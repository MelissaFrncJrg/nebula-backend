const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middlewares/jwtMiddleware");
const { body, param } = require("express-validator");
const { createContentLimiter } = require("../middlewares/rateLimiters");
const { ensureRole } = require("../middlewares/roleMiddleware");
const {
  createTeam,
  getMyTeams,
  getAllTeams,
  updateTeam,
  deleteTeam,
} = require("../controllers/teamController");
const { validateRequest } = require("../middlewares/validateRequest");

router.post(
  "/:projectId",
  createContentLimiter,
  authenticateToken,
  ensureRole("CREATOR"),
  [
    param("projectId").isInt({ min: 1 }).withMessage("Invalid project ID"),

    body("name")
      .trim()
      .notEmpty()
      .withMessage("Team name is required")
      .isLength({ min: 3, max: 100 })
      .withMessage("Name must be between 3 and 100 characters")
      .escape(),

    body("description")
      .optional()
      .isString()
      .trim()
      .isLength({ max: 1000 })
      .withMessage("Description must be less than 1000 characters")
      .escape(),

    body("jobs")
      .isArray({ min: 1 })
      .withMessage("Jobs must be a non-empty array"),
  ],
  validateRequest,
  createTeam
);

router.get("/mine", authenticateToken, ensureRole("CREATOR"), getMyTeams);

router.get("/all", getAllTeams);

router.patch(
  "/mine/:projectId",
  authenticateToken,
  ensureRole("CREATOR"),
  [
    param("projectId").isInt({ min: 1 }).withMessage("Invalid project ID"),

    body("name")
      .optional()
      .isString()
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage("Name must be between 3 and 100 characters")
      .escape(),

    body("description")
      .optional()
      .isString()
      .trim()
      .isLength({ max: 1000 })
      .withMessage("Description must be less than 1000 characters")
      .escape(),

    body("jobs").optional().isArray().withMessage("Jobs must be an array"),

    body("status")
      .optional()
      .isIn(["OPEN", "CLOSED"])
      .withMessage("Invalid status"),
  ],
  validateRequest,
  updateTeam
);

router.delete(
  "/mine/:projectId",
  authenticateToken,
  ensureRole("CREATOR"),
  [param("projectId").isInt({ min: 1 }).withMessage("Invalid project ID")],
  validateRequest,
  deleteTeam
);

module.exports = router;
