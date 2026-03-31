const express = require("express");
const router = express.Router();
const aiController = require("../controllers/aiController");
const { requireAuth } = require("../middleware/authMiddleware");

// AI Route for Hint/Code Review (Protected)
router.post("/review", requireAuth, aiController.getHintOrReview);

module.exports = router;
