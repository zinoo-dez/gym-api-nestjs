/**
 * PublicWorkoutPlansPage Component
 * Public-facing workout plans showcase
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { PublicHeader } from "../../components/layout/PublicHeader";
import { PublicFooter } from "../../components/layout/PublicFooter";
import { Hero } from "../../components/marketing/Hero";
import { WorkoutPlanCard } from "../../components/marketing/WorkoutPlanCard";
import { Button } from "../../components/common/Button";

export function PublicWorkoutPlansPage() {
  const [selectedGoal, setSelectedGoal] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All");

  const goals = ["All", "Muscle Gain", "Fat Loss", "Strength", "Endurance", "Athletic"];
  const levels = ["All", "Beginner", "Intermediate", "Advanced"];

  const plans = [
    {
      id: 1,
      name: "Beginner Strength Builder",
      goal: "Muscle Gain",
      level: "Beginner",
      duration: "8 weeks",
      daysPerWeek: 3,
      description: "Perfect for those new to strength training. Build a solid foundation with compound movements.",
      features: ["Full body workouts", "Progressive overload", "Video demonstrations", "Nutrition guide"]
    },
    {
      id: 2,
      name: "Fat Loss Accelerator",
      goal: "Fat Loss",
      level: "Intermediate",
      duration: "12 weeks",
      daysPerWeek: 5,
      description: "High-intensity program combining strength and cardio for maximum fat burning.",
      features: ["HIIT circuits", "Metabolic conditioning", "Meal plan included", "Weekly check-ins"]
    },
    {
      id: 3,
      name: "Powerlifting Protocol",
      goal: "Strength",
      level: "Advanced",
      duration: "16 weeks",
      daysPerWeek: 4,
      description: "Advanced program focused on increasing your squat, bench, and deadlift numbers.",
      features: ["Periodized training", "Competition prep", "Technique coaching", "Deload weeks"]
    },
    {
      id: 4,
      name: "Athletic Performance",
      goal: "Athletic",
      level: "Intermediate",
      duration: "10 weeks",
      daysPerWeek: 4,
      description: "Enhance speed, agility, and power for sports performance.",
      features: ["Plyometrics", "Speed drills", "Mobility work", "Sport-specific training"]
    },
    {
      id: 5,
      name: "Endurance Builder",
      goal: "Endurance",
      level: "Beginner",
      duration: "8 weeks",
      daysPerWeek: 4,
      description: "Build cardiovascular endurance and stamina progressively.",
      features: ["Progressive running", "Cross-training", "Recovery protocols", "Heart rate zones"]
    },
    {
      id: 6,
      name: "Hypertrophy Max",
      goal: "Muscle Gain",
      level: "Advanced",
      duration: "12 weeks",
      daysPerWeek: 6,
      description: "Maximum muscle growth through high-volume training and optimal nutrition.",
      features: ["Split routines", "Volume progression", "Supplement guide", "Body composition tracking"]
    },
  ];

  const filteredPlans = plans.filter(plan => 
    (selectedGoal === "All" || plan.goal === selectedGoal) &&
    (selectedLevel === "All" || plan.level === selectedLevel)
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <PublicHeader />
      
      <Hero 
        title={<>Personalized <span className="bg-gradient-to-r from-[#22c55e] to-[#84cc16] bg-clip-text text-transparent">Workout Plans</span></>}
        subtitle="Science-backed programs designed by expert trainers. Whether you're building muscle, losing fat, or improving performance, we have the perfect plan."
        ctaPrimary="Get Your Plan"
        ctaSecondary="Browse Plans"
        linkSecondary="#plans"
      />

      {/* Filter Section */}
      <section id="plans" className="py-20 lg:py-32">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h2 className="text-4xl lg:text-5xl font-black mb-6 uppercase tracking-tighter">
              Find Your Plan
            </h2>
            <p className="text-xl text-gray-400">
              Filter by goal and experience level
            </p>
          </motion.div>

          {/* Goal Filter */}
          <div className="mb-6">
            <h3 className="text-sm font-bold uppercase tracking-wider mb-3 text-gray-400">Goal</h3>
            <div className="flex gap-2 overflow-x-auto pb-4">
              {goals.map((goal) => (
                <button
                  key={goal}
                  onClick={() => setSelectedGoal(goal)}
                  className={`px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wider whitespace-nowrap transition-all ${
                    selectedGoal === goal
                      ? 'bg-[#22c55e] text-black'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {goal}
                </button>
              ))}
            </div>
          </div>

          {/* Level Filter */}
          <div className="mb-12">
            <h3 className="text-sm font-bold uppercase tracking-wider mb-3 text-gray-400">Level</h3>
            <div className="flex gap-2 overflow-x-auto pb-4">
              {levels.map((level) => (
                <button
                  key={level}
                  onClick={() => setSelectedLevel(level)}
                  className={`px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider whitespace-nowrap transition-all ${
                    selectedLevel === level
                      ? 'bg-[#22c55e] text-black'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPlans.map((plan, i) => (
              <WorkoutPlanCard
                key={plan.id}
                name={plan.name}
                description={plan.description}
                duration={plan.duration}
                difficulty={plan.level}
                exercises={plan.daysPerWeek * 4} // Approximate exercises per week
                trainer="Expert Coach"
                onPreview={() => console.log('Preview', plan.name)}
                onSelect={() => console.log('Start', plan.name)}
              />
            ))}
          </div>

          {filteredPlans.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No plans match your criteria</p>
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 lg:py-32 bg-black/20">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-black mb-6 uppercase tracking-tighter">
              How It Works
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Get started with your personalized workout plan in 3 simple steps
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Choose Your Goal",
                description: "Select a plan that aligns with your fitness objectives and experience level"
              },
              {
                step: "02",
                title: "Follow the Program",
                description: "Access detailed workouts with video demonstrations and track your progress"
              },
              {
                step: "03",
                title: "See Results",
                description: "Stay consistent and watch your body transform with our proven methods"
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative p-8 rounded-3xl bg-[#171717] border border-white/5"
              >
                <div className="text-6xl font-black text-[#22c55e]/20 mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold mb-3 uppercase">{item.title}</h3>
                <p className="text-gray-400">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 lg:py-32">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-black mb-6 uppercase tracking-tighter">
              Plan Features
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Everything you need for success
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: "📹", title: "Video Guides", description: "HD exercise demonstrations" },
              { icon: "📊", title: "Progress Tracking", description: "Monitor your improvements" },
              { icon: "🍎", title: "Nutrition Tips", description: "Meal planning guidance" },
              { icon: "💬", title: "Trainer Support", description: "Expert advice available" }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-[#171717] border border-white/5 text-center"
              >
                <div className="text-4xl mb-3">{feature.icon}</div>
                <h3 className="font-bold mb-2 uppercase text-sm">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
