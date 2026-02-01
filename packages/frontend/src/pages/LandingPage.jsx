/**
 * LandingPage Component
 * A premium landing page for the Gym Management System
 */

import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "../components/common/Button";

export function LandingPage() {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 200], [1, 0]);
  const scale = useTransform(scrollY, [0, 200], [1, 0.95]);

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-blue-500/30 selection:text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/40 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex justify-between items-center h-24">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <span className="text-white font-black text-xl italic">G</span>
              </div>
              <span className="text-xl font-black bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent italic tracking-tighter uppercase">
                Gym Premier
              </span>
            </div>
            <div className="flex items-center space-x-8">
              <Link
                to="/login"
                className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors"
              >
                Entrance
              </Link>
              <Link to="/register">
                <Button variant="premium" className="px-8 !py-2.5 !rounded-full text-xs uppercase tracking-widest">
                  Join Elite
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-32 lg:pt-60 lg:pb-52 overflow-hidden">
        {/* Dynamic Background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0">
          <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-blue-600/10 blur-[130px] rounded-full animate-pulse" />
          <div className="absolute bottom-[10%] left-[-10%] w-[700px] h-[700px] bg-indigo-600/5 blur-[150px] rounded-full" />
          <div className="absolute top-[20%] left-[15%] w-[300px] h-[300px] bg-violet-600/10 blur-[100px] rounded-full" />
          
          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        </div>

        <motion.div 
          style={{ opacity, scale }}
          className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10"
        >
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <span className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] mb-8">
                The Pinnacle of Human Performance
              </span>
              <h1 className="text-6xl md:text-8xl lg:text-[7.5rem] font-black leading-[0.9] mb-10 tracking-tighter uppercase italic">
                Shatter Your <br />
                <span className="text-gradient">Limits.</span>
              </h1>
              <p className="text-lg sm:text-2xl text-gray-400 mb-12 max-w-2xl leading-relaxed font-medium">
                We don't just build muscle; we build legends. Access the most exclusive training environment in the world.
              </p>
              <div className="flex flex-col sm:flex-row gap-6">
                <Link to="/register">
                  <Button variant="premium" className="px-10 py-5 text-sm uppercase tracking-widest min-w-[220px]">
                    Get Started
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" className="px-10 py-5 text-sm uppercase tracking-widest min-w-[220px]">
                    Member Login
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-24 border-y border-white/5 bg-black/20">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 sm:gap-16">
            {[
              { label: "Elite Athletes", val: "2,400+" },
              { label: "Master Trainers", val: "48" },
              { label: "Locations", val: "12" },
              { label: "Success Rate", val: "99.2%" },
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center md:text-left"
              >
                <div className="text-3xl sm:text-5xl font-black mb-3 text-white italic tracking-tighter italic">{stat.val}</div>
                <div className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-500">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 lg:py-52 relative">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
            <div className="max-w-2xl">
              <h2 className="text-4xl lg:text-6xl font-black mb-6 uppercase italic tracking-tighter">Beyond Physicality</h2>
              <p className="text-xl text-gray-500 leading-relaxed font-medium">Our methodology integrates metabolic science with world-class biomechanics.</p>
            </div>
            <Link to="/register" className="group flex items-center gap-3 text-blue-400 font-black uppercase tracking-widest text-xs">
              View Memberships 
              <span className="w-8 h-[2px] bg-blue-400 group-hover:w-12 transition-all" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Neuro-Integration", desc: "Proprietary nervous system training to maximize muscle fiber activation and speed.", icon: "🧠" },
              { title: "Bio-Analytics", desc: "Real-time blood glucose and cortisol monitoring to optimize every single set.", icon: "🧬" },
              { title: "Atmosphere Control", desc: "Oxygen-enriched facilities designed to accelerate recovery and focus.", icon: "🌬️" }
            ].map((f, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:border-blue-500/20 transition-all duration-500 group relative overflow-hidden"
              >
                <div className="absolute -right-4 -top-4 text-8xl opacity-[0.03] group-hover:scale-110 transition-transform duration-700">{f.icon}</div>
                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-3xl mb-10 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500">
                  {f.icon}
                </div>
                <h3 className="text-2xl font-black mb-4 group-hover:text-blue-400 transition-colors uppercase italic tracking-tight">{f.title}</h3>
                <p className="text-gray-500 leading-relaxed group-hover:text-gray-300 transition-colors duration-500">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-48 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
          <div className="relative p-12 lg:p-24 rounded-[3rem] bg-gradient-to-br from-blue-600/90 to-indigo-700/90 overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2" />
            
            <div className="relative z-10 text-center max-w-3xl mx-auto">
              <h2 className="text-4xl lg:text-7xl font-black mb-10 uppercase italic tracking-tighter leading-tight">Your Transformation <br /> Starts Tonight.</h2>
              <p className="text-xl text-blue-100/80 mb-12 font-medium">Join the thousands who have already unlocked their true potential.</p>
              <Link to="/register">
                <Button className="!bg-white !text-blue-600 hover:!bg-blue-50 px-12 py-6 text-sm uppercase tracking-[0.2em] font-black">
                  Apply for Membership
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5 bg-black/40">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="flex flex-col items-center md:items-start gap-4">
              <span className="text-2xl font-black tracking-tighter uppercase italic text-white/80">Gym Premier</span>
              <p className="text-gray-600 text-xs tracking-widest uppercase">Precision. Power. Performance.</p>
            </div>
            <div className="flex gap-12 text-[10px] uppercase tracking-widest font-black text-gray-500">
              <a href="#" className="hover:text-white transition-colors">Instagram</a>
              <a href="#" className="hover:text-white transition-colors">X / Twitter</a>
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
            </div>
            <p className="text-gray-700 text-[10px] uppercase tracking-[0.2em] font-bold">
              © 2026 GP MANAGEMENT. ALL RIGHTS RESERVED.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
