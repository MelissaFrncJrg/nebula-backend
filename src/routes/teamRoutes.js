const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../middlewares/authMiddleware");
const { ensureRole } = require("../middlewares/roleMiddleware");
const {
  createTeam,
  getMyTeams,
  getAllTeams,
  updateTeam,
  deleteTeam,
} = require("../controllers/teamController");

router.post(
  "/:projectId",
  ensureAuthenticated,
  ensureRole("CREATOR"),
  createTeam
);

router.get("/mine", ensureAuthenticated, ensureRole("CREATOR"), getMyTeams);

router.get("/all", getAllTeams);

router.patch(
  "/mine/:projectId",
  ensureRole("CREATOR"),
  ensureAuthenticated,
  updateTeam
);

router.delete(
  "/mine/:projectId",
  ensureAuthenticated,
  ensureRole("CREATOR"),
  deleteTeam
);

module.exports = router;
