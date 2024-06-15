const Panel = require("../models/panelModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const factoryController = require("./factoryController");
const User = require("../models/userModel");
const Reading = require("../models/readingModel");
const dateFns = require("date-fns");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const jwt = require("jsonwebtoken");

exports.getAllPanels = factoryController.getAll(Panel);
exports.getPanel = factoryController.getOne(Panel);
exports.updatePanel = factoryController.updateOne(Panel);
exports.deletePanel = factoryController.deleteOne(Panel);
exports.createPanel = factoryController.createOne(Panel);

exports.addUserToBody = catchAsync(async (req, res, next) => {
  if (!(req.body.email || req.body.user) || !req.body.panel)
    return next(
      new AppError(" invalid data , please provide panel and email ", 400)
    );
  if (req.body.user) return next();

  const user = await User.findOne({ email: req.body?.email });

  if (!user) return next(new AppError(" user doesn't exit ", 400));

  req.body.user = user?.id;
  next();
});

exports.addUserToPanel = catchAsync(async (req, res, next) => {
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
        panel: "$_id",
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

  await Panel.populate(readings, "panel");

  const highestReading = readings[0];

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

// authentication

function generateToken(id, isRefreshToken = false) {
  return jwt.sign({ id }, process.env.SOLAR_PANEL_JWT_SECRET, {
    expiresIn: isRefreshToken
      ? process.env.PANEL_REFRESH_EXPIRE
      : process.env.PANEL_TOKEN_EXPIRE,
  });
}

exports.issueInitialRefreshToken = catchAsync(async (req, res, next) => {
  const { hashedSecret, id } = req.body;

  if (
    !hashedSecret ||
    !(await bcrypt.compare(process.env.SOLAR_PANEL_SECRET_KEY, hashedSecret))
  ) {
    return next(new AppError("invalid secret", 403));
  }

  let panel;
  if (id) {
    panel = await Panel.findById(id);
  } else {
    panel = await Panel.create({
      name: `New panel ${Date.now()}`,
      description: `New panel added through API at date ${Date.now()}`,
    });
  }

  if (!panel?.id) return next(new AppError(" invalid panel id", 400));

  const refreshToken = generateToken(panel.id, true);
  const accessToken = generateToken(panel.id);

  res.json({
    message: "Panel created successfully",
    panel,
    refresh_token: refreshToken,
    access_token: accessToken,
  });
});

exports.validateAccessToken = catchAsync(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return next(new AppError("Unauthorized", 401));
  }

  const token = authHeader.split(" ")[1];

  let decoded;

  try {
    decoded = await jwt.verify(token, process.env.SOLAR_PANEL_JWT_SECRET);
  } catch (error) {
    next(new AppError("invalid token", 401));
  }

  if (!decoded?.id) return next(new AppError("invalid token", 401));
  req.userId = decoded.id;

  const panel = await Panel.findById(decoded.id);
  if (!panel)
    return next(new AppError("panel belonging to token no longer exist", 401));

  req.panel = panel;
  next();
});

exports.refreshToken = catchAsync(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return next(new AppError("Unauthorized", 401));
  }

  const refreshToken = authHeader.split(" ")[1];

  if (!refreshToken) {
    return next(new AppError("Refresh token required", 401));
  }

  let decodedRefreshToken;
  try {
    decodedRefreshToken = await jwt.verify(
      refreshToken,
      process.env.SOLAR_PANEL_JWT_SECRET
    );
  } catch (refreshError) {
    return next(new AppError("Invalid refresh token", 401));
  }
  const newAccessToken = generateToken(decodedRefreshToken.id);
  res.set("X-New-Access-Token", newAccessToken);
  res.status(200).json({
    status: "success",
  });
});

exports.renewRefreshToken = catchAsync(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return next(new AppError("Unauthorized", 401));
  }

  const refreshToken = authHeader.split(" ")[1];

  if (!refreshToken) {
    return next(new AppError("Refresh token required", 401));
  }

  let decodedRefreshToken;
  try {
    decodedRefreshToken = await jwt.verify(
      refreshToken,
      process.env.SOLAR_PANEL_JWT_SECRET
    );
  } catch (err) {
    return next(new AppError("Invalid refresh token", 401));
  }
  const newAccessToken = generateToken(decodedRefreshToken.id, true);
  res.set("X-New-Refresh-Token", newAccessToken);
  res.status(200).json({
    status: "success",
  });
});
