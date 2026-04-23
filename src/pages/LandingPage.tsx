import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  Clock3,
  Factory,
  Globe,
  Leaf,
  Package,
  Recycle,
  ShieldCheck,
  Sparkles,
  TrendingDown,
} from 'lucide-react';
import { motion } from 'motion/react';

const stats = [
  { value: '1,243', label: 'Tons Diverted This Month', icon: Recycle },
  { value: '89', label: 'Industries Joined', icon: Factory },
  { value: '14.2k', label: 'Tons CO₂ Saved', icon: TrendingDown },
  { value: '₹4.2M', label: 'Value Unlocked', icon: BadgeCheck },
  { value: '< 2 min', label: 'Avg Match Time', icon: Clock3 },
];

const wasteTypes = [
  { name: 'Plastic Waste', buyers: 12, tone: 'from-emerald-400/20 to-teal-300/10', position: 'left-6 top-10' },
  { name: 'Metal Scrap', buyers: 8, tone: 'from-sky-400/20 to-cyan-300/10', position: 'right-6 top-20' },
  { name: 'E-Waste', buyers: 6, tone: 'from-violet-400/20 to-fuchsia-300/10', position: 'left-10 bottom-24' },
  { name: 'Organic Sludge', buyers: 4, tone: 'from-amber-400/20 to-orange-300/10', position: 'right-10 bottom-12' },
];

export default function LandingPage() {
  const [hoveredWaste, setHoveredWaste] = useState(0);
  const [ctaBurst, setCtaBurst] = useState(false);

  const triggerBurst = () => {
    setCtaBurst(true);
    window.setTimeout(() => setCtaBurst(false), 900);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-emerald-500/30">
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800/50 absolute top-0 w-full z-10 glass-nav">
        <div className="flex items-center gap-2">
          <Leaf className="text-emerald-500 w-6 h-6" />
          <span className="font-bold text-xl tracking-tight">EcoMatch India</span>
        </div>
        <nav className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-medium hover:text-emerald-400 transition-colors">Sign In</Link>
          <Link to="/login" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm px-4 py-2 rounded-full transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            Get Started
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative isolate overflow-hidden pt-28 pb-10 px-6 min-h-[92vh] flex items-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.16),transparent_36%),radial-gradient(circle_at_right,rgba(45,212,191,0.10),transparent_28%),linear-gradient(180deg,rgba(2,6,23,0.0),rgba(2,6,23,0.55))]" />
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute left-12 top-24 h-2 w-2 rounded-full bg-emerald-400/80 shadow-[0_0_30px_rgba(16,185,129,0.7)]"
            animate={{ y: [0, -16, 0], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute right-20 top-40 h-3 w-3 rounded-full bg-teal-300/70 shadow-[0_0_24px_rgba(45,212,191,0.6)]"
            animate={{ y: [0, 18, 0], x: [0, -8, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-24 left-[40%] h-1.5 w-1.5 rounded-full bg-emerald-300/70"
            animate={{ y: [0, -14, 0], opacity: [0.35, 0.9, 0.35] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-emerald-500/10 rounded-full blur-[130px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto w-full grid lg:grid-cols-[1.08fr_0.92fr] gap-14 lg:gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: 'easeOut' }}
            className="text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs uppercase tracking-[0.28em] font-semibold mb-8">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Marketplace
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-[5.15rem] font-bold tracking-tight mb-6 max-w-3xl mx-auto lg:mx-0 leading-[0.92] text-balance">
              Turn Industrial Waste
              <span className="block">Into <span className="text-emerald-300">Valuable Resources</span></span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-300/90 max-w-2xl mx-auto lg:mx-0 mb-10 font-medium leading-relaxed text-balance">
              Find verified buyers. Ensure compliance. Track impact in one platform.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-5">
              <Link
                to="/login"
                onClick={triggerBurst}
                className="group relative h-16 px-9 rounded-full bg-emerald-500 text-slate-950 font-bold flex items-center justify-center gap-2 text-lg transition-all duration-300 hover:scale-[1.05] hover:bg-emerald-400 w-full sm:w-auto shadow-[0_0_0_1px_rgba(16,185,129,0.25),0_0_35px_rgba(16,185,129,0.28)] hover:shadow-[0_0_0_1px_rgba(16,185,129,0.35),0_0_50px_rgba(16,185,129,0.45)] overflow-hidden"
              >
                <motion.span
                  className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-70"
                  animate={{ x: ['-120%', '240%'] }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                />
                <span className="relative flex items-center gap-2">
                  Start Selling Waste Now
                  <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </Link>

              <Link
                to="/login"
                className="h-16 px-9 rounded-full border border-white/14 bg-white/4 backdrop-blur-sm text-white font-semibold flex items-center justify-center gap-2 text-lg transition-all duration-300 hover:scale-[1.05] hover:bg-white/8 hover:border-emerald-400/30 w-full sm:w-auto"
              >
                Explore Marketplace
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24, rotateY: -8 }}
            animate={{ opacity: 1, y: 0, rotateY: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.08 }}
            className="relative mx-auto lg:ml-auto w-full max-w-xl perspective-[1400px]"
          >
            <div className="absolute -left-12 top-1/2 hidden lg:block h-px w-24 bg-gradient-to-r from-emerald-400/0 via-emerald-400/70 to-emerald-400/0">
              <motion.span
                className="absolute -top-[3px] left-0 h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_24px_rgba(110,231,183,0.95)]"
                animate={ctaBurst ? { x: [0, 92, 170], opacity: [0, 1, 0] } : { opacity: 0.8 }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
              />
            </div>

            <motion.div
              className="relative rounded-[2rem] border border-white/10 bg-slate-900/55 backdrop-blur-xl shadow-[0_30px_100px_rgba(2,6,23,0.55)] p-5 sm:p-6 overflow-hidden"
              animate={{ rotateX: [2, -2, 2], rotateY: [-4, 4, -4], y: [0, -8, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.14),transparent_42%)]" />
              <div className="relative aspect-[4/5] sm:aspect-[5/6] rounded-[1.6rem] border border-white/10 bg-slate-950/70 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.13),transparent_34%),linear-gradient(180deg,rgba(15,23,42,0.2),rgba(2,6,23,0.9))]" />

                {ctaBurst &&
                  [0, 45, 90, 135].map((angle, index) => (
                    <motion.span
                      key={angle}
                      className="absolute left-1/2 top-1/2 h-px origin-left bg-gradient-to-r from-emerald-400/0 via-emerald-300 to-emerald-400/0"
                      style={{ width: '9rem', rotate: `${angle}deg` }}
                      initial={{ scaleX: 0, opacity: 0 }}
                      animate={{ scaleX: [0, 1.25, 0], opacity: [0, 1, 0] }}
                      transition={{ duration: 0.9, ease: 'easeOut', delay: index * 0.03 }}
                    />
                  ))}

                <motion.div
                  className="absolute inset-10 rounded-full border border-emerald-400/15"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
                />
                <motion.div
                  className="absolute inset-16 rounded-full border border-dashed border-teal-300/20"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 34, repeat: Infinity, ease: 'linear' }}
                />

                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-x-12 top-1/2 h-px bg-gradient-to-r from-emerald-400/0 via-emerald-400/25 to-emerald-400/0" />
                  <div className="absolute inset-y-14 left-1/2 w-px bg-gradient-to-b from-emerald-400/0 via-emerald-400/20 to-emerald-400/0" />
                </div>

                <motion.div
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center z-10"
                  animate={{ scale: [1, 1.03, 1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <div className="relative w-24 h-24 rounded-full bg-emerald-500/15 border border-emerald-400/20 backdrop-blur-md flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.18)]">
                    <Recycle className="w-10 h-10 text-emerald-300" />
                    <Sparkles className="w-4 h-4 text-teal-200 absolute -top-1 -right-1" />
                  </div>
                  <div className="mt-4 text-center">
                    <div className="text-sm font-semibold text-white">Verified matches</div>
                    <div className="text-xs text-slate-400">buyers • compliance • impact</div>
                  </div>
                </motion.div>

                {wasteTypes.map((waste, index) => {
                  const Icon = Package;
                  return (
                    <motion.button
                      key={waste.name}
                      type="button"
                      onMouseEnter={() => setHoveredWaste(index)}
                      onFocus={() => setHoveredWaste(index)}
                      onMouseLeave={() => setHoveredWaste(0)}
                      className={`absolute ${waste.position} group rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-left backdrop-blur-md shadow-[0_20px_50px_rgba(2,6,23,0.35)] transition-all duration-300 hover:scale-105 hover:-translate-y-1 ${index === hoveredWaste ? 'ring-1 ring-emerald-400/30 shadow-[0_0_30px_rgba(16,185,129,0.18)]' : ''}`}
                    >
                      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${waste.tone} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                      <div className="relative flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/6 border border-white/10 flex items-center justify-center text-emerald-300">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white">{waste.name}</div>
                          <div className="text-xs text-slate-300">Matched with {waste.buyers} buyers near you</div>
                        </div>
                      </div>

                      {index === hoveredWaste && (
                        <motion.div
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute -top-11 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-emerald-400/20 bg-slate-950/95 px-3 py-1 text-[11px] font-medium text-emerald-200 shadow-[0_10px_30px_rgba(16,185,129,0.15)]"
                        >
                          Matched with {waste.buyers} buyers near you
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}

                <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-xs uppercase tracking-[0.24em] text-slate-400 mb-1">Live impact</div>
                      <div className="text-lg font-semibold text-white">{wasteTypes[hoveredWaste].name}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-emerald-300">{wasteTypes[hoveredWaste].buyers} active buyers</div>
                      <div className="text-xs text-slate-400">Verified compliance-ready demand</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative px-6 -mt-8 pb-10">
        <div className="max-w-7xl mx-auto rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_24px_80px_rgba(2,6,23,0.28)] px-6 py-7 lg:px-8 lg:py-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="rounded-2xl border border-white/8 bg-slate-950/25 px-4 py-5">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-400/15 bg-emerald-500/10 text-emerald-300">
                    <Icon size={18} />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-white leading-none mb-2">{stat.value}</div>
                  <div className="text-[11px] text-slate-300 uppercase tracking-[0.22em] font-semibold">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">How It Works</h2>
          <p className="text-slate-400">Join the circular supply chain in 4 simple steps.</p>
        </div>

        <div className="grid md:grid-cols-4 gap-8 relative">
          <div className="hidden md:block absolute top-[28px] left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-emerald-500/0 via-emerald-500/20 to-emerald-500/0" />
          {[
            { icon: Factory, title: "1. List Waste", desc: "Upload photos and details of your industrial byproducts." },
            { icon: ShieldCheck, title: "2. AI Analysis", desc: "Our AI agents check composition & Hazardous Waste Rules compliance." },
            { icon: Globe, title: "3. Smart Match", desc: "Get matched with verified recyclers and raw-material buyers." },
            { icon: TrendingDown, title: "4. ESG Anchor", desc: "Logistics estimated and impact anchored on Blockchain." }
          ].map((step, i) => (
            <div key={i} className="relative flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6 text-emerald-400 relative z-10 backdrop-blur-sm">
                <step.icon />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
              <p className="text-sm text-slate-400">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-800 mt-20 py-8 text-center text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} EcoMatch India. Hackathon MVP.</p>
      </footer>
    </div>
  );
}
