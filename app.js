const express = require("express");
const userRouter = require("./routes/userRouter");
const globalErrorHandler = require("./controllers/errorController");
const morgan = require("morgan");
const cors = require("cors");
const app = express();
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const panelsRouter = require("./routes/panelsRouter");
const ReadingsRouter = require("./routes/ReadingsRouter");
const helmet = require("helmet");

app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

const corsConfig = {
  origin: ["http://localhost:5173", "https://solar-front-theta.vercel.app"],
  credentials: true,
};

app.use(cors(corsConfig));
app.options("*", cors(corsConfig));

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});
app.use("/api", limiter);

app.use(xss());
app.use(mongoSanitize());

app.use(helmet());

app.use(cookieParser());

console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

app.use("/api/v1/users", userRouter);
app.use("/api/v1/Panels", panelsRouter);

app.use("/api/v1/Readings", ReadingsRouter);

app.use((error, req, res, next) => {
  res.status(error.statusCode || 500).json({
    status: "fail",
    message: error.message,
  });
});

// error handlers
app.use("*", (req, res, next) => {
  res.status(404).json({
    status: "404 Not Found",
  });
});

app.use(globalErrorHandler);

module.exports = app;
