const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const dataSchema = new Schema({
  plat: String,
  nama: String,
  tahun: Number,
});

const historySchema = new Schema({
  plat: String,
  nama: String,
  tahun: Number,
  kondisi: String,
  tanggal: Date
})

const Data = mongoose.model("data", dataSchema);

const History = mongoose.model("history", historySchema)

async function createData(data) {
  return await Data.create(data);
}

async function readOneData(filter) {
  return await Data.findOne(filter)
}

async function createHistory(history) {
  return await History.create(history)
}



module.exports = {
  createData,
  readOneData,
  createHistory
}