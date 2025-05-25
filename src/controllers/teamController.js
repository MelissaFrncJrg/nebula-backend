const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.createTeam = async (req, res) => {
  const creatorId = req.user.id;
  const projectId = parseInt(req.params.projectId, 10);
  const { name, description, jobs } = req.body;

  try {
    const team = await prisma.team.create({
      data: {
        ID_project: projectId,
        ID_creator: creatorId,
        name,
        description,
        jobs,
      },
    });

    res.status(201).json({
      message: "Team search created successfully",
      team,
    });
  } catch (err) {
    console.error("Error occurred when creating team:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMyTeams = async (req, res) => {
  try {
    const creatorId = req.user.id;
    const teams = await prisma.team.findMany({
      where: { ID_creator: creatorId },
    });
    res.json(teams);
  } catch (err) {
    console.error("Error fetching my teams:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllTeams = async (_req, res) => {
  try {
    const teams = await prisma.team.findMany();
    res.status(200).json({ teams });
  } catch (err) {
    console.error("Error occured when fetching all teams", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateTeam = async (req, res) => {
  const creatorId = req.user.id;
  const projectId = parseInt(req.params.projectId, 10);
  const { name, description, jobs, status } = req.body;

  try {
    const updated = await prisma.team.update({
      where: {
        ID_project_ID_creator: {
          ID_project: projectId,
          ID_creator: creatorId,
        },
      },
      data: {
        name,
        description,
        jobs,
        status,
        updatedAt: new Date(),
      },
    });
    res.status(200).json({ message: "Team updated", updated });
  } catch (err) {
    console.error(`Error updating team ${projectId}-${creatorId}`, err);
    if (err.code === "P2025") {
      return res.status(404).json({ message: "Team not found" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteTeam = async (req, res) => {
  const creatorId = req.user.id;
  const projectId = parseInt(req.params.projectId, 10);

  try {
    await prisma.team.delete({
      where: {
        ID_project_ID_creator: {
          ID_project: projectId,
          ID_creator: creatorId,
        },
      },
    });
    return res
      .status(200)
      .json({ message: "Team search deleted successfully" });
  } catch (err) {
    console.error(
      `Error occurred when deleting team ${projectId}-${creatorId}`,
      err
    );
    return res.status(500).json({ message: "Server error" });
  }
};
