const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const parseCreatorId = (req) => {
  const id = parseInt(req.params.creatorId, 10);
  if (isNaN(id)) throw new Error("Invalid creator ID");
  return id;
};

const isAlreadyFollowing = async (userId, creatorId) => {
  return await prisma.follow_creator.findUnique({
    where: {
      ID_user_ID_creator: {
        ID_user: userId,
        ID_creator: creatorId,
      },
    },
  });
};

const checkCreatorExistence = async (creatorId) => {
  const creator = await prisma.user.findUnique({
    where: { id: creatorId },
    select: { id: true },
  });

  if (!creator) throw new Error("Creator not found");
  return creator;
};

const validateSelfFollow = (userId, creatorId) => {
  if (userId === creatorId) {
    throw new Error("Cannot follow yourself");
  }
};

exports.followCreator = async (req, res) => {
  const userId = req.user.id;

  try {
    const creatorId = parseCreatorId(req);

    validateSelfFollow(userId, creatorId);
    await checkCreatorExistence(creatorId);

    const alreadyFollowing = await isAlreadyFollowing(userId, creatorId);
    if (alreadyFollowing) {
      return res
        .status(400)
        .json({ success: false, message: "Already following this creator" });
    }

    const follow = await prisma.follow_creator.create({
      data: {
        ID_user: userId,
        ID_creator: creatorId,
      },
    });

    res.status(201).json({
      success: true,
      message: "Creator followed successfully",
      data: {
        creatorId,
        followedAt: follow.createdAt,
        notificationsEnabled: follow.notificationsEnabled,
      },
    });
  } catch (err) {
    console.error("Error following creator:", err);

    if (err.message === "Creator not found") {
      return res.status(404).json({ success: false, message: err.message });
    }

    if (
      err.message === "Cannot follow yourself" ||
      err.message === "Invalid creator ID"
    ) {
      return res.status(400).json({ success: false, message: err.message });
    }

    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.unfollowCreator = async (req, res) => {
  const userId = req.user.id;

  try {
    const creatorId = parseCreatorId(req);

    const follow = await isAlreadyFollowing(userId, creatorId);
    if (!follow) {
      return res.status(404).json({
        success: false,
        message: "You are not following this creator",
      });
    }

    await prisma.follow_creator.delete({
      where: {
        ID_user_ID_creator: {
          ID_user: userId,
          ID_creator: creatorId,
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Creator unfollowed successfully",
    });
  } catch (err) {
    console.error("Error unfollowing creator:", err);

    if (err.message === "Invalid creator ID") {
      return res.status(400).json({ success: false, message: err.message });
    }

    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.updateNotificationPreferences = async (req, res) => {
  const userId = req.user.id;
  const { notificationsEnabled } = req.body;

  if (typeof notificationsEnabled !== "boolean") {
    return res.status(400).json({
      success: false,
      message: "notificationsEnabled must be a boolean value",
    });
  }

  try {
    const creatorId = parseCreatorId(req);

    const follow = await isAlreadyFollowing(userId, creatorId);
    if (!follow) {
      return res.status(404).json({
        success: false,
        message: "You are not following this creator",
      });
    }

    const updated = await prisma.follow_creator.update({
      where: {
        ID_user_ID_creator: {
          ID_user: userId,
          ID_creator: creatorId,
        },
      },
      data: { notificationsEnabled },
    });

    res.status(200).json({
      success: true,
      message: `Notifications ${
        notificationsEnabled ? "enabled" : "disabled"
      } for creator`,
      data: {
        creatorId: updated.ID_creator,
        notificationsEnabled: updated.notificationsEnabled,
      },
    });
  } catch (err) {
    console.error("Error updating notification preferences:", err);

    if (err.message === "Invalid creator ID") {
      return res.status(400).json({ success: false, message: err.message });
    }

    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.getFollowedCreators = async (req, res) => {
  const userId = req.user.id;

  try {
    const followed = await prisma.follow_creator.findMany({
      where: { ID_user: userId },
      include: {
        followedCreator: {
          include: {
            profile: {
              select: {
                username: true,
                avatarUrl: true,
                bio: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const result = followed.map((entry) => ({
      id: entry.ID_creator,
      username: entry.followedCreator.profile?.username,
      avatarUrl: entry.followedCreator.profile?.avatarUrl || null,
      bio: entry.followedCreator.profile?.bio || null,
      notificationsEnabled: entry.notificationsEnabled,
      followedAt: entry.createdAt,
    }));

    res.status(200).json({
      success: true,
      count: result.length,
      data: result,
    });
  } catch (err) {
    console.error("Error fetching followed creators:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.getCreatorFollowers = async (req, res) => {
  try {
    const creatorId = parseCreatorId(req);

    await checkCreatorExistence(creatorId);

    const followers = await prisma.follow_creator.findMany({
      where: { ID_creator: creatorId },
      include: {
        follower: {
          include: {
            profile: {
              select: {
                username: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const result = followers.map((entry) => ({
      id: entry.ID_user,
      username: entry.follower.profile?.username,
      avatarUrl: entry.follower.profile?.avatarUrl || null,
      followedAt: entry.createdAt,
    }));

    res.status(200).json({
      success: true,
      count: result.length,
      data: result,
    });
  } catch (err) {
    console.error("Error fetching creator followers:", err);

    if (err.message === "Creator not found") {
      return res.status(404).json({ success: false, message: err.message });
    }

    if (err.message === "Invalid creator ID") {
      return res.status(400).json({ success: false, message: err.message });
    }

    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.checkFollowStatus = async (req, res) => {
  const userId = req.user.id;

  try {
    const creatorId = parseCreatorId(req);

    const follow = await isAlreadyFollowing(userId, creatorId);

    res.status(200).json({
      success: true,
      data: {
        isFollowing: !!follow,
        notificationsEnabled: follow ? follow.notificationsEnabled : false,
        followedAt: follow ? follow.createdAt : null,
      },
    });
  } catch (err) {
    console.error("Error checking follow status:", err);

    if (err.message === "Invalid creator ID") {
      return res.status(400).json({ success: false, message: err.message });
    }

    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
