const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

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
