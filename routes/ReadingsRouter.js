const express = require("express");

const readingController = require("../controllers/readingController");
const authController = require("../controllers/authController");
const panelController = require("../controllers/panelController");

const router = express.Router();

router
  .route("/")
  .get(readingController.getAllReadings)
  .post(readingController.createReading);

router.post(
  "/create-reading",
  panelController.validateAccessToken,
  readingController.createReading
);

router.use(authController.protect);

router.get("/weekly", readingController.weekOverview);

router.route("/peak-time").get(readingController.peakPerformanceTime);
router.route("/total-energy").get(readingController.totalEnergy);

router
  .route("/:readingId")
  .get(readingController.getReading)
  .delete(readingController.deleteReading);

// router.use(panelController.protectPanel);

router
  .route("/:panelId/monthly/:date")
  .get(panelController.protectPanel, readingController.getMonthlyAvg);
router
  .route("/:panelId/day/:date")
  .get(panelController.protectPanel, readingController.getDayAvg);
router
  .route("/:panelId/recent/:date")
  .get(panelController.protectPanel, readingController.getRecentReadings);
router
  .route("/:panelId/latest/:date")
  .get(panelController.protectPanel, readingController.getLatestReading);

module.exports = router;
