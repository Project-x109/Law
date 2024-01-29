const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const User = require("../models/User");
passport.use(
  new LocalStrategy(
    {
      usernameField: "username",
      passwordField: "password",
    },
    async (username, password, done) => {
      try {
        const user = await User.findOne({ username });
        if (!user) {
          return done(null, false, { message: "Incorrect username." });
        }
        if (user.status === 'blocked') {
          return done(null, false, { message: "Your account is blocked. Contact the adminstrator" });
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
          user.passwordMistakeCounter += 1;
          if (user.passwordMistakeCounter >= 3) {
            user.status = 'blocked';
            user.passwordMistakeCounter = 0;
          }
          await user.save();
          return done(null, false, { message: "Incorrect password." });
        }
        user.passwordMistakeCounter = 0;
        await user.save();
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);
passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser((id, done) => {
  User.findById(id)
    .then((user) => {
      done(null, user);
    })
    .catch((err) => {
      done(err);
    });
});
module.exports = passport;
