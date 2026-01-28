const { Router } = require("express");
const dashboardController = require("../controllers/dashboardController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = Router();

// All dashboard routes require authentication
router.get("/stats", requireAuth, dashboardController.getStats);
router.get("/submissions", requireAuth, dashboardController.getSubmissions);
router.get("/streak", requireAuth, dashboardController.getStreak);
router.get("/progress", requireAuth, dashboardController.getProgress);

module.exports = router;
