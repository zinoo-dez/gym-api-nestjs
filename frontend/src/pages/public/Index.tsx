import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dumbbell,
  Users,
  Trophy,
  ArrowRight,
  CheckCircle2,
  Star,
  Phone,
  Mail,
  MapPin,
  Menu,
  X,
  Clock,
  Play,
  ChevronRight,
} from "lucide-react";
import heroImg from "@/assets/hero-gym.jpg";
import aboutImg from "@/assets/about-gym.jpg";
import servicePersonal from "@/assets/service-personal.jpg";
import serviceFunctional from "@/assets/service-functional.jpg";
import serviceWeight from "@/assets/service-weight.jpg";

const stats = [
  { icon: Users, label: "Happy Global Customers", value: "85%" },
  { icon: Dumbbell, label: "Advanced Gym Equipments", value: "92%" },
  { icon: Trophy, label: "Qualified Expert Trainers", value: "99%" },
];

const services = [
  { img: servicePersonal, title: "Online Personal Training Class", num: "01" },
  { img: serviceFunctional, title: "Functional Fitness Training", num: "02" },
  { img: serviceWeight, title: "Weight Loss Coaching Class", num: "03" },
];

const plans = [
  {
    name: "Basic",
    price: 11,
    period: "month",
    features: ["Access to gym floor", "Locker room access", "1 Guest pass/month", "Basic fitness assessment"],
  },
  {
    name: "Premium",
    price: 105,
    period: "month",
    popular: true,
    features: ["Everything in Basic", "Group classes included", "Personal trainer (2x/mo)", "Nutrition consultation", "Sauna & spa access"],
  },
  {
    name: "VIP",
    price: 299,
    period: "month",
    features: ["Everything in Premium", "Unlimited PT sessions", "Priority booking", "Private locker", "Recovery therapy", "Guest passes unlimited"],
  },
];

const trainers = [
  { name: "Alex Turner", role: "Strength Coach" },
  { name: "Maria Wong", role: "Yoga Instructor" },
  { name: "David Brooks", role: "CrossFit Trainer" },
  { name: "Ella James", role: "Nutrition Expert" },
];

const testimonials = [
  { name: "James Wilson", text: "This gym completely transformed my physique. The trainers are world-class and the equipment is top-notch.", rating: 5 },
  { name: "Sarah Chen", text: "Best investment I've made for my health. The community here keeps me motivated every single day.", rating: 5 },
  { name: "Mike Rodriguez", text: "From beginner to competing in my first bodybuilding show — all thanks to the incredible coaching staff here.", rating: 5 },
];

const LandingPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[hsl(222,18%,7%)] text-[hsl(210,20%,94%)] overflow-x-hidden">
      {/* ─── Navbar ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[hsl(222,18%,7%)]/90 backdrop-blur-md border-b border-[hsl(222,12%,16%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-7 w-7 text-[hsl(82,85%,50%)]" />
            <span className="text-xl font-black tracking-tight uppercase">FitZone</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            {["home", "about", "services", "pricing", "trainers", "contact"].map((s) => (
              <button key={s} onClick={() => scrollTo(s)} className="capitalize hover:text-[hsl(82,85%,50%)] transition-colors">
                {s}
              </button>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login">
              <Button variant="outline" className="border-[hsl(82,85%,50%)] text-[hsl(82,85%,50%)] hover:bg-[hsl(82,85%,50%)] hover:text-[hsl(222,18%,7%)] bg-transparent">
                Admin Login
              </Button>
            </Link>
            <Button onClick={() => scrollTo("pricing")} className="bg-[hsl(82,85%,50%)] text-[hsl(222,18%,7%)] hover:bg-[hsl(82,85%,60%)] font-bold">
              Join Now <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden bg-[hsl(222,16%,11%)] border-t border-[hsl(222,12%,16%)] px-4 py-4 space-y-3">
            {["home", "about", "services", "pricing", "trainers", "contact"].map((s) => (
              <button key={s} onClick={() => scrollTo(s)} className="block w-full text-left capitalize py-2 hover:text-[hsl(82,85%,50%)]">
                {s}
              </button>
            ))}
            <Link to="/login" className="block">
              <Button variant="outline" className="w-full border-[hsl(82,85%,50%)] text-[hsl(82,85%,50%)] bg-transparent">Admin Login</Button>
            </Link>
          </div>
        )}
      </nav>

      {/* ─── Hero ─── */}
      <section id="home" className="relative min-h-screen flex items-center pt-16">
        <div className="absolute inset-0">
          <img src={heroImg} alt="Gym hero" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[hsl(222,18%,7%)] via-[hsl(222,18%,7%)]/80 to-transparent" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-2xl">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black uppercase leading-[1.05] tracking-tight">
              Sculpt <span className="text-[hsl(82,85%,50%)]">Your</span> Body,
              <br />
              Elevate <span className="text-[hsl(82,85%,50%)]">Your</span> Spirit
            </h1>
            <p className="mt-6 text-lg text-[hsl(215,15%,55%)] max-w-lg">
              Transform your life with state-of-the-art equipment, expert trainers, and a community that pushes you beyond your limits.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button onClick={() => scrollTo("pricing")} className="bg-[hsl(82,85%,50%)] text-[hsl(222,18%,7%)] hover:bg-[hsl(82,85%,60%)] font-bold px-8 py-6 text-base rounded-full">
                Try For Free <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" onClick={() => scrollTo("contact")} className="border-[hsl(210,20%,94%)]/30 text-[hsl(210,20%,94%)] hover:bg-[hsl(210,20%,94%)]/10 bg-transparent px-8 py-6 text-base rounded-full">
                <Clock className="mr-2 h-5 w-5" /> Schedule Time
              </Button>
            </div>
            <div className="mt-10 flex items-center gap-3">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-[hsl(82,85%,50%)]/20 border-2 border-[hsl(222,18%,7%)] flex items-center justify-center text-xs font-bold text-[hsl(82,85%,50%)]">
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <p className="text-sm"><span className="text-[hsl(82,85%,50%)] font-bold">10,000+</span> Active Members</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats ─── */}
      <section className="py-16 bg-[hsl(222,16%,11%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-3 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col items-center text-center gap-4 p-8 rounded-2xl bg-[hsl(222,18%,9%)] border border-[hsl(222,12%,16%)]">
              <div className="w-14 h-14 rounded-xl bg-[hsl(82,85%,50%)]/10 flex items-center justify-center">
                <s.icon className="h-7 w-7 text-[hsl(82,85%,50%)]" />
              </div>
              <p className="text-4xl font-black text-[hsl(82,85%,50%)]">{s.value}</p>
              <p className="text-sm uppercase tracking-wider text-[hsl(215,15%,55%)] font-semibold">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── About ─── */}
      <section id="about" className="py-24 bg-[hsl(222,18%,7%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <img src={aboutImg} alt="About gym" className="rounded-2xl w-full object-cover aspect-[4/5]" />
            <div className="absolute bottom-6 left-6 bg-[hsl(82,85%,50%)] text-[hsl(222,18%,7%)] px-5 py-3 rounded-xl font-black text-lg flex items-center gap-2">
              25+ <span className="text-sm font-medium">Years of Fitness Experience</span>
            </div>
            <button className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-[hsl(82,85%,50%)]/90 flex items-center justify-center hover:scale-110 transition-transform">
              <Play className="h-6 w-6 text-[hsl(222,18%,7%)] ml-1" />
            </button>
          </div>
          <div>
            <span className="text-sm uppercase tracking-widest text-[hsl(82,85%,50%)] font-bold border border-[hsl(82,85%,50%)]/30 px-4 py-1.5 rounded-full">
              About Company
            </span>
            <h2 className="mt-6 text-4xl sm:text-5xl font-black uppercase leading-tight">
              Dedicated to Igniting Your <span className="text-[hsl(82,85%,50%)]">Fitness Health</span>
            </h2>
            <p className="mt-6 text-[hsl(215,15%,55%)] leading-relaxed">
              We believe fitness is more than a workout — it's a lifestyle. Our modern facilities, diverse programs, and expert team are dedicated to helping you reach your peak potential.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4">
              {["Modern Facilities", "Expert Team", "Diverse Offering", "Fitness Focus"].map((f) => (
                <div key={f} className="flex items-center gap-2 text-sm font-medium">
                  <CheckCircle2 className="h-5 w-5 text-[hsl(82,85%,50%)]" />
                  {f}
                </div>
              ))}
            </div>
            <Button onClick={() => scrollTo("contact")} variant="outline" className="mt-8 border-[hsl(82,85%,50%)] text-[hsl(82,85%,50%)] hover:bg-[hsl(82,85%,50%)] hover:text-[hsl(222,18%,7%)] bg-transparent rounded-full px-6">
              More About Us <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* ─── Services ─── */}
      <section id="services" className="py-24 bg-[hsl(222,16%,11%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div>
              <span className="text-sm uppercase tracking-widest text-[hsl(82,85%,50%)] font-bold border border-[hsl(82,85%,50%)]/30 px-4 py-1.5 rounded-full">
                Why Choose Us
              </span>
              <h2 className="mt-6 text-4xl sm:text-5xl font-black uppercase leading-tight">
                Experience Reliable<br />Fitness <span className="text-[hsl(82,85%,50%)]">Services</span>
              </h2>
            </div>
            <p className="text-[hsl(215,15%,55%)] max-w-md">
              Our diverse programs cater to every fitness goal. From personal training to group classes, we have everything you need.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s) => (
              <div key={s.num} className="group relative rounded-2xl overflow-hidden aspect-[3/4] cursor-pointer">
                <img src={s.img} alt={s.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-[hsl(222,18%,7%)] via-[hsl(222,18%,7%)]/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <p className="text-xs text-[hsl(82,85%,50%)] font-mono mb-1">{s.num}</p>
                  <h3 className="text-xl font-black uppercase">{s.title}</h3>
                  <div className="mt-3 w-10 h-10 rounded-full bg-[hsl(82,85%,50%)] flex items-center justify-center group-hover:translate-x-2 transition-transform">
                    <ChevronRight className="h-5 w-5 text-[hsl(222,18%,7%)]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section id="pricing" className="py-24 bg-[hsl(222,18%,7%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-sm uppercase tracking-widest text-[hsl(82,85%,50%)] font-bold border border-[hsl(82,85%,50%)]/30 px-4 py-1.5 rounded-full">
            Choose Our Pricing
          </span>
          <h2 className="mt-6 text-4xl sm:text-5xl font-black uppercase">Subscription Plans</h2>
          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((p) => (
              <Card
                key={p.name}
                className={`relative rounded-2xl border bg-[hsl(222,16%,11%)] text-[hsl(210,20%,94%)] ${
                  p.popular ? "border-[hsl(82,85%,50%)] ring-2 ring-[hsl(82,85%,50%)]/20" : "border-[hsl(222,12%,16%)]"
                }`}
              >
                {p.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[hsl(82,85%,50%)] text-[hsl(222,18%,7%)] text-xs font-bold uppercase px-4 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <CardContent className="p-8">
                  <h3 className="text-lg font-bold uppercase">{p.name}</h3>
                  <div className="mt-4">
                    <span className="text-5xl font-black text-[hsl(82,85%,50%)]">${p.price}</span>
                    <span className="text-[hsl(215,15%,55%)]">/{p.period}</span>
                  </div>
                  <ul className="mt-8 space-y-3 text-left">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-center gap-3 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-[hsl(82,85%,50%)] shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full mt-8 rounded-full font-bold ${
                      p.popular
                        ? "bg-[hsl(82,85%,50%)] text-[hsl(222,18%,7%)] hover:bg-[hsl(82,85%,60%)]"
                        : "bg-transparent border border-[hsl(82,85%,50%)] text-[hsl(82,85%,50%)] hover:bg-[hsl(82,85%,50%)] hover:text-[hsl(222,18%,7%)]"
                    }`}
                  >
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Trainers ─── */}
      <section id="trainers" className="py-24 bg-[hsl(222,16%,11%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-sm uppercase tracking-widest text-[hsl(82,85%,50%)] font-bold border border-[hsl(82,85%,50%)]/30 px-4 py-1.5 rounded-full">
            Our Best Professional
          </span>
          <h2 className="mt-6 text-4xl sm:text-5xl font-black uppercase">Fitness <span className="text-[hsl(82,85%,50%)]">Trainers</span></h2>
          <div className="mt-14 grid grid-cols-2 lg:grid-cols-4 gap-6">
            {trainers.map((t) => (
              <div key={t.name} className="group">
                <div className="aspect-square rounded-2xl bg-[hsl(222,18%,9%)] border border-[hsl(222,12%,16%)] flex items-center justify-center mb-4 overflow-hidden">
                  <div className="w-20 h-20 rounded-full bg-[hsl(82,85%,50%)]/10 flex items-center justify-center text-2xl font-black text-[hsl(82,85%,50%)]">
                    {t.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                </div>
                <h3 className="font-bold text-lg">{t.name}</h3>
                <p className="text-sm text-[hsl(82,85%,50%)]">{t.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section className="py-24 bg-[hsl(222,18%,7%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-sm uppercase tracking-widest text-[hsl(82,85%,50%)] font-bold border border-[hsl(82,85%,50%)]/30 px-4 py-1.5 rounded-full">
              What Our Clients Say
            </span>
            <h2 className="mt-6 text-4xl sm:text-5xl font-black uppercase">About <span className="text-[hsl(82,85%,50%)]">Fitness</span></h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <Card key={t.name} className="rounded-2xl bg-[hsl(222,16%,11%)] border-[hsl(222,12%,16%)] text-[hsl(210,20%,94%)]">
                <CardContent className="p-8">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-[hsl(82,85%,50%)] text-[hsl(82,85%,50%)]" />
                    ))}
                  </div>
                  <p className="text-[hsl(215,15%,55%)] leading-relaxed mb-6">"{t.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[hsl(82,85%,50%)]/10 flex items-center justify-center text-sm font-bold text-[hsl(82,85%,50%)]">
                      {t.name[0]}
                    </div>
                    <p className="font-bold">{t.name}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Contact / CTA ─── */}
      <section id="contact" className="py-24 bg-[hsl(222,16%,11%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-br from-[hsl(82,85%,50%)]/10 to-transparent border border-[hsl(82,85%,50%)]/20 p-10 md:p-16 flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1">
              <h2 className="text-4xl sm:text-5xl font-black uppercase">
                Let's Get <span className="text-[hsl(82,85%,50%)]">Started</span>!
              </h2>
              <p className="mt-4 text-[hsl(215,15%,55%)] max-w-lg">
                Join our community today and start your transformation journey. First session is always free.
              </p>
              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-5 w-5 text-[hsl(82,85%,50%)]" />
                  +1 (555) 123-4567
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-5 w-5 text-[hsl(82,85%,50%)]" />
                  info@fitzone.com
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-5 w-5 text-[hsl(82,85%,50%)]" />
                  123 Fitness Avenue, New York, NY 10001
                </div>
              </div>
            </div>
            <div className="flex-1 w-full max-w-md">
              <div className="space-y-4">
                <input placeholder="Your Name" className="w-full px-5 py-3 rounded-xl bg-[hsl(222,18%,9%)] border border-[hsl(222,12%,20%)] text-[hsl(210,20%,94%)] placeholder:text-[hsl(215,15%,40%)] focus:outline-none focus:border-[hsl(82,85%,50%)]" />
                <input placeholder="Your Email" className="w-full px-5 py-3 rounded-xl bg-[hsl(222,18%,9%)] border border-[hsl(222,12%,20%)] text-[hsl(210,20%,94%)] placeholder:text-[hsl(215,15%,40%)] focus:outline-none focus:border-[hsl(82,85%,50%)]" />
                <input placeholder="Phone Number" className="w-full px-5 py-3 rounded-xl bg-[hsl(222,18%,9%)] border border-[hsl(222,12%,20%)] text-[hsl(210,20%,94%)] placeholder:text-[hsl(215,15%,40%)] focus:outline-none focus:border-[hsl(82,85%,50%)]" />
                <textarea placeholder="Your Message" rows={4} className="w-full px-5 py-3 rounded-xl bg-[hsl(222,18%,9%)] border border-[hsl(222,12%,20%)] text-[hsl(210,20%,94%)] placeholder:text-[hsl(215,15%,40%)] focus:outline-none focus:border-[hsl(82,85%,50%)] resize-none" />
                <Button className="w-full bg-[hsl(82,85%,50%)] text-[hsl(222,18%,7%)] hover:bg-[hsl(82,85%,60%)] font-bold py-6 rounded-xl text-base">
                  Send Message <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="py-10 bg-[hsl(222,18%,7%)] border-t border-[hsl(222,12%,16%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-[hsl(82,85%,50%)]" />
            <span className="font-black uppercase">FitZone</span>
          </div>
          <p className="text-sm text-[hsl(215,15%,55%)]">© 2026 FitZone. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-[hsl(215,15%,55%)]">
            <button className="hover:text-[hsl(82,85%,50%)]">Privacy</button>
            <button className="hover:text-[hsl(82,85%,50%)]">Terms</button>
            <Link to="/login" className="hover:text-[hsl(82,85%,50%)]">Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
