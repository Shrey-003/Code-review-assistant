const express = require("express");
const router = express.Router();
const problemController = require("../controllers/problemController");
const { requireAdmin, requireAuth } = require("../middleware/authMiddleware");

// Public Routes
router.get("/", problemController.listProblems);
router.get("/:id", problemController.getProblem);

// Admin-only Routes
router.post("/", requireAdmin, problemController.createProblem);
router.put("/:id", requireAdmin, problemController.editProblem);
router.delete("/:id", requireAdmin, problemController.deleteProblem);

// Submission & Run (requires login)
router.post("/:id/submit", requireAuth, problemController.submitProblem);
router.post("/:id/run", requireAuth, problemController.runProblem);

module.exports = router;
