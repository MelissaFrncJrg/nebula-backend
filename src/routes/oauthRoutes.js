const express = require("express");
const jwt = require("jsonwebtoken");
const passport = require("passport");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user.id, email: req.user.email, role: req.user.role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  }
);

router.get("/auth/github", passport.authenticate("github"));
router.get(
  "/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "/login" }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user.id, email: req.user.email, role: req.user.role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  }
);

router.get("/auth/discord", passport.authenticate("discord"));
router.get(
  "/auth/discord/callback",
  passport.authenticate("discord", { failureRedirect: "/login" }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user.id, email: req.user.email, role: req.user.role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  }
);

router.get("/auth/steam", passport.authenticate("steam"));
router.get(
  "/auth/steam/callback",
  passport.authenticate("steam", { failureRedirect: "/login" }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user.id, email: req.user.email, role: req.user.role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  }
);

module.exports = router;
