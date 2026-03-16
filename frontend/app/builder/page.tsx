// frontend/app/builder/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import ImageUpload from "@/components/ImageUpload";

export default function ResumeBuilder() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [aiSuggestions, setAiSuggestions] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);
  const [showJobModal, setShowJobModal] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [activeTab, setActiveTab] = useState("personal");

  // STATE UNTUK FORM DATA
  const [formData, setFormData] = useState({
    personal: {
      fullName: "",
      email: "",
      phone: "",
      location: "",
      summary: "",
      photo: "",
      title: "",
    },
    skills: [""],
    experience: [
      {
        company: "",
        position: "",
        startDate: "",
        endDate: "",
        current: false,
        description: "",
      },
    ],
    education: [
      {
        institution: "",
        degree: "",
        field: "",
        graduationYear: "",
      },
    ],
  });

  // ===========================================
  // HANDLE FUNCTIONS
  // ===========================================
  const handlePersonalChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({
      ...formData,
      personal: {
        ...formData.personal,
        [e.target.name]: e.target.value,
      },
    });
  };

  const handlePhotoUpload = (url: string) => {
    setFormData({
      ...formData,
      personal: {
        ...formData.personal,
        photo: url,
      },
    });
  };

  const handleSkillChange = (index: number, value: string) => {
    const newSkills = [...formData.skills];
    newSkills[index] = value;
    setFormData({ ...formData, skills: newSkills });
  };

  const addSkill = () => {
    setFormData({ ...formData, skills: [...formData.skills, ""] });
  };

  const removeSkill = (index: number) => {
    const newSkills = formData.skills.filter((_, i) => i !== index);
    setFormData({ ...formData, skills: newSkills });
  };

  const handleExperienceChange = (index: number, field: string, value: any) => {
    const newExperience = [...formData.experience];
    newExperience[index] = { ...newExperience[index], [field]: value };
    setFormData({ ...formData, experience: newExperience });
  };

  const addExperience = () => {
    setFormData({
      ...formData,
      experience: [
        ...formData.experience,
        {
          company: "",
          position: "",
          startDate: "",
          endDate: "",
          current: false,
          description: "",
        },
      ],
    });
  };

  const removeExperience = (index: number) => {
    const newExperience = formData.experience.filter((_, i) => i !== index);
    setFormData({ ...formData, experience: newExperience });
  };

  const handleEducationChange = (
    index: number,
    field: string,
    value: string,
  ) => {
    const newEducation = [...formData.education];
    newEducation[index] = { ...newEducation[index], [field]: value };
    setFormData({ ...formData, education: newEducation });
  };

  const addEducation = () => {
    setFormData({
      ...formData,
      education: [
        ...formData.education,
        {
          institution: "",
          degree: "",
          field: "",
          graduationYear: "",
        },
      ],
    });
  };

  const removeEducation = (index: number) => {
    const newEducation = formData.education.filter((_, i) => i !== index);
    setFormData({ ...formData, education: newEducation });
  };

  // ===========================================
  // AI FUNCTIONS WITH CLOUDFLARE WORKER
  // ===========================================
  const getAISuggestions = async () => {
    setLoadingAI(true);
    setAiSuggestions("");

    try {
      // Validasi data minimal
      if (!formData.personal.fullName) {
        setAiSuggestions("Please fill in your name first.");
        setLoadingAI(false);
        return;
      }

      // Format data resume menjadi prompt yang bagus
      const prompt = `
        You are an expert resume writer. Review this resume and give 4-5 specific, actionable suggestions for improvement.

        PERSONAL:
        - Name: ${formData.personal.fullName || "Not provided"}
        - Title: ${formData.personal.title || "Not provided"}
        - Summary: ${formData.personal.summary || "Not provided"}

        SKILLS:
        ${formData.skills.filter((s) => s.trim()).join(", ") || "No skills listed"}

        EXPERIENCE:
        ${
          formData.experience
            .filter((exp) => exp.company && exp.position)
            .map(
              (exp) =>
                `- ${exp.position} at ${exp.company} (${exp.startDate || "?"} - ${exp.current ? "Present" : exp.endDate || "?"})
             ${exp.description ? `  Description: ${exp.description}` : ""}`,
            )
            .join("\n") || "No experience listed"
        }

        EDUCATION:
        ${
          formData.education
            .filter((edu) => edu.institution)
            .map(
              (edu) =>
                `- ${edu.degree || "Degree"} at ${edu.institution} (${edu.graduationYear || "?"})`,
            )
            .join("\n") || "No education listed"
        }

        INSTRUCTIONS:
        1. Focus on keywords that help pass ATS screening
        2. Suggest action verbs and quantitative achievements
        3. Recommend how to better organize skills
        4. Give format/template suggestions
        5. Be constructive and specific

        Format your response with clear bullet points using emojis.
      `;

      console.log("Mengirim prompt ke Cloudflare Worker...");

      // Panggil Cloudflare Worker
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_GEMINI_API_URL}?prompt=${encodeURIComponent(prompt)}`,
      );

      console.log("Response diterima:", response.data);

      // Set hasil ke state
      setAiSuggestions(response.data.response || "No response from AI");
    } catch (error: any) {
      console.error("AI Error:", error);
      setAiSuggestions(
        error.response?.data?.error ||
          "Sorry, something went wrong. Please try again later.",
      );
    } finally {
      setLoadingAI(false);
    }
  };

  const analyzeJobDescription = async () => {
    if (!jobDescription.trim()) {
      alert("Please paste a job description first");
      return;
    }

    setLoadingAI(true);
    setShowJobModal(false);
    setAiSuggestions("");

    try {
      const prompt = `
        Analyze how well this candidate fits the job description.

        JOB DESCRIPTION:
        ${jobDescription}

        CANDIDATE SKILLS:
        ${formData.skills.filter((s) => s.trim()).join(", ") || "No skills listed"}

        Provide:
        1. Match score (0-100%)
        2. Matching skills
        3. Missing skills
        4. 2-3 specific suggestions to improve their chances

        Format with clear sections and emojis.
      `;

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_GEMINI_API_URL}?prompt=${encodeURIComponent(prompt)}`,
      );

      setAiSuggestions(response.data.response);
    } catch (error) {
      console.error("AI Error:", error);
      setAiSuggestions("Sorry, something went wrong. Please try again.");
    } finally {
      setLoadingAI(false);
    }
  };

  // ===========================================
  // HANDLE SUBMIT - UPDATED VERSION
  // ===========================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Bersihkan data: filter yang kosong
      const cleanSkills = formData.skills.filter(
        (skill) => skill.trim() !== "",
      );

      const cleanExperience = formData.experience.filter(
        (exp) => exp.company.trim() !== "" && exp.position.trim() !== "",
      );

      const cleanEducation = formData.education.filter(
        (edu) => edu.institution.trim() !== "",
      );

      // 🔴 PASTIKAN TIDAK ADA UNDEFINED ATAU NULL
      const dataToSend = {
        personal: {
          fullName: formData.personal.fullName || "",
          email: formData.personal.email || "",
          phone: formData.personal.phone || "",
          location: formData.personal.location || "",
          summary: formData.personal.summary || "",
          photo: formData.personal.photo || "",
          title: formData.personal.title || "",
        },
        skills: cleanSkills.length > 0 ? cleanSkills : [], // Kirim array kosong jika tidak ada
        experience: cleanExperience,
        education: cleanEducation,
      };

      console.log(
        "📤 Data yang akan dikirim:",
        JSON.stringify(dataToSend, null, 2),
      );

      // Simpan ke API endpoint
      const response = await axios.post("/api/resumes", dataToSend);

      console.log("✅ Respon dari server:", response.data);

      const resumeId = response.data.resume.id || response.data.resume._id;

      // Redirect ke halaman preview
      router.push(`/builder/${resumeId}`);
    } catch (err: any) {
      console.error("❌ Error saving resume:", err);

      if (err.response) {
        // Server merespon dengan error
        console.error("Server error response:", err.response.data);
        setError(
          err.response.data?.error || `Server error: ${err.response.status}`,
        );
      } else if (err.request) {
        // Request dibuat tapi tidak ada response
        setError("No response from server. Please check your connection.");
      } else {
        // Error lainnya
        setError(err.message || "Failed to save resume");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen py-8"
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      <div className="max-w-6xl mx-auto px-4">
        {/* Header Premium */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4">
            <span className="gradient-text">SmartResume AI</span>
          </h1>
          <p className="text-xl text-white/90">
            Build an ATS-friendly resume with AI assistance
          </p>
        </div>

        {/* AI SUGGESTION PANEL */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                <span className="text-2xl">✨</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">AI Assistant</h2>
                <p className="text-sm text-white/70">
                  Powered by Google Gemini on Cloudflare
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowJobModal(true)}
                className="px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 transition-all border border-white/20 text-sm"
              >
                📋 Analyze Job
              </button>
              <button
                onClick={getAISuggestions}
                disabled={loadingAI}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg font-semibold disabled:opacity-50"
              >
                {loadingAI ? "✨ Processing..." : "✨ Get AI Suggestions"}
              </button>
            </div>
          </div>

          {loadingAI && (
            <div className="flex items-center gap-3 text-white/80 py-4">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <p>AI is analyzing your resume...</p>
            </div>
          )}

          {aiSuggestions && !loadingAI && (
            <div className="mt-4 p-6 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
              <div className="prose prose-invert max-w-none text-white/90 whitespace-pre-line">
                {aiSuggestions}
              </div>
            </div>
          )}
        </div>

        {/* JOB DESCRIPTION MODAL */}
        {showJobModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 max-w-2xl w-full">
              <h3 className="text-xl font-bold text-white mb-4">
                Analyze Job Description
              </h3>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={8}
                className="w-full border border-white/20 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                placeholder="Paste job description here..."
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowJobModal(false)}
                  className="px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 transition-all border border-white/20"
                >
                  Cancel
                </button>
                <button
                  onClick={analyzeJobDescription}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
                >
                  Analyze
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {["personal", "skills", "experience", "education"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === tab
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              {tab === "personal" && "👤 Personal"}
              {tab === "skills" && "🛠️ Skills"}
              {tab === "experience" && "💼 Experience"}
              {tab === "education" && "🎓 Education"}
            </button>
          ))}
        </div>

        {/* Form Container */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* PERSONAL INFO TAB */}
            {activeTab === "personal" && (
              <div>
                <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Personal Information
                </h2>

                {/* Upload Foto */}
                <div className="mb-8">
                  <label className="block text-sm font-medium mb-4 text-white/80">
                    Profile Photo
                  </label>
                  <ImageUpload
                    onUploadComplete={handlePhotoUpload}
                    currentImage={formData.personal.photo}
                    name={formData.personal.fullName || "User"}
                  />
                </div>

                {/* Job Title */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2 text-white/80">
                    Professional Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.personal.title}
                    onChange={handlePersonalChange}
                    className="w-full border border-white/20 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Senior Frontend Developer"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-white/80">
                      Full Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.personal.fullName}
                      onChange={handlePersonalChange}
                      required
                      className="w-full border border-white/20 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-white/80">
                      Email <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.personal.email}
                      onChange={handlePersonalChange}
                      required
                      className="w-full border border-white/20 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-white/80">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.personal.phone}
                      onChange={handlePersonalChange}
                      className="w-full border border-white/20 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+1 234 567 8900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-white/80">
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.personal.location}
                      onChange={handlePersonalChange}
                      className="w-full border border-white/20 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="New York, NY"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium mb-2 text-white/80">
                    Professional Summary
                  </label>
                  <textarea
                    name="summary"
                    value={formData.personal.summary}
                    onChange={handlePersonalChange}
                    rows={4}
                    className="w-full border border-white/20 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Tell us about yourself, your key skills, and career goals..."
                  />
                </div>
              </div>
            )}

            {/* SKILLS TAB */}
            {activeTab === "skills" && (
              <div>
                <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Skills
                </h2>

                {formData.skills.map((skill, index) => (
                  <div key={index} className="flex gap-3 mb-3">
                    <input
                      type="text"
                      value={skill}
                      onChange={(e) => handleSkillChange(index, e.target.value)}
                      className="flex-1 border border-white/20 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., JavaScript"
                    />
                    {formData.skills.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSkill(index)}
                        className="px-4 py-2 text-red-400 hover:bg-white/10 rounded-lg transition"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addSkill}
                  className="mt-4 text-blue-400 hover:text-blue-300 font-medium"
                >
                  + Add Skill
                </button>
              </div>
            )}

            {/* EXPERIENCE TAB */}
            {activeTab === "experience" && (
              <div>
                <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Work Experience
                </h2>

                {formData.experience.map((exp, index) => (
                  <div
                    key={index}
                    className="mb-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-lg text-white">
                        Experience {index + 1}
                      </h3>
                      {formData.experience.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeExperience(index)}
                          className="text-red-400 hover:text-red-300 transition"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-white/80">
                          Company
                        </label>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) =>
                            handleExperienceChange(
                              index,
                              "company",
                              e.target.value,
                            )
                          }
                          className="w-full border border-white/20 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Company name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2 text-white/80">
                          Position
                        </label>
                        <input
                          type="text"
                          value={exp.position}
                          onChange={(e) =>
                            handleExperienceChange(
                              index,
                              "position",
                              e.target.value,
                            )
                          }
                          className="w-full border border-white/20 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., Frontend Developer"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2 text-white/80">
                          Start Date
                        </label>
                        <input
                          type="month"
                          value={exp.startDate}
                          onChange={(e) =>
                            handleExperienceChange(
                              index,
                              "startDate",
                              e.target.value,
                            )
                          }
                          className="w-full border border-white/20 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2 text-white/80">
                          End Date
                        </label>
                        <input
                          type="month"
                          value={exp.endDate}
                          onChange={(e) =>
                            handleExperienceChange(
                              index,
                              "endDate",
                              e.target.value,
                            )
                          }
                          disabled={exp.current}
                          className="w-full border border-white/20 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={exp.current}
                          onChange={(e) =>
                            handleExperienceChange(
                              index,
                              "current",
                              e.target.checked,
                            )
                          }
                          className="rounded bg-white/20 border-white/30 text-blue-600"
                        />
                        <span className="text-sm text-white/80">
                          I currently work here
                        </span>
                      </label>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium mb-2 text-white/80">
                        Description
                      </label>
                      <textarea
                        value={exp.description}
                        onChange={(e) =>
                          handleExperienceChange(
                            index,
                            "description",
                            e.target.value,
                          )
                        }
                        rows={3}
                        className="w-full border border-white/20 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Describe your responsibilities and achievements..."
                      />
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addExperience}
                  className="mt-4 text-blue-400 hover:text-blue-300 font-medium"
                >
                  + Add Experience
                </button>
              </div>
            )}

            {/* EDUCATION TAB */}
            {activeTab === "education" && (
              <div>
                <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Education
                </h2>

                {formData.education.map((edu, index) => (
                  <div
                    key={index}
                    className="mb-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-lg text-white">
                        Education {index + 1}
                      </h3>
                      {formData.education.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeEducation(index)}
                          className="text-red-400 hover:text-red-300 transition"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-2 text-white/80">
                          Institution
                        </label>
                        <input
                          type="text"
                          value={edu.institution}
                          onChange={(e) =>
                            handleEducationChange(
                              index,
                              "institution",
                              e.target.value,
                            )
                          }
                          className="w-full border border-white/20 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="University name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2 text-white/80">
                          Degree
                        </label>
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) =>
                            handleEducationChange(
                              index,
                              "degree",
                              e.target.value,
                            )
                          }
                          className="w-full border border-white/20 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., Bachelor of Science"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2 text-white/80">
                          Field of Study
                        </label>
                        <input
                          type="text"
                          value={edu.field}
                          onChange={(e) =>
                            handleEducationChange(
                              index,
                              "field",
                              e.target.value,
                            )
                          }
                          className="w-full border border-white/20 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., Computer Science"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2 text-white/80">
                          Graduation Year
                        </label>
                        <input
                          type="text"
                          value={edu.graduationYear}
                          onChange={(e) =>
                            handleEducationChange(
                              index,
                              "graduationYear",
                              e.target.value,
                            )
                          }
                          className="w-full border border-white/20 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="2023"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addEducation}
                  className="mt-4 text-blue-400 hover:text-blue-300 font-medium"
                >
                  + Add Education
                </button>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end gap-4 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 transition-all border border-white/20"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg font-semibold disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Resume ✨"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
