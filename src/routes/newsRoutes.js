const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middlewares/jwtMiddleware");
const { body } = require("express-validator");
const { createContentLimiter } = require("../middlewares/rateLimiters");
const {
  createNews,
  updateNews,
  deleteNews,
  getProjectNews,
  commentNews,
  updateComment,
  deleteComment,
  likeNews,
  unlikeNews,
  getNewsLikeCount,
  likeComment,
  unlikeComment,
  getCommentLikeCount,
} = require("../controllers/newsController");
const { validateRequest } = require("../middlewares/validateRequest");

router.get("/projects/:id", getProjectNews);

router.post(
  "/projects/:id",
  createContentLimiter,
  [
    param("id").isInt({ min: 1 }).withMessage("Invalid project ID"),
    body("title")
      .trim()
      .notEmpty()
      .withMessage("Title is required")
      .isLength({ min: 3, max: 100 })
      .withMessage("Title must be between 3 and 100 characters")
      .escape(),
    body("content")
      .trim()
      .notEmpty()
      .withMessage("Content is required")
      .isLength({ max: 1000 })
      .withMessage("Content must be under 1000 characters")
      .escape(),
  ],
  validateRequest,
  authenticateToken,
  createNews
);
router.patch("/:id", authenticateToken, updateNews);
router.delete("/:id", authenticateToken, deleteNews);

router.post(
  "/:id/comment",
  createContentLimiter,
  authenticateToken,
  [
    body("content")
      .trim()
      .notEmpty()
      .withMessage("Comment content cannot be empty")
      .isLength({ min: 2 })
      .withMessage("Comment is too short")
      .escape(),
    body("parentId")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Invalid parent comment ID"),
  ],
  validateRequest,
  commentNews
);
router.patch("/:id/comment/:id", authenticateToken, updateComment);
router.delete("/comments/:id", authenticateToken, deleteComment);

router.post("/:id/like", authenticateToken, likeNews);
router.delete("/:id/like", authenticateToken, unlikeNews);
router.get("/:id/likeCount", getNewsLikeCount);

router.post("/comments/:id/like", authenticateToken, likeComment);
router.delete("/comments/:id/like", authenticateToken, unlikeComment);
router.get("/comments/:id/likeCount", getCommentLikeCount);

module.exports = router;
