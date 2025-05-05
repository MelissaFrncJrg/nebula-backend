const express = require("express");
const router = express.Router();
const {
  followCreator,
  unfollowCreator,
  updateNotificationPreferences,
  getFollowedCreators,
  getCreatorFollowers,
  checkFollowStatus,
} = require("../controllers/followController");
const { ensureAuthenticated } = require("../middlewares/authMiddleware");

router.post("/:creatorId", ensureAuthenticated, followCreator);

router.delete("/:creatorId", ensureAuthenticated, unfollowCreator);

router.patch("/:creatorId", ensureAuthenticated, updateNotificationPreferences);

router.get("/", ensureAuthenticated, getFollowedCreators);

router.get("/followers/:creatorId", ensureAuthenticated, getCreatorFollowers);

router.get("/status/:creatorId", ensureAuthenticated, checkFollowStatus);

module.exports = router;
