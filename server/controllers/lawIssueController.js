const LawIssue = require("../models/LawIssue");
const User = require("../models/User")
const asyncErrorHandler = require("../middlewares/asyncErrorHandler");
const path = require('path');
const fs = require('fs');
const moment = require('moment');
const csv = require('fast-csv');
const mongoose = require('mongoose');
const { formatResolutionTime, getInitials } = require('../config/functions')
const { startOfWeek, endOfWeek } = require('date-fns');

exports.addIssue = asyncErrorHandler(async (req, res) => {
    const error = [];
    try {
        const {
            issueType,
            issueRegion,
            requestingDepartment,
            issueRaisedPlace,
            issueRaisingOffice,
            issueRaisingOfficer,
            issueRequestDate,
            issueStartDate,
            issuedDate,
            issueOpenDate,
            issueDecisionDate,
            issueLevel,
            legalMotions,
            status,
        } = req.body;
        const createdBy = req.user._id;
        const newLawIssue = new LawIssue({
            issueType,
            issueRequestDate,
            issueStartDate,
            issueRegion,
            requestingDepartment,
            issueRaisedPlace,
            issueRaisedOffice: issueRaisingOffice,
            issuedDate,
            issuedOfficer: issueRaisingOfficer,
            issueOpenDate,
            issueDecisionDate,
            issueLevel,
            legalMotions,
            status,
            createdBy,
        });
        await newLawIssue.save();
        res.status(201).json({ success: true, message: "Law issue added successfully", lawIssue: newLawIssue });
    } catch (err) {
        if (err.name === 'ValidationError') {
            error.push(err.message)
            return res.status(400).json({ success: false, error: error });
        }
        error.push("Internal Server Error")
        res.status(500).json({ success: false, error: error });
    }
});
exports.updateIssue = asyncErrorHandler(async (req, res) => {
    const error = []
    try {
        const issueId = req.params.issueId;
        const existingIssue = await LawIssue.findById(issueId);
        if (!existingIssue) {
            error.push('Law issue not found')
            return res.status(404).json({ success: false, error: error });
        }
        if (existingIssue.createdBy.toString() !== req.user._id.toString()) {
            error.push('Unauthorized to update this law issue')
            return res.status(403).json({ success: false, error: error });
        }
        const originalData = { ...existingIssue.toObject() };
        existingIssue.issueType = req.body.issueType;
        existingIssue.issueRequestDate = req.body.issueRequestDate;
        existingIssue.issueStartDate = req.body.issueStartDate;
        existingIssue.issueRegion = req.body.issueRegion;
        existingIssue.requestingDepartment = req.body.requestingDepartment;
        existingIssue.issueRaisedPlace = req.body.issueRaisedPlace;
        existingIssue.issueRaisedOffice = req.body.issueRaisingOffice;
        existingIssue.issuedDate = req.body.issuedDate;
        existingIssue.issuedOfficer = req.body.issueRaisingOfficer;
        existingIssue.issueOpenDate = req.body.issueOpenDate;
        existingIssue.issueDecisionDate = req.body.issueDecisionDate;
        existingIssue.issueLevel = req.body.issueLevel;
        existingIssue.legalMotions = req.body.legalMotions;
        existingIssue.status = req.body.status;
        existingIssue.updatedAt = new Date();
        existingIssue.updatedBy = req.user._id;
        await existingIssue.save();

        res.status(200).json({
            success: true,
            message: "Law issue updated successfully",
            lawIssue: existingIssue,
            originalData,
        });
    } catch (err) {
        if (err.name === 'ValidationError') {
            error.push(error.message)
            return res.status(400).json({ success: false, error: error });
        }
        error.push('Internal Server Error')
        res.status(500).json({ success: false, error: error });
    }
});
exports.getAllIssues = asyncErrorHandler(async (req, res) => {
    try {
        const allLawIssues = await LawIssue.find().populate('createdBy');
        res.status(200).json({
            success: true,
            message: "All law issues retrieved successfully",
            lawIssues: allLawIssues,
        });
    } catch (error) {
        console.error('Error retrieving all law issues:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});
exports.getIssueById = asyncErrorHandler(async (req, res) => {
    try {
        const issueId = req.params.issueId;

        // Check if the issue exists
        const lawIssue = await LawIssue.findById(issueId).populate('createdBy');
        if (!lawIssue) {
            return res.status(404).json({ success: false, error: 'Law issue not found' });
        }

        // Only allow accessing if the user is the creator of the issue or an admin
        /* if (
            lawIssue.createdBy.toString() !== req.user._id.toString() &&
            !req.user.role.includes("admin")
        ) {
            return res.status(403).json({ success: false, error: 'Unauthorized to access this law issue' });
        } */

        res.status(200).json({
            success: true,
            lawIssue,
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});
exports.getIssuesByCreatedBy = asyncErrorHandler(async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        const issues = await LawIssue.find({ createdBy: userId });
        res.status(200).json({
            success: true,
            message: `Law issues created by ${user.username}`,
            issues: issues,
        });
    } catch (error) {
        console.error('Error fetching law issues by createdBy:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});
exports.getIssuesByLogin = asyncErrorHandler(async (req, res) => {
    try {
        const userId = req.user._id;

        // Check if the user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        // Fetch law issues created by the user
        const issues = await LawIssue.find({ createdBy: userId });

        res.status(200).json({
            success: true,
            message: `Law issues created by ${user.username}`,
            issues: issues,
        });
    } catch (error) {
        console.error('Error fetching law issues by createdBy:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});
exports.deleteIssue = asyncErrorHandler(async (req, res) => {
    try {
        const issueId = req.params.issueId;
        const existingIssue = await LawIssue.findById(issueId);
        if (!existingIssue) {
            return res.status(404).json({ success: false, error: 'Law issue not found' });
        }
        if (existingIssue.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, error: 'Unauthorized to delete this law issue' });
        }
        await existingIssue.deleteOne();
        res.status(200).json({
            success: true,
            message: "Law issue deleted successfully",
            lawIssue: existingIssue,
        });
    } catch (error) {
        console.error('Error deleting law issue:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});
exports.exportLawIssues = asyncErrorHandler(async (req, res) => {
    try {
        const lawIssues = await LawIssue.find();
        if (!lawIssues || lawIssues.length === 0) {
            return res.status(404).json({ success: false, message: 'No law issues found' });
        }
        const csvData = [];
        const headers = [
            'Issue Type',
            'Request Date',
            'Start Date',
            'Region',
            'Requesting Department',
            'Raised Place',
            'Raised Office',
            'Issued Date',
            'Issued Officer',
            'Open Date',
            'Decision Date',
            'Issue Level',
            'Law Court',
            'Status',
            'Created By',
            'Updated At',
            'Updated By',
        ];
        csvData.push(headers);
        lawIssues.forEach((lawIssue) => {
            const lawIssueRow = [
                lawIssue.issueType,
                lawIssue.issueRequestDate,
                lawIssue.issueStartDate,
                lawIssue.issueRegion,
                lawIssue.requestingDepartment,
                lawIssue.issueRaisedPlace,
                lawIssue.issueRaisedOffice,
                lawIssue.issuedDate,
                lawIssue.issuedOfficer,
                lawIssue.issueOpenDate,
                lawIssue.issueDecisionDate,
                lawIssue.issueLevel,
                lawIssue.lawCourt,
                lawIssue.status,
                lawIssue.createdBy,
                lawIssue.updatedAt,
                lawIssue.updatedBy,
            ];
            csvData.push(lawIssueRow);
        });
        const csvFilePath = path.join(__dirname, '../exports/lawIssues.csv');
        csv.writeToPath(csvFilePath, csvData)
            .on('finish', () => {
                res.status(200).json({
                    success: true,
                    message: 'Law issue data exported successfully',
                    downloadLink: `/exports/lawIssues.csv`,
                });
            })
            .on('error', (err) => {
                console.error('Error writing CSV:', err);
                res.status(500).json({ success: false, error: 'Internal Server Error' });
            });
    } catch (error) {
        console.error('Error exporting law issues:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});
exports.addComment = asyncErrorHandler(async (req, res) => {
    try {
        const issueId = req.params.issueId;
        const { text } = req.body;
        const commenterId = req.user._id;

        // Find the law issue
        const lawIssue = await LawIssue.findById(issueId);

        if (!lawIssue) {
            return res.status(404).json({ success: false, error: 'Law issue not found' });
        }

        // Add the comment
        lawIssue.comments.push({ commenter: commenterId, text });

        // Save the updated law issue
        await lawIssue.save();

        res.status(200).json({
            success: true,
            message: 'Comment added successfully',
            comment: lawIssue.comments[lawIssue.comments.length - 1],
        });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});
exports.getComments = asyncErrorHandler(async (req, res) => {
    try {
        const issueId = req.params.issueId;
        const lawIssue = await LawIssue.findById(issueId);
        if (!lawIssue) {
            return res.status(404).json({ success: false, error: 'Law issue not found' });
        }
        res.status(200).json({
            success: true,
            comments: lawIssue.comments,
        });
    } catch (error) {
        console.error('Error retrieving comments:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});
exports.updateComment = asyncErrorHandler(async (req, res) => {
    try {
        const issueId = req.params.issueId;
        const commentId = req.params.commentId;
        const { text } = req.body;
        const commenterId = req.user._id;
        const lawIssue = await LawIssue.findById(issueId);
        if (!lawIssue) {
            return res.status(404).json({ success: false, error: 'Law issue not found' });
        }
        const commentIndex = lawIssue.comments.findIndex(comment => comment._id.toString() === commentId);
        if (commentIndex === -1) {
            return res.status(404).json({ success: false, error: 'Comment not found' });
        }
        if (lawIssue.comments[commentIndex].commenter.toString() !== commenterId.toString()) {
            return res.status(403).json({ success: false, error: 'Unauthorized to update this comment' });
        }
        lawIssue.comments[commentIndex].text = text;
        await lawIssue.save();
        res.status(200).json({
            success: true,
            message: 'Comment updated successfully',
            updatedComment: lawIssue.comments[commentIndex],
        });
    } catch (error) {
        console.error('Error updating comment:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});
exports.deleteComment = asyncErrorHandler(async (req, res) => {
    try {
        const issueId = req.params.issueId;
        const commentId = req.params.commentId;

        // Find the law issue
        const lawIssue = await LawIssue.findById(issueId);

        if (!lawIssue) {
            return res.status(404).json({ success: false, error: 'Law issue not found' });
        }

        // Find the index of the comment to delete
        const commentIndex = lawIssue.comments.findIndex(comment => comment._id.toString() === commentId);

        if (commentIndex === -1) {
            return res.status(404).json({ success: false, error: 'Comment not found' });
        }

        // Remove the comment from the array
        const deletedComment = lawIssue.comments.splice(commentIndex, 1)[0];

        // Save the updated law issue
        await lawIssue.save();

        res.status(200).json({
            success: true,
            message: 'Comment deleted successfully',
            deletedComment,
        });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});
exports.getDashboardSummary = asyncErrorHandler(async (req, res) => {
    try {
        const totalIssues = await LawIssue.countDocuments();
        const issuesByStatus = await LawIssue.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                },
            },
        ]);
        const averageResolutionTime = await LawIssue.aggregate([
            {
                $match: {
                    issuedDate: { $exists: true },
                    issueDecisionDate: { $exists: true },
                },
            },
            {
                $group: {
                    _id: null,
                    totalResolutionTime: {
                        $avg: {
                            $subtract: ["$issueDecisionDate", "$issuedDate"],
                        },
                    },
                },
            },
        ]);
        const summary = {
            totalIssues,
            issuesByStatus,
            averageResolutionTime: formatResolutionTime(averageResolutionTime[0]?.totalResolutionTime) || 0, // Handle cases where there are no resolved issues
        };

        res.status(200).json({
            success: true,
            message: "Dashboard summary retrieved successfully",
            summary,
        });
    } catch (error) {
        console.error('Error getting dashboard summary:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});
exports.getUserDashboardSummary = asyncErrorHandler(async (req, res) => {
    try {
        const createdBy = req.user._id;
        const userIssues = await LawIssue.find({ createdBy });
        const totalIssues = userIssues.length;
        const issuesByStatus = userIssues.reduce((result, issue) => {
            const status = issue.status;
            const existingStatus = result.find(item => item._id === status);
            if (existingStatus) {
                existingStatus.count += 1;
            } else {
                result.push({ _id: status, count: 1 });
            }
            return result;
        }, []);
        const resolvedIssues = userIssues.filter(issue =>
            issue.issuedDate && issue.issueDecisionDate
        );
        const totalResolutionTime = resolvedIssues.reduce((sum, issue) => {
            const resolutionTime = issue.issueDecisionDate - issue.issuedDate;
            return sum + resolutionTime;
        }, 0);
        const averageResolutionTime =
            resolvedIssues.length > 0
                ? totalResolutionTime / resolvedIssues.length
                : 0;

        const averageResolutionTimeFormatted = formatResolutionTime(averageResolutionTime);

        const summary = {
            totalIssues,
            issuesByStatus,
            averageResolutionTime: averageResolutionTimeFormatted,
        };

        res.status(200).json({
            success: true,
            message: "Dashboard summary retrieved successfully",
            summary,
        });
    } catch (error) {
        console.error('Error getting user dashboard summary:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

exports.changeIssueStatus = asyncErrorHandler(async (req, res) => {
    const error = [];
    try {
        const { id, status } = req.body;
        const issue = await LawIssue.findById(id);
        if (!issue) {
            error.push('Law issue not found');
            return res.status(404).json({ success: false, error: error });
        }
        if (issue.createdBy.toString() !== req.user._id.toString()) {
            error.push('Unauthorized to update this law issue');
            return res.status(403).json({ success: false, error: error });
        }
        if (issue.status === 'closed') {
            error.push('You can\'t change the status of closed issues');
            return res.status(403).json({ success: false, error: error });
        }
        issue.status = status;
        await issue.save();

        res.status(200).json({
            success: true,
            message: `Law issue status updated to ${status} successfully`,
            lawIssue: issue,
        });
    } catch (err) {
        if (err.name === 'ValidationError') {
            error.push(err.message)
            return res.status(400).json({ success: false, error: error });
        }
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});
exports.getRecentActivities = asyncErrorHandler(async (req, res) => {
    const error = [];
    try {
        const recentActivities = await LawIssue.find()
            .sort({ updatedAt: -1, createdAt: -1 })
            .limit(10).populate('createdBy');
        const formattedActivities = recentActivities.map(activity => {
            return {
                issueId: activity._id,
                issueType: activity.issueType,
                status: activity.status,
                issueRegion: activity.issueRegion,
                requestingDepartment: activity.requestingDepartment,
                issueLevel: activity.issueLevel,
                legalMotions: activity.legalMotions,
                createdBy: activity.createdBy,
                updatedAt: activity.updatedAt,
                updatedBy: activity.updatedBy,
            };
        });
        res.status(200).json({
            success: true,
            message: "Recent activities retrieved successfully",
            recentActivities: formattedActivities,
        });
    } catch (err) {
        if (err.name === 'ValidationError') {
            error.push(err.message)
            return res.status(400).json({ success: false, error: error });
        }
        error.push('Internal Server Error')
        res.status(500).json({ success: false, error: error });
    }
});
exports.getRecentActivity = asyncErrorHandler(async (req, res) => {
    const error = [];
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);
        if (!user) {
            error.push('User not found')
            return res.status(404).json({ success: false, error: error });
        }
        const recentActivities = await LawIssue.find({
            createdBy: userId,
        })
            .sort({ updatedAt: -1 })
            .limit(10).populate('createdBy');;
        const formattedActivities = recentActivities.map(activity => {
            return {
                issueId: activity._id,
                issueType: activity.issueType,
                status: activity.status,
                issueRegion: activity.issueRegion,
                requestingDepartment: activity.requestingDepartment,
                issueLevel: activity.issueLevel,
                legalMotions: activity.legalMotions,
                createdBy: activity.createdBy,
                updatedAt: activity.updatedAt,
                updatedBy: activity.updatedBy,
            };
        });
        res.status(200).json({
            success: true,
            message: `Recent activities for ${user.username}`,
            recentActivities: formattedActivities,
        });
    } catch (err) {
        if (err.name === 'ValidationError') {
            error.push(err.message)
            return res.status(400).json({ success: false, error: error });
        }
        error.push('Internal Server Error')
        res.status(500).json({ success: false, error: error });
    }
});
exports.getUserPerformance = asyncErrorHandler(async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        const userIssues = await LawIssue.find({ createdBy: userId });
        const resolvedIssues = userIssues.filter(issue => issue.status === 'closed');
        const numberOfResolvedIssues = resolvedIssues.length;
        let totalResolutionTime = 0;
        resolvedIssues.forEach(issue => {
            if (issue.issueDecisionDate && issue.issueOpenDate) {
                const resolutionTime = moment(issue.issueDecisionDate).diff(moment(issue.issueOpenDate), 'days');
                totalResolutionTime += resolutionTime;
            }
        });
        const averageResolutionTime = numberOfResolvedIssues > 0 ?
            totalResolutionTime / numberOfResolvedIssues :
            0;

        res.status(200).json({
            success: true,
            message: `User performance for ${user.username}`,
            numberOfResolvedIssues,
            averageResolutionTime,
        });
    } catch (error) {
        console.error('Error fetching user performance:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});
exports.getAllUserPerformances = asyncErrorHandler(async (req, res) => {
    const error = [];
    try {
        // Fetch all users
        const allUsers = await User.find();
        if (!allUsers || allUsers.length === 0) {
            error.push('No users found');
            return res.status(404).json({ success: false, error: error });
        }
        const userPerformances = [];
        for (const user of allUsers) {
            const userId = user._id;
            const userIssues = await LawIssue.find({ createdBy: userId });
            const resolvedIssues = userIssues.filter(issue => issue.status === 'closed');
            const numberOfResolvedIssues = resolvedIssues.length;

            let totalResolutionTime = 0;
            resolvedIssues.forEach(issue => {
                if (issue.issueDecisionDate && issue.issueOpenDate) {
                    const resolutionTime = moment(issue.issueDecisionDate).diff(moment(issue.issueOpenDate), 'days');
                    totalResolutionTime += resolutionTime;
                }
            });

            const averageResolutionTime = numberOfResolvedIssues > 0 ?
                totalResolutionTime / numberOfResolvedIssues :
                0;

            userPerformances.push({
                userId,
                firstName: user.firstName,
                lastName: user.lastName,
                initials: getInitials(user.firstName, user.lastName),
                numberOfResolvedIssues,
                averageResolutionTime,
            });
        }
        userPerformances.sort((a, b) => b.numberOfResolvedIssues - a.numberOfResolvedIssues);
        const topUserPerformances = userPerformances.slice(0, 10);

        res.status(200).json({
            success: true,
            message: 'User performances retrieved successfully',
            topUserPerformances,
        });
    } catch (err) {
        error.push('Internal Server Error')
        res.status(500).json({ success: false, error: error });
    }
});
exports.getPriorityIssues = asyncErrorHandler(async (req, res) => {
    try {
        let userId;
        const userRole = req.user.role;

        if (userRole === 'admin') {
            const highCount = await LawIssue.countDocuments({ issueLevel: 'high' });
            const mediumCount = await LawIssue.countDocuments({ issueLevel: 'medium' });
            const lowCount = await LawIssue.countDocuments({ issueLevel: 'low' });
            res.status(200).json({
                success: true,
                message: 'Priority issue counts for all users',
                counts: {
                    high: highCount,
                    medium: mediumCount,
                    low: lowCount,
                },
            });
        } else {
            userId = req.user._id;
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ success: false, error: 'User not found' });
            }

            const highCount = await LawIssue.countDocuments({
                createdBy: new mongoose.Types.ObjectId(userId),
                issueLevel: 'high',
            });

            const mediumCount = await LawIssue.countDocuments({
                createdBy: new mongoose.Types.ObjectId(userId),
                issueLevel: 'medium',
            });

            const lowCount = await LawIssue.countDocuments({
                createdBy: new mongoose.Types.ObjectId(userId),
                issueLevel: 'low',
            });

            res.status(200).json({
                success: true,
                message: `Priority issue counts for ${user.username}`,
                counts: {
                    high: highCount,
                    medium: mediumCount,
                    low: lowCount,
                },
            });
        }
    } catch (error) {
        console.error('Error fetching priority issue counts:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});
exports.getIssuesCreatedByUser = asyncErrorHandler(async (req, res) => {
    try {
        const createdByUserAggregation = await LawIssue.aggregate([
            {
                $group: {
                    _id: "$createdBy",
                    totalIssues: { $sum: 1 },
                },
            },
            {
                $sort: { totalIssues: -1 },
            },
            {
                $limit: 5,
            },
        ]);

        const resultWithUserDetails = await User.populate(createdByUserAggregation, {
            path: "_id",
            select: "username firstName lastName role",
        });

        const resultWithInitials = resultWithUserDetails.map((item) => {
            const initials = item._id
                ? `${item._id.firstName.charAt(0)}${item._id.lastName.charAt(0)}`
                : 'NA';

            return {
                ...item,
                initials,
            };
        });
        res.status(200).json({
            success: true,
            message: "Total number of issues created by each user",
            data: resultWithInitials,
        });
    } catch (err) {
        console.log(err)
        const error = []
        error.push('Internal Server Error')
        res.status(500).json({ success: false, error: error });
    }
});
exports.getWeeklyReview = asyncErrorHandler(async (req, res) => {
    const error = []
    try {
        const userId = req.user._id;
        if (!userId) {
            error.push('userId is mandatory');
            res.status(403).json({ success: false, error: error })
        }
        const startDate = startOfWeek(new Date(), { weekStartsOn: 1 });
        const endDate = endOfWeek(new Date(), { weekStartsOn: 1 });
        let statusDistribution
        if (req.user.role === "employee") {
            statusDistribution = await LawIssue.aggregate([
                {
                    $match: {
                        createdBy: new mongoose.Types.ObjectId(userId),
                        createdAt: { $gte: startDate, $lte: endDate },
                    },
                },
                {
                    $group: {
                        _id: "$status",
                        count: { $sum: 1 },
                    },
                },
            ]);
        } else {
            statusDistribution = await LawIssue.aggregate([
                {
                    $match: {
                        createdAt: { $gte: startDate, $lte: endDate },
                    },
                },
                {
                    $group: {
                        _id: "$status",
                        count: { $sum: 1 },
                    },
                },
            ]);
        }
        if (!statusDistribution) {
            statusDistribution = [];
        }
        const formattedStatusDistribution = statusDistribution.reduce(
            (acc, { _id, count }) => {
                acc[_id] = count;
                return acc;
            },
            {}
        );

        res.status(200).json({ success: true, weeklyReview: formattedStatusDistribution });
    } catch (error) {
        console.error('Error retrieving weekly review:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});
exports.getDepartmentWiseAnalysis = asyncErrorHandler(async (req, res) => {
    try {
        const departmentAnalysis = await LawIssue.aggregate([
            {
                $group: {
                    _id: "$requestingDepartment",
                    totalIssues: { $sum: 1 },
                },

            },
            {
                $sort: { totalIssues: -1 },
            },
            {
                $limit: 5,
            },
        ]);

        res.status(200).json({
            success: true,
            message: "Department-wise Analysis",
            data: departmentAnalysis,
        });
    } catch (error) {
        console.error('Error fetching Department-wise Analysis:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});
