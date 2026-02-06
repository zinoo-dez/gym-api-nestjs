import { PublicLayout } from "../../layouts";
import { PrimaryButton } from "@/components/gym";
import { useGymSettings } from "@/hooks/use-gym-settings";

export default function FeaturesPage() {
  const { gymName } = useGymSettings();

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
              Everything you need to achieve your fitness goals under one roof,
              backed by cutting-edge technology and expert support.
            </p>
          </div>

          {/* Facilities Grid - Removed hardcoded facilities */}

          {/* Features Section - Removed hardcoded features */}

          {/* App Showcase */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8 md:p-12">
              <div className="flex flex-col justify-center">
                <span className="text-primary text-sm font-semibold mb-2">
                  MOBILE APP
                </span>
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  Your Gym, In Your Pocket
                </h2>
                <p className="text-muted-foreground mb-6">
                  Download the {gymName} app to book classes, track your
                  workouts, view your progress, and manage your membership from
                  anywhere. Available on iOS and Android.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3 text-foreground">
                    <svg
                      className="w-5 h-5 text-primary flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Book and manage class reservations
                  </li>
                  <li className="flex items-center gap-3 text-foreground">
                    <svg
                      className="w-5 h-5 text-primary flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Access personalized workout plans
                  </li>
                  <li className="flex items-center gap-3 text-foreground">
                    <svg
                      className="w-5 h-5 text-primary flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Track attendance and progress
                  </li>
                  <li className="flex items-center gap-3 text-foreground">
                    <svg
                      className="w-5 h-5 text-primary flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Connect with your trainer
                  </li>
                  <li className="flex items-center gap-3 text-foreground">
                    <svg
                      className="w-5 h-5 text-primary flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Manage membership and payments
                  </li>
                </ul>
                <div className="flex gap-4">
                  <button className="flex items-center gap-2 bg-foreground text-background px-4 py-2 rounded-lg hover:bg-foreground/90 transition-colors">
                    <svg
                      className="w-6 h-6"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                    </svg>
                    App Store
                  </button>
                  <button className="flex items-center gap-2 bg-foreground text-background px-4 py-2 rounded-lg hover:bg-foreground/90 transition-colors">
                    <svg
                      className="w-6 h-6"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 010 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z" />
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
              Ready to Experience {gymName}?
            </h2>
            <p className="text-muted-foreground mb-6">
              Start your 7-day free trial today. No commitment required.
            </p>
            <PrimaryButton size="lg">Start Free Trial</PrimaryButton>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
