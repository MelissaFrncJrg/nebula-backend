const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: "Too many attempts. You can retry later.",
});

const createContentLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  message: "Too many requests. Please wait a minute before trying again.",
});

module.exports = {
  loginLimiter,
  createContentLimiter,
};
