import * as React from "react";
import { useEffect, useState } from "react";
import { PublicLayout } from "../../layouts";
import { PricingCard, SecondaryButton } from "@/components/gym";
import { cn } from "@/lib/utils";
import {
  membershipsService,
  type MembershipPlan,
} from "@/services/memberships.service";

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">(
    "monthly",
  );
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await membershipsService.getAllPlans({ limit: 10 });
        setPlans(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Error fetching membership plans:", error);
        setPlans([]); // Ensure it's always an array
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  if (loading) {
    return (
      <PublicLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading pricing plans...</p>
          </div>
        </div>
      </PublicLayout>
    );
  }

  const displayPlans = (plans || []).map((plan, index) => {
    // Calculate price based on billing period
    // Assuming API returns monthly price, calculate yearly with 30% discount
    const monthlyPrice = plan.price;
    const yearlyPrice = Math.round(monthlyPrice * 12 * 0.7); // 30% discount
    const displayPrice =
      billingPeriod === "monthly" ? monthlyPrice : yearlyPrice;

    return {
      ...plan,
      price: displayPrice,
      period: billingPeriod === "monthly" ? "month" : "year",
      isPopular: index === 1,
    };
  });

  return (
    <PublicLayout>
      <div className="pt-28 pb-20">
        {/* Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Choose Your <span className="text-primary">Membership</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Flexible plans designed to fit your lifestyle. Start your fitness
              journey today with our transparent pricing.
            </p>
          </div>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <span
              className={cn(
                "text-sm font-medium transition-colors",
                billingPeriod === "monthly"
                  ? "text-foreground"
                  : "text-muted-foreground",
              )}
            >
              Monthly
            </span>
            <button
              onClick={() =>
                setBillingPeriod(
                  billingPeriod === "monthly" ? "yearly" : "monthly",
                )
              }
              className="relative w-14 h-7 bg-secondary rounded-full transition-colors"
              aria-label="Toggle billing period"
            >
              <span
                className={cn(
                  "absolute top-1 w-5 h-5 bg-primary rounded-full transition-all",
                  billingPeriod === "yearly" ? "left-8" : "left-1",
                )}
              />
            </button>
            <span
              className={cn(
                "text-sm font-medium transition-colors",
                billingPeriod === "yearly"
                  ? "text-foreground"
                  : "text-muted-foreground",
              )}
            >
              Yearly
            </span>
            {billingPeriod === "yearly" && (
              <span className="bg-primary/10 text-primary text-xs font-semibold px-2 py-1 rounded-full">
                Save 30%
              </span>
            )}
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-20">
            {displayPlans.map((plan) => (
              <PricingCard key={plan.id} {...plan} />
            ))}
          </div>

          {/* Comparison Table - Removed hardcoded comparison data */}

          {/* FAQs - Removed hardcoded FAQs */}

          {/* CTA */}
          <div className="text-center mt-20">
            <p className="text-muted-foreground mb-4">
              Still have questions? We&apos;re here to help.
            </p>
            <SecondaryButton>Contact Our Team</SecondaryButton>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
