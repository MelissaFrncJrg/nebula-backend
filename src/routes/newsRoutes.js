const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../middlewares/authMiddleware");
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

router.post("/projects/:id", ensureAuthenticated, createNews);
router.patch("/:id", ensureAuthenticated, updateNews);
router.delete("/:id", ensureAuthenticated, deleteNews);

router.post("/:id/comment", ensureAuthenticated, commentNews);
router.patch("/:id/comment/:id", ensureAuthenticated, updateComment);
router.delete("/comments/:id", ensureAuthenticated, deleteComment);

router.post("/:id/like", ensureAuthenticated, likeNews);
router.delete("/:id/like", ensureAuthenticated, unlikeNews);
router.get("/:id/likeCount", getNewsLikeCount);

router.post("/comments/:id/like", ensureAuthenticated, likeComment);
router.delete("/comments/:id/like", ensureAuthenticated, unlikeComment);
router.get("/comments/:id/likeCount", getCommentLikeCount);

module.exports = router;
