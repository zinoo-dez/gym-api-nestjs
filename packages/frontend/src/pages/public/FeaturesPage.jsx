/**
 * FeaturesPage Component
 * Detailed features and facilities page
 */

import { motion } from "framer-motion";
import { PublicHeader } from "../../components/layout/PublicHeader";
import { PublicFooter } from "../../components/layout/PublicFooter";
import { Hero } from "../../components/marketing/Hero";
import { FeatureCard } from "../../components/marketing/FeatureCard";

export function FeaturesPage() {
  const facilities = [
    {
      icon: "🏋️",
      title: "State-of-the-Art Equipment",
      description: "Latest cardio machines, free weights, and strength training equipment from top brands."
    },
    {
      icon: "🏊",
      title: "Olympic Pool",
      description: "25-meter heated pool for lap swimming, aqua classes, and recovery sessions."
    },
    {
      icon: "🧖",
      title: "Spa & Recovery",
      description: "Sauna, steam room, and massage therapy for optimal muscle recovery."
    },
    {
      icon: "🥗",
      title: "Nutrition Bar",
      description: "Healthy smoothies, protein shakes, and meal prep options on-site."
    },
    {
      icon: "👥",
      title: "Group Studio",
      description: "Dedicated spaces for yoga, spin, HIIT, and dance classes."
    },
    {
      icon: "🎯",
      title: "Personal Training",
      description: "One-on-one coaching with certified trainers for customized programs."
    },
  ];

  const smartFeatures = [
    {
      icon: "📱",
      title: "Smart Attendance",
      description: "Contactless check-in with QR codes and real-time capacity tracking."
    },
    {
      icon: "📊",
      title: "Progress Tracking",
      description: "Monitor your workouts, body metrics, and achievements in our mobile app."
    },
    {
      icon: "🎓",
      title: "Personalized Plans",
      description: "AI-powered workout recommendations based on your goals and progress."
    },
    {
      icon: "📅",
      title: "Easy Booking",
      description: "Reserve classes, equipment, and trainer sessions from anywhere."
    },
    {
      icon: "🏆",
      title: "Challenges & Rewards",
      description: "Join community challenges and earn rewards for hitting milestones."
    },
    {
      icon: "💬",
      title: "Community",
      description: "Connect with members, share progress, and stay motivated together."
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <PublicHeader />
      
      <Hero 
        title={<>Premium <span className="bg-gradient-to-r from-[#22c55e] to-[#84cc16] bg-clip-text text-transparent">Facilities</span></>}
        subtitle="Everything you need for your fitness journey under one roof. Experience the difference of world-class amenities."
        ctaPrimary="Start Free Trial"
        ctaSecondary="Take a Tour"
        linkSecondary="#facilities"
      />

      {/* Facilities Section */}
      <section id="facilities" className="py-20 lg:py-32">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-black mb-6 uppercase tracking-tighter">
              World-Class Facilities
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl">
              Our gym features premium equipment and amenities designed to elevate your training experience.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {facilities.map((facility, i) => (
              <FeatureCard key={i} {...facility} delay={i * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* Smart Features Section */}
      <section className="py-20 lg:py-32 bg-black/20">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-black mb-6 uppercase tracking-tighter">
              Smart Technology
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl">
              Cutting-edge digital tools to track progress, book classes, and stay connected with your fitness community.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {smartFeatures.map((feature, i) => (
              <FeatureCard key={i} {...feature} delay={i * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl lg:text-5xl font-black mb-8 uppercase tracking-tighter">
                Why Members Love Us
              </h2>
              <div className="space-y-6">
                {[
                  "24/7 access for ultimate flexibility",
                  "Clean, sanitized equipment after every use",
                  "Free parking and locker storage",
                  "Complimentary fitness assessment",
                  "Guest passes for friends and family",
                  "No long-term contracts required"
                ].map((benefit, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-4"
                  >
                    <span className="text-[#22c55e] text-2xl mt-1">✓</span>
                    <span className="text-lg text-gray-300">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-[#22c55e]/20 to-[#84cc16]/20 flex items-center justify-center text-9xl">
                💪
              </div>
              <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-[#22c55e]/10 blur-[100px] rounded-full" />
            </motion.div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
