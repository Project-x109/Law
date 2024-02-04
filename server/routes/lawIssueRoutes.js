const express = require("express");
const { verifyToken, isAuthenticated } = require("../config/functions")
const authorize = require('../middlewares/authorizationMiddleware');
const router = express.Router();
const {
    addIssue, //Used
    updateIssue,//Used
    getAllIssues,//Used
    getIssueById,//Used
    getIssuesByCreatedBy,//Used
    deleteIssue,
    exportLawIssues,
    addComment,
    getComments,
    updateComment,
    deleteComment,
    getDashboardSummary,//Used
    getUserDashboardSummary,//Used
    changeIssueStatus,//Used
    getRecentActivities,//Used
    getRecentActivity,//Used
    getUserPerformance,//Used
    getAllUserPerformances,//Used
    getPriorityIssues,//used
    getIssuesByLogin,//used
    getIssuesCreatedByUser,//used
    getWeeklyReview,//Used
    getDepartmentWiseAnalysis

} = require("../controllers/lawIssueController")
const {
    validateLawIssueData,
    validateLawIssueDataComment,
    changeIssueStatusValidation,
    handleValidationErrors } = require("../middlewares/validation")

router.route("/addissue").post(isAuthenticated, verifyToken, validateLawIssueData, handleValidationErrors, authorize(["admin", "employee"]), addIssue)
router.route("/updateissue/:issueId").put(isAuthenticated, verifyToken, validateLawIssueData, handleValidationErrors, authorize(["admin", "employee"]), updateIssue);
router.route("/getallissues").get(isAuthenticated, verifyToken, authorize(["admin", "employee"]), getAllIssues);
router.route("/addcomment/:issueId").post(isAuthenticated, verifyToken, validateLawIssueDataComment, handleValidationErrors, authorize(["admin", "employee"]), addComment);
router.route("/getcomment/:issueId").get(isAuthenticated, verifyToken, authorize(["admin", "employee"]), getComments);
router.route("/updatecomment/:issueId/:commentId").put(isAuthenticated, verifyToken, validateLawIssueDataComment, handleValidationErrors, authorize(["admin", "employee"]), updateComment);
router.route("/getissuebyid/:issueId").get(isAuthenticated, verifyToken, authorize(["admin", "employee"]), getIssueById);
router.route("/getissuesbycreatedby/:userId").get(isAuthenticated, verifyToken, authorize(["admin", "employee"]), getIssuesByCreatedBy);
router.route("/getissuesbylogin").get(isAuthenticated, verifyToken, authorize(["admin", "employee"]), getIssuesByLogin);
router.route("/deleteissue/:issueId").delete(isAuthenticated, verifyToken, authorize(["admin", "employee"]), deleteIssue);
router.route("/deletecomment/:issueId/:commentId").delete(isAuthenticated, verifyToken, authorize(["admin", "employee"]), deleteComment);
router.route("/exportlawissues").get(isAuthenticated, verifyToken, authorize(["admin", "employee"]), exportLawIssues);
router.route("/getdashboardsummery").get(isAuthenticated, verifyToken, authorize(["admin", "employee"]), getDashboardSummary);
router.route("/getuserdashboardsummary").get(isAuthenticated, verifyToken, authorize(["admin", "employee"]), getUserDashboardSummary);
router.route("/changeissuestatus").put(isAuthenticated, verifyToken, changeIssueStatusValidation, handleValidationErrors, authorize(["admin", "employee"]), changeIssueStatus);
router.route("/getrecentactivities").get(isAuthenticated, verifyToken, authorize(["admin", "employee"]), getRecentActivities);
router.route("/getrecentactivity").get(isAuthenticated, verifyToken, authorize(["admin", "employee"]), getRecentActivity);
router.route("/getuserperformance/:userId").get(isAuthenticated, verifyToken, authorize(["admin", "employee"]), getUserPerformance);
router.route("/getalluserperformances").get(isAuthenticated, verifyToken, authorize(["admin", "employee"]), getAllUserPerformances);
router.route("/priority-issues").get(isAuthenticated, verifyToken, authorize(["admin", "employee"]), getPriorityIssues);
router.route("/total-issues-by-user").get(isAuthenticated, verifyToken, getIssuesCreatedByUser);
router.route("/get-weekly-review").get(isAuthenticated, verifyToken, authorize(["admin", "employee"]), getWeeklyReview)
router.route("/get-department-wise-analyis").get(isAuthenticated, verifyToken, authorize(["admin", "employee"]), getDepartmentWiseAnalysis)
module.exports = router;