const CodeTemplate = require("../models/CodeTemplate");

// GET /api/templates - List all available templates
exports.listTemplates = async (req, res) => {
    try {
        const templates = await CodeTemplate.find({}).select("language description");
        res.json(templates);
    } catch (error) {
        console.error("Error in listTemplates:", error);
        res.status(500).json({ error: "Failed to fetch templates" });
    }
};

// GET /api/templates/:language - Get template for specific language
exports.getTemplate = async (req, res) => {
    try {
        const { language } = req.params;
        const template = await CodeTemplate.findOne({ language: language.toLowerCase() });

        if (!template) {
            return res.status(404).json({ error: "Template not found for this language" });
        }

        res.json({
            language: template.language,
            template: template.template,
            description: template.description,
        });
    } catch (error) {
        console.error("Error in getTemplate:", error);
        res.status(500).json({ error: "Failed to fetch template" });
    }
};

// POST /api/templates - Create new template (Admin only)
exports.createTemplate = async (req, res) => {
    try {
        const { language, template, description } = req.body;

        if (!language || !template) {
            return res.status(400).json({ error: "Language and template are required" });
        }

        const newTemplate = new CodeTemplate({
            language: language.toLowerCase(),
            template,
            description: description || "Starter template",
        });

        await newTemplate.save();
        res.status(201).json({ message: "Template created successfully", template: newTemplate });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: "Template for this language already exists" });
        }
        console.error("Error in createTemplate:", error);
        res.status(500).json({ error: "Failed to create template" });
    }
};

// PUT /api/templates/:id - Update template (Admin only)
exports.updateTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        const { template, description } = req.body;

        const updated = await CodeTemplate.findByIdAndUpdate(
            id,
            { template, description, updatedAt: Date.now() },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ error: "Template not found" });
        }

        res.json({ message: "Template updated successfully", template: updated });
    } catch (error) {
        console.error("Error in updateTemplate:", error);
        res.status(500).json({ error: "Failed to update template" });
    }
};

// DELETE /api/templates/:id - Delete template (Admin only)
exports.deleteTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await CodeTemplate.findByIdAndDelete(id);

        if (!deleted) {
            return res.status(404).json({ error: "Template not found" });
        }

        res.json({ message: "Template deleted successfully" });
    } catch (error) {
        console.error("Error in deleteTemplate:", error);
        res.status(500).json({ error: "Failed to delete template" });
    }
};
