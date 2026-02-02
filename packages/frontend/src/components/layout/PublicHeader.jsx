/**
 * PublicHeader Component
 * Navigation header for public pages
 */

import { Link, useLocation } from "react-router-dom";
import { Button } from "../common/Button";

export function PublicHeader() {
  const location = useLocation();
  
  const navLinks = [
    { label: "Home", path: "/" },
    { label: "Features", path: "/features" },
    { label: "Trainers", path: "/trainers" },
    { label: "Classes", path: "/classes" },
    { label: "Workout Plans", path: "/workout-plans" },
    { label: "Memberships", path: "/memberships" },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-black/40 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#22c55e] to-[#84cc16] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.3)]">
              <span className="text-black font-black text-xl">G</span>
            </div>
            <span className="text-xl font-black tracking-tighter uppercase hidden sm:block">
              Gym Elite
            </span>
          </Link>
          
          <div className="hidden lg:flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`hover:text-[#22c55e] transition-colors ${
                  location.pathname === link.path ? 'text-[#22c55e]' : ''
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Link 
              to="/login" 
              className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 hover:text-[#22c55e] transition-colors"
            >
              Login
            </Link>
            <Link to="/register">
              <Button className="px-6 !py-2.5 text-[10px] uppercase tracking-widest font-black bg-[#22c55e] hover:bg-[#84cc16] text-black">
                Join Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
