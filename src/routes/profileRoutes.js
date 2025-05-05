const express = require("express");
const router = express.Router();
const {
  updateProfile,
  switchToCreator,
  deleteAccount,
} = require("../controllers/profileController");
const { ensureAuthenticated } = require("../middlewares/authMiddleware");

router.patch("/", ensureAuthenticated, updateProfile);

router.delete("/delete-account", ensureAuthenticated, deleteAccount);

router.patch("/switch-to-creator", ensureAuthenticated, switchToCreator);

module.exports = router;
