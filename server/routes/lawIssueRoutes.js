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

router.route("/addissue").post( verifyToken, validateLawIssueData, handleValidationErrors, authorize(["admin", "employee"]), addIssue)
router.route("/updateissue/:issueId").put( verifyToken, validateLawIssueData, handleValidationErrors, authorize(["admin", "employee"]), updateIssue);
router.route("/getallissues").get( verifyToken, authorize(["admin", "employee"]), getAllIssues);
router.route("/addcomment/:issueId").post( verifyToken, validateLawIssueDataComment, handleValidationErrors, authorize(["admin", "employee"]), addComment);
router.route("/getcomment/:issueId").get( verifyToken, authorize(["admin", "employee"]), getComments);
router.route("/updatecomment/:issueId/:commentId").put( verifyToken, validateLawIssueDataComment, handleValidationErrors, authorize(["admin", "employee"]), updateComment);
router.route("/getissuebyid/:issueId").get( verifyToken, authorize(["admin", "employee"]), getIssueById);
router.route("/getissuesbycreatedby/:userId").get( verifyToken, authorize(["admin", "employee"]), getIssuesByCreatedBy);
router.route("/getissuesbylogin").get( verifyToken, authorize(["admin", "employee"]), getIssuesByLogin);
router.route("/deleteissue/:issueId").delete( verifyToken, authorize(["admin", "employee"]), deleteIssue);
router.route("/deletecomment/:issueId/:commentId").delete( verifyToken, authorize(["admin", "employee"]), deleteComment);
router.route("/exportlawissues").get( verifyToken, authorize(["admin", "employee"]), exportLawIssues);
router.route("/getdashboardsummery").get( verifyToken, authorize(["admin", "employee"]), getDashboardSummary);
router.route("/getuserdashboardsummary").get( verifyToken, authorize(["admin", "employee"]), getUserDashboardSummary);
router.route("/changeissuestatus").put( verifyToken, changeIssueStatusValidation, handleValidationErrors, authorize(["admin", "employee"]), changeIssueStatus);
router.route("/getrecentactivities").get( verifyToken, authorize(["admin", "employee"]), getRecentActivities);
router.route("/getrecentactivity").get( verifyToken, authorize(["admin", "employee"]), getRecentActivity);
router.route("/getuserperformance/:userId").get( verifyToken, authorize(["admin", "employee"]), getUserPerformance);
router.route("/getalluserperformances").get( verifyToken, authorize(["admin", "employee"]), getAllUserPerformances);
router.route("/priority-issues").get( verifyToken, authorize(["admin", "employee"]), getPriorityIssues);
router.route("/total-issues-by-user").get( verifyToken, getIssuesCreatedByUser);
router.route("/get-weekly-review").get( verifyToken, authorize(["admin", "employee"]), getWeeklyReview)
router.route("/get-department-wise-analyis").get( verifyToken, authorize(["admin", "employee"]), getDepartmentWiseAnalysis)
module.exports = router;