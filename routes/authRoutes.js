const router = require("express").Router();
const passport = require("passport");
const authController = require("../controllers/authController");
const { error } = require("../utilies/responseWrapper");
router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.get("/refresh", authController.refreshAccessToken);
router.post("/logout", authController.logout);
module.exports = router;
