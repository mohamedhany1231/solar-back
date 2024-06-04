const express = require("express");
const panelController = require("../controllers/panelController");
const authController = require("../controllers/authController");
const router = express.Router();

router
  .route("/")
  .get(panelController.getAllPanels)
  .post(panelController.createPanel);

router.use(authController.protect);

router
  .route("/addUser")
  .post(authController.restrictToManger, panelController.addUserToPanel);
router
  .route("/removeUser")
  .post(authController.restrictToManger, panelController.removeUserFromPanel);
router.route("/myPanels").get(panelController.getUserPanels);

router.route("/:id/getUsers").get(panelController.getUsersWhoAccessPanel);

router.get("/best-panel", panelController.bestPreformingPanel);

router
  .route("/:id")
  .get(panelController.getPanel)
  .patch(panelController.updatePanel)
  .delete(panelController.deletePanel);

module.exports = router;
