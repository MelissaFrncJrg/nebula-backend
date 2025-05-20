const express = require("express");
const passport = require("passport");
const qrcode = require("qrcode");
const jwt = require("jsonwebtoken");
const { registerUser } = require("../services/authService");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "nebula_secret_key";

router.post("/register", async (req, res) => {
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
});

router.post("/login", async (req, res, next) => {
  passport.authenticate("local", async (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ error: info.message });

    req.login(user, async (err) => {
      if (err) return next(err);

      if (user.isTotpEnabled) {
        req.session.tempUserId = user.id;
        return res.status(200).json({ isTotpEnabled: true });
      }

      // 🔄 Recharge l'utilisateur complet depuis la BDD
      const fullUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: { profile: true }, // si tu veux l'utiliser plus tard
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
      )

      return res.status(200).json({ 
        success: true, 
        user: fullUser,
        token
      });
    });
  })(req, res, next);
});

module.exports = router;
