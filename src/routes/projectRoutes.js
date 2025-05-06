const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../middlewares/authMiddleware");
const { ensureRole } = require("../middlewares/roleMiddleware");
const {
  createProject,
  updateProject,
  getMyProjects,
  getProjectsByProfileId,
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

router.get("/:id/reviews", getProjectReviews);

router.get("/creators/:profileId", getProjectsByProfileId);

router.get("/reviews/:id/likes", getReviewLikesCount);

router.post("/", ensureAuthenticated, ensureRole("CREATOR"), createProject);

router.patch("/:id", ensureAuthenticated, ensureRole("CREATOR"), updateProject);

router.get("/mine", ensureAuthenticated, ensureRole("CREATOR"), getMyProjects);

router.delete(
  "/:id",
  ensureAuthenticated,
  ensureRole("CREATOR"),
  deleteProject
);

router.post("/:id/follow", ensureAuthenticated, followProject);

router.delete("/:id/follow", ensureAuthenticated, unfollowProject);

router.patch(
  "/:id/notifications",
  ensureAuthenticated,
  updateProjectNotifications
);

router.post("/:id/review", ensureAuthenticated, createUpdateReview);

router.delete("/reviews/:id", ensureAuthenticated, deleteReview);

router.post("/reviews/:id/like", ensureAuthenticated, likeReview);

router.delete("/reviews/:id/like", ensureAuthenticated, unlikeReview);

module.exports = router;
