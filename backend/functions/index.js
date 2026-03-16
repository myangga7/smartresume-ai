// backend/functions/index.js
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Inisialisasi Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// ===========================================
// RESUME API ENDPOINTS
// ===========================================

// CREATE - Membuat resume baru
app.post("/api/resumes", async (req, res) => {
  try {
    const resumeData = req.body;

    console.log("📥 Data resume diterima:");
    console.log("- Nama:", resumeData.personal?.fullName);
    console.log("- Email:", resumeData.personal?.email);

    // Validasi
    if (!resumeData.personal?.fullName || !resumeData.personal?.email) {
      return res.status(400).json({
        error: "Nama dan email wajib diisi",
      });
    }

    // Tambahkan timestamp
    resumeData.createdAt = new Date().toISOString();

    // Simpan ke Firestore
    const docRef = await db.collection("resumes").add(resumeData);
    const newResume = { id: docRef.id, ...resumeData };

    console.log("✅ Resume berhasil disimpan dengan ID:", docRef.id);

    res.status(201).json({
      message: "Resume berhasil dibuat",
      resume: newResume,
    });
  } catch (error) {
    console.error("❌ Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// READ ALL - Mendapatkan semua resume
app.get("/api/resumes", async (req, res) => {
  try {
    const snapshot = await db
      .collection("resumes")
      .orderBy("createdAt", "desc")
      .get();

    const resumes = [];
    snapshot.forEach((doc) => {
      resumes.push({ id: doc.id, ...doc.data() });
    });

    console.log(`📊 Mengirim ${resumes.length} resume`);
    res.json({
      count: resumes.length,
      resumes: resumes,
    });
  } catch (error) {
    console.error("❌ Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// READ ONE - Mendapatkan satu resume by ID
app.get("/api/resumes/:id", async (req, res) => {
  try {
    const doc = await db.collection("resumes").doc(req.params.id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Resume tidak ditemukan" });
    }

    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error("❌ Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// UPDATE - Mengupdate resume
app.put("/api/resumes/:id", async (req, res) => {
  try {
    const resumeData = req.body;
    resumeData.updatedAt = new Date().toISOString();

    await db.collection("resumes").doc(req.params.id).update(resumeData);

    const updatedDoc = await db.collection("resumes").doc(req.params.id).get();

    console.log("✅ Resume diupdate:", req.params.id);
    res.json({
      message: "Resume berhasil diupdate",
      resume: { id: updatedDoc.id, ...updatedDoc.data() },
    });
  } catch (error) {
    console.error("❌ Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Menghapus resume
app.delete("/api/resumes/:id", async (req, res) => {
  try {
    await db.collection("resumes").doc(req.params.id).delete();

    console.log("✅ Resume dihapus:", req.params.id);
    res.json({ message: "Resume berhasil dihapus" });
  } catch (error) {
    console.error("❌ Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// ===========================================
// AI ENDPOINTS (Gemini)
// ===========================================

// Get AI Suggestions
app.post("/api/ai/suggest", async (req, res) => {
  try {
    const { resumeData } = req.body;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are an expert resume writer. Review this resume and give 4-5 specific suggestions.

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

      Give suggestions in English with bullet points.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;

    res.json({ suggestions: response.text() });
  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Analyze Job Description
app.post("/api/ai/analyze-job", async (req, res) => {
  try {
    const { jobDescription, resumeData } = req.body;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Analyze how well this candidate fits the job description.

      JOB DESCRIPTION:
      ${jobDescription}

      CANDIDATE SKILLS:
      ${resumeData.skills?.join(", ") || "Not provided"}

      Provide:
      1. Match score (0-100%)
      2. Matching skills
      3. Missing skills
      4. 2-3 suggestions
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;

    res.json({ analysis: response.text() });
  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Test endpoint
app.get("/api/test", (req, res) => {
  res.json({ message: "Firebase Functions API is running!" });
});

// Ekspor API sebagai Cloud Function
exports.api = functions.https.onRequest(app);
