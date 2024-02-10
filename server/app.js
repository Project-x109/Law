const express = require("express");
const app = express();
const cors = require("cors");
const errorHandler = require("./middlewares/errorhandling.js");
const passport = require("./middlewares/passport-config");
const { logMiddleware, store } = require("./middlewares/logMiddleware.js");
const csrf = require("csurf");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const userRoutes = require("./routes/userRoutes");
const lawIssueRoutes = require("./routes/lawIssueRoutes");
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: false }));
app.use(
  cors({
    origin: ["http://localhost:3000", "https://law-front-cj39.vercel.app"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(
  session({
    secret: "ABCDEFGHSABSDBHJCS",
    resave: true,
    saveUninitialized: true,
    store: store,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

// Create CSRF middleware
const csrfProtection = csrf({
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
    secure: true,
    httpOnly: true,
  },
  name: "X-CSRF-TOKEN",
  value: (req) => req.csrfToken(),
  failAction: (req, res) => {
    res.status(403).send("Invalid CSRF token");
  },
});
app.use(csrfProtection);
app.use((req, res, next) => {
  res.cookie("X-CSRF-TOKEN", req.csrfToken());
  res.locals.csrfToken = req.csrfToken();
  next();
});
app.use(passport.initialize());
app.use(passport.session());
app.use("/api/v1", userRoutes);
app.use("/api/v1", lawIssueRoutes);
app.get("/", (req, res) => {
  res.send("Server is Running! 🚀");
});
app.get("/get-csrf-token", (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});
app.use(logMiddleware);
app.use(errorHandler);

module.exports = app;