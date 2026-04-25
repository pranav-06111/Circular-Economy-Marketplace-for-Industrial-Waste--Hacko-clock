import { useState, Suspense } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  Clock3,
  Factory,
  Globe,
  Leaf,
  Recycle,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  ChevronDown,
  Zap,
  BarChart3,
  Users,
  Twitter,
  Linkedin,
  Github,
  Mail,
} from 'lucide-react';
import { motion, useScroll, useTransform } from 'motion/react';
import HeroScene from '../components/HeroScene';

const stats = [
  { value: '1,243', label: 'Tons Diverted', icon: Recycle, accent: '#10b981' },
  { value: '89', label: 'Industries Joined', icon: Factory, accent: '#2dd4bf' },
  { value: '14.2k', label: 'Tons CO₂ Saved', icon: TrendingDown, accent: '#34d399' },
  { value: '₹4.2M', label: 'Value Unlocked', icon: BadgeCheck, accent: '#6ee7b7' },
  { value: '<2 min', label: 'Avg Match Time', icon: Clock3, accent: '#a7f3d0' },
];

const features = [
  {
    icon: ShieldCheck,
    title: 'AI-Powered Compliance',
    desc: 'Automated Hazardous Waste Rules analysis with real-time regulatory updates.',
    gradient: 'from-emerald-500/20 to-teal-500/5',
  },
  {
    icon: Zap,
    title: 'Instant Smart Matching',
    desc: 'AI agents pair your waste with the perfect buyer in under 2 minutes.',
    gradient: 'from-cyan-500/20 to-sky-500/5',
  },
  {
    icon: BarChart3,
    title: 'ESG Impact Dashboard',
    desc: 'Track carbon credits, environmental savings, and blockchain-anchored impact.',
    gradient: 'from-violet-500/20 to-purple-500/5',
  },
  {
    icon: Users,
    title: 'Verified Network',
    desc: 'Connect with 89+ verified industries and 200+ recyclers across India.',
    gradient: 'from-amber-500/20 to-orange-500/5',
  },
];

const steps = [
  { icon: Factory, title: 'List Waste', desc: 'Upload photos and details of your industrial byproducts.', num: '01' },
  { icon: ShieldCheck, title: 'AI Analysis', desc: 'Our AI agents check composition & Hazardous Waste Rules compliance.', num: '02' },
  { icon: Globe, title: 'Smart Match', desc: 'Get matched with verified recyclers and raw-material buyers.', num: '03' },
  { icon: TrendingDown, title: 'ESG Anchor', desc: 'Logistics estimated and impact anchored on Blockchain.', num: '04' },
];

export default function LandingPage() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95]);

  return (
    <div className="min-h-screen bg-[#030712] text-slate-50 font-sans selection:bg-emerald-500/30 overflow-x-hidden">
      {/* ─── Navigation ──────────────────────────────────────────────── */}
      <header className="fixed top-0 w-full z-50">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-2xl px-6 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                EcoMatch India
              </span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-slate-400 hover:text-white transition-colors font-medium">Features</a>
              <a href="#how-it-works" className="text-sm text-slate-400 hover:text-white transition-colors font-medium">How It Works</a>
              <a href="#stats" className="text-sm text-slate-400 hover:text-white transition-colors font-medium">Impact</a>
            </nav>
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors hidden sm:block">
                Sign In
              </Link>
              <Link
                to="/login"
                className="relative bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:scale-[1.03] overflow-hidden group"
              >
                <span className="relative z-10">Get Started</span>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ─── Hero Section ────────────────────────────────────────────── */}
      <motion.section
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative isolate min-h-screen flex items-center overflow-hidden"
      >
        {/* Background gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.15),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_60%,rgba(45,212,191,0.08),transparent)]" />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#030712] to-transparent z-10" />

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* 3D Scene */}
        <div className="absolute right-0 top-0 w-full lg:w-[55%] h-full">
          <Suspense fallback={null}>
            <HeroScene />
          </Suspense>
          {/* Fade edges for blending */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#030712] via-transparent to-transparent lg:via-20%" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto w-full px-6 pt-32 pb-20">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.21, 1.02, 0.73, 1] }}
            >
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-emerald-300 text-xs uppercase tracking-[0.25em] font-semibold">
                  Live Marketplace
                </span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.21, 1.02, 0.73, 1] }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] mb-7"
            >
              <span className="bg-gradient-to-b from-white via-white to-slate-400 bg-clip-text text-transparent">
                Turn Industrial
              </span>
              <br />
              <span className="bg-gradient-to-b from-white via-white to-slate-400 bg-clip-text text-transparent">
                Waste Into{' '}
              </span>
              <span className="bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
                Value
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.21, 1.02, 0.73, 1] }}
              className="text-lg sm:text-xl text-slate-400 max-w-lg mb-10 leading-relaxed font-medium"
            >
              India's first AI-powered circular economy marketplace. Find verified buyers, ensure compliance, and track environmental impact — all in one platform.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.21, 1.02, 0.73, 1] }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4"
            >
              <Link
                to="/login"
                className="group relative h-14 px-8 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold flex items-center justify-center gap-2.5 text-base transition-all duration-300 hover:scale-[1.03] w-full sm:w-auto shadow-[0_0_40px_rgba(16,185,129,0.25)] hover:shadow-[0_0_60px_rgba(16,185,129,0.4)] overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative flex items-center gap-2.5">
                  Start Selling Waste
                  <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </Link>

              <Link
                to="/login"
                className="group h-14 px-8 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm text-white font-semibold flex items-center justify-center gap-2 text-base transition-all duration-300 hover:scale-[1.03] hover:bg-white/[0.06] hover:border-emerald-400/25 w-full sm:w-auto"
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Explore Marketplace
              </Link>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="flex items-center gap-6 mt-12 pt-8 border-t border-white/[0.06]"
            >
              {[
                { val: '89+', label: 'Industries' },
                { val: '14.2k', label: 'Tons CO₂ Saved' },
                { val: '₹4.2M', label: 'Value Created' },
              ].map((item, i) => (
                <div key={i} className="text-center sm:text-left">
                  <div className="text-xl font-bold text-white">{item.val}</div>
                  <div className="text-[11px] text-slate-500 uppercase tracking-wider font-medium">{item.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-medium">Scroll</span>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.8, repeat: Infinity }}>
            <ChevronDown className="w-5 h-5 text-slate-500" />
          </motion.div>
        </motion.div>
      </motion.section>

      {/* ─── Stats Marquee ───────────────────────────────────────────── */}
      <section id="stats" className="relative py-8 border-y border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 transition-all duration-300 hover:bg-white/[0.04] hover:border-emerald-500/20"
                >
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${stat.accent}15`, border: `1px solid ${stat.accent}25` }}
                      >
                        <Icon size={14} style={{ color: stat.accent }} />
                      </div>
                    </div>
                    <div className="text-2xl md:text-3xl font-bold text-white mb-1">{stat.value}</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-semibold">{stat.label}</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Features Grid ───────────────────────────────────────────── */}
      <section id="features" className="py-24 lg:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] mb-6">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs text-slate-400 uppercase tracking-[0.2em] font-semibold">Why EcoMatch</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-5">
              <span className="bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
                Built for the Circular Economy
              </span>
            </h2>
            <p className="text-slate-500 max-w-lg mx-auto text-base leading-relaxed">
              Powerful tools to transform industrial waste management across India.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-4">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  onMouseEnter={() => setHoveredFeature(i)}
                  onMouseLeave={() => setHoveredFeature(null)}
                  className={`group relative rounded-3xl border border-white/[0.06] bg-white/[0.02] p-8 transition-all duration-500 hover:border-emerald-500/20 cursor-default overflow-hidden ${
                    hoveredFeature === i ? 'bg-white/[0.04]' : ''
                  }`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center mb-5 group-hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] transition-shadow duration-500">
                      <Icon className="w-5 h-5 text-emerald-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{feature.desc}</p>
                  </div>

                  {/* Corner glow */}
                  <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── How It Works ────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 lg:py-32 px-6 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.05),transparent_60%)]" />
        <div className="max-w-7xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] mb-6">
              <Recycle className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs text-slate-400 uppercase tracking-[0.2em] font-semibold">Process</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-5">
              <span className="bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
                Four Steps to Circularity
              </span>
            </h2>
            <p className="text-slate-500 max-w-lg mx-auto text-base">
              Join the circular supply chain in minutes, not months.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-6 relative">
            {/* Connection line */}
            <div className="hidden md:block absolute top-16 left-[12%] right-[12%] h-px">
              <div className="h-full bg-gradient-to-r from-emerald-500/0 via-emerald-500/20 to-emerald-500/0" />
              <motion.div
                className="absolute top-0 h-full w-24 bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent"
                animate={{ left: ['0%', '100%', '0%'] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>

            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.12 }}
                  className="group relative flex flex-col items-center text-center"
                >
                  <div className="relative mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-emerald-400 relative z-10 backdrop-blur-sm group-hover:border-emerald-500/25 group-hover:bg-emerald-500/10 transition-all duration-300 group-hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="absolute -top-2 -right-2 text-[10px] font-bold text-purple-500/50 tabular-nums">
                      {step.num}
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed max-w-[200px]">{step.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── CTA Section ─────────────────────────────────────────────── */}
      <section className="py-24 lg:py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative rounded-[2.5rem] border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-transparent overflow-hidden"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.12),transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(45,212,191,0.06),transparent_50%)]" />

            <div className="relative text-center px-8 py-16 lg:py-20">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(16,185,129,0.25)]">
                <Recycle className="w-8 h-8 text-white" />
              </div>

              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
                <span className="bg-gradient-to-b from-white to-slate-300 bg-clip-text text-transparent">
                  Ready to Close the Loop?
                </span>
              </h2>

              <p className="text-slate-400 max-w-md mx-auto mb-10 text-base leading-relaxed">
                Join India's fastest-growing circular economy network. Your waste is someone's raw material.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/login"
                  className="group relative h-14 px-10 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold flex items-center justify-center gap-2.5 transition-all duration-300 hover:scale-[1.03] shadow-[0_0_40px_rgba(16,185,129,0.25)] hover:shadow-[0_0_60px_rgba(16,185,129,0.4)] overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative flex items-center gap-2.5">
                    Get Started Free
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
                <Link
                  to="/login"
                  className="h-14 px-10 rounded-2xl border border-white/10 bg-white/[0.03] text-white font-semibold flex items-center justify-center transition-all duration-300 hover:bg-white/[0.06] hover:border-emerald-400/25 hover:scale-[1.03]"
                >
                  Contact Sales
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Premium Footer ───────────────────────────────────────────── */}
      <footer className="relative border-t border-white/[0.04] bg-[#030712] pt-20 pb-10 overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/4 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent shadow-[0_0_20px_rgba(52,211,153,0.5)]" />
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-40 bg-emerald-500/5 rounded-[100%] blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
            
            {/* Brand Column */}
            <div className="lg:col-span-4">
              <Link to="/" className="flex items-center gap-2.5 mb-6">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                  <Leaf className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  EcoMatch India
                </span>
              </Link>
              <p className="text-slate-400 text-sm leading-relaxed mb-8 max-w-sm">
                India's first AI-powered circular economy marketplace. Turning industrial waste into valuable resources through smart compliance and matchmaking.
              </p>
            </div>

            {/* Links Columns */}
            <div className="lg:col-span-2">
              <h4 className="text-white font-semibold mb-6">Platform</h4>
              <ul className="space-y-4">
                <li><a href="#how-it-works" className="text-slate-400 hover:text-emerald-400 text-sm transition-colors">How it Works</a></li>
                <li><a href="#features" className="text-slate-400 hover:text-emerald-400 text-sm transition-colors">AI Matching</a></li>
                <li><a href="#stats" className="text-slate-400 hover:text-emerald-400 text-sm transition-colors">ESG Tracking</a></li>
                <li><Link to="/login" className="text-slate-400 hover:text-emerald-400 text-sm transition-colors">Pricing</Link></li>
              </ul>
            </div>

            <div className="lg:col-span-2">
              <h4 className="text-white font-semibold mb-6">Resources</h4>
              <ul className="space-y-4">
                <li><Link to="/login" className="text-slate-400 hover:text-emerald-400 text-sm transition-colors">Case Studies</Link></li>
                <li><a href="#features" className="text-slate-400 hover:text-emerald-400 text-sm transition-colors">Waste Laws 2016</a></li>
                <li><Link to="/login" className="text-slate-400 hover:text-emerald-400 text-sm transition-colors">Blog</Link></li>
                <li><Link to="/login" className="text-slate-400 hover:text-emerald-400 text-sm transition-colors">Developer API</Link></li>
              </ul>
            </div>

            {/* Newsletter Column */}
            <div className="lg:col-span-4">
              <h4 className="text-white font-semibold mb-6">Stay Updated</h4>
              <p className="text-slate-400 text-sm mb-4">
                Get the latest news on circular economy laws and marketplace updates.
              </p>
              <form className="relative group" onSubmit={(e) => e.preventDefault()}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500 border-slate-200 dark:border-slate-700/50 transition-all"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1 bottom-1 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-900 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-white/[0.06] flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-sm">
              &copy; {new Date().getFullYear()} EcoMatch India. Built for a sustainable future.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-slate-500 hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="text-sm text-slate-500 hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="text-sm text-slate-500 hover:text-white transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
