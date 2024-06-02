const Panel = require("../models/panelModel");
const appError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const factoryController = require("./factoryController");
const User = require("../models/userModel");

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
