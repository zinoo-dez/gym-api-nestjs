/**
 * LandingPage Component
 * A premium landing page for the Gym Management System
 */

import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-500 selection:text-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <span className="text-2xl font-black bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent italic">
                GYM PREMIER
              </span>
            </div>
            <div className="flex items-center space-x-6">
              <Link
                to="/login"
                className="text-sm font-medium hover:text-blue-400 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-sm font-bold transition-all shadow-lg hover:shadow-blue-500/25 active:scale-95"
              >
                Join Now
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] z-0 pointer-events-none">
          <div className="absolute top-[-100px] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[20%] left-[-5%] w-[400px] h-[400px] bg-indigo-600/20 blur-[100px] rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl lg:text-7xl font-black leading-tight mb-6">
                ELEVATE YOUR <br />
                <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  PERFORMANCE
                </span>
              </h1>
              <p className="text-xl text-gray-400 mb-8 max-w-lg leading-relaxed">
                Experience the NEXT generation of fitness. We combine state-of-the-art 
                technology with world-class trainers to help you reach your peak.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/register"
                  className="px-8 py-4 bg-white text-black font-bold rounded-2xl hover:bg-gray-100 transition-all shadow-xl hover:shadow-white/10 active:scale-95 text-center min-w-[180px]"
                >
                  Start Training
                </Link>
                <Link
                  to="/login"
                  className="px-8 py-4 bg-white/5 backdrop-blur-md border border-white/10 text-white font-bold rounded-2xl hover:bg-white/10 transition-all text-center min-w-[180px]"
                >
                  Access Portal
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative lg:block"
            >
              <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                <img
                  src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000&auto=format&fit=crop"
                  alt="Professional Gym"
                  className="w-full h-auto object-cover grayscale hover:grayscale-0 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
              </div>
              
              {/* Floating Stat Card */}
              <div className="absolute -bottom-6 -left-6 bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-3xl shadow-2xl z-20">
                <div className="text-3xl font-black mb-1 text-blue-400">500+</div>
                <div className="text-sm font-medium text-gray-400">ACTIVE MEMBERS</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 lg:py-32 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-black mb-4 italic uppercase">World Class Features</h2>
            <p className="text-gray-500 text-lg">Unmatched facilities and expertise at your fingertips.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Smart Tracking", desc: "Monitor your progress with real-time analytics and biometric synchronization.", icon: "📊" },
              { title: "Elite Trainers", desc: "Access certified professionals who specialize in bodybuilding, yoga, and HIIT.", icon: "🔥" },
              { title: "Premium Access", desc: "Enjoy 24/7 access to our luxury facilities across multiple locations.", icon: "💎" }
            ].map((f, i) => (
              <div key={i} className="p-8 rounded-3xl bg-white/5 border border-white/5 hover:border-blue-500/30 transition-all group">
                <div className="text-4xl mb-6">{f.icon}</div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-blue-400 transition-colors uppercase italic">{f.title}</h3>
                <p className="text-gray-400 leading-relaxed text-sm lg:text-base">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
          <p>© 2026 GYM PREMIER MANAGEMENT. POWERED BY ANTIGRAVITY.</p>
        </div>
      </footer>
    </div>
  );
}
