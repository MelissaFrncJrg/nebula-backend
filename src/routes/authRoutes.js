const express = require("express");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const qrcode = require("qrcode");
const {
  requestPasswordReset,
  resetPassword,
} = require("../controllers/passwordController");
const { registerUser } = require("../services/authService");
const { resetPasswordLimiter } = require("../middlewares/resetPasswordLimit");
const { body } = require("express-validator");
const { loginLimiter } = require("../middlewares/rateLimiters");
const { PrismaClient } = require("@prisma/client");
const { registerUser } = require("../services/authService");
const { validateRequest } = require("../middlewares/validateRequest");

const prisma = new PrismaClient();
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "nebula_secret_key";

router.post(
  "/register",
  [
    body("email")
      .isEmail()
      .withMessage("Invalid email format")
      .normalizeEmail(),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
    body("username")
      .trim()
      .notEmpty()
      .withMessage("Username is required")
      .escape(),
  ],
  validateRequest,
  async (req, res) => {
    const { email, password, username } = req.body;
    try {
      const { user, secret } = await registerUser(email, password, username);
      const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);
      res.status(201).json({
        message:
          "Account created successfully. Scan this QR code to active the 2Auth authentication.",
        qrCodeUrl,
        userId: user.id,
      });
    } catch (err) {
      if (err.message === "EMAIL_EXISTS") {
        return res.status(400).json({ message: "Email already exists" });
      }

      if (err.message === "USERNAME_EXISTS") {
        return res.status(400).json({ message: "Username already exists" });
      }

      console.error("Error when trying to create the account", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

router.post(
  "/login",
  loginLimiter,
  [
    body("email")
      .isEmail()
      .withMessage("Invalid email format")
      .normalizeEmail(),
    body("password")
      .isString()
      .trim()
      .notEmpty()
      .withMessage("Password is required"),
  ],
  validateRequest,
  async (req, res, next) => {
    passport.authenticate("local", async (err, user, info) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ error: info.message });

      req.login(user, async (err) => {
        if (err) return next(err);

        if (user.isTotpEnabled) {
          req.session.tempUserId = user.id;
          return res.status(200).json({ isTotpEnabled: true });
        }

        const fullUser = await prisma.user.findUnique({
          where: { id: user.id },
          include: { profile: true },
        });

        const token = jwt.sign(
          {
            id: fullUser.id,
            email: fullUser.email,
            role: fullUser.role,
          },
          JWT_SECRET,
          {
            expiresIn: "1d",
          }
        );

        return res.status(200).json({
          success: true,
          user: fullUser,
          token,
        });
      });
    })(req, res, next);
  }
);

router.post(
  "/request-password-reset",
  resetPasswordLimiter,
  requestPasswordReset
);

router.post("/reset-password", resetPassword);

module.exports = router;
