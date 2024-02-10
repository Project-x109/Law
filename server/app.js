const express = require("express");
const app = express();
const cors = require("cors");
const errorHandler = require("./middlewares/errorhandling.js");
const passport = require("./middlewares/passport-config");
const { logMiddleware, store } = require("./middlewares/logMiddleware.js");
const csrf = require("csurf");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const user = require("./routes/userRoutes");
const lawIssue = require("./routes/lawIssueRoutes");

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: false }));
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(session({
    secret: 'ABCDEFGHSABSDBHJCS',
    resave: true,
    saveUninitialized: true,
    store: store,
    cookie: {
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60 * 24,
    },
}));

// Create CSRF middleware
const csrfProtection = csrf({ cookie: false });
app.use(csrfProtection);

// Set CSRF token in cookie and locals
app.use((req, res, next) => {
    res.cookie('X-CSRF-Token', req.csrfToken());
    res.locals.csrfToken = req.csrfToken();
    next();
});

// Logging CSRF Token
app.use((req, res, next) => {
    console.log("CSRF Token:", res.locals.csrfToken);
    next();
});

// CSRF token validation middleware
app.use((err, req, res, next) => {
    const error = []
    if (err.code !== 'EBADCSRFTOKEN') return next(err);
    error.push('Invalid CSRF token')
    res.status(403).json({ success: false, error: error });
});

if (process.env.NODE_ENV !== "production") {
    require("dotenv").config({ path: "server/config/config.env" });
}

app.use(passport.initialize());
app.use(passport.session());

app.get('/get-csrf-token', (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
});

app.use(logMiddleware);
app.use("/api/v1", user);
app.use("/api/v1", lawIssue);

app.get("/", (req, res) => {
    res.send("Server is Running! 🚀");
});

app.use(errorHandler);

module.exports = app;
