// frontend/app/builder/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ResumeData {
  id: string;
  personal: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    summary: string;
    photo?: string;
    title?: string;
  };
  skills: string[];
  experience: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    graduationYear: string;
  }>;
  createdAt: string;
}

export default function ResumePreview() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [resume, setResume] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchResume = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/resumes/${id}`);
        setResume(response.data);
        console.log("Resume loaded:", response.data);
      } catch (err: any) {
        console.error("Error fetching resume:", err);
        setError(err.response?.data?.error || "Failed to load resume");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchResume();
    }
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this resume?")) return;

    try {
      await axios.delete(`/api/resumes/${id}`);
      router.push("/dashboard");
    } catch (err: any) {
      alert("Failed to delete resume");
      console.error(err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-6 text-xl text-gray-600">Loading resume...</p>
        </div>
      </div>
    );
  }

  if (error || !resume) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
          <p className="text-red-600 text-xl mb-4">
            ❌ {error || "Resume not found"}
          </p>
          <Link
            href="/dashboard"
            className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 print:bg-white print:py-0">
      <div className="max-w-5xl mx-auto px-4 print:px-0">
        {/* Action Buttons - Hide when printing */}
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4 print:hidden">
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition flex items-center gap-2"
          >
            ← Dashboard
          </Link>

          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
            >
              🖨️ Print
            </button>
            <Link
              href={`/builder/${id}/edit`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              ✏️ Edit
            </Link>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
            >
              🗑️ Delete
            </button>
          </div>
        </div>

        {/* Resume Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-8 border-white print:shadow-none print:border-0">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 p-8 text-white">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Photo */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white shadow-xl flex items-center justify-center overflow-hidden">
                  {resume.personal.photo && !imageError ? (
                    <img
                      src={resume.personal.photo}
                      alt={resume.personal.fullName}
                      className="w-full h-full object-cover"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <span className="text-5xl text-white/80">
                      {resume.personal.fullName?.charAt(0)?.toUpperCase() ||
                        "👤"}
                    </span>
                  )}
                </div>
              </div>

              {/* Name and Title */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-4xl md:text-5xl font-bold mb-2">
                  {resume.personal.fullName}
                </h1>
                <p className="text-xl text-white/90 mb-4">
                  {resume.personal.title || "Professional Resume"}
                </p>

                {/* Contact Info */}
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  {resume.personal.email && (
                    <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm flex items-center gap-2">
                      📧 {resume.personal.email}
                    </span>
                  )}
                  {resume.personal.phone && (
                    <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm flex items-center gap-2">
                      📞 {resume.personal.phone}
                    </span>
                  )}
                  {resume.personal.location && (
                    <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm flex items-center gap-2">
                      📍 {resume.personal.location}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Summary */}
            {resume.personal.summary && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                    📝
                  </span>
                  Professional Summary
                </h2>
                <p className="text-gray-700 leading-relaxed bg-gray-50 p-6 rounded-xl">
                  {resume.personal.summary}
                </p>
              </div>
            )}

            {/* Skills */}
            {resume.skills && resume.skills.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                    🛠️
                  </span>
                  Skills
                </h2>
                <div className="flex flex-wrap gap-3">
                  {resume.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 text-gray-700 rounded-full text-sm font-medium border border-blue-100 shadow-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Experience */}
            {resume.experience && resume.experience.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
                    💼
                  </span>
                  Work Experience
                </h2>
                <div className="space-y-6">
                  {resume.experience.map((exp, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition"
                    >
                      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">
                            {exp.position}
                          </h3>
                          <p className="text-lg text-gray-600">{exp.company}</p>
                        </div>
                        <div className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                          {exp.startDate} -{" "}
                          {exp.current ? "Present" : exp.endDate}
                        </div>
                      </div>
                      {exp.description && (
                        <p className="text-gray-700 leading-relaxed">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {resume.education && resume.education.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600">
                    🎓
                  </span>
                  Education
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {resume.education.map((edu, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition"
                    >
                      <h3 className="text-xl font-bold text-gray-800 mb-2">
                        {edu.institution}
                      </h3>
                      <p className="text-gray-600 mb-2">
                        {edu.degree} {edu.field && `in ${edu.field}`}
                      </p>
                      {edu.graduationYear && (
                        <div className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                          Class of {edu.graduationYear}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="border-t pt-6 text-center text-gray-400 text-sm print:text-xs">
              Created with SmartResume AI •{" "}
              {new Date(resume.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
