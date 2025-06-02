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
const { authenticateToken } = require("../middlewares/jwtMiddleware");

router.post("/:creatorId", authenticateToken, followCreator);

router.delete("/:creatorId", authenticateToken, unfollowCreator);

router.patch("/:creatorId", authenticateToken, updateNotificationPreferences);

router.get("/", authenticateToken, getFollowedCreators);

router.get("/followers/:creatorId", authenticateToken, getCreatorFollowers);

router.get("/status/:creatorId", authenticateToken, checkFollowStatus);

module.exports = router;
