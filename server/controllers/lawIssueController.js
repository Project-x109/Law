const LawIssue = require("../models/LawIssue");
const User = require("../models/User")
const asyncErrorHandler = require("../middlewares/asyncErrorHandler");
const path = require('path');
const fs = require('fs');
const csv = require('fast-csv');

exports.addIssue = asyncErrorHandler(async (req, res) => {
    try {
        const {
            issueType,
            issueRequestDate,
            issueStartDate,
            issueRegion,
            requestingDepartment,
            issueRaisedPlace,
            issueRaisedOffice,
            issuedDate,
            issuedOfficer,
            issueOpenDate,
            issueDecisionDate,
            issueLevel,
            lawCourt,
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
            issueRaisedOffice,
            issuedDate,
            issuedOfficer,
            issueOpenDate,
            issueDecisionDate,
            issueLevel,
            lawCourt,
            status,
            createdBy,
        });
        await newLawIssue.save();
        res.status(201).json({ success: true, message: "Law issue added successfully", lawIssue: newLawIssue });
    } catch (error) {
        console.error('Error adding law issue:', error);
        if (error.name === 'ValidationError') {
            // Handle Mongoose validation errors
            return res.status(400).json({ success: false, error: error.message });
        }
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});
exports.updateIssue = asyncErrorHandler(async (req, res) => {
    try {
        const issueId = req.params.issueId;
        const existingIssue = await LawIssue.findById(issueId);
        if (!existingIssue) {
            return res.status(404).json({ success: false, error: 'Law issue not found' });
        }
        if (existingIssue.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, error: 'Unauthorized to update this law issue' });
        }
        const originalData = { ...existingIssue.toObject() };

        // Update the law issue fields
        existingIssue.issueType = req.body.issueType;
        existingIssue.issueRequestDate = req.body.issueRequestDate;
        existingIssue.issueStartDate = req.body.issueStartDate;
        existingIssue.issueRegion = req.body.issueRegion;
        existingIssue.requestingDepartment = req.body.requestingDepartment;
        existingIssue.issueRaisedPlace = req.body.issueRaisedPlace;
        existingIssue.issueRaisedOffice = req.body.issueRaisedOffice;
        existingIssue.issuedDate = req.body.issuedDate;
        existingIssue.issuedOfficer = req.body.issuedOfficer;
        existingIssue.issueOpenDate = req.body.issueOpenDate;
        existingIssue.issueDecisionDate = req.body.issueDecisionDate;
        existingIssue.issueLevel = req.body.issueLevel;
        existingIssue.lawCourt = req.body.lawCourt;
        existingIssue.status = req.body.status;
        existingIssue.updatedAt = new Date();
        existingIssue.updatedBy = req.user._id;
        await existingIssue.save();

        res.status(200).json({
            success: true,
            message: "Law issue updated successfully",
            lawIssue: existingIssue,
            originalData, // Include original data for reference
        });
    } catch (error) {
        console.error('Error updating law issue:', error);

        if (error.name === 'ValidationError') {
            return res.status(400).json({ success: false, error: error.message });
        }
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});
exports.getAllIssues = asyncErrorHandler(async (req, res) => {
    try {
        // Get all law issues from the database
        const allLawIssues = await LawIssue.find();

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
        const lawIssue = await LawIssue.findById(issueId);

        if (!lawIssue) {
            return res.status(404).json({ success: false, error: 'Law issue not found' });
        }

        // Only allow accessing if the user is the creator of the issue or an admin
        if (
            lawIssue.createdBy.toString() !== req.user._id.toString() &&
            !req.user.role.includes("admin")
        ) {
            return res.status(403).json({ success: false, error: 'Unauthorized to access this law issue' });
        }

        res.status(200).json({
            success: true,
            lawIssue,
        });
    } catch (error) {
        console.error('Error getting law issue by ID:', error);

        // Handle other internal server errors
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});
exports.getIssuesByCreatedBy = asyncErrorHandler(async (req, res) => {
    try {
        const userId = req.params.userId;

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
                console.log('CSV file successfully written');
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
// Inside your law controller
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

