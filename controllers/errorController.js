const AppError = require("../utils/appError");

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path} : ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.message.match(/"(.*?)" /)[0];
  const message = `Duplicate field value: ${value} , please use another value `;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((val) => val.message);
  const message = errors.join(", ");
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError("invalid token provided , please login again", 401);

const handleJWTExpiredError = () =>
  new AppError("Your token has expired! Please log in again.", 401);

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  if (process.env.NODE_ENV === "production") {
    let error = {
      ...err,
      message: err.message,
      name: err.name,
      statusCode: err.statusCode,
    };

    if (error.name === "CastError") error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (err.name === "ValidationError") error = handleValidationErrorDB(error);
    if (error.name === "JsonWebTokenError") error = handleJWTError();
    if (error.name === "TokenExpiredError") error = handleJWTExpiredError();

    res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
    });
  } else {
    console.log(err);

    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      error: err,
    });
  }
};
