const express = require("express");
const panelController = require("../controllers/panelController");
const authController = require("../controllers/authController");
const router = express.Router();

router
  .route("/")
  .get(panelController.getAllPanels)
  .post(panelController.createPanel);

router.all(authController.protect);

router.route("/addUser").post(panelController.addUserToPanel);
router.route("/removeUser").post(panelController.removeUserFromPanel);
router
  .route("/myPanels")
  .get(authController.protect, panelController.getUserPanels);

router.route("/:id/getUsers").get(panelController.getUsersWhoAccessPanel);

router
  .route("/:id")
  .get(panelController.getPanel)
  .patch(panelController.updatePanel)
  .delete(panelController.deletePanel);

module.exports = router;
