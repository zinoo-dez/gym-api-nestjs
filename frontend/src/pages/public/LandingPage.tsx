import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  Dumbbell,
  HeartPulse,
  MapPin,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.12,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const floatingBadgeTransition = {
  duration: 3,
  repeat: Infinity,
  repeatType: "mirror" as const,
  ease: "easeInOut" as const,
};

const plans = {
  monthly: [
    {
      name: "Starter",
      price: "$39",
      detail: "Perfect for building consistency",
      features: ["Open gym access", "2 group classes/week", "Basic progress tracking"],
      recommended: false,
    },
    {
      name: "Pro",
      price: "$69",
      detail: "Most popular for fast progress",
      features: ["Unlimited classes", "Trainer check-ins", "Nutrition starter guide"],
      recommended: true,
    },
    {
      name: "Elite",
      price: "$109",
      detail: "Full transformation support",
      features: ["1:1 coaching", "Priority booking", "Body composition reviews"],
      recommended: false,
    },
  ],
  yearly: [
    {
      name: "Starter",
      price: "$399",
      detail: "Save two months yearly",
      features: ["Open gym access", "2 group classes/week", "Basic progress tracking"],
      recommended: false,
    },
    {
      name: "Pro",
      price: "$699",
      detail: "Best annual value",
      features: ["Unlimited classes", "Trainer check-ins", "Nutrition starter guide"],
      recommended: true,
    },
    {
      name: "Elite",
      price: "$1099",
      detail: "Highest accountability",
      features: ["1:1 coaching", "Priority booking", "Body composition reviews"],
      recommended: false,
    },
  ],
};

export default function LandingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  const activePlans = useMemo(() => plans[billingCycle], [billingCycle]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="relative mx-auto max-w-[1400px] px-4 py-8 sm:px-8">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-[-120px] top-16 h-72 w-72 rounded-full bg-secondary/15" />
          <div className="absolute right-[-80px] top-[380px] h-80 w-80 rounded-full bg-primary/10" />
          <div className="absolute left-1/2 top-[820px] h-56 w-56 -translate-x-1/2 rounded-[40px] bg-secondary/10" />
        </div>

        <header className="sticky top-4 z-40 rounded-2xl border border-input bg-background/90 px-4 py-3 backdrop-blur md:px-6">
          <nav className="flex items-center justify-between gap-4">
            <a href="#home" className="flex items-center gap-2">
              <span className="inline-flex size-10 items-center justify-center rounded-full bg-primary text-on-primary">
                <Dumbbell className="size-5" />
              </span>
              <span className="card-title">GymFlow</span>
            </a>

            <div className="hidden items-center gap-6 md:flex">
              <a href="#features" className="body-text text-muted-foreground transition-colors hover:text-primary">Features</a>
              <a href="#trainers" className="body-text text-muted-foreground transition-colors hover:text-primary">Trainers</a>
              <a href="#plans" className="body-text text-muted-foreground transition-colors hover:text-primary">Plans</a>
              <a href="#location" className="body-text text-muted-foreground transition-colors hover:text-primary">Location</a>
            </div>

            <Button variant="filled" size="default">Get Started</Button>
          </nav>
        </header>

        <main className="space-y-24 pb-12 pt-12 sm:space-y-28" id="home">
          <motion.section
            className="grid items-center gap-12 lg:grid-cols-2"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={sectionVariants}
          >
            <motion.div variants={itemVariants} className="fade-in slide-up space-y-6">
              <p className="small-text inline-flex items-center gap-2 rounded-full border border-input bg-secondary/15 px-4 py-2 text-muted-foreground">
                <Sparkles className="size-4" /> Elite Training. Real Results.
              </p>
              <h1 className="page-title max-w-xl">The Best Fitness Studio In Your Town</h1>
              <p className="body-text max-w-xl text-muted-foreground">
                Build strength with expert coaching, high-energy classes, and a community that keeps you consistent every week.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Button size="lg" className="gap-2">Join Now <ArrowRight className="size-5" /></Button>
                <Button variant="outlined" size="lg">See Membership Plans</Button>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="fade-in slide-up relative mx-auto w-full max-w-[560px]">
              <div className="absolute -left-10 -top-10 h-48 w-48 rounded-full bg-secondary/20" />
              <div className="absolute -right-6 -top-4 h-32 w-32 rounded-3xl bg-primary/10" />

              <div className="relative overflow-visible rounded-[32px] border border-input bg-card p-4 shadow-sm">
                <img
                  src="/placeholder-user.jpg"
                  alt="Athlete training in gym studio"
                  className="h-[520px] w-full rounded-3xl object-cover"
                />

                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={floatingBadgeTransition}
                  className="absolute -left-12 top-10 rounded-xl border border-input bg-background/85 px-4 py-3 backdrop-blur"
                >
                  <p className="small-text text-muted-foreground">Skill</p>
                  <p className="card-title">Handstand</p>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 9, 0] }}
                  transition={{ ...floatingBadgeTransition, duration: 3.4 }}
                  className="absolute -right-10 top-1/2 rounded-xl border border-input bg-background/85 px-4 py-3 backdrop-blur"
                >
                  <p className="small-text text-muted-foreground">Heart Rate</p>
                  <p className="card-title inline-flex items-center gap-2"><HeartPulse className="size-5 text-primary" />96 BPM</p>
                </motion.div>

                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ ...floatingBadgeTransition, duration: 3.8 }}
                  className="absolute bottom-[-16px] left-8 rounded-xl bg-primary px-4 py-3 text-on-primary shadow-sm"
                >
                  <p className="small-text text-on-primary/80">Community</p>
                  <p className="card-title">1.5M Members</p>
                </motion.div>
              </div>
            </motion.div>
          </motion.section>

          <div className="pointer-events-none flex justify-center">
            <div className="h-16 w-px border-l border-dashed border-input" />
          </div>

          <motion.section
            id="features"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={sectionVariants}
            className="space-y-8"
          >
            <motion.div variants={itemVariants} className="fade-in slide-up space-y-3 text-center">
              <h2 className="section-title">Equipment & Programs</h2>
              <p className="body-text mx-auto max-w-2xl text-muted-foreground">
                Purpose-built training tracks for flexibility, endurance, and muscle growth.
              </p>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  icon: Activity,
                  title: "Yoga Flow",
                  description: "Mobility-focused classes with breathing, posture, and recovery routines.",
                },
                {
                  icon: Clock3,
                  title: "Functional Fitness",
                  description: "Conditioning circuits and cardio sessions that raise stamina and speed.",
                },
                {
                  icon: Dumbbell,
                  title: "Muscle Builder",
                  description: "Strength progression programs guided by certified trainers and weekly targets.",
                },
              ].map((feature) => (
                <motion.article
                  key={feature.title}
                  variants={itemVariants}
                  className="fade-in slide-up rounded-lg border bg-card p-6 text-card-foreground shadow-sm"
                >
                  <span className="mb-4 inline-flex size-12 items-center justify-center rounded-xl bg-secondary/20 text-primary">
                    <feature.icon className="size-6" />
                  </span>
                  <h3 className="card-title">{feature.title}</h3>
                  <p className="body-text mt-3 text-muted-foreground">{feature.description}</p>
                </motion.article>
              ))}
            </div>
          </motion.section>

          <motion.section
            id="trainers"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={sectionVariants}
            className="space-y-8"
          >
            <motion.div variants={itemVariants} className="fade-in slide-up space-y-3 text-center">
              <h2 className="section-title">Professional Trainers</h2>
              <p className="body-text mx-auto max-w-2xl text-muted-foreground">
                Coaching specialists focused on technique, motivation, and sustainable fitness progress.
              </p>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-3">
              {["Coach Maya", "Coach Ethan", "Coach Lina"].map((name, index) => (
                <motion.article
                  key={name}
                  variants={itemVariants}
                  className="fade-in slide-up relative overflow-hidden rounded-3xl border bg-card p-6 shadow-sm"
                >
                  <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-secondary/20" />
                  <img
                    src="/placeholder-user.jpg"
                    alt={`${name} fitness trainer`}
                    className="h-64 w-full rounded-2xl object-cover"
                    style={{ transform: `translateY(${index % 2 === 0 ? "8px" : "-6px"})` }}
                  />
                  <div className="mt-6 space-y-2">
                    <h3 className="card-title">{name}</h3>
                    <p className="body-text text-muted-foreground">Strength & Conditioning Specialist</p>
                    <p className="small-text inline-flex items-center gap-2 rounded-full bg-secondary/15 px-3 py-1 text-muted-foreground">
                      <ShieldCheck className="size-4" /> Certified Performance Coach
                    </p>
                  </div>
                </motion.article>
              ))}
            </div>
          </motion.section>

          <motion.section
            id="plans"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={sectionVariants}
            className="space-y-8"
          >
            <motion.div variants={itemVariants} className="fade-in slide-up flex flex-col items-center justify-between gap-4 rounded-2xl border bg-card p-6 md:flex-row">
              <div className="space-y-2">
                <h2 className="section-title">Plans & Pricing</h2>
                <p className="body-text text-muted-foreground">Choose flexible billing with no hidden setup fees.</p>
              </div>

              <div className="inline-flex rounded-full border border-input bg-background p-1">
                <button
                  type="button"
                  onClick={() => setBillingCycle("monthly")}
                  className={`rounded-full px-4 py-2 small-text transition-colors ${
                    billingCycle === "monthly" ? "bg-primary text-on-primary" : "text-muted-foreground"
                  }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle("yearly")}
                  className={`rounded-full px-4 py-2 small-text transition-colors ${
                    billingCycle === "yearly" ? "bg-primary text-on-primary" : "text-muted-foreground"
                  }`}
                >
                  Yearly
                </button>
              </div>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-3">
              {activePlans.map((plan) => (
                <motion.article
                  key={`${billingCycle}-${plan.name}`}
                  variants={itemVariants}
                  className={`fade-in slide-up rounded-2xl border p-6 shadow-sm ${
                    plan.recommended ? "bg-primary text-on-primary" : "bg-card text-card-foreground"
                  }`}
                >
                  <div className="space-y-2">
                    <h3 className="card-title">{plan.name}</h3>
                    <p className={`page-title ${plan.recommended ? "text-on-primary" : "text-primary"}`}>{plan.price}</p>
                    <p className={`body-text ${plan.recommended ? "text-on-primary/80" : "text-muted-foreground"}`}>{plan.detail}</p>
                  </div>

                  <ul className="mt-6 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="body-text inline-flex items-center gap-2">
                        <Check className="size-5" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant={plan.recommended ? "outlined" : "filled"}
                    size="lg"
                    className={`mt-8 w-full ${plan.recommended ? "border-on-primary text-on-primary hover:bg-background/10" : ""}`}
                  >
                    Select {plan.name}
                  </Button>
                </motion.article>
              ))}
            </div>
          </motion.section>

          <motion.section
            id="location"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={sectionVariants}
            className="fade-in slide-up grid gap-8 rounded-3xl border bg-card p-8 md:grid-cols-2"
          >
            <motion.div variants={itemVariants} className="space-y-4">
              <h2 className="section-title">Ready to make a change?</h2>
              <p className="body-text text-muted-foreground">
                Visit our studio and start with a guided session tailored to your goals and current fitness level.
              </p>
              <div className="inline-flex items-center gap-2 rounded-full bg-secondary/15 px-4 py-2">
                <MapPin className="size-5 text-primary" />
                <span className="body-text text-muted-foreground">245 Riverside Avenue, Downtown</span>
              </div>
              <div className="flex flex-wrap gap-4 pt-2">
                <Button size="lg">Book Free Trial</Button>
                <Button variant="outlined" size="lg">Contact Team</Button>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="relative rounded-2xl border border-input bg-background p-6">
              <div className="absolute inset-6 rounded-2xl border border-dashed border-input" />
              <div className="relative z-10 grid h-full content-between gap-6">
                <div className="space-y-2">
                  <p className="small-text text-muted-foreground">Location Snapshot</p>
                  <h3 className="card-title">5 Minutes From Central Station</h3>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl bg-secondary/10 p-4">
                    <p className="small-text text-muted-foreground">Parking</p>
                    <p className="card-title">120 Spots</p>
                  </div>
                  <div className="rounded-xl bg-secondary/10 p-4">
                    <p className="small-text text-muted-foreground">Open Hours</p>
                    <p className="card-title">05:00 - 23:00</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.section>
        </main>

        <footer className="mt-16 rounded-2xl border bg-card px-6 py-8 text-card-foreground">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="space-y-2">
              <h3 className="card-title">GymFlow</h3>
              <p className="body-text text-muted-foreground">A modern gym platform for stronger habits and long-term results.</p>
            </div>

            <div className="space-y-3">
              <p className="card-title">Quick Links</p>
              <div className="flex flex-col gap-2">
                <a href="#features" className="small-text text-muted-foreground hover:text-primary">Features</a>
                <a href="#trainers" className="small-text text-muted-foreground hover:text-primary">Trainers</a>
                <a href="#plans" className="small-text text-muted-foreground hover:text-primary">Plans</a>
                <a href="#location" className="small-text text-muted-foreground hover:text-primary">Location</a>
              </div>
            </div>

            <div className="space-y-3">
              <p className="card-title">Newsletter</p>
              <div className="flex gap-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="body-text w-full border border-input bg-background rounded-md px-3 py-2"
                />
                <Button size="default">
                  <CalendarDays className="size-5" />
                </Button>
              </div>
              <p className="small-text text-muted-foreground inline-flex items-center gap-2">
                <Users className="size-4" /> Weekly training tips and offers.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
