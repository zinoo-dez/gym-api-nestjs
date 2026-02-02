"use client"

import { PublicLayout } from "@/components/layouts"
import { TrainerCard } from "@/components/gym"

const trainers = [
  {
    name: "Alex Thompson",
    specialty: "Strength & Conditioning",
    experience: "8 years",
    image: "https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=400&h=500&fit=crop",
    rating: 4.9,
    certifications: ["NASM-CPT", "CSCS", "FMS"],
  },
  {
    name: "Sarah Chen",
    specialty: "HIIT & Cardio",
    experience: "6 years",
    image: "https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400&h=500&fit=crop",
    rating: 4.8,
    certifications: ["ACE-CPT", "Spinning", "TRX"],
  },
  {
    name: "Marcus Williams",
    specialty: "Bodybuilding",
    experience: "10 years",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=500&fit=crop",
    rating: 5.0,
    certifications: ["ISSA-CPT", "Nutrition Coach"],
  },
  {
    name: "Emily Rodriguez",
    specialty: "Yoga & Flexibility",
    experience: "7 years",
    image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=500&fit=crop",
    rating: 4.9,
    certifications: ["RYT-500", "Pilates Mat"],
  },
  {
    name: "James Park",
    specialty: "CrossFit",
    experience: "5 years",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=500&fit=crop",
    rating: 4.7,
    certifications: ["CF-L2", "Olympic Lifting"],
  },
  {
    name: "Lisa Anderson",
    specialty: "Boxing & MMA",
    experience: "9 years",
    image: "https://images.unsplash.com/photo-1550345332-09e3ac987658?w=400&h=500&fit=crop",
    rating: 4.8,
    certifications: ["USA Boxing Coach", "Krav Maga"],
  },
  {
    name: "Michael Brown",
    specialty: "Sports Performance",
    experience: "12 years",
    image: "https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=400&h=500&fit=crop",
    rating: 5.0,
    certifications: ["CSCS", "PES", "CES"],
  },
  {
    name: "Nina Patel",
    specialty: "Nutrition & Wellness",
    experience: "6 years",
    image: "https://images.unsplash.com/photo-1609899464726-209befbaa3e2?w=400&h=500&fit=crop",
    rating: 4.9,
    certifications: ["RDN", "Precision Nutrition"],
  },
]

export default function TrainersPage() {
  return (
    <PublicLayout>
      <div className="pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Meet Our <span className="text-primary">Expert Trainers</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our certified professionals are dedicated to helping you achieve your fitness goals with personalized guidance and support.
            </p>
          </div>

          {/* Trainer Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {trainers.map((trainer) => (
              <TrainerCard key={trainer.name} {...trainer} />
            ))}
          </div>

          {/* Join CTA */}
          <div className="mt-20 text-center bg-card border border-border rounded-2xl p-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Want to Work With Our Trainers?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Personal training sessions are included in our Pro and Elite memberships. 
              Get customized workout plans and one-on-one guidance.
            </p>
            <a
              href="/pricing"
              className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
            >
              View Membership Plans
            </a>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
