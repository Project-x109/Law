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
const lawIssue = require("./routes/lawIssueRoutes")
app.use(
    cors({
        origin: ["http://localhost:3000", "http://192.168.56.1:3000"],
        credentials: true,
    })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
    session({
        secret: 'ABCDEFGHSABSDBHJCS',
        resave: false,
        saveUninitialized: false,
        store: store,
        cookie: {
            httpOnly: true,
            sameSite: 'strict',
            maxAge: 1000 * 60 * 60 * 24,
        },
    })
);
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config({ path: "server/config/config.env" });
}

app.use(csrf({ cookie: false }));
app.use((req, res, next) => {
    console.log("CSRF Token:", req.csrfToken());
    console.log("Request:", req);
    next();
});
app.use(passport.initialize());
app.use(passport.session());
app.get('/get-csrf-token', (req, res) => {
    console.log(req.csrfToken())
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
