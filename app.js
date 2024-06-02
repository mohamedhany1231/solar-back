const express = require("express");
const userRouter = require("./routes/userRouter");
const globalErrorHandler = require("./controllers/errorController");
const morgan = require("morgan");
const cors = require("cors");
const app = express();
const sendEmail = require("./utils/email");

app.use(express.json());

app.use(cors());

console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

app.use("/api/v1/users", userRouter);

app.route("/sendemail").get(async (req, res, next) => {
  console.log("sendi");
  await sendEmail({
    email: "kaned65449@avastu.com",
    subject: "test",
    message: "testest",
  }).catch((err) => console.log(err));
  res
    .status(200)
    .json({ status: "success", message: "email sent successfully" });
});

const panelsRouter = require("./routes/panelsRouter");
app.use("/api/v1/Panels", panelsRouter);

const ReadingsRouter = require("./routes/ReadingsRouter");
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
