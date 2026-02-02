/**
 * PublicClassesPage Component
 * Public-facing classes schedule and information
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { PublicHeader } from "../../components/layout/PublicHeader";
import { PublicFooter } from "../../components/layout/PublicFooter";
import { Hero } from "../../components/marketing/Hero";
import { Button } from "../../components/common/Button";

export function PublicClassesPage() {
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [selectedType, setSelectedType] = useState("All");

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const types = ["All", "Strength", "Cardio", "Yoga", "HIIT", "Spin"];

  const classes = [
    {
      id: 1,
      name: "Morning Power",
      type: "Strength",
      time: "6:00 AM",
      duration: "60 min",
      trainer: "Alex Rivera",
      capacity: 20,
      level: "Intermediate",
      day: "Monday"
    },
    {
      id: 2,
      name: "HIIT Blast",
      type: "HIIT",
      time: "7:30 AM",
      duration: "45 min",
      trainer: "Jordan Lee",
      capacity: 25,
      level: "All Levels",
      day: "Monday"
    },
    {
      id: 3,
      name: "Yoga Flow",
      type: "Yoga",
      time: "9:00 AM",
      duration: "60 min",
      trainer: "Sam Taylor",
      capacity: 30,
      level: "Beginner",
      day: "Monday"
    },
    {
      id: 4,
      name: "Spin & Burn",
      type: "Spin",
      time: "12:00 PM",
      duration: "45 min",
      trainer: "Jordan Lee",
      capacity: 20,
      level: "Intermediate",
      day: "Monday"
    },
    {
      id: 5,
      name: "Strength & Conditioning",
      type: "Strength",
      time: "5:30 PM",
      duration: "60 min",
      trainer: "Casey Morgan",
      capacity: 15,
      level: "Advanced",
      day: "Monday"
    },
    {
      id: 6,
      name: "Evening Yoga",
      type: "Yoga",
      time: "7:00 PM",
      duration: "60 min",
      trainer: "Sam Taylor",
      capacity: 30,
      level: "All Levels",
      day: "Monday"
    },
  ];

  const filteredClasses = classes.filter(cls => 
    cls.day === selectedDay && (selectedType === "All" || cls.type === selectedType)
  );

  const classTypes = [
    {
      name: "HIIT",
      description: "High-intensity interval training for maximum calorie burn",
      icon: "🔥"
    },
    {
      name: "Yoga",
      description: "Flexibility, balance, and mindfulness practice",
      icon: "🧘"
    },
    {
      name: "Spin",
      description: "Indoor cycling for cardio endurance",
      icon: "🚴"
    },
    {
      name: "Strength",
      description: "Build muscle and increase power",
      icon: "💪"
    },
    {
      name: "Boxing",
      description: "Combat training for fitness and stress relief",
      icon: "🥊"
    },
    {
      name: "Dance",
      description: "Fun cardio through dance movements",
      icon: "💃"
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <PublicHeader />
      
      <Hero 
        title={<>Group <span className="bg-gradient-to-r from-[#22c55e] to-[#84cc16] bg-clip-text text-transparent">Classes</span></>}
        subtitle="Join our energizing group classes led by expert instructors. From yoga to HIIT, find the perfect workout for you."
        ctaPrimary="View Schedule"
        ctaSecondary="Book Class"
        linkSecondary="#schedule"
      />

      {/* Class Types */}
      <section className="py-20 lg:py-32">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-black mb-6 uppercase tracking-tighter">
              Class Types
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Diverse workouts to keep you motivated and challenged
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {classTypes.map((type, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-3xl bg-[#171717] border border-white/5 hover:border-[#22c55e]/20 transition-all group"
              >
                <div className="text-5xl mb-4">{type.icon}</div>
                <h3 className="text-xl font-bold mb-3 uppercase group-hover:text-[#22c55e] transition-colors">
                  {type.name}
                </h3>
                <p className="text-gray-400">{type.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Schedule */}
      <section id="schedule" className="py-20 lg:py-32 bg-black/20">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h2 className="text-4xl lg:text-5xl font-black mb-6 uppercase tracking-tighter">
              Weekly Schedule
            </h2>
            <p className="text-xl text-gray-400">
              Browse classes by day and type
            </p>
          </motion.div>

          {/* Day Filter */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-4">
            {days.map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wider whitespace-nowrap transition-all ${
                  selectedDay === day
                    ? 'bg-[#22c55e] text-black'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {day}
              </button>
            ))}
          </div>

          {/* Type Filter */}
          <div className="flex gap-2 mb-12 overflow-x-auto pb-4">
            {types.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider whitespace-nowrap transition-all ${
                  selectedType === type
                    ? 'bg-[#22c55e] text-black'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Classes List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredClasses.map((cls, i) => (
              <motion.div
                key={cls.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-6 rounded-2xl bg-[#171717] border border-white/5 hover:border-[#22c55e]/20 transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold mb-1 uppercase">{cls.name}</h3>
                    <p className="text-sm text-[#22c55e] font-bold uppercase">{cls.type}</p>
                  </div>
                  <span className="px-3 py-1 bg-white/5 rounded-full text-xs text-gray-400">
                    {cls.level}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-gray-500 block mb-1">Time</span>
                    <span className="font-bold">{cls.time}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-1">Duration</span>
                    <span className="font-bold">{cls.duration}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-1">Trainer</span>
                    <span className="font-bold">{cls.trainer}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-1">Capacity</span>
                    <span className="font-bold">{cls.capacity} spots</span>
                  </div>
                </div>

                <Button className="w-full bg-[#22c55e] hover:bg-[#84cc16] text-black">
                  Book Now
                </Button>
              </motion.div>
            ))}
          </div>

          {filteredClasses.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No classes available for this selection</p>
            </div>
          )}
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 lg:py-32">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-black mb-6 uppercase tracking-tighter">
              Why Group Classes
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Experience the power of community fitness
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "👥",
                title: "Community Support",
                description: "Train alongside motivated members who push you to be your best"
              },
              {
                icon: "🎯",
                title: "Expert Guidance",
                description: "Professional instructors ensure proper form and maximum results"
              },
              {
                icon: "📅",
                title: "Structured Schedule",
                description: "Consistent class times help you build a sustainable fitness routine"
              }
            ].map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-3xl bg-[#171717] border border-white/5 text-center"
              >
                <div className="text-5xl mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-bold mb-3 uppercase">{benefit.title}</h3>
                <p className="text-gray-400">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
