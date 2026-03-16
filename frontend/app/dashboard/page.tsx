// frontend/app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Resume {
  id: string;
  personal: {
    fullName: string;
    email: string;
    phone?: string;
    location?: string;
    title?: string;
    photo?: string;
  };
  skills: string[];
  experience: Array<any>;
  education: Array<any>;
  createdAt: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/resumes");
      setResumes(response.data.resumes || []);
    } catch (err: any) {
      console.error("Error fetching resumes:", err);
      setError(err.response?.data?.error || "Failed to load resumes");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this resume?")) return;

    try {
      await axios.delete(`/api/resumes/${id}`);
      // Refresh daftar setelah hapus
      fetchResumes();
    } catch (err: any) {
      alert("Failed to delete resume");
      console.error(err);
    }
  };

  // Filter resumes based on search term
  const filteredResumes = resumes.filter(
    (resume) =>
      resume.personal?.fullName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      resume.personal?.email
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      resume.personal?.title?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-6 text-xl text-gray-600">Loading your resumes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              My Resumes
            </h1>
            <p className="text-gray-600">Manage all your created resumes</p>
          </div>
          <Link
            href="/builder"
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg flex items-center gap-2"
          >
            <span>+</span>
            Create New Resume
          </Link>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search by name, email, or title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-10 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
            <span className="absolute left-3 top-3 text-gray-400">🔍</span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-xl">
            ❌ {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-sm text-gray-500">Total Resumes</p>
            <p className="text-3xl font-bold text-gray-800">{resumes.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-sm text-gray-500">With Photos</p>
            <p className="text-3xl font-bold text-gray-800">
              {resumes.filter((r) => r.personal?.photo).length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-sm text-gray-500">With Experience</p>
            <p className="text-3xl font-bold text-gray-800">
              {resumes.filter((r) => r.experience?.length > 0).length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-sm text-gray-500">Last Update</p>
            <p className="text-sm font-semibold text-gray-800">
              {resumes.length > 0
                ? new Date(resumes[0]?.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "N/A"}
            </p>
          </div>
        </div>

        {/* Resume List */}
        {filteredResumes.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-12 text-center">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No resumes found
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm
                ? "No matches for your search"
                : "Get started by creating your first resume"}
            </p>
            {!searchTerm && (
              <Link
                href="/builder"
                className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
              >
                Create Your First Resume
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResumes.map((resume) => (
              <div
                key={resume.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1"
              >
                {/* Card Header with Photo/Initial */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white flex items-center justify-center overflow-hidden">
                      {resume.personal?.photo ? (
                        <img
                          src={resume.personal.photo}
                          alt={resume.personal.fullName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl font-bold">
                          {resume.personal?.fullName?.charAt(0) || "👤"}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg truncate">
                        {resume.personal?.fullName || "Unnamed"}
                      </h3>
                      <p className="text-sm text-white/80 truncate">
                        {resume.personal?.title || "No title"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6">
                  {/* Contact Info */}
                  <div className="space-y-2 mb-4 text-sm text-gray-600">
                    {resume.personal?.email && (
                      <div className="flex items-center gap-2">
                        <span>📧</span>
                        <span className="truncate">
                          {resume.personal.email}
                        </span>
                      </div>
                    )}
                    {resume.personal?.location && (
                      <div className="flex items-center gap-2">
                        <span>📍</span>
                        <span className="truncate">
                          {resume.personal.location}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Skills Preview */}
                  {resume.skills && resume.skills.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-gray-700 mb-2">
                        Skills:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {resume.skills.slice(0, 3).map((skill, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                          >
                            {skill}
                          </span>
                        ))}
                        {resume.skills.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                            +{resume.skills.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Meta Info */}
                  <div className="flex justify-between items-center text-xs text-gray-400 mb-4">
                    <span>
                      Created:{" "}
                      {new Date(resume.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <span>
                      Exp: {resume.experience?.length || 0} | Edu:{" "}
                      {resume.education?.length || 0}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/builder/${resume.id}`)}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                    >
                      View
                    </button>
                    <button
                      onClick={() => router.push(`/builder/${resume.id}/edit`)}
                      className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(resume.id)}
                      className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
