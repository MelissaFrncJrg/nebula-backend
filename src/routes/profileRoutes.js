const express = require("express");
const router = express.Router();
const {
  getProfile,
  updateProfile,
  switchToCreator,
  deleteAccount,
} = require("../controllers/profileController");
const { ensureAuthenticated } = require("../middlewares/authMiddleware");
const { authenticateToken } = require("../middlewares/jwtMiddleware");

router.get("/", authenticateToken, getProfile);

router.patch("/", ensureAuthenticated, updateProfile);

router.delete("/delete-account", ensureAuthenticated, deleteAccount);

router.patch("/switch-to-creator", ensureAuthenticated, switchToCreator);

module.exports = router;
