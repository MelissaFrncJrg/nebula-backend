require("dotenv").config();
const express = require("express");
const session = require("express-session");

require("./strategies/discordStrategy");
require("./strategies/githubStrategy");
require("./strategies/googleStrategy");
require("./strategies/steamStrategy");

const passport = require("passport");

const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(authRoutes);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
