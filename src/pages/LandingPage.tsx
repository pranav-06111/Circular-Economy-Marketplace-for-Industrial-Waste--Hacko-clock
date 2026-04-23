import { Link } from 'react-router-dom';
import { Leaf, ArrowRight, ShieldCheck, Factory, Globe, TrendingDown } from 'lucide-react';
import { motion } from 'motion/react';

export default function LandingPage() {
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
      <section className="relative pt-32 pb-20 px-6 overflow-hidden flex flex-col items-center text-center min-h-[90vh] justify-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs uppercase tracking-widest font-semibold mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Marketplace
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 max-w-4xl mx-auto leading-[1.1]">
            Turn Industrial Waste Into <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">Valuable Resources.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 font-light">
            AI-powered composition analysis, instant regulatory checks, and verified ESG anchoring for circular economy pioneers.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/login" className="h-14 px-8 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center gap-2 text-lg transition-all w-full sm:w-auto justify-center group">
              Start Offloading
              <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="border-y border-slate-800/50 bg-slate-900/50 px-6 py-12">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: "1,243", label: "Tons Diverted This Month" },
            { value: "89", label: "Industries Joined" },
            { value: "14.2k", label: "Tons CO₂ Saved" },
            { value: "₹4.2M", label: "Value Unlocked" }
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.value}</div>
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">{stat.label}</div>
            </div>
          ))}
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
