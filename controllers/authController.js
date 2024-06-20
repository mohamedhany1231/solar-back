const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const crypto = require("crypto");

const Panel = require("../models/panelModel");
const Email = require("../utils/email");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });

const createSendToken = (id, statusCode, req, res) => {
  const token = signToken(id);
  res.cookie("jwt", token, {
    secure: process.env.NODE_ENV !== "development",
    expiresIn: new Date(Date.now() + 30 * 24 * 60 * 1000),
    httpOnly: true,
    sameSite: "none",
    domain:
      process.env.NODE_ENV === "development"
        ? "http://localhost:5173"
        : "https://solar-front-theta.vercel.app",
  });
  res.status(statusCode).json({
    status: "success",
    token,
  });
};

// exports.signup = catchAsync(async (req, res, next) => {
//   const { name, email, password, confirmPassword } = req.body;
//   const user = await User.create({ name, email, password, confirmPassword });

//   res.status(200).json({
//     status: "success",
//     data: {
//       user,
//     },
//   });
// });

exports.login = catchAsync(async (req, res, next) => {
  // 1- check email and password in req body
  const { email, password } = req.body;

  if (!email || !password) {
    next(new AppError("pleaser provide email and password", 400));
  }
  // 2- check if user with email and password exist
  const user = await User.findOne({ email }).select("+password");

  if (!user || !user.correctPassword(user.password, password)) {
    next(new AppError("invalid email or password", 401));
  }

  // 3- send token
  createSendToken(user.id, 200, req, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  //  1 check if token exist
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req?.cookies?.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return next(
      new AppError("you are not logged in , please log in to gain access", 401)
    );
  }

  // 2 check if token is valid

  let decoded;
  try {
    decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  } catch (err) {
    return next(new AppError("invalid token provided", 401));
  }

  // 3 check if user belongs to token exist
  const user = await User.findById(decoded.id);
  if (!user)
    return next(new AppError("user belonging to token no longer exist", 401));

  //  4- check if user  changed password after token was created
  if (user.passwordChangeAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password! Please log in again.", 401)
    );
  }
  req.user = user;
  next();
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1- check if user exist

  const currentUser = await User.findOne({ email: req.body.email });
  if (!currentUser) {
    return next(new AppError("user not found", 404));
  }
  // 2 - create token

  const token = currentUser.createPasswordResetToken();
  await currentUser.save({ validateBeforeSave: false });
  // validateModifiedOnly: true

  // 3 -send email

  try {
    const resetURL = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/users/resetPassword/${token}`;
    // TODO: integrate with frontend url
    console.log("sending email");
    await new Email(currentUser, resetURL).sendResetPassword();
    console.log("email sent");

    res.status(200).json({
      status: "success",
      message: "token sent to email",
    });
  } catch (err) {
    currentUser.passwordResetToken = undefined;
    currentUser.passwordResetExpires = undefined;
    await currentUser.save({ validateBeforeSave: false });

    next(new AppError("couldn't reset password , please try again ", 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1- get user based on token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  // 2- check if user exist and token is valid . and set password
  const currentUser = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gte: Date.now() },
  });

  if (!currentUser) {
    return next(new AppError(" token is invalid or has expired", 400));
  }
  currentUser.password = req.body.password;
  currentUser.confirmPassword = req.body.confirmPassword;
  currentUser.passwordResetExpires = undefined;
  currentUser.passwordResetToken = undefined;
  await currentUser.save();
  // 3- update changePasswordAt

  //  4- log user in
  createSendToken(currentUser, 200, req, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1- get user from collection

  const currentUser = await User.findById(req.user.id).select("+password");

  // 2-check if posted password is correct

  if (
    !req.body.currentPassword ||
    !(await currentUser.correctPassword(
      req.body.currentPassword,
      currentUser.password
    ))
  )
    next(new AppError("invalid password ", 401));

  //  3- update password

  currentUser.password = req.body.newPassword;
  currentUser.confirmPassword = req.body.confirmPassword;

  await currentUser.save();

  // 4- send back token

  createSendToken(currentUser, 200, req, res);
});

exports.logout = (req, res) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    sameSite: "none",
    partitionKey: 'http://localhost:5173"',
  });
  res.status(200).json({ status: "success" });
};

exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1) verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // 2) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3) Check if user changed password after the token was issued
      if (currentUser.passwordChangeAfter(decoded.iat)) {
        return next();
      }

      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

exports.restrictTo = function (...roles) {
  return function (req, res, next) {
    console.log(roles.includes(req.user.role));
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("you don't have permission to preform this action", 403)
      );
    }
    next();
  };
};

exports.restrictToManger = catchAsync(async (req, res, next) => {
  const panel = await Panel.findById(req.params.panelId || req.body.panel);
  if (req.user.role !== "admin" && String(panel.manger) !== req.user.id) {
    return next(
      new AppError("you don't have permission to mange this panel", 403)
    );
  }
  req.panel = panel;
  next();
});
