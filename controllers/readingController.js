const mongoose = require("mongoose");
const dateFns = require("date-fns");

const appError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const Reading = require("../models/readingModel");
const Panel = require("../models/panelModel");
const factoryController = require("./factoryController");
const User = require("../models/userModel");
const generateWarning = require("../utils/generateWarnings");

exports.getAllReadings = factoryController.getAll(Reading);
exports.getReading = factoryController.getOne(Reading);
exports.updateReading = factoryController.updateOne(Reading);
exports.deleteReading = factoryController.deleteOne(Reading);

exports.createReading = catchAsync(async (req, res, next) => {
  const warnings = generateWarning(req.body);
  const panelId = req.params.panelId || req.body.panel;

  await Promise.all([
    factoryController.createOne(Reading)(req, res, next),
    Panel.findByIdAndUpdate(
      panelId,
      { warnings, latestReadingDate: Date.now() },
      { runValidators: true }
    ),
  ]);
});

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
        color: { $avg: "$color" },
        current: { $avg: "$current" },
        pressure: { $avg: "$pressure" },
        intensity: { $avg: "$intensity" },
        readingsCount: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        date: "$_id",
        temperature: { $round: ["$temperature", 1] },
        color: { $round: ["$color", 1] },
        current: { $round: ["$current", 1] },
        pressure: { $round: ["$pressure", 1] },
        intensity: { $round: ["$intensity", 1] },
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

exports.getRecentReadings = catchAsync(async (req, res, next) => {
  const date = req.body.date ? dateFns.endOfDay(req.body.date) : new Date();

  const panelId = new mongoose.Types.ObjectId(req.params.panelId);

  const readings = await Reading.aggregate([
    {
      $match: {
        panel: panelId,
        date: { $gte: dateFns.subDays(date, 14), $lte: date },
      },
    },
    {
      $addFields: {
        month: { $month: "$date" },
        day: { $dayOfMonth: "$date" },
      },
    },
    {
      $group: {
        _id: { month: "$month", day: "$day" },
        temperature: { $avg: "$temperature" },
        color: { $avg: "$color" },
        current: { $avg: "$current" },
        pressure: { $avg: "$pressure" },
        intensity: { $avg: "$intensity" },
        readingsCount: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        date: "$_id",
        temperature: { $round: ["$temperature", 1] },
        color: { $round: ["$color", 1] },
        current: { $round: ["$current", 1] },
        pressure: { $round: ["$pressure", 1] },
        intensity: { $round: ["$intensity", 1] },
        readingsCount: 1,
      },
    },
    {
      $sort: {
        "date.month": 1,
        "date.day": 1,
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

exports.getDayAvg = catchAsync(async (req, res, next) => {
  const date = req.body.date ? dateFns.endOfDay(req.body.date) : new Date();
  const panelId = new mongoose.Types.ObjectId(req.params.panelId);

  const reading = await Reading.aggregate([
    {
      $match: {
        panel: panelId,
        date: {
          $gte: dateFns.subDays(date, 1),
          $lte: date,
        },
      },
    },
    {
      $addFields: {
        month: { $month: "$date" },
        day: date.getDate(),
      },
    },
    {
      $group: {
        _id: { month: "$month", day: "$day" },
        temperature: { $avg: "$temperature" },
        color: { $avg: "$color" },
        current: { $avg: "$current" },
        pressure: { $avg: "$pressure" },
        intensity: { $avg: "$intensity" },
        readingsCount: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        date: "$_id",
        temperature: { $round: ["$temperature", 1] },
        color: { $round: ["$color", 1] },
        current: { $round: ["$current", 1] },
        pressure: { $round: ["$pressure", 1] },
        intensity: { $round: ["$intensity", 1] },
        readingsCount: 1,
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    data: {
      reading,
    },
  });
});

exports.getLatestReading = catchAsync(async (req, res, next) => {
  const panelId = new mongoose.Types.ObjectId(req.params.panelId);

  const reading = await Reading.findOne({
    panel: panelId,
    date: { $lte: Date.now() },
  }).sort("-date");
  res.status(200).json({
    status: "success",
    data: {
      reading,
    },
  });
});

exports.peakPerformanceTime = catchAsync(async (req, res, next) => {
  const panels = req.user.panels;
  const reading = await Reading.aggregate([
    {
      $match: {
        panel: { $in: panels },
        date: { $gte: dateFns.subDays(Date.now(), 7), $lte: new Date() },
      },
    },

    {
      $group: {
        _id: { $divide: [{ $hour: "$date" }, 3] },
        temperature: { $avg: "$temperature" },
        color: { $avg: "$color" },
        current: { $avg: "$current" },
        pressure: { $avg: "$pressure" },
        intensity: { $avg: "$intensity" },
        readingsCount: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        startTime: { $multiply: ["$_id", 3] },
        endTime: { $sum: [{ $multiply: ["$_id", 3] }, 3] },
        temperature: { $round: ["$temperature", 1] },
        color: { $round: ["$color", 1] },
        current: { $round: ["$current", 1] },
        pressure: { $round: ["$pressure", 1] },
        intensity: { $round: ["$intensity", 1] },
        readingsCount: 1,
      },
    },
    {
      $sort: {
        current: -1,
      },
    },
    {
      $limit: 1,
    },
  ]);

  res.status(200).json({
    status: "success",
    data: { time: reading[0] },
  });
});

exports.totalEnergy = catchAsync(async (req, res, next) => {
  const panels = req.user.panels;
  const reading = await Reading.aggregate([
    {
      $match: {
        panel: { $in: panels },
        date: { $gte: dateFns.subDays(Date.now(), 7), $lte: new Date() },
      },
    },

    {
      $group: {
        _id: null,
        temperature: { $avg: "$temperature" },
        color: { $avg: "$color" },
        pressure: { $avg: "$pressure" },
        intensity: { $avg: "$intensity" },
        current: { $sum: "$current" },
        readingsCount: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,

        temperature: { $round: ["$temperature", 1] },
        color: { $round: ["$color", 1] },
        current: { $round: ["$current", 1] },
        pressure: { $round: ["$pressure", 1] },
        intensity: { $round: ["$intensity", 1] },
        readingsCount: 1,
      },
    },
  ]);

  console.log(reading);
  res.status(200).json({
    status: "success",
    data: { reading: reading[0] },
  });
});
