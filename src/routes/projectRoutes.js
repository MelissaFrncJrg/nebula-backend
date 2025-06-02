const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middlewares/jwtMiddleware");
const { body, param } = require("express-validator");
const { createContentLimiter } = require("../middlewares/rateLimiters");
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
const { validateRequest } = require("../middlewares/validateRequest");

router.get("/creators", getAllCreatorProjects);

router.get("/:id/reviews", getProjectReviews);

router.get("/creators/:profileId", getProjectsByProfileId);

router.get("/reviews/:id/likes", getReviewLikesCount);

router.post(
  "/",
  authenticateToken,
  ensureRole("CREATOR"),
  [
    body("title")
      .trim()
      .notEmpty()
      .withMessage("Title is required")
      .isLength({ min: 3, max: 100 })
      .withMessage("Title must be between 3 and 100 characters")
      .escape(),

    body("description")
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage("Description must be less than 1000 characters")
      .escape(),

    body("status")
      .trim()
      .isIn(["IN_PROGRESS", "COMPLETED", "PLANNED"])
      .withMessage("Invalid status"),
  ],
  validateRequest,
  createProject
);

router.patch(
  "/:id",
  authenticateToken,
  ensureRole("CREATOR"),
  [
    body("title")
      .optional()
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage("Title must be between 3 and 100 characters")
      .escape(),

    body("description")
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage("Description must be less than 1000 characters")
      .escape(),

    body("status")
      .optional()
      .trim()
      .isIn(["IN_PROGRESS", "COMPLETED", "PLANNED"])
      .withMessage("Invalid status"),
  ],
  validateRequest,
  updateProject
);

router.get("/mine", authenticateToken, ensureRole("CREATOR"), getMyProjects);

router.delete("/:id", authenticateToken, ensureRole("CREATOR"), deleteProject);

router.post(
  "/:id/follow",
  createContentLimiter,
  authenticateToken,
  [param("id").isInt({ min: 1 }).withMessage("Invalid project ID")],
  followProject
);

router.delete("/:id/follow", authenticateToken, unfollowProject);

router.patch(
  "/:id/notifications",
  authenticateToken,
  [param("id").isInt({ min: 1 }).withMessage("Invalid project ID")],
  updateProjectNotifications
);

router.post(
  "/:id/review",
  createContentLimiter,
  authenticateToken,
  [
    param("id").isInt({ min: 1 }).withMessage("Invalid project ID"),

    body("rating")
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be an integer between 1 and 5"),

    body("comment")
      .optional()
      .isString()
      .trim()
      .isLength({ max: 1000 })
      .withMessage("Comment must be a string under 1000 characters"),
  ],
  validateRequest,
  createUpdateReview
);

router.delete(
  "/reviews/:id",
  authenticateToken,
  [param("id").isInt({ min: 1 }).withMessage("Invalid review ID")],
  validateRequest,
  deleteReview
);

router.post("/reviews/:id/like", authenticateToken, likeReview);

router.delete("/reviews/:id/like", authenticateToken, unlikeReview);

router.get("/:id", getProjectById);

module.exports = router;
