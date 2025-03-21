const express = require("express");
const passport = require("passport");

require("../strategies/googleStrategy");
require("../strategies/githubStrategy");
require("../strategies/discordStrategy");
require("../strategies/steamStrategy");

const router = express.Router();

// Google
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect("/");
  }
);

// GitHub
router.get("/auth/github", passport.authenticate("github"));
router.get(
  "/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect("/");
  }
);

// Discord
router.get("/auth/discord", passport.authenticate("discord"));
router.get(
  "/auth/discord/callback",
  passport.authenticate("discord", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect("/");
  }
);

// Steam
router.get("/auth/steam", passport.authenticate("steam"));
router.get(
  "/auth/steam/callback",
  passport.authenticate("steam", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect("/");
  }
);

module.exports = router;
