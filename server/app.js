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
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
        httpOnly: false,
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60 * 24,
    },
}));
app.use(csrf({ cookie: false }));
app.use((req, res, next) => {
    const token = req.csrfToken(); // Retrieve CSRF token
    res.cookie('XSRF-TOKEN', token);
    res.locals.csrfToken = token; // Set CSRF token in locals
    next();
});

if (process.env.NODE_ENV !== "production") {
    require("dotenv").config({ path: "server/config/config.env" });
}

app.use(passport.initialize());
app.use(passport.session());

// Logging CSRF Token
app.use((req, res, next) => {
    console.log("CSRF Token:", res.locals.csrfToken); // Use res.locals.csrfToken
    next();
});

app.get('/get-csrf-token', (req, res) => {
    console.log(res.locals.csrfToken)
    res.json({ csrfToken: res.locals.csrfToken });
});

app.use(logMiddleware);
app.use("/api/v1", user);
app.use("/api/v1", lawIssue);

app.get("/", (req, res) => {
    res.send("Server is Running! 🚀");
});

app.use(errorHandler);

module.exports = app;
