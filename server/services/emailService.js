// Implement your email service here (e.g., using a library like nodemailer)
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    // Configure your email service provider settings
    service: 'gmail',
    auth: {
        user: 'your-email@gmail.com',
        pass: 'your-email-password',
    },
});

// Function to send performance review reminder email
const sendPerformanceReviewReminderEmail = async ({ to, subject, body }) => {
    try {
        await transporter.sendMail({
            from: 'your-email@gmail.com',
            to,
            subject,
            text: body,
        });
    } catch (error) {
        console.error(`Error sending email: ${error.message}`);
        throw error;
    }
};

module.exports = { sendPerformanceReviewReminderEmail };
