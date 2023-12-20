const passport = require("../middlewares/passport-config");
require("dotenv").config({ path: "./server/config/.env" });
const User = require("../models/User");
const ResetToken = require('../models/ResetToken');
const { logger } = require("../middlewares/logMiddleware");
const { sendForgetPasswordToken } = require("../config/emailMain");
const { emailValidator, validatePassword } = require("../config/functions");
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const secretKey = 'YourSuperSecretKeyHere1234567890';
const asyncErrorHandler = require("../middlewares/asyncErrorHandler")
exports.Register = asyncErrorHandler(async (req, res) => {
    if (!req.csrfToken()) {
        return res.status(403).json({ error: 'CSRF token verification failed' });
    }
    try {
        const { username, password, ConfirmPassword } = req.body;
        if (emailValidator(username)) {
            return res.status(400).json({ error: "Invalid email format" });
        }
        if (password !== ConfirmPassword) {
            return res
                .status(400)
                .json({ error: "Password and confirm password do not match" });
        }

        const existingUser = await User.findOne({ username });

        if (existingUser) {
            return res.status(400).json({ error: "Username already taken" });
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
            // Send a success response
            return res
                .status(201)
                .json({ message: "Registration successful", user: newUser });
        });
    } catch (err) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.RegisterEmployee = asyncErrorHandler(async (req, res) => {
    console.log(req.user)
    if (!req.csrfToken()) {
        return res.status(403).json({ error: 'CSRF token verification failed' });
    }

    try {
        const { username, password, ConfirmPassword, firstName, lastName, dateOfBirth, phoneNo } = req.body;

        // Validate email format
        if (emailValidator(username)) {
            return res.status(400).json({ error: "Invalid email format" });
        }

        // Check if passwords match
        if (password !== ConfirmPassword) {
            return res.status(400).json({ error: "Password and confirm password do not match" });
        }

        // Check if username is taken
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: "Username already taken" });
        }

        // Create a new user
        const newUser = new User({
            username,
            password,
            firstName,
            lastName,
            birthDate: dateOfBirth,
            phoneNumber: phoneNo,
            role: 'employee',
        });

        // Save the new user to the database
        await newUser.save();

        logger.info(`User registered with ID: ${newUser._id}`);

        // Send a success response
        return res.status(201).json({ message: "Registration successful", user: req.user });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

exports.resetPassword = asyncErrorHandler(async (req, res) => {
    if (!req.csrfToken()) {
        return res.status(403).json({ error: 'CSRF token verification failed' });
    }
    const { username } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
        return res.status(404).json({ error: 'User Not Found' });
    }

    try {
        // Check if a reset token already exists for the user
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
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});
exports.resetPasswordToken = asyncErrorHandler(async (req, res) => {
    const { token } = req.params;
    const ConfirmPassword = req.body.ConfirmPassword;
    const password = req.body.password;
    const resetToken = await ResetToken.findOne({ token });

    if (!resetToken) {
        return res.status(404).json({ error: 'Invalid or expired token' });
    }
    if (resetToken.expirationDate < new Date()) {
        return res.status(400).json({ error: 'Token has expired' });
    }
    if (password !== ConfirmPassword) {
        return res.status(400).json({ error: "Password Dont Match" });
    }
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
        return res.status(400).json({ error: passwordErrors });
    }
    // Update the user's password
    const user = await User.findById(resetToken.userId);
    user.password = req.body.password;
    try {
        await user.save();
        await ResetToken.deleteOne({ _id: resetToken._id });

        res.json({ success: 'Password updated successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
exports.login = asyncErrorHandler(async (req, res, next) => {
    try {
        passport.authenticate("local", async (err, user, info) => {
            if (err) {
                console.error("Error in login authentication:", err);
                return res.status(500).json({ error: "Internal Server Error" });
            }
            if (info) {
                return res.status(400).json({ error: info.message });
            }
            req.logIn(user, async (err) => {
                if (err) {
                    return res.status(500).json({ error: "Internal Server Error" });
                }
                req.session.user = { username: user.username };
                try {
                    const token = jwt.sign(
                        { username: user.username, _id: user._id, role: user.role, employee: user.employee },
                        secretKey,
                        { expiresIn: '1h' }
                    );
                    return res.json({ success: "Login successful", user, token });
                } catch (error) {
                    console.error("Error while signing JWT:", error);
                    return res.status(500).json({ error: "Failed to sign JWT token" });
                }
            });
        })(req, res, next);
    } catch (error) {
        return res.status(500).json({ error: "An error occurred while logging in on backend" });
    }
});
exports.profile = asyncErrorHandler(async (req, res) => {
    console.log(req.user)
    if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    res.json({ user: req.user });
});
exports.updateProfile = asyncErrorHandler(async (req, res) => {
    try {
        const { username, password, ConfirmPassword } = req.body;

        // Validate email format
        if (emailValidator(username)) {
            return res.status(400).json({ error: "Invalid email format" });
        }

        // Validate password and confirm password match
        if (password !== ConfirmPassword) {
            return res
                .status(400)
                .json({ error: "Password and confirm password do not match" });
        }

        // Find the user by ID
        const userId = req.user._id;
        const existingUser = await User.findById(userId);

        if (!existingUser) {
            return res.status(404).json({ error: "User not found" });
        }

        // Update user profile fields
        existingUser.username = username;
        existingUser.password = password;

        // If the user is an admin, update the role
        if (req.user.role === 'admin') {
            existingUser.role = 'admin';
        }

        await existingUser.save();
        logger.info(`User profile updated for ID: ${existingUser._id}`);

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: existingUser,
        });
    } catch (err) {
        console.error('Error updating user profile:', err);

        if (err.name === 'ValidationError') {
            return res.status(400).json({ success: false, error: err.message });
        }
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});
exports.logout = asyncErrorHandler(async (req, res) => {
    req.logout(function (err) {
        if (err) {
            console.error('Error during logout:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.clearCookie(secretKey);
        req.session.destroy((err) => {
            if (err) {
                console.error('Error clearing session:', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
            res.json({ message: 'Logout successful' });
        });
    });
});
exports.allUsers = asyncErrorHandler(async (req, res) => {
    try {
        // Fetch all users with role 'employee'
        const employees = await User.find({ role: 'employee' });
        console.log(employees)
        return res.status(200).json({ success: true, users: employees });
    } catch (error) {
        console.error('Error fetching users:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }

})