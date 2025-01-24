const express = require("express");
const passport = require("passport");

require("../strategies/googleStrategy");

const router = express.Router();

// Route pour Google
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect("/"); // Redirection après succès
  }
);

module.exports = router;
