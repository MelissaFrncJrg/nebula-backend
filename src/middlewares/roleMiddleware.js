const ensureRole = (role) => {
  return (req, res, next) => {
    if (req.user?.role === role) {
      return next();
    }

    return res.status(403).json({ message: "Forbidden" });
  };
};

module.exports = { ensureRole };
