const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const CommentSchema = new Schema({
    commenter: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    text: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});
const LawIssueSchema = new Schema({
    issueType: {
        type: String,
        enum: ['criminal', 'civil', 'other'],
        required: true,
    },
    issueRequestDate: {
        type: Date,
        required: true,
    },
    issueStartDate: {
        type: Date,
    },
    issueRegion: {
        type: String,
        required: true,
    },
    requestingDepartment: {
        type: String,
        required: true,
    },
    issueRaisedPlace: {
        type: String,
    },
    issueRaisedOffice: {
        type: String,
    },
    issuedDate: {
        type: Date,
        required: true,
    },
    issuedOfficer: {
        type: String,
    },
    issueOpenDate: {
        type: Date,
    },
    issueDecisionDate: {
        type: Date,
    },
    issueLevel: {
        type: String,
    },
    lawCourt: {
        type: String,
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'closed'],
        default: 'pending',
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    updatedAt: {
        type: Date,
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    comments: [CommentSchema],
});

const LawIssue = mongoose.model("LawIssue", LawIssueSchema);

module.exports = LawIssue;
