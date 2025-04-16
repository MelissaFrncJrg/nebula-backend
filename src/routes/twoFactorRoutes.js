const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const rateLimit2fa = require("../middlewares/rateLimit2fa");
const {
  generateTotpSecret,
  storeTotpSecret,
  enableTwoFactor,
  verifyTotpToken,
  getUserById,
} = require("../services/twoFactorService");

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ error: "Not authenticated" });
}

router.post("/enable-2fa", ensureAuthenticated, async (req, res) => {
  const { totpSecret, qrCodeUrl } = await generateTotpSecret(req.user.email);
  await storeTotpSecret(req.user.id, totpSecret);
  res.json({ qrCodeUrl });
});

router.post("/confirm-2fa", ensureAuthenticated, async (req, res) => {
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

  req.login(user, (err) => {
    if (err) return res.status(500).json({ error: "Error login after 2FA" });
    req.session.tempUserId = null;
    res.json({ success: true });
  });
});

module.exports = router;
