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
router.route("/registeremployee").post( verifyToken, authorize(['admin']), validateEmployeeRegistration, handleValidationErrors, RegisterEmployee);
router.route("/resetpassword").post(validateResetPassowrd, handleValidationErrors, resetPassword);
router.route("/changepassword").put( verifyToken, validateOldPasswordChange, handleValidationErrors, changePassword);
router.route("/changenewuserpassword").put( verifyToken, validateNewUserPassword, handleValidationErrors, changeNewUserPassword);
router.route("/resetpassword/:token").put(validateChangePassword, handleValidationErrors, resetPasswordToken);
router.route("/login").post(validateUserLogin, handleValidationErrors, login);
router.route("/profile").get( verifyToken, authorize(['employee', 'admin']), profile);
router.route("/logout").get(logout);
router.route("/all-users").get( verifyToken, authorize(['admin']), allUsers);
router.route("/deactivated-users").get( verifyToken, authorize(['admin']), deactivatedAccounts);
router.route("/change-account-status").put( verifyToken, authorize(['admin']), validateStatusChange, handleValidationErrors, changeUserStatus);

module.exports = router;


