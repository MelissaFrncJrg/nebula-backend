const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const { getUserByEmail } = require("../services/userService");

module.exports = new LocalStrategy(
  { usernameField: "email" },
  async (email, password, done) => {
    try {
      const user = await getUserByEmail(email);
      if (!user) return done(null, false, { message: "Email not found" });

      if (!user.password) {
        return done(null, false, {
          message: "Please use OAuth to login.",
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return done(null, false, { message: "Incorrect password" });

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
);
