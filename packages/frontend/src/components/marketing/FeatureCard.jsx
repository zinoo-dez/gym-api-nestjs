/**
 * FeatureCard Component
 * Card for displaying features with icon and description
 */

import { motion } from "framer-motion";

export function FeatureCard({ icon, title, description, delay = 0 }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      className="p-8 rounded-3xl bg-[#171717] border border-white/5 hover:border-[#22c55e]/20 transition-all duration-300 group relative overflow-hidden"
    >
      <div className="absolute -right-4 -top-4 text-8xl opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
        {icon}
      </div>
      <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:bg-[#22c55e] group-hover:text-black transition-colors duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 group-hover:text-[#22c55e] transition-colors uppercase tracking-tight">
        {title}
      </h3>
      <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
        {description}
      </p>
    </motion.div>
  );
}
