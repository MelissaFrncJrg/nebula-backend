const express = require("express");
const router = express.Router();
const {
  getProfile,
  updateProfile,
  switchToCreator,
  deleteAccount,
} = require("../controllers/profileController");
const { authenticateToken } = require("../middlewares/jwtMiddleware");

router.get("/", authenticateToken, getProfile);

router.patch("/", authenticateToken, updateProfile);

router.delete("/delete-account", authenticateToken, deleteAccount);

router.patch("/switch-to-creator", authenticateToken, switchToCreator);

module.exports = router;
