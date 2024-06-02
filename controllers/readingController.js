const mongoose = require("mongoose");

const appError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const Reading = require("../models/readingModel");
const factoryController = require("./factoryController");
const User = require("../models/userModel");

exports.getAllReadings = factoryController.getAll(Reading);
exports.getReading = factoryController.getOne(Reading);
exports.updateReading = factoryController.updateOne(Reading);
exports.deleteReading = factoryController.deleteOne(Reading);
exports.createReading = factoryController.createOne(Reading);

exports.getMonthlyAvg = catchAsync(async (req, res, next) => {
  const panelId = new mongoose.Types.ObjectId(req.params.panelId);

  const readings = await Reading.aggregate([
    {
      $match: { panel: panelId },
    },
    { $addFields: { month: { $month: "$date" }, year: { $year: "$date" } } },
    {
      $group: {
        _id: { month: "$month", year: "$year" },
        temperature: { $avg: "$temperature" },
        rainDrop: { $avg: "$rainDrop" },
        current: { $avg: "$current" },
        pressure: { $avg: "$pressure" },
        humidity: { $avg: "$humidity" },
        readingsCount: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        date: "$_id",
        temperature: { $round: ["$temperature", 1] },
        rainDrop: { $round: ["$rainDrop", 1] },
        current: { $round: ["$current", 1] },
        pressure: { $round: ["$pressure", 1] },
        humidity: { $round: ["$humidity", 1] },
        readingsCount: 1,
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    result: readings.length,
    data: {
      readings,
    },
  });
});
