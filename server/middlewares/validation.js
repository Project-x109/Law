const { check } = require('express-validator');
const { validationResult } = require('express-validator');
const moment = require('moment')
const validateLawIssueData = [
    check('issueType').notEmpty().isIn(['criminal', 'civil', 'other']).withMessage('Invalid issue type'),
    check('issueRequestDate').notEmpty().custom((value) => moment(value, true).isValid()).withMessage('Invalid issue request date'),
    check('issueStartDate').optional({ nullable: true }).custom((value) => moment(value, true).isValid()).withMessage('Invalid issue start date'),
    check('issueRegion').notEmpty().withMessage('Issue region is required'),
    check('requestingDepartment').notEmpty().withMessage('Requesting department is required'),
    check('issueRaisedPlace').optional({ nullable: true }).notEmpty().withMessage('Invalid issue raised place'),
    check('issueRaisedOffice').optional({ nullable: true }).notEmpty().withMessage('Invalid issue raised office'),
    check('issuedDate').notEmpty().custom((value) => moment(value, true).isValid()).withMessage('Invalid issued date'),
    check('issuedOfficer').optional({ nullable: true }).notEmpty().withMessage('Invalid issued officer'),
    check('issueOpenDate').optional({ nullable: true }).custom((value) => moment(value, true).isValid()).withMessage('Invalid issue open date'),
    check('issueDecisionDate').optional({ nullable: true }).custom((value) => moment(value, true).isValid()).withMessage('Invalid issue decision date'),
    check('issueLevel').optional({ nullable: true }).notEmpty().withMessage('Invalid issue level'),
    check('legalMotions').optional({ nullable: true }).notEmpty().withMessage('Invalid Legal Motion'),
    check('status').optional({ nullable: true }).isIn(['pending', 'processing', 'closed']).withMessage('Invalid status'),
];
const validateLawIssueDataComment = [
    check('issueId').notEmpty().withMessage('Issue ID is required'),
];
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map((error) => error.msg);
        return res.status(400).json({ success: false, errors: errorMessages });
    }

    next();
};

module.exports = {
    validateLawIssueData,
    validateLawIssueDataComment,
    handleValidationErrors,
};