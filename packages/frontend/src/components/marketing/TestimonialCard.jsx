/**
 * TestimonialCard Component
 * Customer testimonial with avatar and rating
 */

import { motion } from "framer-motion";

export function TestimonialCard({ name, role, content, image, rating = 5, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      className="p-8 rounded-3xl bg-[#171717] border border-white/5 hover:border-[#22c55e]/20 transition-all duration-300"
    >
      <div className="flex gap-1 mb-6">
        {[...Array(rating)].map((_, i) => (
          <span key={i} className="text-[#22c55e] text-xl">★</span>
        ))}
      </div>
      
      <p className="text-gray-300 leading-relaxed mb-6 text-lg">
        "{content}"
      </p>

      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#22c55e] to-[#84cc16] flex items-center justify-center text-black font-black">
          {image ? (
            <img src={image} alt={name} className="w-full h-full rounded-full object-cover" />
          ) : (
            name.charAt(0)
          )}
        </div>
        <div>
          <div className="font-bold text-white">{name}</div>
          <div className="text-sm text-gray-500">{role}</div>
        </div>
      </div>
    </motion.div>
  );
}
