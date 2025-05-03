const express = require("express");
const router = express.Router();
const {
  updateProfile,
  switchToCreator,
} = require("../controllers/updateProfile");
const { ensureAuthenticated } = require("../middlewares/authMiddleware");

router.patch("/", ensureAuthenticated, updateProfile);

router.patch("/switch-to-creator", ensureAuthenticated, switchToCreator);

module.exports = router;
