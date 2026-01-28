const { Router } = require("express");
const templateController = require("../controllers/templateController");
const { requireAdmin } = require("../middleware/authMiddleware");

const router = Router();

// Public routes - anyone can view templates
router.get("/", templateController.listTemplates);
router.get("/:language", templateController.getTemplate);

// Admin-only routes
router.post("/", requireAdmin, templateController.createTemplate);
router.put("/:id", requireAdmin, templateController.updateTemplate);
router.delete("/:id", requireAdmin, templateController.deleteTemplate);

module.exports = router;
