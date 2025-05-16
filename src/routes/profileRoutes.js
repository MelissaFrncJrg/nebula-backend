const express = require("express");
const router = express.Router();
const {
  updateProfile,
  switchToCreator,
  deleteAccount,
  updatePassword,
} = require("../controllers/profileController");
const { ensureAuthenticated } = require("../middlewares/authMiddleware");

router.patch("/", ensureAuthenticated, updateProfile);

router.delete("/delete-account", ensureAuthenticated, deleteAccount);

router.patch("/switch-to-creator", ensureAuthenticated, switchToCreator);

router.patch("/update-password", ensureAuthenticated, updatePassword);

module.exports = router;
