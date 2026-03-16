// backend/routes/aiRoutes.js
const express = require("express");
const router = express.Router();
const aiService = require("../services/aiService");

// Endpoint untuk saran perbaikan resume
router.post("/ai/suggest", async (req, res) => {
  try {
    const { resumeData } = req.body;

    if (!resumeData) {
      return res.status(400).json({ error: "Resume data is required" });
    }

    console.log("Processing AI suggestion request...");
    const result = await aiService.suggestImprovements(resumeData);

    if (result.success) {
      res.json({ suggestions: result.suggestions });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error("AI Route Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint untuk analisis job description
router.post("/ai/analyze-job", async (req, res) => {
  try {
    const { jobDescription, resumeData } = req.body;

    if (!jobDescription || !resumeData) {
      return res
        .status(400)
        .json({ error: "Job description and resume data are required" });
    }

    console.log("Processing job analysis request...");
    const result = await aiService.analyzeJobDescription(
      jobDescription,
      resumeData,
    );

    if (result.success) {
      res.json({ analysis: result.analysis });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error("AI Route Error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
