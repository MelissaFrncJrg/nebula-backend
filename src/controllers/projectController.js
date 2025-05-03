const { PrismaClient, Role } = require("@prisma/client");
const prisma = new PrismaClient();

exports.createProject = async (req, res) => {
  const userId = req.user.id;
  const { title, description, status } = req.body;

  try {
    const project = await prisma.project.create({
      data: {
        title,
        description,
        status,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    await prisma.creator.create({
      data: {
        ID_creator: userId,
        ID_project: project.id,
      },
    });

    res.status(201).json({ message: "Project created successfully", project });
  } catch (err) {
    console.error("Error occured when creating project", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateProject = async (req, res) => {
  const userId = req.user.id;
  const projectId = parseInt(req.params.id, 10);
  const { title, description, status } = req.body;

  try {
    const creator = await prisma.creator.findUnique({
      where: {
        ID_creator_ID_project: {
          ID_creator: userId,
          ID_project: projectId,
        },
      },
    });

    if (!creator) {
      return res
        .status(403)
        .json({ message: "Only the project creator can update it" });
    }

    if (!title && !description && !status) {
      return res.status(400).json({ message: "No data provided to update" });
    }

    const updated = await prisma.project.update({
      where: { id: projectId },
      data: {
        title,
        description,
        status,
        updatedAt: new Date(),
      },
    });

    res.status(200).json({
      message: `Project '${updated.title}' updated successfully`,
      project: updated,
    });
  } catch (err) {
    console.error(`Error while trying to update project ${projectId}:`, err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMyProjects = async (req, res) => {
  const userId = req.user.id;

  try {
    const creatorProjects = await prisma.creator.findMany({
      where: { ID_creator: userId },
      include: { project: true },
    });

    const projects = creatorProjects.map((link) => link.project);

    res.status(200).json({ projects });
  } catch (err) {
    console.error("Error when trying to get your projects", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getProjectsByProfileId = async (req, res) => {
  const profileId = parseInt(req.params.profileId, 10);

  try {
    const user = await prisma.user.findFirst({
      where: { profileId },
    });

    if (!user || user.role !== Role.CREATOR) {
      return res.status(404).json({ message: "Creator not found" });
    }

    const creatorProjects = await prisma.creator.findMany({
      where: { ID_creator: user.id },
      include: { project: true },
    });

    const projects = creatorProjects.map((link) => link.project);

    res.status(200).json({ projects });
  } catch (err) {
    console.error("Error when trying to get creator's projects:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.deleteProject = async (req, res) => {
  const userId = req.user.id;
  const projectId = parseInt(req.params.id, 10);

  try {
    const creator = await prisma.creator.findUnique({
      where: {
        ID_creator_ID_project: {
          ID_creator: userId,
          ID_project: projectId,
        },
      },
    });

    if (!creator) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await prisma.creator.delete({
      where: {
        ID_creator_ID_project: {
          ID_creator: userId,
          ID_project: projectId,
        },
      },
    });

    await prisma.project.delete({
      where: { id: projectId },
    });

    return res
      .status(200)
      .json({ message: `Project ${projectId} deleted successfully` });
  } catch (err) {
    console.error(`Error deleting project ${projectId}`, err);
    return res.status(500).json({ message: "Server error" });
  }
};
