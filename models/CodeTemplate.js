const mongoose = require("mongoose");

const codeTemplateSchema = new mongoose.Schema({
    language: {
        type: String,
        required: true,
        enum: ["javascript", "python", "java", "cpp", "c"],
        unique: true,
    },
    template: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        default: "Starter template",
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

// Update timestamp before saving
codeTemplateSchema.pre("save", function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model("CodeTemplate", codeTemplateSchema);
