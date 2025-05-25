const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new PrismaClient();
const speakeasy = require("speakeasy");

exports.getProfile = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user || !user.profile) {
      return res.status(404).json({ message: "User profile not found" });
    }

    res.status(200).json({
      profile: {
        username: user.profile.username,
        avatarUrl: user.profile.avatarUrl,
        bio: user.profile.bio,
        socialLinks: user.profile.socialLinks,
      },
    });
  } catch (err) {
    console.error("An error occured when trying to get the profile :", err);
    res.status(500).json({ message: "Server error." });
  }
};

exports.updateProfile = async (req, res) => {
  const userId = req.user.id;
  const { username, avatarUrl, bio, socialLinks } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user || !user.profile) {
      return res.statuts(404).json({ message: "No user profile found" });
    }

    const updatedProfile = await prisma.profile.update({
      where: { id: user.profileId },
      data: {
        username,
        avatarUrl,
        bio,
        socialLinks,
      },
    });

    res.status(200).json({
      message: "Profile updated successfully",
      profile: updatedProfile,
    });
  } catch (err) {
    console.error("Error occured while updating profile:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.switchToCreator = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "CREATOR") {
      return res.status(400).json({ message: "User is already creator" });
    }

    const updateUser = await prisma.user.update({
      where: { id: userId },
      data: { role: "CREATOR" },
    });

    res.status(200).json({
      message: "Profile updated to creator successfully!",
      user: updateUser,
    });
  } catch (err) {
    console.log("Error while switching to creator", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteAccount = async (req, res) => {
  const userId = req.user.id;
  const { password, totpToken } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let isAuthValid = false;

    if (password && user.password) {
      isAuthValid = await bcrypt.compare(password, user.password);
    }

    if (!isAuthValid && user.isTotpEnabled && totpToken) {
      isAuthValid = speakeasy.totp.verify({
        secret: user.totpSecret,
        encoding: "base32",
        token: totpToken,
      });
    }

    if (!isAuthValid) {
      return res
        .status(401)
        .json({ message: "Invalid credentials (password or 2FA token)" });
    }

    await prisma.$transaction(async (tx) => {
      if (user.profile) {
        await tx.profile.update({
          where: { id: user.profileId },
          data: {
            username: `deleted_user_${user.id}`,
            avatarUrl: null,
            bio: null,
            socialLinks: null,
            isAnonymized: true,
          },
        });
      }

      await tx.follow_creator.deleteMany({
        where: { ID_user: userId },
      });

      await tx.news.updateMany({
        where: { authorId: userId },
        data: {},
      });

      await tx.user.update({
        where: { id: userId },
        data: {
          email: `deleted_${userId}_${Date.now()}@deleted.account`,
          password: null,
          googleId: null,
          githubId: null,
          steamId: null,
          discordId: null,
          totpSecret: null,
          isTotpEnabled: false,
          isDeleted: true,
          deletedAt: new Date(),
        },
      });
    });

    res.status(200).json({
      message:
        "Your personal data has been deleted. Your account is now anonymized.",
    });
  } catch (err) {
    console.error("Error during account deletion:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
