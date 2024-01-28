const { check } = require('express-validator');
const { validationResult } = require('express-validator');
const moment = require('moment')
const { emailValidator, phoneValidator, isValidDateOfBirth } = require("../config/functions")
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
        return res.status(400).json({ success: false, error: errorMessages });
    }

    next();
};

const validateUserRegistration = [
    check('username')
        .notEmpty().withMessage('Email is Required')
        .isEmail().withMessage('Invalid Email Format')
        .custom((value) => emailValidator(value))
        .withMessage('Invalid Email Format'),
    check('password')
        .notEmpty().withMessage('Password is Required')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/[a-zA-Z]/).withMessage('Password must contain at least one letter')
        .matches(/[0-9]/).withMessage('Password must contain at least one number')
        .matches(/[^a-zA-Z0-9]/).withMessage('Password must contain at least one special character'),
    check('ConfirmPassword')
        .notEmpty().withMessage('Confirm Password is Required')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords do not match');
            }
            return true;
        }).withMessage('Passwords do not match'),
];

const validateEmployeeRegistration = [
    check('username')
        .notEmpty().withMessage('Email is Required')
        .isEmail().withMessage('Invalid Email Format')
        .custom((value) => emailValidator(value))
        .withMessage('Invalid Email Format'),
    check('password')
        .notEmpty().withMessage('Password is Required')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/[a-zA-Z]/).withMessage('Password must contain at least one letter')
        .matches(/[0-9]/).withMessage('Password must contain at least one number')
        .matches(/[^a-zA-Z0-9]/).withMessage('Password must contain at least one special character'),
    check('ConfirmPassword')
        .notEmpty().withMessage('Confirm Password is Required')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords do not match');
            }
            return true;
        }).withMessage('Passwords do not match'),
    check('firstName').notEmpty()
        .withMessage('First Name is Required')
        .isLength({ min: 5, max: 30 }).withMessage('First Name should be between 5 and 30 characters long'),
    check('lastName').notEmpty()
        .withMessage('First Name is Required')
        .isLength({ min: 5, max: 30 }).withMessage('Last Name should be between 5 and 30 characters long'),
    check('phoneNo')
        .notEmpty().withMessage("Phone Number is Required")
        .isMobilePhone().withMessage("Invalid Phone Number")
        .custom((value) => phoneValidator(value)).withMessage("invalid phone Number"),
    check('dateOfBirth')
        .notEmpty().withMessage("Date of Birth is Required")
        .custom((value) => isValidDateOfBirth(value)).withMessage("Invalid Date of Birth"),


];
const validateResetPassowrd = [
    check('username')
        .notEmpty().withMessage('Email is Required')
        .isEmail().withMessage('Invalid Email Format')
        .custom((value) => emailValidator(value))
        .withMessage('Invalid Email Format'),
]
const validateUserLogin = [
    check('username')
        .notEmpty().withMessage('Email is Required')
        .isEmail().withMessage('Invalid Email Format')
        .custom((value) => emailValidator(value))
        .withMessage('Invalid Email Format'),
    check('password')
        .notEmpty().withMessage('Password is Required')
]
const validateChangePassword = [
    check('password')
        .notEmpty().withMessage('Password is Required')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/[a-zA-Z]/).withMessage('Password must contain at least one letter')
        .matches(/[0-9]/).withMessage('Password must contain at least one number')
        .matches(/[^a-zA-Z0-9]/).withMessage('Password must contain at least one special character'),
    check('confirmPassword')
        .notEmpty().withMessage('Confirm Password is Required')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords do not match');
            }
            return true;
        }).withMessage('Passwords do not match'),
]

const validateOldPasswordChange = [
    check('currentPassword')
        .notEmpty().withMessage('Old Password is Required'),
    check('password')
        .notEmpty().withMessage('New Password is Required')
        .isLength({ min: 8 }).withMessage('New Password must be at least 8 characters')
        .matches(/[a-zA-Z]/).withMessage('New Password must contain at least one letter')
        .matches(/[0-9]/).withMessage('New Password must contain at least one number')
        .matches(/[^a-zA-Z0-9]/).withMessage('ew Password must contain at least one special character')
        .custom((value, { req }) => {
            if (value === req.body.oldPassword) {
                throw new Error("New password cannot be the same as old password");
            }
            return true;
        }).withMessage("Old Password and New Password Can not be the same"),
    check('confirmPassword')
        .notEmpty().withMessage('Confirm Password is Required')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('New Password and Confirm Password do not match');
            }
            return true;
        }).withMessage('New Password and Confirm Password do not match'),
]


module.exports = {
    validateLawIssueData,
    validateLawIssueDataComment,
    validateUserRegistration,
    validateEmployeeRegistration,
    validateResetPassowrd,
    validateUserLogin,
    validateChangePassword,
    validateOldPasswordChange,
    handleValidationErrors,
};