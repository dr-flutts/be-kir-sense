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

async function readData() {
  return await Data.find();
}

async function readOneData(filter) {
  return await Data.findOne(filter)
}

async function readDataByPlat(plat) {
  return await Data.findOne({ plat })
}

async function createHistory(history) {
  return await History.create(history)
}

async function readAllHistory() {
  return await History.find();
}

async function readByPlat(plat) {
  return await History.findOne({ plat })
}



module.exports = {
  createData,
  readData,
  readOneData,
  readDataByPlat,
  createHistory,
  readAllHistory,
  readByPlat
}