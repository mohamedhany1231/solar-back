const express = require("express");
const panelController = require("../controllers/panelController");
const authController = require("../controllers/authController");
const router = express.Router();

router
  .route("/")
  .get(panelController.getAllPanels)
  .post(panelController.createPanel);

router.post("/initialize-panel", panelController.issueInitialRefreshToken);
router.get("/refresh", panelController.refreshToken);
router.get("/renew-refresh", panelController.renewRefreshToken);

router.use(authController.protect);

router
  .route("/addUser")
  .post(
    panelController.addUserToBody,
    authController.restrictToManger,
    panelController.addUserToPanel
  );

router
  .route("/removeUser")
  .post(
    panelController.addUserToBody,
    authController.restrictToManger,
    panelController.removeUserFromPanel
  );

router.route("/myPanels").get(panelController.getUserPanels);

router.get("/best-panel", panelController.bestPreformingPanel);

router
  .route("/:id")
  .get(panelController.getPanel)
  .patch(panelController.updatePanel)
  .delete(panelController.deletePanel);

module.exports = router;
