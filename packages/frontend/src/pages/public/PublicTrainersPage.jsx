/**
 * PublicTrainersPage Component
 * Public-facing trainers showcase page
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { PublicHeader } from "../../components/layout/PublicHeader";
import { PublicFooter } from "../../components/layout/PublicFooter";
import { Hero } from "../../components/marketing/Hero";
import { TrainerCard } from "../../components/marketing/TrainerCard";
import { PrimaryButton } from "../../components/common/PrimaryButton";
import { Modal } from "../../components/common/Modal";

export function PublicTrainersPage() {
  const [selectedTrainer, setSelectedTrainer] = useState(null);

  const trainers = [
    {
      id: 1,
      name: "Alex Rivera",
      specialty: "Strength & Conditioning",
      experience: "10+ years",
      certifications: ["NASM-CPT", "CSCS", "Precision Nutrition L1"],
      bio: "Former Olympic weightlifter with a passion for helping clients build strength and confidence. Specializes in powerlifting and functional fitness.",
      achievements: ["Trained 500+ clients", "National Powerlifting Champion", "Published fitness author"]
    },
    {
      id: 2,
      name: "Jordan Lee",
      specialty: "HIIT & Cardio",
      experience: "8 years",
      certifications: ["ACE-CPT", "TRX Certified", "Spin Instructor"],
      bio: "High-energy trainer focused on metabolic conditioning and fat loss. Creates challenging yet fun workouts that deliver results.",
      achievements: ["Marathon runner", "Group fitness specialist", "500+ classes taught"]
    },
    {
      id: 3,
      name: "Sam Taylor",
      specialty: "Yoga & Mobility",
      experience: "12 years",
      certifications: ["RYT-500", "Mobility Specialist", "Meditation Teacher"],
      bio: "Holistic approach to fitness combining strength, flexibility, and mindfulness. Helps clients prevent injuries and improve movement quality.",
      achievements: ["International yoga instructor", "Published wellness author", "1000+ students trained"]
    },
    {
      id: 4,
      name: "Casey Morgan",
      specialty: "Sports Performance",
      experience: "15 years",
      certifications: ["CSCS", "FMS", "USA Weightlifting L2"],
      bio: "Works with athletes to enhance performance through evidence-based training methods. Expert in speed, agility, and power development.",
      achievements: ["Former D1 athlete", "Olympic coach", "Sports science researcher"]
    },
    {
      id: 5,
      name: "Riley Chen",
      specialty: "Bodybuilding & Aesthetics",
      experience: "9 years",
      certifications: ["IFBB Pro", "NASM-CPT", "Sports Nutrition"],
      bio: "Competitive bodybuilder helping clients achieve their physique goals through structured training and nutrition protocols.",
      achievements: ["IFBB Pro Card holder", "Regional champion", "Transformation specialist"]
    },
    {
      id: 6,
      name: "Morgan Blake",
      specialty: "Rehabilitation & Recovery",
      experience: "11 years",
      certifications: ["DPT", "CSCS", "Corrective Exercise"],
      bio: "Physical therapist turned trainer specializing in injury prevention and post-rehab training. Focuses on long-term health and sustainability.",
      achievements: ["Doctorate in PT", "500+ rehab cases", "Pain management expert"]
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <PublicHeader />
      
      <Hero 
        title={<>Meet Our <span className="bg-gradient-to-r from-[#22c55e] to-[#84cc16] bg-clip-text text-transparent">Expert Trainers</span></>}
        subtitle="Certified professionals dedicated to helping you achieve your fitness goals. Every trainer brings unique expertise and passion."
        ctaPrimary="Book Consultation"
        ctaSecondary="View All"
        linkSecondary="#trainers"
      />

      {/* Trainers Grid */}
      <section id="trainers" className="py-20 lg:py-32">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {trainers.map((trainer, i) => (
              <TrainerCard
                key={trainer.id}
                name={trainer.name}
                title={trainer.specialty}
                specialties={trainer.certifications}
                bio={trainer.bio}
                experience={trainer.experience.replace(/\D/g, '')}
                rating="5.0"
                onViewProfile={() => setSelectedTrainer(trainer)}
                onBookSession={() => {
                  setSelectedTrainer(trainer);
                  // Could add booking logic here
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Why Train With Us */}
      <section className="py-20 lg:py-32 bg-black/20">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-black mb-6 uppercase tracking-tighter">
              Why Train With Us
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Our trainers are more than just coaches—they're partners in your fitness journey
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "🎓",
                title: "Certified Experts",
                description: "All trainers hold nationally recognized certifications and continue education"
              },
              {
                icon: "🎯",
                title: "Personalized Approach",
                description: "Custom programs tailored to your goals, fitness level, and lifestyle"
              },
              {
                icon: "📈",
                title: "Proven Results",
                description: "Track record of helping thousands achieve their transformation goals"
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-3xl bg-[#171717] border border-white/5 text-center"
              >
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold mb-3 uppercase">{item.title}</h3>
                <p className="text-gray-400">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <PublicFooter />

      {/* Trainer Detail Modal */}
      {selectedTrainer && (
        <Modal
          isOpen={!!selectedTrainer}
          onClose={() => setSelectedTrainer(null)}
          title={selectedTrainer.name}
        >
          <div className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#22c55e] to-[#84cc16] flex items-center justify-center text-black text-4xl font-black">
                {selectedTrainer.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-1">{selectedTrainer.name}</h3>
                <p className="text-[#22c55e] font-bold uppercase text-sm">
                  {selectedTrainer.specialty}
                </p>
                <p className="text-gray-400 text-sm">{selectedTrainer.experience}</p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider mb-3">About</h4>
              <p className="text-gray-300 leading-relaxed">{selectedTrainer.bio}</p>
            </div>

            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider mb-3">Certifications</h4>
              <div className="flex flex-wrap gap-2">
                {selectedTrainer.certifications.map((cert, idx) => (
                  <span 
                    key={idx}
                    className="px-4 py-2 bg-white/5 rounded-full text-sm"
                  >
                    {cert}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider mb-3">Achievements</h4>
              <ul className="space-y-2">
                {selectedTrainer.achievements.map((achievement, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="text-[#22c55e] mt-1">✓</span>
                    <span className="text-gray-300">{achievement}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Button className="w-full bg-[#22c55e] hover:bg-[#84cc16] text-black">
              Book Session
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
