const mongoose = require("mongoose");
const dateFns = require("date-fns");

const warningSchema = new mongoose.Schema({
  type: {
    type: String,
    Enum: ["environmental", "performance", "component", "operational"],
    required: true,
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
});

const panelSchema = new mongoose.Schema(
  {
    name: String,
    Location: String,
    description: String,
    createdAt: { type: Date, default: Date.now() },

    warnings: [warningSchema],
    manger: { type: mongoose.Schema.ObjectId, ref: "User" },
    latestReadingDate: Date,
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

panelSchema.virtual("status").get(function () {
  return this.latestReadingDate &&
    dateFns.subDays(Date.now(), this.latestReadingDate) < 1
    ? "online"
    : "offline";
});

const model = mongoose.model("Panel", panelSchema);

module.exports = model;
