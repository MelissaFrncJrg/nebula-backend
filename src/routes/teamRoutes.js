const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middlewares/jwtMiddleware");
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
  authenticateToken,
  ensureRole("CREATOR"),
  createTeam
);

router.get("/mine", authenticateToken, ensureRole("CREATOR"), getMyTeams);

router.get("/all", getAllTeams);

router.patch(
  "/mine/:projectId",
  authenticateToken,
  ensureRole("CREATOR"),
  updateTeam
);

router.delete(
  "/mine/:projectId",
  authenticateToken,
  ensureRole("CREATOR"),
  deleteTeam
);

module.exports = router;
