const { GoogleGenerativeAI } = require("@google/generative-ai");
const Problem = require("../models/problems");

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.getHintOrReview = async (req, res) => {
  try {
    const { problemId, code, language, errorOutput } = req.body;

    if (!problemId) {
      return res.status(400).json({ error: "Missing problemId" });
    }

    // Fetch problem details for context
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ error: "Problem not found" });
    }

    // Ensure API Key exists
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "Gemini API Key is not configured on the server." });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Build context-aware prompt
    let prompt = `You are an expert programming tutor and Code Review Assistant. Your goal is to guide the student towards the correct answer without simply writing the code for them.\n\n`;
    prompt += `**Problem Title**: ${problem.title}\n`;
    prompt += `**Problem Description**:\n${problem.description.replace(/<[^>]*>?/gm, '')}\n\n`; // Strip simple HTML
    
    prompt += `**Student's Language**: ${language}\n`;
    prompt += `**Student's Current Code**:\n\`\`\`${language}\n${code || '(No code provided)'}\n\`\`\`\n\n`;

    if (errorOutput) {
       prompt += `The student attempted to run their code and encountered the following error or test case failure:\n\`\`\`\n${errorOutput}\n\`\`\`\n\n`;
       prompt += `Your task: Explain why the error happened and give a conceptual hint on how to fix it. Keep it concise, friendly, and under 3 paragraphs. Do NOT provide the full corrected code. Use markdown formatting.`;
    } else {
       prompt += `Your task: The student is asking for a hint or a general code review. Analyze their current code draft. Provide 1 or 2 specific actionable hints or point out logical flaws if they are going down the wrong path. Keep it concise, friendly, and under 3 paragraphs. Do NOT provide the full corrected code. Use markdown formatting.`;
    }

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    res.json({ review: responseText });

  } catch (error) {
    console.error("❌ Error in AI Controller:", error);
    res.status(500).json({ 
      error: "Failed to generate AI review.", 
      details: error.message 
    });
  }
};
