
import * as React from "react"
import { useEffect, useState } from "react"
import { PublicLayout } from "../../layouts"
import { PricingCard, SecondaryButton } from "@/components/gym"
import { cn } from "@/lib/utils"
import { membershipsService, type MembershipPlan } from "@/services/memberships.service"

const faqs = [
  {
    question: "Can I cancel my membership anytime?",
    answer: "Yes, you can cancel your membership at any time with no cancellation fees. Your access will continue until the end of your billing period.",
  },
  {
    question: "Is there a trial period?",
    answer: "Yes! We offer a 7-day free trial for all new members. You can explore all our facilities and classes before committing to a membership.",
  },
  {
    question: "Can I upgrade or downgrade my plan?",
    answer: "Absolutely. You can change your plan at any time. The new rate will be prorated from your next billing cycle.",
  },
  {
    question: "Are personal training sessions transferable?",
    answer: "Personal training sessions are non-transferable but can be rolled over to the next month (up to 4 sessions maximum).",
  },
  {
    question: "What's included in the group classes?",
    answer: "Our group classes include HIIT, Spin, Yoga, Pilates, Boxing, CrossFit, and more. Pro and Elite members get unlimited access to all classes.",
  },
  {
    question: "Do you offer student or corporate discounts?",
    answer: "Yes! We offer 15% off for students with valid ID and custom corporate packages. Contact us for more details.",
  },
]

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly")
  const [plans, setPlans] = useState<MembershipPlan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await membershipsService.getAllPlans({ limit: 10, isActive: true })
        setPlans(Array.isArray(response.data) ? response.data : [])
      } catch (error) {
        console.error('Error fetching membership plans:', error)
        setPlans([]) // Ensure it's always an array
      } finally {
        setLoading(false)
      }
    }

    fetchPlans()
  }, [])

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
    )
  }

  const displayPlans = (plans || []).map((plan, index) => ({
    ...plan,
    period: billingPeriod,
    isPopular: index === 1,
  }))

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
              Flexible plans designed to fit your lifestyle. Start your fitness journey today with our transparent pricing.
            </p>
          </div>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <span className={cn(
              "text-sm font-medium transition-colors",
              billingPeriod === "monthly" ? "text-foreground" : "text-muted-foreground"
            )}>
              Monthly
            </span>
            <button
              onClick={() => setBillingPeriod(billingPeriod === "monthly" ? "yearly" : "monthly")}
              className="relative w-14 h-7 bg-secondary rounded-full transition-colors"
              aria-label="Toggle billing period"
            >
              <span
                className={cn(
                  "absolute top-1 w-5 h-5 bg-primary rounded-full transition-all",
                  billingPeriod === "yearly" ? "left-8" : "left-1"
                )}
              />
            </button>
            <span className={cn(
              "text-sm font-medium transition-colors",
              billingPeriod === "yearly" ? "text-foreground" : "text-muted-foreground"
            )}>
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

          {/* Comparison Table */}
          <div className="mb-20">
            <h2 className="text-2xl font-bold text-foreground text-center mb-8">
              Compare Plans
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full max-w-4xl mx-auto">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-4 px-4 text-foreground font-semibold">Feature</th>
                    <th className="text-center py-4 px-4 text-foreground font-semibold">Basic</th>
                    <th className="text-center py-4 px-4 text-foreground font-semibold">Pro</th>
                    <th className="text-center py-4 px-4 text-foreground font-semibold">Elite</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: "Gym Floor Access", basic: true, pro: true, elite: true },
                    { feature: "Group Classes", basic: false, pro: true, elite: true },
                    { feature: "Personal Training", basic: false, pro: "1/month", elite: "4/month" },
                    { feature: "Sauna & Steam", basic: false, pro: true, elite: true },
                    { feature: "Guest Passes", basic: false, pro: "2/month", elite: "4/month" },
                    { feature: "Custom Workout Plans", basic: false, pro: false, elite: true },
                    { feature: "Recovery Zone", basic: false, pro: false, elite: true },
                    { feature: "Priority Booking", basic: false, pro: false, elite: true },
                  ].map((row) => (
                    <tr key={row.feature} className="border-b border-border/50">
                      <td className="py-4 px-4 text-foreground">{row.feature}</td>
                      <td className="py-4 px-4 text-center">
                        {typeof row.basic === "boolean" ? (
                          row.basic ? (
                            <svg className="w-5 h-5 text-primary mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-muted-foreground mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )
                        ) : (
                          <span className="text-muted-foreground">{row.basic}</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center">
                        {typeof row.pro === "boolean" ? (
                          row.pro ? (
                            <svg className="w-5 h-5 text-primary mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-muted-foreground mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )
                        ) : (
                          <span className="text-foreground">{row.pro}</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center">
                        {typeof row.elite === "boolean" ? (
                          row.elite ? (
                            <svg className="w-5 h-5 text-primary mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-muted-foreground mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )
                        ) : (
                          <span className="text-foreground">{row.elite}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* FAQs */}
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground text-center mb-8">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq) => (
                <details
                  key={faq.question}
                  className="group bg-card border border-border rounded-xl"
                >
                  <summary className="flex items-center justify-between cursor-pointer p-6 text-foreground font-medium">
                    {faq.question}
                    <svg
                      className="w-5 h-5 text-muted-foreground transition-transform group-open:rotate-180"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <p className="px-6 pb-6 text-muted-foreground">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-20">
            <p className="text-muted-foreground mb-4">
              Still have questions? We&apos;re here to help.
            </p>
            <SecondaryButton>
              Contact Our Team
            </SecondaryButton>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
