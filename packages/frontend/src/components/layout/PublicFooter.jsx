/**
 * PublicFooter Component
 * Footer for public pages
 */

import { Link } from "react-router-dom";

export function PublicFooter() {
  return (
    <footer className="py-16 border-t border-white/5 bg-black/40">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#22c55e] to-[#84cc16] rounded-xl flex items-center justify-center">
                <span className="text-black font-black text-xl">G</span>
              </div>
              <span className="text-xl font-black tracking-tighter uppercase">Gym Elite</span>
            </div>
            <p className="text-gray-500 text-sm">
              Transform your body and mind with elite training programs.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-black uppercase tracking-widest mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link to="/features" className="hover:text-[#22c55e] transition-colors">Features</Link></li>
              <li><Link to="/trainers" className="hover:text-[#22c55e] transition-colors">Trainers</Link></li>
              <li><Link to="/classes" className="hover:text-[#22c55e] transition-colors">Classes</Link></li>
              <li><Link to="/workout-plans" className="hover:text-[#22c55e] transition-colors">Workout Plans</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-black uppercase tracking-widest mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link to="/about" className="hover:text-[#22c55e] transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-[#22c55e] transition-colors">Contact</Link></li>
              <li><a href="#" className="hover:text-[#22c55e] transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-[#22c55e] transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-black uppercase tracking-widest mb-4">Connect</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="#" className="hover:text-[#22c55e] transition-colors">Instagram</a></li>
              <li><a href="#" className="hover:text-[#22c55e] transition-colors">Facebook</a></li>
              <li><a href="#" className="hover:text-[#22c55e] transition-colors">Twitter</a></li>
              <li><a href="#" className="hover:text-[#22c55e] transition-colors">YouTube</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-600 text-xs uppercase tracking-widest">
            © 2026 Gym Elite. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs uppercase tracking-widest text-gray-600">
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
