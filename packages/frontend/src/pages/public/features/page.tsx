"use client"

import { PublicLayout } from "@/components/layouts"
import { PrimaryButton } from "@/components/gym"

const facilities = [
  {
    title: "Premium Weight Room",
    description: "Over 20,000 sq ft of free weights, machines, and functional training equipment from top brands.",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop",
  },
  {
    title: "Cardio Zone",
    description: "State-of-the-art treadmills, bikes, and ellipticals with personal entertainment screens.",
    image: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=600&h=400&fit=crop",
  },
  {
    title: "Group Fitness Studios",
    description: "Three dedicated studios for yoga, cycling, and high-intensity group classes.",
    image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&h=400&fit=crop",
  },
  {
    title: "Recovery Zone",
    description: "Sauna, steam room, cold plunge, and massage therapy for optimal recovery.",
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&h=400&fit=crop",
  },
]

const features = [
  {
    title: "Smart Attendance Tracking",
    description: "Check in seamlessly with our mobile app or membership card. Track your gym visits and workout frequency over time.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    title: "Personalized Workout Plans",
    description: "Get customized workout programs based on your goals, fitness level, and available time. Updated regularly by your trainer.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    title: "Expert Personal Trainers",
    description: "Work one-on-one with certified professionals who specialize in your area of interest, from bodybuilding to marathon prep.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    title: "Flexible Membership Options",
    description: "Choose from Basic, Pro, or Elite plans. Upgrade, downgrade, or pause anytime without penalties.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
  },
  {
    title: "Mobile App Experience",
    description: "Book classes, track workouts, view your progress, and manage your membership all from our intuitive mobile app.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: "Progress Analytics",
    description: "Detailed insights into your fitness journey with body metrics tracking, workout history, and goal progress visualization.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
]

export default function FeaturesPage() {
  return (
    <PublicLayout>
      <div className="pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-20">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              World-Class <span className="text-primary">Facilities</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to achieve your fitness goals under one roof, backed by cutting-edge technology and expert support.
            </p>
          </div>

          {/* Facilities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
            {facilities.map((facility) => (
              <div
                key={facility.title}
                className="group relative overflow-hidden rounded-2xl aspect-[3/2]"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url(${facility.image})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-xl font-bold text-foreground mb-2">{facility.title}</h3>
                  <p className="text-muted-foreground text-sm">{facility.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Features Section */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Features That Set Us <span className="text-primary">Apart</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                We combine state-of-the-art equipment with smart technology to deliver a premium fitness experience.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="bg-card border border-border rounded-xl p-6 transition-all duration-300 hover:border-primary/50"
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

          {/* App Showcase */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8 md:p-12">
              <div className="flex flex-col justify-center">
                <span className="text-primary text-sm font-semibold mb-2">MOBILE APP</span>
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  Your Gym, In Your Pocket
                </h2>
                <p className="text-muted-foreground mb-6">
                  Download the PowerFit app to book classes, track your workouts, view your progress, 
                  and manage your membership from anywhere. Available on iOS and Android.
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    "Book and manage class reservations",
                    "Access personalized workout plans",
                    "Track attendance and progress",
                    "Connect with your trainer",
                    "Manage membership and payments",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-foreground">
                      <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="flex gap-4">
                  <button className="flex items-center gap-2 bg-foreground text-background px-4 py-2 rounded-lg hover:bg-foreground/90 transition-colors">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                    </svg>
                    App Store
                  </button>
                  <button className="flex items-center gap-2 bg-foreground text-background px-4 py-2 rounded-lg hover:bg-foreground/90 transition-colors">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 010 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z"/>
                    </svg>
                    Play Store
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative w-64 h-[500px] bg-background rounded-[3rem] border-4 border-border p-2">
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-6 bg-border rounded-full" />
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 rounded-[2.5rem] flex items-center justify-center">
                    <span className="text-2xl font-bold text-foreground">
                      Power<span className="text-primary">Fit</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-20">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Ready to Experience PowerFit?
            </h2>
            <p className="text-muted-foreground mb-6">
              Start your 7-day free trial today. No commitment required.
            </p>
            <PrimaryButton size="lg">
              Start Free Trial
            </PrimaryButton>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
