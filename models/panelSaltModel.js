const { default: mongoose } = require("mongoose");

const panelSaltSchema = new mongoose.Schema({
  salt: String,
});

const PanelSalt = mongoose.model("PanelSalt", panelSaltSchema);

module.exports = PanelSalt;
