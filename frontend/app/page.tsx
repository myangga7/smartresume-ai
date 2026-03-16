// frontend/app/page.tsx
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-5xl font-bold text-center mb-6">SmartResume AI</h1>
        <p className="text-xl text-center text-gray-900 mb-8">
          Create a friendly resume easily and quickly
        </p>

        {/* Tombol-tombol utama - DIPERBESAR DAN DIPERJELAS */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
          <Link
            href="/builder"
            className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 text-center font-semibold text-lg"
          >
            ✨ Create New Resume
          </Link>
          <Link
            href="/dashboard"
            className="bg-gray-600 text-white px-8 py-4 rounded-lg hover:bg-gray-700 text-center font-semibold text-lg"
          >
            📊 Dashboard
          </Link>
        </div>

        {/* Statistik Cepat - PREMIUM VERSION */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {/* Stat 1 */}
          <div className="premium-card group hover:-translate-y-2 transition-all duration-300">
            <div className="flex flex-col items-center p-8">
              <div className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                100+
              </div>
              <div className="text-sm uppercase tracking-wider text-white/60 mb-4">
                Resumes Created
              </div>
              <div className="w-12 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></div>
            </div>
          </div>

          {/* Stat 2 */}
          <div className="premium-card group hover:-translate-y-2 transition-all duration-300">
            <div className="flex flex-col items-center p-8">
              <div className="text-5xl font-bold bg-gradient-to-r from-pink-400 to-red-400 bg-clip-text text-transparent mb-2">
                95%
              </div>
              <div className="text-sm uppercase tracking-wider text-white/60 mb-4">
                User Satisfaction
              </div>
              <div className="w-12 h-1 bg-gradient-to-r from-pink-400 to-red-400 rounded-full"></div>
            </div>
          </div>

          {/* Stat 3 */}
          <div className="premium-card group hover:-translate-y-2 transition-all duration-300">
            <div className="flex flex-col items-center p-8">
              <div className="text-5xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2">
                24/7
              </div>
              <div className="text-sm uppercase tracking-wider text-white/60 mb-4">
                Access Anytime
              </div>
              <div className="w-12 h-1 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Featured Features - PREMIUM VERSION */}
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold mb-4">
            <span className="gradient-text">Featured Features</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-400 mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="premium-card group hover:-translate-y-2 transition-all duration-300">
            <div className="p-8">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="text-3xl">✨</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Easy to Use</h3>
              <p className="text-white/70 leading-relaxed">
                An intuitive form to create a professional resume in minutes,
                with real-time preview and smart suggestions.
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="premium-card group hover:-translate-y-2 transition-all duration-300">
            <div className="p-8">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-pink-400 to-red-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="text-3xl">📱</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Live Preview
              </h3>
              <p className="text-white/70 leading-relaxed">
                See your resume take shape in real-time as you type. Instant
                feedback on layout and content.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="premium-card group hover:-translate-y-2 transition-all duration-300">
            <div className="p-8">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-green-400 to-emerald-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="text-3xl">💾</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Save & Edit</h3>
              <p className="text-white/70 leading-relaxed">
                All resumes are securely stored in your dashboard. Edit anytime,
                download as PDF, or share the link.
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="premium-card inline-block p-1">
            <div className="flex gap-4 p-1">
              <Link
                href="/builder"
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg font-semibold"
              >
                Get Started Now 🚀
              </Link>
              <Link
                href="/dashboard"
                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-all border border-white/20"
              >
                View Dashboard 📊
              </Link>
            </div>
          </div>
        </div>

        {/* Call to Action Tambahan */}
        <div className="text-center mt-12">
          <p className="text- mb-4">Ready to create your dream resume?</p>
          <Link
            href="/builder"
            className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
          >
            Let's Start →
          </Link>
        </div>
      </div>
    </div>
  );
}
