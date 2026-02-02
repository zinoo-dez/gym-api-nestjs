"use client"

import { PublicLayout } from "@/components/layouts"
import {
  PrimaryButton,
  SecondaryButton,
  PricingCard,
  TrainerCard,
  WorkoutPlanCard,
} from "@/components/gym"
import Link from "next/link"

const features = [
  {
    title: "State-of-the-Art Equipment",
    description: "Access to premium fitness machines and free weights",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
  },
  {
    title: "Expert Personal Trainers",
    description: "Certified professionals to guide your fitness journey",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    title: "Diverse Group Classes",
    description: "From HIIT to yoga, find your perfect workout style",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    title: "24/7 Access",
    description: "Work out on your schedule, any time day or night",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
]

const trainers = [
  {
    name: "Alex Thompson",
    specialty: "Strength & Conditioning",
    experience: "8 years",
    image: "https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=400&h=500&fit=crop",
    rating: 4.9,
    certifications: ["NASM-CPT", "CSCS"],
  },
  {
    name: "Sarah Chen",
    specialty: "HIIT & Cardio",
    experience: "6 years",
    image: "https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400&h=500&fit=crop",
    rating: 4.8,
    certifications: ["ACE-CPT", "Spinning"],
  },
  {
    name: "Marcus Williams",
    specialty: "Bodybuilding",
    experience: "10 years",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=500&fit=crop",
    rating: 5.0,
    certifications: ["ISSA-CPT", "Nutrition"],
  },
]

const workoutPlans = [
  {
    title: "Beginner Full Body",
    goal: "muscle" as const,
    difficulty: "beginner" as const,
    duration: "8 weeks",
    daysPerWeek: 3,
    exercises: 24,
    description: "Perfect for those just starting their fitness journey",
  },
  {
    title: "Fat Burner HIIT",
    goal: "fat-loss" as const,
    difficulty: "intermediate" as const,
    duration: "6 weeks",
    daysPerWeek: 4,
    exercises: 32,
    description: "High-intensity program designed to maximize calorie burn",
  },
  {
    title: "Strength Builder",
    goal: "strength" as const,
    difficulty: "advanced" as const,
    duration: "12 weeks",
    daysPerWeek: 5,
    exercises: 48,
    description: "Progressive overload program for serious strength gains",
  },
]

const pricingPlans = [
  {
    name: "Basic",
    price: 29,
    description: "Essential access for casual gym-goers",
    features: [
      "Access to gym floor",
      "Locker room access",
      "Free parking",
      "Mobile app access",
    ],
  },
  {
    name: "Pro",
    price: 59,
    description: "Everything you need for serious training",
    features: [
      "Everything in Basic",
      "Unlimited group classes",
      "1 personal training session/month",
      "Nutrition consultation",
      "Sauna & steam room",
      "Guest passes (2/month)",
    ],
    isPopular: true,
  },
  {
    name: "Elite",
    price: 99,
    description: "Premium experience for dedicated athletes",
    features: [
      "Everything in Pro",
      "4 personal training sessions/month",
      "Custom workout plans",
      "Recovery zone access",
      "Priority class booking",
      "Exclusive member events",
    ],
  },
]

const testimonials = [
  {
    name: "Jessica M.",
    role: "Member for 2 years",
    content: "PowerFit completely transformed my approach to fitness. The trainers are incredibly supportive and the facilities are top-notch.",
    avatar: "JM",
  },
  {
    name: "David K.",
    role: "Member for 1 year",
    content: "Best gym I've ever been to. The equipment is always clean and well-maintained, and the community here is amazing.",
    avatar: "DK",
  },
  {
    name: "Emily R.",
    role: "Member for 3 years",
    content: "The group classes are fantastic! I've tried everything from spin to yoga and each instructor brings their A-game.",
    avatar: "ER",
  },
]

export default function HomePage() {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/10" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&q=80')] bg-cover bg-center opacity-20" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-8">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-primary text-sm font-medium">Now Open 24/7</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight text-balance">
            Transform Your Body,<br />
            <span className="text-gradient">Transform Your Life</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 text-pretty">
            Join the ultimate fitness experience with world-class equipment, expert trainers, and a supportive community that pushes you to achieve your goals.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <PrimaryButton size="lg">
              Start Free Trial
            </PrimaryButton>
            <SecondaryButton size="lg">
              View Membership Plans
            </SecondaryButton>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 max-w-4xl mx-auto">
            {[
              { value: "10K+", label: "Active Members" },
              { value: "50+", label: "Expert Trainers" },
              { value: "100+", label: "Weekly Classes" },
              { value: "24/7", label: "Access" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-primary">{stat.value}</p>
                <p className="text-muted-foreground text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Why Choose <span className="text-primary">PowerFit</span>?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We provide everything you need to achieve your fitness goals in one place.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-background border border-border rounded-xl p-6 transition-all duration-300 hover:border-primary/50 hover:shadow-[0_0_30px_rgba(34,197,94,0.1)]"
              >
                <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trainers Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
                Meet Our <span className="text-primary">Expert Trainers</span>
              </h2>
              <p className="text-muted-foreground">
                Learn from the best in the fitness industry.
              </p>
            </div>
            <Link href="/trainers" className="text-primary font-medium hover:underline mt-4 sm:mt-0">
              View All Trainers
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {trainers.map((trainer) => (
              <TrainerCard key={trainer.name} {...trainer} />
            ))}
          </div>
        </div>
      </section>

      {/* Workout Plans Section */}
      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
                Popular <span className="text-primary">Workout Plans</span>
              </h2>
              <p className="text-muted-foreground">
                Structured programs designed to help you reach your goals.
              </p>
            </div>
            <Link href="/workouts" className="text-primary font-medium hover:underline mt-4 sm:mt-0">
              Browse All Plans
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {workoutPlans.map((plan) => (
              <WorkoutPlanCard key={plan.title} {...plan} />
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Simple, Transparent <span className="text-primary">Pricing</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that fits your fitness journey. No hidden fees, cancel anytime.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan) => (
              <PricingCard key={plan.name} {...plan} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              What Our <span className="text-primary">Members Say</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join thousands of satisfied members who have transformed their lives with PowerFit.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.name}
                className="bg-background border border-border rounded-xl p-6"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-primary font-semibold">{testimonial.avatar}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-muted-foreground">&ldquo;{testimonial.content}&rdquo;</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Ready to Start Your Transformation?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join PowerFit today and get access to world-class facilities, expert trainers, and a community that supports your goals.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <PrimaryButton size="lg">
              Start Your Free Trial
            </PrimaryButton>
            <SecondaryButton size="lg">
              Schedule a Tour
            </SecondaryButton>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
