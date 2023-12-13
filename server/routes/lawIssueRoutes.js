const express = require("express");
const { verifyToken, isAuthenticated } = require("../config/functions")
const authorize = require('../middlewares/authorizationMiddleware');
const router = express.Router();
const { addIssue, updateIssue, getAllIssues, getIssueById, getIssuesByCreatedBy, deleteIssue, exportLawIssues, addComment, getComments, updateComment, deleteComment } = require("../controllers/lawIssueController")
const {
    validateLawIssueData,
    handleValidationErrors } = require("../middlewares/validation")

router.route("/addissue").post(isAuthenticated, verifyToken, validateLawIssueData, handleValidationErrors, authorize(["admin", "employee"]), addIssue)
router.route("/updateissue/:issueId").put(isAuthenticated, verifyToken, validateLawIssueData, handleValidationErrors, authorize(["admin", "employee"]), updateIssue);
router.route("/getallissues").get(isAuthenticated, verifyToken, authorize(["admin"]), getAllIssues);
router.route("/addcomment/:issueId").post(isAuthenticated, verifyToken, authorize(["admin", "employee"]), addComment);
router.route("/getcomment/:issueId").get(isAuthenticated, verifyToken, authorize(["admin", "employee"]), getComments);
router.route("/updatecomment/:issueId/:commentId").put(isAuthenticated, verifyToken, authorize(["admin", "employee"]), updateComment);
router.route("/getissuebyid/:issueId").get(isAuthenticated, verifyToken, authorize(["admin", "employee"]), getIssueById);
router.route("/getissuesbycreatedby/:userId").get(isAuthenticated, verifyToken, authorize(["admin", "employee"]), getIssuesByCreatedBy);
router.route("/deleteissue/:issueId").delete(isAuthenticated, verifyToken, authorize(["admin", "employee"]), deleteIssue);
router.route("/deletecomment/:issueId/:commentId").delete(isAuthenticated, verifyToken, authorize(["admin", "employee"]), deleteComment);
router.route("/exportlawissues").get(isAuthenticated, verifyToken, authorize(["admin", "employee"]), exportLawIssues);
module.exports = router;