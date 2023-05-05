const express = require('express')
const cors = require('cors')
const unggah = require('express-fileupload')
const fs = require('fs');
const mongoose = require("mongoose");
const Tesseract = require('tesseract.js');
const { createData, readOneData, createHistory } = require('./db');

var app = express()
app.use(cors())
app.use(unggah())
app.use(express.json({limit: "10mb", extended: true}))
app.use(express.urlencoded({ extended: false }))
app.use('/img', express.static('storage'))

const ALLOWED_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ';
mongoose.set("strictQuery", false);

// koneksi database
const mongoDB = "mongodb+srv://drflutts:kir.sense@cluster0.ulaorns.mongodb.net/kir";

app.get('/', (req, res) => {
  res.send('<h1>Node.js OCR</h1>')
})

const capturedImage = async (req, res, next) => {
  try {
    const path = './storage/ocr_image.jpeg'
    const imgdata = req.body.img;
    const base64Data = imgdata.replace(/^data:([A-Za-z-+/]+);base64,/, '');
    fs.writeFileSync(path, base64Data, { encoding: 'base64' });

    Tesseract.recognize(
      'http://localhost:5000/img/ocr_image.jpeg',
      'eng',
      {
        psm: Tesseract.PSM.SINGLE_LINE,
      }
    )
      .then(async({ data: { text } }) => {
        let [plat, ...etc] = text.split("\n")
        plat = plat.split('').filter((x) => ALLOWED_CHARS.includes(x.toUpperCase())).join('');

        const result = await readOneData({ plat })

        // 
        if (result && result.tahun < new Date().getFullYear()) {
          const history = await createHistory({ 
            plat,
            nama: result.nama,
            tahun: result.tahun,
            kondisi: "Kir tidak aktif",
            tanggal: new Date()
          })
          return res.send(history)
        } else if (result && result.tahun >= new Date().getFullYear()) {
            const history = await createHistory({ 
              plat,
              nama: result.nama,
              tahun: result.tahun,
              kondisi: "Kir aktif",
              tanggal: new Date()
            })
            return res.send(history)
        } else {
          return res.send({ 
              plat,
              nama: null,
              tahun: null,
              kondisi: "Data tidak ditemukan",
              tanggal: new Date()
            })
        }
      })

  } catch (e) {
    next(e);
  }
}

app.post('/capture', capturedImage)

app.post('/upload', (req, res) => {
  if (req.files) {
    var unggahFile = req.files.file
    var namaFile = unggahFile.name
    unggahFile.mv('./storage/' + namaFile, (err) => {
      if (err) {
        console.log(err)
        res.send(err)
      } else {
        Tesseract.recognize(
          `./storage/${namaFile}`,
          {
            psm: Tesseract.PSM.SINGLE_LINE,
          }
        )
          .then(({ data: { text } }) => {
            return res.send({
              image: `http://localhost:5000/img/${namaFile}`,
              path: `http://localhost:5000/img/${namaFile}`,
              text: text,
            });
          })
          .catch((err) => {
            console.log(err)
          })
      }
    })
  }
})

app.listen(5000, async () => {
  mongoose.connect(mongoDB)
  .then(() => console.log("Koneksi database sukses"))
  .catch((err) => console.log(err))
  console.log('Server aktif @port 5000!')
  // await createData({ plat: "B 6349 TAP", nama: "NUZUL HAKIM", tahun: 2023 })
})
