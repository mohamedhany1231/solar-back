const mongoose = require("mongoose");

const panelSchema = new mongoose.Schema({
  name: String,
  Location: String,
  manger: { type: mongoose.Schema.ObjectId, ref: "User" },
});

const model = mongoose.model("Panel", panelSchema);

module.exports = model;
