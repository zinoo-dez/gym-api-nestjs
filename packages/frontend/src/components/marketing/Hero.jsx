/**
 * Hero Component
 * Premium hero section with video/image background
 */

import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "../common/Button";

export function Hero({ 
  title, 
  subtitle, 
  ctaPrimary = "Start Free Trial", 
  ctaSecondary = "Learn More",
  linkPrimary = "/register",
  linkSecondary = "#features",
  backgroundImage 
}) {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const scale = useTransform(scrollY, [0, 300], [1, 0.95]);
  const bgY = useTransform(scrollY, [0, 500], [0, 150]);

  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden min-h-[90vh] flex items-center">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <motion.div style={{ y: bgY }} className="absolute inset-0">
          {backgroundImage && (
            <>
              <img 
                src={backgroundImage} 
                alt="Hero background" 
                className="w-full h-full object-cover opacity-30 scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-transparent to-[#0a0a0a]" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-transparent to-[#0a0a0a]" />
            </>
          )}
        </motion.div>
        
        {/* Glow effects */}
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#22c55e]/10 blur-[130px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-[#84cc16]/10 blur-[130px] rounded-full animate-pulse" />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      <motion.div 
        style={{ opacity, scale }}
        className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full"
      >
        <div className="max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-5xl md:text-7xl lg:text-[72px] font-black leading-[0.9] mb-8 tracking-[-0.02em] uppercase">
              {title}
            </h1>
            <p className="text-lg sm:text-xl text-gray-400 mb-12 max-w-2xl leading-relaxed font-medium">
              {subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-6">
              <Link to={linkPrimary}>
                <Button className="px-10 py-5 text-sm uppercase tracking-widest min-w-[220px] bg-[#22c55e] hover:bg-[#84cc16] text-black font-black shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] transition-all">
                  {ctaPrimary}
                </Button>
              </Link>
              <a href={linkSecondary}>
                <Button className="px-10 py-5 text-sm uppercase tracking-widest min-w-[220px] bg-transparent border-2 border-[#22c55e] text-[#22c55e] hover:bg-[#22c55e] hover:text-black font-black transition-all">
                  {ctaSecondary}
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
