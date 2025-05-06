const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.createUpdateReview = async (req, res) => {
  const userId = req.user.id;
  const projectId = parseInt(req.params.id, 10);
  const { rating, comment } = req.body;

  const isCreator = await prisma.creator.findUnique({
    where: {
      ID_creator_ID_project: {
        ID_creator: userId,
        ID_project: projectId,
      },
    },
  });

  if (isCreator) {
    return res
      .status(403)
      .json({ message: "Creators cannot review their own projects!" });
  }

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Rating must be between 1 and 5" });
  }

  try {
    const existingReview = await prisma.project_review.findFirst({
      where: {
        ID_author: userId,
        ID_project: projectId,
      },
    });

    if (existingReview) {
      const updated = await prisma.project_review.update({
        where: {
          ID_review: existingReview.ID_review,
        },
        data: {
          rating,
          comment,
          updatedAt: new Date(),
        },
      });
      return res
        .status(200)
        .json({ message: "Review updated", review: updated });
    } else {
      const created = await prisma.project_review.create({
        data: {
          author: {
            connect: { id: userId },
          },
          project: {
            connect: { id: projectId },
          },
          rating,
          comment,
        },
      });
      return res.status(201).json({ message: "Review added", review: created });
    }
  } catch (err) {
    console.error("Error creating/updating review", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getProjectReviews = async (req, res) => {
  const projectId = parseInt(req.params.id, 10);

  try {
    const reviews = await prisma.project_review.findMany({
      where: { ID_project: projectId },
      include: { author: { select: { id: true, profile: true } }, likes: true },
    });
    res.status(200).json({ reviews });
  } catch (err) {
    console.error("Error getting project reviews");
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteReview = async (req, res) => {
  const userId = req.user.id;
  const reviewId = parseInt(req.params.id, 10);

  try {
    const review = await prisma.project_review.findUnique({
      where: { ID_review: reviewId },
    });

    if (!review || review.ID_author !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await prisma.project_review.delete({ where: { ID_review: reviewId } });
    res.status(200).json({ message: "Review deleted successfully" });
  } catch (err) {
    console.error();
  }
};

exports.likeReview = async (req, res) => {
  const userId = req.user.id;
  const reviewId = parseInt(req.params.id, 10);

  const review = await prisma.project_review.findUnique({
    where: { ID_review: reviewId },
  });

  if (!review) {
    return res.status(404).json({ message: "Review not found" });
  }

  try {
    const existing = await prisma.like_review.findUnique({
      where: {
        ID_user_ID_review: { ID_user: userId, ID_review: reviewId },
      },
    });

    if (existing) {
      return res.status(400).json({ message: "Already liked this review." });
    }

    const like = await prisma.like_review.create({
      data: { ID_user: userId, ID_review: reviewId },
    });

    res.status(201).json({ message: "Review liked", like });
  } catch (err) {
    console.error("Error liking review:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.unlikeReview = async (req, res) => {
  const userId = req.user.id;
  const reviewId = parseInt(req.params.id, 10);

  try {
    await prisma.like_review.delete({
      where: {
        ID_user_ID_review: { ID_user: userId, ID_review: reviewId },
      },
    });

    res.status(200).json({ message: "Review unliked" });
  } catch (err) {
    console.error("Error unliking review:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getReviewLikesCount = async (req, res) => {
  const reviewId = parseInt(req.params.id, 10);

  try {
    const count = await prisma.project_review.count({
      where: { ID_review: reviewId },
    });
    res.status(200).json({ reviewId, likeCount: count });
  } catch (err) {
    console.error("Error trying to get likes count");
    res.status(500).json("Internal server error");
  }
};
