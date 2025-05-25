const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middlewares/jwtMiddleware");
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

router.get("/projects/:id", getProjectNews);

router.post("/projects/:id", authenticateToken, createNews);
router.patch("/:id", authenticateToken, updateNews);
router.delete("/:id", authenticateToken, deleteNews);

router.post("/:id/comment", authenticateToken, commentNews);
router.patch("/:id/comment/:id", authenticateToken, updateComment);
router.delete("/comments/:id", authenticateToken, deleteComment);

router.post("/:id/like", authenticateToken, likeNews);
router.delete("/:id/like", authenticateToken, unlikeNews);
router.get("/:id/likeCount", getNewsLikeCount);

router.post("/comments/:id/like", authenticateToken, likeComment);
router.delete("/comments/:id/like", authenticateToken, unlikeComment);
router.get("/comments/:id/likeCount", getCommentLikeCount);

module.exports = router;
