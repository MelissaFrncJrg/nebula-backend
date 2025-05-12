const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.createNews = async (req, res) => {
  const projectId = parseInt(req.params.id, 10);
  const userId = req.user.id;
  const { title, content, image } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: "Title and content are required" });
  }

  try {
    const isCreator = await prisma.creator.findUnique({
      where: {
        ID_creator_ID_project: {
          ID_creator: userId,
          ID_project: projectId,
        },
      },
    });

    if (!isCreator) {
      return res
        .status(403)
        .json({ message: "Only the creator can post news" });
    }

    const created = await prisma.news.create({
      data: {
        title,
        content,
        image,
        ID_project: projectId,
        authorId: userId,
      },
    });

    return res.status(201).json({ message: "News created", news: created });
  } catch (err) {
    console.error("Error creating news:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateNews = async (req, res) => {
  const { id: newsId } = req.params;
  const userId = req.user.id;
  const { title, content, image } = req.body;

  try {
    const news = await prisma.news.findUnique({
      where: { id: Number(newsId) },
    });

    if (!news) {
      return res.status(404).json({ message: "News not found" });
    }

    if (news.authorId !== userId) {
      return res.status(403).json({
        message: "Unauthorized, only the comment's author can delete it",
      });
    }

    const updated = await prisma.news.update({
      where: { id: Number(newsId) },
      data: { title, content, image, updatedAt: new Date() },
    });

    return res.status(200).json({ message: "News updated", news: updated });
  } catch (err) {
    console.error("Error updating news:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteNews = async (req, res) => {
  const newsId = Number(req.params.id);
  const userId = req.user.id;

  try {
    const news = await prisma.news.findUnique({ where: { id: newsId } });
    if (!news) return res.status(404).json({ message: "News not found" });
    if (news.authorId !== userId)
      return res.status(403).json({
        message: "Unauthorized, only the news's creator can delete it",
      });

    await prisma.like_news.deleteMany({
      where: { ID_news: newsId },
    });

    await prisma.news.delete({ where: { id: newsId } });
    return res.status(200).json({ message: "News deleted" });
  } catch (err) {
    console.error("Error deleting news:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getProjectNews = async (req, res) => {
  const projectId = parseInt(req.params.id, 10);

  try {
    const news = await prisma.news.findMany({
      where: { ID_project: projectId },
      include: {
        author: { select: { profile: true } },
        likes: true,
        Comment_news: {
          include: {
            user: { select: { profile: true } },
            Like_comment: true,
            replies: {
              include: {
                user: { select: { profile: true } },
                Like_comment: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ news });
  } catch (err) {
    console.error("Error getting news:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.commentNews = async (req, res) => {
  const newsId = parseInt(req.params.id, 10);
  const { content, parentId } = req.body;
  const userId = req.user.id;

  try {
    const news = await prisma.news.findUnique({
      where: { id: Number(newsId) },
    });
    if (!news) return res.status(404).json({ message: "News not found" });

    if (!parentId && news.authorId === userId) {
      return res
        .status(403)
        .json({ message: "Creator cannot start a comment thread" });
    }

    const comment = await prisma.comment_news.create({
      data: {
        ID_news: Number(newsId),
        ID_user: userId,
        content,
        ID_parent: parentId ?? null,
      },
    });

    res.status(201).json({ message: "Comment posted", comment });
  } catch (err) {
    console.error("Error commenting news:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateComment = async (req, res) => {
  const userId = req.user.id;
  const newsId = parseInt(req.params.id, 10);
  const commentId = parseInt(req.params.id, 10);
  const { content } = req.body;

  if (!commentId || isNaN(commentId)) {
    return res.status(400).json({ message: "Invalid comment ID" });
  }

  if (!content || typeof content !== "string" || content.trim() === "") {
    return res.status(400).json({ message: "Content is required" });
  }

  try {
    const comment = await prisma.comment_news.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.ID_news !== newsId) {
      return res
        .status(400)
        .json({ message: "Comment does not belong to this news item" });
    }

    if (comment.ID_user !== userId) {
      return res
        .status(403)
        .json({ message: "You can only update your own comments" });
    }

    const updated = await prisma.comment_news.update({
      where: { id: commentId },
      data: {
        content,
        updatedAt: new Date(),
      },
    });

    return res
      .status(200)
      .json({ message: "Comment updated", comment: updated });
  } catch (err) {
    console.error("Error updating comment:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteComment = async (req, res) => {
  const userId = req.user.id;
  const commentId = parseInt(req.params.id, 10);

  try {
    const comment = await prisma.comment_news.findUnique({
      where: { id: commentId },
    });

    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (comment.ID_user !== userId) {
      return res
        .status(403)
        .json({ message: "You can only delete your own comments" });
    }

    await prisma.like_comment.deleteMany({
      where: { ID_comment: commentId },
    });

    await prisma.comment_news.delete({
      where: { id: commentId },
    });

    return res.status(200).json({ message: "Comment deleted successfully" });
  } catch (err) {
    console.error("Error deleting news comment:", err);
    return res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

exports.likeNews = async (req, res) => {
  const { id: newsId } = req.params;
  const userId = req.user.id;

  try {
    const news = await prisma.news.findUnique({
      where: { id: Number(newsId) },
    });
    if (!news) return res.status(404).json({ message: "News not found" });

    if (news.authorId === userId) {
      return res.status(403).json({ message: "You cannot like your own news" });
    }

    const existing = await prisma.like_news.findUnique({
      where: { ID_user_ID_news: { ID_user: userId, ID_news: Number(newsId) } },
    });
    if (existing) {
      return res.status(400).json({ message: "Already liked" });
    }

    await prisma.like_news.create({
      data: { ID_news: Number(newsId), ID_user: userId },
    });

    res.status(201).json({ message: "News liked" });
  } catch (error) {
    res.status(500).json({ message: "Error liking news", error });
  }
};

exports.unlikeNews = async (req, res) => {
  const { id: newsId } = req.params;
  const userId = req.user.id;

  try {
    await prisma.like_news.delete({
      where: { ID_user_ID_news: { ID_user: userId, ID_news: Number(newsId) } },
    });

    res.status(200).json({ message: "News unliked" });
  } catch (error) {
    res.status(500).json({ message: "Error unliking news", error });
  }
};

exports.getNewsLikeCount = async (req, res) => {
  const { id: newsId } = req.params;

  try {
    const count = await prisma.like_news.count({
      where: {
        ID_news: Number(newsId),
      },
    });

    res.status(200).json({ count });
  } catch (error) {
    console.error("Error fetching like count:", error);
    res.status(500).json({
      message: "Error fetching like count",
      error: error.message,
    });
  }
};

exports.likeComment = async (req, res) => {
  const { id: commentId } = req.params;
  const userId = req.user.id;

  const comment = await prisma.comment_news.findUnique({
    where: { id: Number(commentId) },
  });

  if (!comment) return res.status(404).json({ message: "Comment not found" });

  if (comment.ID_user === userId) {
    return res
      .status(403)
      .json({ message: "You cannot like your own comment" });
  }

  const existing = await prisma.like_comment.findUnique({
    where: {
      ID_user_ID_comment: { ID_user: userId, ID_comment: Number(commentId) },
    },
  });

  if (existing) {
    return res.status(400).json({ message: "Already liked" });
  }

  await prisma.like_comment.create({
    data: { ID_comment: Number(commentId), ID_user: userId },
  });

  res.status(201).json({ message: "Comment liked" });
};

exports.unlikeComment = async (req, res) => {
  const { id: commentId } = req.params;
  const userId = req.user.id;

  try {
    await prisma.like_comment.delete({
      where: {
        ID_user_ID_comment: { ID_user: userId, ID_comment: Number(commentId) },
      },
    });

    res.status(200).json({ message: "Comment unliked" });
  } catch (error) {
    res.status(500).json({ message: "Error unliking comment", error });
  }
};

exports.getCommentLikeCount = async (req, res) => {
  const { id: commentId } = req.params;

  try {
    const count = await prisma.like_comment.count({
      where: {
        ID_comment: Number(commentId),
      },
    });

    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching like count",
      error: error.message,
    });
  }
};
