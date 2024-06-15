const multer = require("multer");
const sharp = require("sharp");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const factory = require("./factoryController");
const { v2: cloudinary } = require("cloudinary");
const streamifier = require("streamifier");
const mongoose = require("mongoose");

const SETTINGS_FIELDS = [
  "environmental",
  "performance",
  "component",
  "operational",
];

const baseURL = `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload`;

cloudinary.config({
  api_key: process.env.CLOUDINARY_KEY,
  cloud_name: process.env.CLOUDINARY_NAME,
  api_secret: process.env.CLOUDINARY_SECRET,
});
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload only images.", 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single("photo");

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (req.file) {
    const id = req.params.id || req.user.id;
    const fileName = `user-${id}-${Date.now()}`;
    const img = await sharp(req.file.buffer)
      .resize(1920, 1080)
      .jpeg({ quality: 90 })
      .toBuffer();

    const folder = "solar/users";

    const cloudinaryStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: fileName,
      },
      (err, response) => {
        req.body.photo = response.secure_url;

        next();
      }
    );

    streamifier.createReadStream(img).pipe(cloudinaryStream);
  } else {
    next();
  }
});

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  req.body.email = undefined;
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "This route is not for password updates. Please use /updateMyPassword.",
        400
      )
    );
  }

  // 2) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, "name", "email", "photo");
  // if (req.file) filteredBody.photo = req.file.filename;

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.createUser = catchAsync(async (req, res, next) => {
  const { name, email, password, confirmPassword, role } = req.body;
  const user = await User.create({
    name,
    email,
    password,
    confirmPassword,
    role,
  });

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

exports.updateSettings = catchAsync(async (req, res, next) => {
  const settings = {};
  SETTINGS_FIELDS.forEach((field) => {
    settings[field] = req.body[field] || req.user.settings[field];
  });
  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      settings,
    },
    { runValidators: true, new: true }
  );

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

exports.getPanelViewers = catchAsync(async (req, res, next) => {
  const panelId = new mongoose.Types.ObjectId(req.params.panelId);

  const users = await User.find({ panels: panelId });

  res.status(200).json({
    status: "success",
    result: users.length,
    data: {
      users,
    },
  });
});

exports.getUser = factory.getOne(User);
exports.getAllUsers = factory.getAll(User);

// Do NOT update passwords with this!
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
