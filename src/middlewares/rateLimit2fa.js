function rateLimit2fa(req, res, next) {
  const now = Date.now();
  const windowsMs = 5 * 60 * 1000; // 5min
  const maxAttempts = 3;

  if (!req.session.otpTries) {
    req.session.otpTries = [];
  }

  req.session.otpTries = req.session.otpTries.filter(
    (timestamp) => now - timestamp < windowsMs
  );

  if (req.session.otpTries.length >= maxAttempts) {
    req.session.destroy((err) => {
      if (err) return res.status(500).json({ error: "Session error" });
      return res
        .status(401)
        .json({ error: "Too many attempts. You have been disconnected." });
    });
    return;
  }

  req.session.otpTries.push(now);
  next();
}

module.exports = rateLimit2fa;
