/**
 * PublicMembershipsPage Component
 * Public-facing memberships and pricing page
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { PublicHeader } from "../../components/layout/PublicHeader";
import { PublicFooter } from "../../components/layout/PublicFooter";
import { Hero } from "../../components/marketing/Hero";
import { PricingCard } from "../../components/marketing/PricingCard";
import { Button } from "../../components/common/Button";

export function PublicMembershipsPage() {
  const [billingPeriod, setBillingPeriod] = useState("monthly");

  const plans = [
    {
      name: "Basic",
      monthlyPrice: 29,
      yearlyPrice: 290,
      features: [
        "Access to gym floor",
        "Basic cardio & strength equipment",
        "Locker room access",
        "Mobile app access",
        "Free fitness assessment"
      ]
    },
    {
      name: "Pro",
      monthlyPrice: 59,
      yearlyPrice: 590,
      recommended: true,
      features: [
        "Everything in Basic",
        "Unlimited group classes",
        "Personal trainer consultation",
        "Nutrition guidance",
        "Priority class booking",
        "Guest passes (2/month)",
        "Towel service"
      ]
    },
    {
      name: "Elite",
      monthlyPrice: 99,
      yearlyPrice: 990,
      features: [
        "Everything in Pro",
        "4 personal training sessions/month",
        "Custom workout plans",
        "Recovery & spa access",
        "Unlimited guest passes",
        "Supplement discounts",
        "Private locker",
        "24/7 gym access"
      ]
    },
  ];

  const faqs = [
    {
      question: "Can I cancel my membership anytime?",
      answer: "Yes! We offer flexible month-to-month memberships with no long-term contracts. Cancel anytime with 30 days notice."
    },
    {
      question: "Is there a free trial?",
      answer: "Absolutely! We offer a 7-day free trial for all new members. Experience our facilities and classes before committing."
    },
    {
      question: "What's included in group classes?",
      answer: "All Pro and Elite members get unlimited access to 100+ weekly classes including HIIT, yoga, spin, strength training, and more."
    },
    {
      question: "Can I freeze my membership?",
      answer: "Yes, you can freeze your membership for up to 3 months per year for medical reasons or extended travel."
    },
    {
      question: "Do you offer student or military discounts?",
      answer: "Yes! We offer 20% off for students with valid ID and 25% off for active military and veterans."
    },
    {
      question: "What if I want to upgrade my plan?",
      answer: "You can upgrade anytime! The price difference will be prorated for the current billing period."
    },
  ];

  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <PublicHeader />
      
      <Hero 
        title={<>Choose Your <span className="bg-gradient-to-r from-[#22c55e] to-[#84cc16] bg-clip-text text-transparent">Membership</span></>}
        subtitle="Flexible plans designed to fit your lifestyle and budget. No hidden fees, no long-term contracts."
        ctaPrimary="Start Free Trial"
        ctaSecondary="Compare Plans"
        linkSecondary="#pricing"
      />

      {/* Pricing Section */}
      <section id="pricing" className="py-20 lg:py-32">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Billing Toggle */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex items-center gap-4 p-2 bg-white/5 rounded-2xl">
              <button
                onClick={() => setBillingPeriod("monthly")}
                className={`px-8 py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all ${
                  billingPeriod === "monthly"
                    ? 'bg-[#22c55e] text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod("yearly")}
                className={`px-8 py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all relative ${
                  billingPeriod === "yearly"
                    ? 'bg-[#22c55e] text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Yearly
                <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-[#22c55e] text-black text-[10px] font-black rounded-full">
                  SAVE 20%
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {plans.map((plan, i) => (
              <PricingCard
                key={i}
                name={plan.name}
                price={billingPeriod === "monthly" ? plan.monthlyPrice : plan.yearlyPrice}
                period={billingPeriod === "monthly" ? "month" : "year"}
                features={plan.features}
                recommended={plan.recommended}
                delay={i * 0.1}
              />
            ))}
          </div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <p className="text-gray-400 mb-4">
              All plans include access to our mobile app and online community
            </p>
            <p className="text-sm text-gray-500">
              Prices shown in USD. Tax may apply based on location.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 lg:py-32 bg-black/20">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-black mb-6 uppercase tracking-tighter">
              Compare Features
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              See what's included in each membership tier
            </p>
          </motion.div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-4 px-6 font-bold uppercase text-sm">Feature</th>
                  <th className="text-center py-4 px-6 font-bold uppercase text-sm">Basic</th>
                  <th className="text-center py-4 px-6 font-bold uppercase text-sm">Pro</th>
                  <th className="text-center py-4 px-6 font-bold uppercase text-sm">Elite</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: "Gym Floor Access", basic: true, pro: true, elite: true },
                  { feature: "Group Classes", basic: false, pro: true, elite: true },
                  { feature: "Personal Training", basic: false, pro: "1/month", elite: "4/month" },
                  { feature: "Nutrition Guidance", basic: false, pro: true, elite: true },
                  { feature: "Spa & Recovery", basic: false, pro: false, elite: true },
                  { feature: "Guest Passes", basic: false, pro: "2/month", elite: "Unlimited" },
                  { feature: "24/7 Access", basic: false, pro: false, elite: true },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td className="py-4 px-6 text-gray-300">{row.feature}</td>
                    <td className="py-4 px-6 text-center">
                      {typeof row.basic === "boolean" ? (
                        row.basic ? <span className="text-[#22c55e]">✓</span> : <span className="text-gray-600">—</span>
                      ) : (
                        <span className="text-sm text-gray-400">{row.basic}</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {typeof row.pro === "boolean" ? (
                        row.pro ? <span className="text-[#22c55e]">✓</span> : <span className="text-gray-600">—</span>
                      ) : (
                        <span className="text-sm text-gray-400">{row.pro}</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {typeof row.elite === "boolean" ? (
                        row.elite ? <span className="text-[#22c55e]">✓</span> : <span className="text-gray-600">—</span>
                      ) : (
                        <span className="text-sm text-gray-400">{row.elite}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-black mb-6 uppercase tracking-tighter">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Got questions? We've got answers
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="rounded-2xl bg-[#171717] border border-white/5 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full p-6 text-left flex justify-between items-center hover:bg-white/5 transition-colors"
                >
                  <span className="font-bold text-lg">{faq.question}</span>
                  <span className="text-[#22c55e] text-2xl">
                    {openFaq === i ? "−" : "+"}
                  </span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-6 text-gray-400 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-black/20">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative p-12 lg:p-24 rounded-[3rem] bg-gradient-to-br from-[#22c55e] to-[#84cc16] overflow-hidden text-center"
          >
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-4xl lg:text-6xl font-black mb-6 uppercase tracking-tighter text-black">
                Ready to Transform?
              </h2>
              <p className="text-xl text-black/80 mb-12 font-medium">
                Start your 7-day free trial today. No credit card required.
              </p>
              <Link to="/register">
                <Button className="!bg-black !text-[#22c55e] hover:!bg-[#171717] px-12 py-6 text-sm uppercase tracking-widest font-black">
                  Start Free Trial
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
