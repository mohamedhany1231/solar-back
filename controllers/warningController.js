const mongoose = require("mongoose");
const dateFns = require("date-fns");

const appError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const Warning = require("../models/warningModel");
const factoryController = require("./factoryController");
const User = require("../models/userModel");

exports.getAllWarnings = factoryController.getAll(Warning);
exports.getWarning = factoryController.getOne(Warning);
exports.updateWarning = factoryController.updateOne(Warning);
exports.deleteWarning = factoryController.deleteOne(Warning);
exports.createWarning = factoryController.createOne(Warning);

exports.getUserWarnings = catchAsync(async (req, res, next) => {
  //   const panelId = req.params.panelId || req.body.panel;
  const panels = req.user.panels;

  const warnings = await Warning.aggregate([
    { $match: { Panel: { $in: panels } } },
  ]);

  res.status(200).json({
    status: "success",
    data: {
      warnings,
    },
  });
});
