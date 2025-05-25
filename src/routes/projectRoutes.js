const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middlewares/jwtMiddleware");
const { ensureRole } = require("../middlewares/roleMiddleware");
const {
  createProject,
  updateProject,
  getMyProjects,
  getAllCreatorProjects,
  getProjectsByProfileId,
  getProjectById,
  deleteProject,
  followProject,
  unfollowProject,
  updateProjectNotifications,
} = require("../controllers/projectController");
const {
  createUpdateReview,
  getProjectReviews,
  deleteReview,
  likeReview,
  unlikeReview,
  getReviewLikesCount,
} = require("../controllers/projectReviewController");

router.get("/creators", getAllCreatorProjects);

router.get("/:id/reviews", getProjectReviews);

router.get("/creators/:profileId", getProjectsByProfileId);

router.get("/reviews/:id/likes", getReviewLikesCount);

router.post("/", authenticateToken, ensureRole("CREATOR"), createProject);

router.patch("/:id", authenticateToken, ensureRole("CREATOR"), updateProject);

router.get("/mine", authenticateToken, ensureRole("CREATOR"), getMyProjects);

router.delete("/:id", authenticateToken, ensureRole("CREATOR"), deleteProject);

router.post("/:id/follow", authenticateToken, followProject);

router.delete("/:id/follow", authenticateToken, unfollowProject);

router.patch(
  "/:id/notifications",
  authenticateToken,
  updateProjectNotifications
);

router.post("/:id/review", authenticateToken, createUpdateReview);

router.delete("/reviews/:id", authenticateToken, deleteReview);

router.post("/reviews/:id/like", authenticateToken, likeReview);

router.delete("/reviews/:id/like", authenticateToken, unlikeReview);

router.get("/:id", getProjectById);

module.exports = router;
