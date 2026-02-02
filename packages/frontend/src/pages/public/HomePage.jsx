/**
 * HomePage Component
 * Main landing page for the gym website
 */

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { PublicHeader } from "../../components/layout/PublicHeader";
import { PublicFooter } from "../../components/layout/PublicFooter";
import { Hero } from "../../components/marketing/Hero";
import { StatsSection } from "../../components/marketing/StatsSection";
import { FeatureCard } from "../../components/marketing/FeatureCard";
import { TestimonialCard } from "../../components/marketing/TestimonialCard";
import { PricingCard } from "../../components/marketing/PricingCard";
import { Button } from "../../components/common/Button";
import bannerImg from "../../assets/banner.jpg";

export function HomePage() {
  const stats = [
    { value: "2,400+", label: "Active Members" },
    { value: "48", label: "Expert Trainers" },
    { value: "100+", label: "Classes Weekly" },
    { value: "99.2%", label: "Success Rate" },
  ];

  const benefits = [
    {
      icon: "💪",
      title: "Strength Training",
      description: "Build muscle and increase power with our science-backed strength programs designed by elite coaches."
    },
    {
      icon: "🏃",
      title: "Cardio Excellence",
      description: "Boost endurance and burn fat with high-intensity cardio workouts tailored to your fitness level."
    },
    {
      icon: "🧘",
      title: "Mind & Body",
      description: "Achieve balance with yoga, meditation, and recovery sessions for complete wellness."
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Member since 2024",
      content: "Best gym I've ever joined! The trainers are incredibly knowledgeable and the community is so supportive.",
      rating: 5
    },
    {
      name: "Mike Chen",
      role: "Member since 2023",
      content: "Lost 30 pounds in 4 months. The personalized workout plans and nutrition guidance made all the difference.",
      rating: 5
    },
    {
      name: "Emma Davis",
      role: "Member since 2025",
      content: "The facilities are top-notch and always clean. Love the variety of classes and flexible scheduling.",
      rating: 5
    },
  ];

  const pricingPlans = [
    {
      name: "Basic",
      price: 29,
      features: [
        "Access to gym floor",
        "Basic equipment",
        "Locker room access",
        "Mobile app access"
      ]
    },
    {
      name: "Pro",
      price: 59,
      recommended: true,
      features: [
        "Everything in Basic",
        "Unlimited group classes",
        "Personal trainer consultation",
        "Nutrition guidance",
        "Priority booking"
      ]
    },
    {
      name: "Elite",
      price: 99,
      features: [
        "Everything in Pro",
        "4 personal training sessions/month",
        "Custom workout plans",
        "Recovery & spa access",
        "Guest passes"
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <PublicHeader />
      
      <Hero 
        title={<>Unleash Your <br /><span className="bg-gradient-to-r from-[#22c55e] to-[#84cc16] bg-clip-text text-transparent">Power.</span></>}
        subtitle="Elite training programs, world-class facilities, and expert coaches. Your transformation starts here."
        backgroundImage={bannerImg}
      />

      <StatsSection stats={stats} />

      {/* Benefits Section */}
      <section id="features" className="py-20 lg:py-32">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-6xl font-black mb-6 uppercase tracking-tighter">
              Why Choose Us
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Everything you need to achieve your fitness goals
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, i) => (
              <FeatureCard key={i} {...benefit} delay={i * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Classes */}
      <section className="py-20 lg:py-32 bg-black/20">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl lg:text-5xl font-black mb-4 uppercase tracking-tighter">
                Popular Classes
              </h2>
              <p className="text-gray-400">Join our most loved workouts</p>
            </div>
            <Link to="/classes">
              <Button className="bg-transparent border-2 border-[#22c55e] text-[#22c55e] hover:bg-[#22c55e] hover:text-black">
                View All Classes
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {["HIIT Blast", "Yoga Flow", "Strength & Power"].map((className, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative rounded-3xl overflow-hidden bg-[#171717] border border-white/5 hover:border-[#22c55e]/20 transition-all"
              >
                <div className="aspect-video bg-gradient-to-br from-[#22c55e]/20 to-[#84cc16]/20 relative overflow-hidden">
                  <div className="absolute inset-0 bg-black/40" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-6xl">🏋️</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 uppercase">{className}</h3>
                  <p className="text-sm text-gray-400 mb-4">45 min • Intermediate</p>
                  <Button className="w-full bg-[#22c55e] hover:bg-[#84cc16] text-black">
                    Book Now
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trainer Highlights */}
      <section className="py-20 lg:py-32">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-6xl font-black mb-6 uppercase tracking-tighter">
              Meet Our Trainers
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Certified professionals dedicated to your success
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {["Alex Rivera", "Jordan Lee", "Sam Taylor", "Casey Morgan"].map((name, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center group"
              >
                <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#22c55e] to-[#84cc16] flex items-center justify-center text-black text-4xl font-black group-hover:scale-110 transition-transform">
                  {name.charAt(0)}
                </div>
                <h3 className="font-bold text-lg mb-1">{name}</h3>
                <p className="text-sm text-gray-400">Certified Trainer</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/trainers">
              <Button className="bg-transparent border-2 border-[#22c55e] text-[#22c55e] hover:bg-[#22c55e] hover:text-black">
                View All Trainers
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 lg:py-32 bg-black/20">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-6xl font-black mb-6 uppercase tracking-tighter">
              Success Stories
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Real results from real members
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <TestimonialCard key={i} {...testimonial} delay={i * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section id="pricing" className="py-20 lg:py-32">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-6xl font-black mb-6 uppercase tracking-tighter">
              Choose Your Plan
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Flexible memberships for every fitness journey
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {pricingPlans.map((plan, i) => (
              <PricingCard key={i} {...plan} delay={i * 0.1} />
            ))}
          </div>

          <div className="text-center">
            <Link to="/memberships">
              <Button className="bg-transparent border-2 border-[#22c55e] text-[#22c55e] hover:bg-[#22c55e] hover:text-black">
                Compare All Plans
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative p-12 lg:p-24 rounded-[3rem] bg-gradient-to-br from-[#22c55e] to-[#84cc16] overflow-hidden"
          >
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
            <div className="relative z-10 text-center max-w-3xl mx-auto">
              <h2 className="text-4xl lg:text-6xl font-black mb-6 uppercase tracking-tighter text-black">
                Start Your Transformation Today
              </h2>
              <p className="text-xl text-black/80 mb-12 font-medium">
                Join thousands who have already unlocked their true potential
              </p>
              <Link to="/register">
                <Button className="!bg-black !text-[#22c55e] hover:!bg-[#171717] px-12 py-6 text-sm uppercase tracking-widest font-black">
                  Get Started Now
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
