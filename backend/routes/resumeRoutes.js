// backend/routes/resumeRoutes.js
const express = require("express");
const router = express.Router();
const Resume = require("../models/Resume");

// 📌 CREATE - Membuat resume baru
router.post("/resumes", async (req, res) => {
  try {
    const resumeData = req.body;

    // Log untuk debugging
    console.log("📥 Data resume diterima:");
    console.log("- Nama:", resumeData.personal?.fullName);
    console.log("- Email:", resumeData.personal?.email);
    console.log("- Foto:", resumeData.personal?.photo || "Tidak ada");
    console.log("- Title:", resumeData.personal?.title || "Tidak ada");

    // Validasi
    if (!resumeData.personal?.fullName || !resumeData.personal?.email) {
      return res.status(400).json({
        error: "Nama dan email wajib diisi",
      });
    }

    const resume = new Resume(resumeData);
    await resume.save();

    console.log("✅ Resume berhasil disimpan dengan ID:", resume._id);

    res.status(201).json({
      message: "Resume berhasil dibuat",
      resume: resume,
    });
  } catch (error) {
    console.error("❌ ERROR DETAIL:", error.message);
    console.error("Stack trace:", error.stack);

    // 🔴 TAMBAHKAN HANDLING KHUSUS UNTUK VALIDATION ERROR
    if (error.name === "ValidationError") {
      return res.status(400).json({
        error: "Validasi gagal",
        details: error.errors,
      });
    }

    res.status(500).json({
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

// 📌 READ - Mendapatkan semua resume
router.get("/resumes", async (req, res) => {
  try {
    const resumes = await Resume.find().sort({ createdAt: -1 });
    console.log(`📊 Mengirim ${resumes.length} resume`);

    res.json({
      count: resumes.length,
      resumes: resumes,
    });
  } catch (error) {
    console.error("❌ Error mengambil data:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// 📌 READ - Mendapatkan satu resume by ID
router.get("/resumes/:id", async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({ error: "Resume tidak ditemukan" });
    }

    res.json(resume);
  } catch (error) {
    console.error("❌ Error mencari resume:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// 📌 UPDATE - Mengupdate resume
router.put("/resumes/:id", async (req, res) => {
  try {
    const resume = await Resume.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!resume) {
      return res.status(404).json({ error: "Resume tidak ditemukan" });
    }

    console.log("✅ Resume diupdate:", resume._id);
    res.json({
      message: "Resume berhasil diupdate",
      resume: resume,
    });
  } catch (error) {
    console.error("❌ Error update:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// 📌 DELETE - Menghapus resume
router.delete("/resumes/:id", async (req, res) => {
  try {
    const resume = await Resume.findByIdAndDelete(req.params.id);

    if (!resume) {
      return res.status(404).json({ error: "Resume tidak ditemukan" });
    }

    console.log("✅ Resume dihapus:", req.params.id);
    res.json({ message: "Resume berhasil dihapus" });
  } catch (error) {
    console.error("❌ Error hapus:", error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
