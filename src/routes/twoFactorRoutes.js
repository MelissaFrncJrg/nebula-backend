const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const { authenticateToken } = require("../middlewares/jwtMiddleware");
const rateLimit2fa = require("../middlewares/rateLimit2fa");
const {
  generateTotpSecret,
  storeTotpSecret,
  enableTwoFactor,
  verifyTotpToken,
  getUserById,
} = require("../services/twoFactorService");

router.post("/enable-2fa", authenticateToken, async (req, res) => {
  const { totpSecret, qrCodeUrl } = await generateTotpSecret(req.user.email);
  await storeTotpSecret(req.user.id, totpSecret);
  res.json({ qrCodeUrl });
});

router.post("/confirm-2fa", authenticateToken, async (req, res) => {
  const { token } = req.body;

  const user = await getUserById(req.user.id);

  if (!verifyTotpToken(user.totpSecret, token)) {
    return res.status(400).json({ error: "Invalid token" });
  }

  await enableTwoFactor(user.id);

  res.json({ success: true });
});

router.post("/verify-2fa", rateLimit2fa, async (req, res) => {
  const { token } = req.body;
  const userId = req.session.tempUserId;
  if (!userId) return res.status(401).json({ error: "No temporary session" });

  const user = await getUserById(userId);

  if (!user) return res.status(404).json({ error: "User not found" });

  if (!verifyTotpToken(user.totpSecret, token)) {
    return res.status(400).json({ error: "Invalid token" });
  }

  const jwtToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || "nebula_secret_key",
    { expiresIn: "1d" }
  );

  req.session.tempUserId = null;

  res.json({
    success: true,
    token: jwtToken,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  });
});

module.exports = router;
