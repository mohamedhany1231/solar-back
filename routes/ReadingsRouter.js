const express = require("express");

const readingController = require("../controllers/readingController");

const router = express.Router();

router
  .route("/")
  .get(readingController.getAllReadings)
  .post(readingController.createReading);

router.route("/:panelId/monthly").get(readingController.getMonthlyAvg);

router
  .route("/:readingId")
  .get(readingController.getReading)
  .delete(readingController.deleteReading);

module.exports = router;
