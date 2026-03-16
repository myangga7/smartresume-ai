// backend/models/Resume.js
const mongoose = require("mongoose");

// Schema untuk pengalaman kerja
const experienceSchema = new mongoose.Schema({
  company: String,
  position: String,
  startDate: String,
  endDate: String,
  current: Boolean,
  description: String,
});

// Schema untuk pendidikan
const educationSchema = new mongoose.Schema({
  institution: String,
  degree: String,
  field: String,
  graduationYear: String,
});

// Schema utama Resume
const resumeSchema = new mongoose.Schema({
  personal: {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    location: String,
    summary: String,
    photo: String,
    title: String,
  },

  experience: [experienceSchema],
  education: [educationSchema],
  skills: [String],

  template: {
    type: String,
    default: "modern",
  },

  userId: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// 🔴 PERBAIKAN DI SINI - HAPUS next()
resumeSchema.pre("save", function () {
  this.updatedAt = Date.now();
  // Tidak perlu memanggil next()
});

module.exports = mongoose.model("Resume", resumeSchema);
