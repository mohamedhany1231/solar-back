const mongoose = require("mongoose");

const warningSchema = new mongoose.Schema({
  Panel: { type: mongoose.Schema.ObjectId, ref: "Panel" },
  title: String,
  description: String,
});

const model = mongoose.model("Warning", warningSchema);
module.exports = model;
