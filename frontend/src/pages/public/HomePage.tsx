import React, { useEffect, useState } from "react";

import { PublicLayout } from "../../layouts/PublicLayout";
import {
  PrimaryButton,
  SecondaryButton,
  PricingCard,
  TrainerCard,
  WorkoutPlanCard,
} from "@/components/gym";
import { Link } from "react-router-dom";
import { trainersService, type Trainer } from "@/services/trainers.service";
import {
  workoutPlansService,
  type WorkoutPlan,
} from "@/services/workout-plans.service";
import {
  membershipsService,
  type MembershipPlan,
} from "@/services/memberships.service";
import { useGymSettings } from "@/hooks/use-gym-settings";

export default function HomePage() {
  const {
    heroTitle,
    heroSubtitle,
    heroCtaPrimary,
    heroCtaSecondary,
    heroBadgeText,
    featuresTitle,
    featuresSubtitle,
    features,
    trainersTitle,
    trainersSubtitle,
    trainersCtaLabel,
    workoutsTitle,
    workoutsSubtitle,
    workoutsCtaLabel,
    pricingTitle,
    pricingSubtitle,
    ctaTitle,
    ctaSubtitle,
    ctaButtonLabel,
    heroBgImage,
    featuresBgImage,
    classesBgImage,
    trainersBgImage,
    workoutsBgImage,
    pricingBgImage,
    ctaBgImage,
  } = useGymSettings();
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [pricingPlans, setPricingPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all public data
        const [trainersData, workoutPlansData, membershipPlansData] =
          await Promise.all([
            trainersService.getAll({ limit: 3 }),
            workoutPlansService.getAll({ limit: 3 }),
            membershipsService.getAllPlans({ limit: 3 }),
          ]);
        setTrainers(Array.isArray(trainersData.data) ? trainersData.data : []);
        setWorkoutPlans(
          Array.isArray(workoutPlansData.data) ? workoutPlansData.data : [],
        );
        setPricingPlans(
          Array.isArray(membershipPlansData.data)
            ? membershipPlansData.data
            : [],
        );
      } catch (error) {
        console.error("Error fetching homepage data:", error);
        setTrainers([]);
        setWorkoutPlans([]);
        setPricingPlans([]); // Ensure it's always an array
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <PublicLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/80 to-primary/10" />
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20" 
          style={{ 
            backgroundImage: heroBgImage 
              ? `url(${heroBgImage})` 
              : `url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&q=80')` 
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          {heroBadgeText ? (
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-8">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-primary text-sm font-medium">
                {heroBadgeText}
              </span>
            </div>
          ) : null}

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight text-balance">
            {heroTitle}
          </h1>

          <div
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 text-pretty [&_img]:max-w-full [&_img]:rounded-xl"
            dangerouslySetInnerHTML={{ __html: heroSubtitle || "" }}
          />

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <PrimaryButton size="lg">{heroCtaPrimary}</PrimaryButton>
            <SecondaryButton size="lg">{heroCtaSecondary}</SecondaryButton>
          </div>

          {/* Stats - Remove hardcoded stats */}
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg
            className="w-6 h-6 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section 
        className="py-20 relative overflow-hidden"
        style={{ 
          backgroundImage: featuresBgImage ? `url(${featuresBgImage})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {featuresBgImage && <div className="absolute inset-0 bg-card/90" />}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              {featuresTitle}
            </h2>
            <div
              className="text-muted-foreground max-w-2xl mx-auto [&_img]:max-w-full [&_img]:rounded-xl"
              dangerouslySetInnerHTML={{ __html: featuresSubtitle || "" }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {(features || []).map((feature, index) => (
              <div
                key={`${feature.title}-${index}`}
                className="bg-background border border-border rounded-xl p-6 transition-all duration-300 hover:border-primary/50 hover:shadow-[0_0_30px_rgba(34,197,94,0.1)]"
              >
                <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4 text-2xl">
                  {feature.icon || "⭐"}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trainers Section */}
      <section 
        className="py-20 relative overflow-hidden"
        style={{ 
          backgroundImage: trainersBgImage ? `url(${trainersBgImage})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {trainersBgImage && <div className="absolute inset-0 bg-background/90" />}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
                {trainersTitle}
              </h2>
              <div
                className="text-muted-foreground [&_img]:max-w-full [&_img]:rounded-xl"
                dangerouslySetInnerHTML={{ __html: trainersSubtitle || "" }}
              />
            </div>
            <Link
              to="/trainers"
              className="text-primary font-medium hover:underline mt-4 sm:mt-0"
            >
              {trainersCtaLabel || "View All Trainers"}
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {trainers && trainers.length > 0 ? (
              trainers.map((trainer) => (
                <TrainerCard
                  key={trainer.id}
                  name={`${trainer.firstName} ${trainer.lastName}`}
                  specialty={trainer.specializations?.[0] || "General Fitness"}
                  experience={"5 years"}
                  image={"/placeholder.svg"}
                  rating={5.0}
                  certifications={trainer.certifications}
                />
              ))
            ) : (
              <div className="col-span-3 text-center py-12">
                <p className="text-muted-foreground">
                  No trainers available at the moment.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Workout Plans Section */}
      <section 
        className="py-20 relative overflow-hidden"
        style={{ 
          backgroundImage: workoutsBgImage ? `url(${workoutsBgImage})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {workoutsBgImage && <div className="absolute inset-0 bg-card/90" />}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
                {workoutsTitle}
              </h2>
              <div
                className="text-muted-foreground [&_img]:max-w-full [&_img]:rounded-xl"
                dangerouslySetInnerHTML={{ __html: workoutsSubtitle || "" }}
              />
            </div>
            <Link
              to="/workouts"
              className="text-primary font-medium hover:underline mt-4 sm:mt-0"
            >
              {workoutsCtaLabel || "Browse All Plans"}
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {workoutPlans && workoutPlans.length > 0 ? (
              workoutPlans.map((plan) => (
                <WorkoutPlanCard
                  key={plan.id}
                  title={plan.name}
                  goal={(plan.goal as any) || "muscle"}
                  difficulty="intermediate"
                  duration="4 weeks"
                  daysPerWeek={3}
                  exercises={plan.exercises?.length || 0}
                  description={plan.description || ""}
                />
              ))
            ) : (
              <div className="col-span-3 text-center py-12">
                <p className="text-muted-foreground">
                  No workout plans available at the moment.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section 
        className="py-20 relative overflow-hidden"
        style={{ 
          backgroundImage: pricingBgImage ? `url(${pricingBgImage})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {pricingBgImage && <div className="absolute inset-0 bg-background/90" />}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              {pricingTitle}
            </h2>
            <div
              className="text-muted-foreground max-w-2xl mx-auto [&_img]:max-w-full [&_img]:rounded-xl"
              dangerouslySetInnerHTML={{ __html: pricingSubtitle || "" }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans && pricingPlans.length > 0 ? (
              pricingPlans.map((plan) => (
                <PricingCard
                  key={plan.id}
                  name={plan.name}
                  price={plan.price}
                  description={plan.description || ""}
                  features={plan.features}
                  planFeatures={plan.planFeatures}
                  isPopular={false}
                />
              ))
            ) : (
              <div className="col-span-3 text-center py-12">
                <p className="text-muted-foreground">
                  No pricing plans available at the moment.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Testimonials Section - Removed hardcoded testimonials */}

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20" />
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{ 
            backgroundImage: ctaBgImage ? `url(${ctaBgImage})` : 'none' 
          }}
        />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            {ctaTitle}
          </h2>
          <div
            className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto [&_img]:max-w-full [&_img]:rounded-xl"
            dangerouslySetInnerHTML={{ __html: ctaSubtitle || "" }}
          />
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <PrimaryButton size="lg">{ctaButtonLabel}</PrimaryButton>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
