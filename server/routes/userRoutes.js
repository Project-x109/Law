const express = require("express");
const {
  Register,
  resetPassword,
  resetPasswordToken,
  login,
  profile,
  logout,
  RegisterEmployee,
  allUsers,
  changePassword,
  changeNewUserPassword,
  deactivatedAccounts,
  changeUserStatus
} = require("../controllers/userController");
const { verifyToken, isAuthenticated } = require("../config/functions")
const authorize = require('../middlewares/authorizationMiddleware');
const {
  validateUserRegistration,
  validateEmployeeRegistration,
  handleValidationErrors,
  validateResetPassowrd,
  validateUserLogin,
  validateChangePassword,
  validateOldPasswordChange,
  validateNewUserPassword,
  validateStatusChange
} = require("../middlewares/validation")
const router = express.Router();
router.route("/register").post(validateUserRegistration, handleValidationErrors, Register);
router.route("/registeremployee").post(isAuthenticated, verifyToken, authorize(['admin']), validateEmployeeRegistration, handleValidationErrors, RegisterEmployee);
router.route("/resetpassword").post(validateResetPassowrd, handleValidationErrors, resetPassword);
router.route("/changepassword").put(isAuthenticated, verifyToken, validateOldPasswordChange, handleValidationErrors, changePassword);
router.route("/changenewuserpassword").put(isAuthenticated, verifyToken, validateNewUserPassword, handleValidationErrors, changeNewUserPassword);
router.route("/resetpassword/:token").put(validateChangePassword, handleValidationErrors, resetPasswordToken);
router.route("/login").post(validateUserLogin, handleValidationErrors, login);
router.route("/profile").get(isAuthenticated, verifyToken, authorize(['employee', 'admin']), profile);
router.route("/logout").get(logout);
router.route("/all-users").get(isAuthenticated, verifyToken, authorize(['admin']), allUsers);
router.route("/deactivated-users").get(isAuthenticated, verifyToken, authorize(['admin']), deactivatedAccounts);
router.route("/change-account-status").put(isAuthenticated, verifyToken, authorize(['admin']), validateStatusChange, handleValidationErrors, changeUserStatus);

module.exports = router;


