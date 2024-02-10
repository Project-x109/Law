const passport = require("../middlewares/passport-config");
require("dotenv").config({ path: "./server/config/.env" });
const User = require("../models/User");
const ResetToken = require('../models/ResetToken');
const { logger } = require("../middlewares/logMiddleware");
const { sendForgetPasswordToken } = require("../config/emailMain");
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const secretKey = 'YourSuperSecretKeyHere1234567890';
const asyncErrorHandler = require("../middlewares/asyncErrorHandler")
const bcrypt = require("bcrypt");
exports.Register = asyncErrorHandler(async (req, res) => {
    try {
        const { username, password } = req.body;
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ success: false, error: "Username already taken" });
        }
        const newUser = new User({
            username,
            password,
            role: 'admin',
        });
        await newUser.save();
        logger.info(`User registered with ID: ${newUser._id}`);
        req.login(newUser, (err) => {
            if (err) return res.status(500).json({ error: "Internal Server Error" });
            return res
                .status(201)
                .json({ message: "Registration successful", user: newUser });
        });
    } catch (err) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.RegisterEmployee = asyncErrorHandler(async (req, res) => {
    const error = [];
    try {
        const { username, password, firstName, lastName, dateOfBirth, phoneNo } = req.body;
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            error.push("Username already taken");
            return res.status(400).json({ success: false, error: error });
        }
        const newUser = new User({
            username,
            password,
            firstName,
            lastName,
            birthDate: dateOfBirth,
            phoneNumber: phoneNo,
            role: 'employee',
            status: 'pending'
        });
        await newUser.save();
        logger.info(`User registered with ID: ${newUser._id}`);
        return res.status(201).json({ message: "Registration successful", user: newUser });
    } catch (err) {
        error.push("Internal Server Error")
        return res.status(500).json({ success: false, error: error });
    }
});

exports.resetPassword = asyncErrorHandler(async (req, res) => {
    const error = []
    const { username } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
        error.push('User Not Found')
        return res.status(404).json({ success: false, error: error });
    }

    try {
        let resetToken = await ResetToken.findOne({ userId: user._id });
        if (!resetToken) {
            resetToken = new ResetToken();
            resetToken.userId = user._id;
        }
        resetToken.token = crypto.randomBytes(20).toString('hex');
        resetToken.expirationDate = new Date();
        resetToken.expirationDate.setHours(resetToken.expirationDate.getHours() + 1);
        await resetToken.save();
        sendForgetPasswordToken(user, resetToken.token);
        return res.json({ success: 'Token sent to your email' });
    } catch (err) {
        error.push("Internal Server Error")
        return res.status(500).json({ success: false, error: error });
    }
});
exports.changePassword = asyncErrorHandler(async (req, res) => {
    const { currentPassword, password } = req.body;
    const error = []
    const user = await User.findById(req.user._id);
    if (!user) {
        error.push("User Not Found")
        return res.status(404).json({ success: false, error: error });
    }
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
        error.push("Old Password is Not Correct")
        return res.status(401).json({ success: false, error: error });
    }
    user.password = password;
    try {
        await user.save();
        return res.json({ success: true, message: 'Password updated successfully' });
    } catch (err) {
        error.push("Internal Server Error")
        return res.status(500).json({ success: false, error: error });

    }
});
exports.changeNewUserPassword = asyncErrorHandler(async (req, res) => {
    const { password } = req.body;
    const error = []
    const user = await User.findById(req.user._id);
    if (!user) {
        error.push("User Not Found")
        return res.status(404).json({ success: false, error: error });
    }
    const match = await bcrypt.compare(password, user.password);
    if (match) {
        error.push("New Password Can not be the same as the old password")
        return res.status(401).json({ success: false, error: error });
    }
    user.password = password;
    user.status = 'active';
    try {
        await user.save();
        return res.json({ success: true, message: 'Password updated successfully' });
    } catch (err) {
        error.push("Internal Server Error")
        return res.status(500).json({ success: false, error: error });

    }
});

exports.resetPasswordToken = asyncErrorHandler(async (req, res) => {
    const { token } = req.params;
    const password = req.body.password;
    const error = [];
    try {
        const resetToken = await ResetToken.findOne({ token });
        if (!resetToken) {
            error.push('Invalid or expired token');
            return res.status(404).json({ success: false, error: error });
        }

        if (resetToken.expirationDate < new Date()) {
            error.push("Token has expired");
            return res.status(400).json({ success: false, error: error });
        }

        const user = await User.findById(resetToken.userId);
        if (!user) {
            error.push('User not found');
            return res.status(404).json({ success: false, error: error });
        }

        user.password = password;
        await user.save();
        await ResetToken.deleteOne({ _id: resetToken._id });

        res.status(200).json({ success: 'Password updated successfully' });
    } catch (err) {
        error.push("Internal Server Error")
        return res.status(500).json({ success: false, error: error });

    }
});

exports.login = asyncErrorHandler(async (req, res, next) => {
    const error = [];
    try {
        passport.authenticate("local", async (err, user, info) => {
            if (err) {
                error.push("Internal Server Error on Login")
                return res.status(500).json({ success: false, error: error });
            }
            if (info) {
                error.push(info.message)
                return res.status(400).json({ success: false, error: error });
            }
            req.logIn(user, async (err) => {
                if (err) {
                    error.push("Internal Server Error on Login")
                    return res.status(500).json({ success: false, error: error });
                }
                req.session.user = { username: user.username };
                try {
                    const token = jwt.sign(
                        { username: user.username, _id: user._id, role: user.role, employee: user.employee },
                        secretKey,
                        { expiresIn: '1h' }
                    );
                    return res.json({ success: "Login successful", user, token });
                } catch (err) {
                    error.push("Failed to sign JWT token")
                    return res.status(500).json({ success: false, error: error });
                }
            });
        })(req, res, next);
    } catch (err) {
        error.push("An error occurred while logging in on backend")
        return res.status(500).json({ success: false, error: error });
    }
});
exports.profile = asyncErrorHandler(async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    res.json({ user: req.user });
});
exports.logout = asyncErrorHandler(async (req, res) => {
    const error = []
    req.logout(function (err) {
        if (err) {
            error.push('Internal Server Error')
            return res.status(500).json({ success: false, error: error });
        }
        res.clearCookie(secretKey);
        req.session.destroy((err) => {
            if (err) {
                error.push('Internal Server Error')
                return res.status(500).json({ success: false, error: error });
            }
            res.json({ message: 'Logout successful' });
        });
    });
});
exports.allUsers = asyncErrorHandler(async (req, res) => {
    try {
        // Fetch all users with role 'employee'
        const employees = await User.find({ role: 'employee' });
        return res.status(200).json({ success: true, users: employees });
    } catch (error) {
        return res.status(500).json({ success: false, error: 'Internal Server Error' });
    }

})

exports.deactivatedAccounts = asyncErrorHandler(async (req, res) => {
    const error = []
    try {
        const deactivataedEmployees = await User.find({ status: 'blocked' });
        return res.status(200).json({ success: true, users: deactivataedEmployees })
    } catch (err) {
        error.push('Internal Server Error');
        return res.status(500).json({ success: false, error: error });
    }
})

exports.changeUserStatus = asyncErrorHandler(async (req, res) => {
    try {
        const { id, status } = req.body;
        console.log(id, status)
        const error = [];
        const user = await User.findByIdAndUpdate(id, { status }, { new: true });
        if (!user) {
            error.push("Invalid User ID");
            return res.status(400).json({ success: false, error: error });
        }
        if (user.status === 'blocked' && status === 'blocked') {
            error.push("You Can only change the status of blocked account");
            return res.status(400).json({ success: false, error: error });
        }
        return res.status(201).json({ success: true, data: user, message: 'User Has been Unblocked Successfully' });
    } catch (err) {
        console.error(err);
        const error = ['Internal Server Error'];
        return res.status(500).json({ success: false, error: error });
    }
});
