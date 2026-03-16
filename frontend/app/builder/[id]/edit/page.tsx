// frontend/app/builder/[id]/edit/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";

export default function EditResume() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("personal");

  // STATE UNTUK FORM DATA
  const [formData, setFormData] = useState({
    personal: {
      fullName: "",
      email: "",
      phone: "",
      location: "",
      summary: "",
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

  // FETCH DATA RESUME YANG AKAN DIEDIT
  useEffect(() => {
    const fetchResume = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/resumes/${id}`,
        );
        const resumeData = response.data;

        setFormData({
          personal: resumeData.personal || {
            fullName: "",
            email: "",
            phone: "",
            location: "",
            summary: "",
          },
          skills: resumeData.skills?.length ? resumeData.skills : [""],
          experience: resumeData.experience?.length
            ? resumeData.experience
            : [
                {
                  company: "",
                  position: "",
                  startDate: "",
                  endDate: "",
                  current: false,
                  description: "",
                },
              ],
          education: resumeData.education?.length
            ? resumeData.education
            : [
                {
                  institution: "",
                  degree: "",
                  field: "",
                  graduationYear: "",
                },
              ],
        });
      } catch (err: any) {
        setError(err.response?.data?.error || "Failed to load resume");
      } finally {
        setFetchLoading(false);
      }
    };

    if (id) {
      fetchResume();
    }
  }, [id]);

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

  // HANDLE UPDATE
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const cleanSkills = formData.skills.filter(
        (skill) => skill.trim() !== "",
      );
      const cleanExperience = formData.experience.filter(
        (exp) => exp.company.trim() !== "" && exp.position.trim() !== "",
      );
      const cleanEducation = formData.education.filter(
        (edu) => edu.institution.trim() !== "",
      );

      await axios.put(`http://localhost:5000/api/resumes/${id}`, {
        personal: formData.personal,
        skills: cleanSkills,
        experience: cleanExperience,
        education: cleanEducation,
      });

      router.push(`/builder/${id}`); // Redirect ke halaman preview setelah update
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to update resume");
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading resume data...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen py-8"
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Edit Resume</h1>
          <button
            onClick={() => router.push(`/builder/${id}`)}
            className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 transition-all border border-white/20"
          >
            ← Back to Preview
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-white">
            ❌ {error}
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
          <form onSubmit={handleUpdate} className="space-y-6">
            {/* PERSONAL INFO TAB */}
            {activeTab === "personal" && (
              <div>
                <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Personal Information
                </h2>

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

            {/* Update Button */}
            <div className="flex justify-end gap-4 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => router.push(`/builder/${id}`)}
                className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 transition-all border border-white/20"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg font-semibold disabled:opacity-50"
              >
                {loading ? "Updating..." : "Update Resume ✨"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
