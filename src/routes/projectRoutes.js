const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../middlewares/authMiddleware");
const { ensureRole } = require("../middlewares/roleMiddleware");
const {
  createProject,
  updateProject,
  getMyProjects,
  getProjectsByProfileId,
  deleteProject,
} = require("../controllers/projectController");

router.post("/", ensureAuthenticated, ensureRole("CREATOR"), createProject);

router.patch("/:id", ensureAuthenticated, ensureRole("CREATOR"), updateProject);

router.get("/mine", ensureAuthenticated, ensureRole("CREATOR"), getMyProjects);

router.delete(
  "/:id",
  ensureAuthenticated,
  ensureRole("CREATOR"),
  deleteProject
);

router.get("/creators/:profileId", getProjectsByProfileId);

module.exports = router;
