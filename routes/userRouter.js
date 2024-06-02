const express = require("express");
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");

const router = express.Router();

router.route("/signup").post(authController.signup);

router.route("/login").post(authController.login);
router.route("/protect").get(authController.protect);
router.route("/forgotPassword").post(authController.forgotPassword);
router.route("/resetpassword/:token").patch(authController.resetPassword);

module.exports = router;
