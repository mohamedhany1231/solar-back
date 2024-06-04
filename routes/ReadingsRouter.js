const express = require("express");

const readingController = require("../controllers/readingController");
const authController = require("../controllers/authController");

const router = express.Router();

router
  .route("/")
  .get(readingController.getAllReadings)
  .post(readingController.createReading);

router.use(authController.protect);

router.route("/:panelId/monthly").get(readingController.getMonthlyAvg);
router.route("/:panelId/day").get(readingController.getDayAvg);
router.route("/:panelId/recent").get(readingController.getRecentReadings);
router.route("/peak-time").get(readingController.peakPerformanceTime);

router
  .route("/:readingId")
  .get(readingController.getReading)
  .delete(readingController.deleteReading);

module.exports = router;
