const { check } = require('express-validator');
const { validationResult } = require('express-validator');
const validateLawIssueData = [
    check('issueType').notEmpty().isIn(['criminal', 'civil', 'other']).withMessage('Invalid issue type'),
    check('issueRequestDate').notEmpty().isDate().withMessage('Invalid issue request date'),
    check('issueStartDate').optional({ nullable: true }).isDate().withMessage('Invalid issue start date'),
    check('issueRegion').notEmpty().withMessage('Issue region is required'),
    check('requestingDepartment').notEmpty().withMessage('Requesting department is required'),
    check('issueRaisedPlace').optional({ nullable: true }).notEmpty().withMessage('Invalid issue raised place'),
    check('issueRaisedOffice').optional({ nullable: true }).notEmpty().withMessage('Invalid issue raised office'),
    check('issuedDate').notEmpty().isDate().withMessage('Invalid issued date'),
    check('issuedOfficer').optional({ nullable: true }).notEmpty().withMessage('Invalid issued officer'),
    check('issueOpenDate').optional({ nullable: true }).isDate().withMessage('Invalid issue open date'),
    check('issueDecisionDate').optional({ nullable: true }).isDate().withMessage('Invalid issue decision date'),
    check('issueLevel').optional({ nullable: true }).notEmpty().withMessage('Invalid issue level'),
    check('lawCourt').optional({ nullable: true }).notEmpty().withMessage('Invalid law court'),
    check('status').optional({ nullable: true }).isIn(['pending', 'processing', 'closed']).withMessage('Invalid status'),
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
    handleValidationErrors,
};