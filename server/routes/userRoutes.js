const express = require("express");
const {
    Register,
    resetPassword,
    resetPasswordToken,
    login,
    profile,
    logout,
    RegisterEmployee
} = require("../controllers/userController");
const { verifyToken, isAuthenticated } = require("../config/functions")
const authorize = require('../middlewares/authorizationMiddleware');
const router = express.Router();
router.route("/register").post(Register);
router.route("/registeremployee").post(isAuthenticated, verifyToken, authorize(['admin']),RegisterEmployee);
router.route("/resetpassword").post(resetPassword);
router.route("/resetpassword/:token").put(resetPasswordToken);
router.route("/login").post(login);
router.route("/profile").get(isAuthenticated, verifyToken, authorize(['employee', 'admin']), profile);
router.route("/logout").get(logout);

module.exports = router;


