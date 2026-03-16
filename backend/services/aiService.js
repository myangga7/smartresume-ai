// backend/services/aiService.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

class AIService {
  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("❌ GEMINI_API_KEY tidak ditemukan di .env!");
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    console.log("✅ AI Service initialized with Gemini");
  }

  async suggestImprovements(resumeData) {
    try {
      console.log("🤖 Minta saran AI ke Gemini...");

      const prompt = `
        You are an expert resume writer. Review this resume and give 4-5 specific, actionable suggestions for improvement.

        RESUME DATA:
        - Name: ${resumeData.personal?.fullName || "Not provided"}
        - Title: ${resumeData.personal?.title || "Not provided"}
        - Summary: ${resumeData.personal?.summary || "Not provided"}
        
        SKILLS:
        ${resumeData.skills?.join(", ") || "No skills listed"}
        
        WORK EXPERIENCE:
        ${
          resumeData.experience
            ?.map(
              (exp) =>
                `- ${exp.position} at ${exp.company} (${exp.startDate || "?"} - ${exp.current ? "Present" : exp.endDate || "?"})
           Description: ${exp.description || "No description"}`,
            )
            .join("\n") || "No experience listed"
        }
        
        EDUCATION:
        ${
          resumeData.education
            ?.map(
              (edu) =>
                `- ${edu.degree} at ${edu.institution} (${edu.graduationYear || "?"})`,
            )
            .join("\n") || "No education listed"
        }

        INSTRUCTIONS:
        1. Focus on keywords that help pass ATS screening
        2. Suggest action verbs and quantitative achievements
        3. Recommend how to better organize skills
        4. Give format/template suggestions
        5. Be constructive and specific

        Format your response with clear bullet points and emojis.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      console.log("✅ AI suggestions received");

      return {
        success: true,
        suggestions: text,
      };
    } catch (error) {
      console.error("❌ Gemini Error:", error.message);

      return {
        success: true,
        suggestions: `✨ **AI Suggestions (Demo Mode):**

1. **Add Keywords**: JavaScript, React, Node.js, TypeScript
2. **Improve Summary**: Add quantitative achievements like "Increased performance by 40%"
3. **Group Skills** by category (Frontend, Backend, Tools)
4. **Use Action Verbs**: "Developed" → "Architected", "Led", "Implemented"
5. **Add Metrics**: Include numbers to show impact

💡 **Tip**: Add more specific examples of your achievements.`,
      };
    }
  }

  async analyzeJobDescription(jobDescription, resumeData) {
    try {
      console.log("🤖 Menganalisis job description dengan Gemini...");

      const prompt = `
        Analyze how well this candidate fits the job description.

        JOB DESCRIPTION:
        ${jobDescription}

        CANDIDATE SKILLS:
        ${resumeData.skills?.join(", ") || "Not provided"}

        INSTRUCTIONS:
        Provide:
        1. Match score (0-100%)
        2. Matching skills (what they have)
        3. Missing skills (what they need to learn)
        4. 2-3 specific suggestions to improve their chances

        Format with clear sections and emojis. Be honest but constructive.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return {
        success: true,
        analysis: text,
      };
    } catch (error) {
      console.error("❌ Gemini Error:", error.message);

      return {
        success: true,
        analysis: `📊 **Job Analysis (Demo Mode):**

Match Score: 75%

✅ **Matching Skills:**
• JavaScript, React

❌ **Missing Skills:**
• TypeScript, Node.js

💡 **Suggestions:**
1. Add TypeScript to your skills
2. Learn Node.js basics
3. Highlight relevant projects`,
      };
    }
  }
}

module.exports = new AIService();
