const Panel = require("../models/panelModel");
const appError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const factoryController = require("./factoryController");
const User = require("../models/userModel");
const Reading = require("../models/readingModel");
const dateFns = require("date-fns");

const mongoose = require("mongoose");
exports.getAllPanels = factoryController.getAll(Panel);
exports.getPanel = factoryController.getOne(Panel);
exports.updatePanel = factoryController.updateOne(Panel);
exports.deletePanel = factoryController.deleteOne(Panel);
exports.createPanel = factoryController.createOne(Panel);

exports.addUserToPanel = catchAsync(async (req, res, next) => {
  // const panelId = req.params.id;
  const { user: userId, panel: panelId } = req.body;
  const user = await User.findById(userId);

  user.addPanel(panelId);

  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});
exports.removeUserFromPanel = catchAsync(async (req, res, next) => {
  // const panelId = req.params.id;
  const { user: userId, panel: panelId } = req.body;
  const user = await User.findById(userId);

  user.removePanel(panelId);

  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

exports.getUserPanels = catchAsync(async (req, res, next) => {
  const panelsQuery = req.user.panels.map(async (panelId) => {
    return await Panel.findById(panelId);
  });
  const panels = await Promise.all(panelsQuery);
  res.status(200).json({
    status: "success",
    data: { panels },
  });
});

exports.getUsersWhoAccessPanel = catchAsync(async (req, res, next) => {
  const panelId = new mongoose.Types.ObjectId(req.params.id);
  const users = await User.find({ panels: panelId });
  res.status(200).json({
    status: "success",
    result: users.length,
    data: {
      users,
    },
  });
});

exports.bestPreformingPanel = catchAsync(async (req, res, next) => {
  const panels = req.user.panels;

  const readings = await Reading.aggregate([
    {
      $match: {
        panel: { $in: panels },
        date: { $gte: dateFns.subDays(new Date(), 14), $lte: new Date() },
      },
    },
    {
      $group: {
        _id: "$panel",
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
        panel: "$_id",
        temperature: { $round: ["$temperature", 1] },
        rainDrop: { $round: ["$rainDrop", 1] },
        current: { $round: ["$current", 1] },
        pressure: { $round: ["$pressure", 1] },
        humidity: { $round: ["$humidity", 1] },
        readingsCount: 1,
      },
    },
  ]);

  await Panel.populate(readings, "panel");

  const highestReading = readings.sort((a, b) => b.current - a.current)[0];

  const bestPanel = {
    name: highestReading.panel.name,
    Location: highestReading.panel.location,
    manger: highestReading.panel.manger,
    id: highestReading.panel.id,
    ...highestReading,
  };

  delete bestPanel.panel;

  res.status(200).json({
    status: "success",
    data: {
      panel: bestPanel,
    },
  });
});
