const mongoose = require("mongoose");

const ReadingSchema = new mongoose.Schema({
  temperature: Number,
  humidity: Number,
  rainDrop: Number,
  current: Number,
  pressure: Number,

  date: { type: Date, default: Date.now() },
  panel: { type: mongoose.Schema.ObjectId, ref: "Panel" },
});

const model = mongoose.model("Reading", ReadingSchema);
module.exports = model;
