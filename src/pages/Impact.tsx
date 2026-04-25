import React from 'react';
import { 
  Leaf, 
  TrendingUp, 
  Package, 
  DollarSign, 
  ChevronDown, 
  TreeDeciduous, 
  Car, 
  Zap, 
  Calendar,
  CheckCircle2,
  ArrowRight,
  BarChart3,
  Globe
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts';
import { Link } from 'react-router-dom';

const lineData = [
  { name: 'Jan', co2: 400, waste: 240 },
  { name: 'Feb', co2: 600, waste: 300 },
  { name: 'Mar', co2: 800, waste: 450 },
  { name: 'Apr', co2: 1100, waste: 600 },
  { name: 'May', co2: 1300, waste: 750 },
  { name: 'Jun', co2: 1700, waste: 900 },
  { name: 'Jul', co2: 2100, waste: 1100 },
  { name: 'Aug', co2: 2500, waste: 1400 },
  { name: 'Sep', co2: 3200, waste: 1700 },
  { name: 'Oct', co2: 3800, waste: 1950 },
  { name: 'Nov', co2: 4400, waste: 2150 },
  { name: 'Dec', co2: 5200, waste: 2341 },
];

const pieData = [
  { name: 'Plastic', value: 850, color: '#10b981' },
  { name: 'Metal', value: 620, color: '#6366f1' },
  { name: 'Paper', value: 410, color: '#f59e0b' },
  { name: 'E-Waste', value: 290, color: '#8b5cf6' },
  { name: 'Glass', value: 171, color: '#3b82f6' },
];

const categoryData = [
  { name: 'Plastic', co2: '4.2K', waste: '850', progress: 85, color: 'emerald' },
  { name: 'Metal', co2: '3.8K', waste: '620', progress: 72, color: 'indigo' },
  { name: 'Paper', co2: '2.5K', waste: '410', progress: 55, color: 'amber' },
  { name: 'E-Waste', co2: '2.1K', waste: '290', progress: 40, color: 'violet' },
  { name: 'Glass', co2: '1.6K', waste: '171', progress: 28, color: 'blue' },
];

const milestones = [
  { 
    title: '10K Tons CO₂ Saved', 
    desc: 'Equivalent to planting 450,000 trees.', 
    date: 'March 12, 2026',
    icon: Leaf,
    color: 'emerald'
  },
  { 
    title: '2K Tons Waste Diverted', 
    desc: 'Milestone reached across 15 industrial sectors.', 
    date: 'February 28, 2026',
    icon: Globe,
    color: 'blue'
  },
  { 
    title: '50 Orders Completed', 
    desc: 'Seamless circular economy transactions verified.', 
    date: 'January 15, 2026',
    icon: CheckCircle2,
    color: 'indigo'
  },
];

export default function Impact() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-cyan-500">Your Impact</h1>
          <p className="text-slate-500 dark:text-gray-400 font-medium">Track the positive change you’re creating for the environment.</p>
        </div>
        <div className="relative inline-block">
          <button className="flex items-center space-x-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:border-emerald-500/50 transition-colors group">
            <Calendar size={16} className="text-slate-400 group-hover:text-emerald-500 transition-colors" />
            <span>Last 12 Months</span>
            <ChevronDown size={16} className="text-slate-400" />
          </button>
        </div>
      </div>

      {/* Impact Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'CO₂ Saved', value: '14.2K tons', sub: '+18% from last year', icon: Leaf, color: 'emerald' },
          { title: 'Waste Diverted', value: '2,341 tons', sub: '+16%', icon: Globe, color: 'blue' },
          { title: 'Orders Completed', value: '83', sub: '+22%', icon: Package, color: 'indigo' },
          { title: 'Total Value Saved', value: '₹4,56,750', sub: '+20%', icon: DollarSign, color: 'amber' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 group">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${
                  stat.color === 'emerald' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' :
                  stat.color === 'blue' ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' :
                  stat.color === 'indigo' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400' :
                  'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
                }`}>
                  <Icon size={24} />
                </div>
                <div className="text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-lg">
                  {stat.sub.split(' ')[0]}
                </div>
              </div>
              <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">{stat.title}</div>
              <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{stat.value}</div>
              <div className="mt-2 text-xs text-slate-400 font-medium">
                {stat.sub.includes('year') ? stat.sub : `${stat.sub} from last period`}
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center">
              <TrendingUp size={18} className="mr-2 text-emerald-500" />
              Impact Over Time
            </h3>
            <div className="flex items-center space-x-4">
               <div className="flex items-center text-xs font-bold text-slate-500">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full mr-1.5"></div>
                  CO₂ Saved
               </div>
               <div className="flex items-center text-xs font-bold text-slate-500">
                  <div className="w-3 h-3 bg-indigo-500 rounded-full mr-1.5"></div>
                  Waste Diverted
               </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fontWeight: 600, fill: '#94a3b8' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fontWeight: 600, fill: '#94a3b8' }} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: 'none', 
                    borderRadius: '12px', 
                    color: '#fff',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                  itemStyle={{ fontWeight: 700 }}
                  cursor={{ stroke: '#10b981', strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="co2" 
                  stroke="#10b981" 
                  strokeWidth={4} 
                  dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="waste" 
                  stroke="#6366f1" 
                  strokeWidth={4} 
                  dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 dark:text-white mb-8 flex items-center">
            <BarChart3 size={18} className="mr-2 text-indigo-500" />
            Impact Breakdown
          </h3>
          <div className="h-[300px] w-full relative">
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
               <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">2,341</span>
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Tons Diverted</span>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={85}
                  outerRadius={110}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: 'none', 
                    borderRadius: '12px', 
                    color: '#fff'
                  }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  align="center" 
                  iconType="circle"
                  formatter={(value) => <span className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Environmental Equivalents */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col">
          <h3 className="font-bold text-slate-900 dark:text-white mb-6 uppercase text-xs tracking-widest">Environmental Equivalents</h3>
          <div className="space-y-6 flex-1 flex flex-col justify-center">
            {[
              { icon: TreeDeciduous, label: 'Trees Planted', value: '1,245', desc: 'Equivalent forest area offset.', color: 'emerald' },
              { icon: Car, label: 'Car Emissions Avoided', value: '9,850 km', desc: 'Typical passenger vehicle miles.', color: 'blue' },
              { icon: Zap, label: 'Energy Saved', value: '2.8M kWh', desc: 'Powering local communities.', color: 'amber' },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="flex items-center justify-between group">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-xl group-hover:scale-110 transition-transform ${
                      item.color === 'emerald' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10' :
                      item.color === 'blue' ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10' :
                      'bg-amber-50 text-amber-600 dark:bg-amber-500/10'
                    }`}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white leading-none mb-1">{item.label}</div>
                      <div className="text-2xl font-black text-slate-900 dark:text-white">{item.value}</div>
                    </div>
                  </div>
                  <div className="max-w-[120px] text-right">
                    <p className="text-[10px] font-medium text-slate-400 leading-tight">{item.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Milestones */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 dark:text-white mb-6 uppercase text-xs tracking-widest">Recent Milestones</h3>
          <div className="relative space-y-8 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
            {milestones.map((m, i) => {
              const Icon = m.icon;
              return (
                <div key={i} className="relative pl-12 group">
                  <div className={`absolute left-0 top-0 w-10 h-10 rounded-full flex items-center justify-center z-10 border-4 border-white dark:border-slate-900 transition-colors ${
                    m.color === 'emerald' ? 'bg-emerald-500 text-white' :
                    m.color === 'blue' ? 'bg-blue-500 text-white' :
                    'bg-indigo-500 text-white'
                  }`}>
                    <Icon size={16} />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">{m.title}</h4>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{m.date.split(',')[1].trim()}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium mb-1">{m.desc}</p>
                    <span className="text-[10px] font-bold text-slate-400">{m.date}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Top Category Breakdown */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
           <h3 className="font-bold text-slate-900 dark:text-white mb-6 uppercase text-xs tracking-widest">Category Impact</h3>
           <div className="space-y-6">
              {categoryData.map((cat, i) => (
                <div key={i} className="space-y-2">
                   <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{cat.name}</span>
                      <div className="flex items-center space-x-3 text-[10px] font-bold">
                         <span className="text-emerald-500">{cat.co2} CO₂</span>
                         <span className="text-slate-400">{cat.waste} tons</span>
                      </div>
                   </div>
                   <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${
                          cat.color === 'emerald' ? 'bg-emerald-500' :
                          cat.color === 'indigo' ? 'bg-indigo-500' :
                          cat.color === 'amber' ? 'bg-amber-500' :
                          cat.color === 'violet' ? 'bg-violet-500' :
                          'bg-blue-500'
                        }`}
                        style={{ width: `${cat.progress}%` }}
                      ></div>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* CTA Banner */}
      <div className="bg-emerald-600 dark:bg-gradient-to-r dark:from-emerald-600 dark:to-green-700 rounded-3xl p-8 md:p-12 relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-10 -translate-y-10 group-hover:translate-x-5 group-hover:-translate-y-5 transition-transform duration-700">
            <Globe size={300} />
         </div>
         <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center space-x-2 bg-emerald-500/20 backdrop-blur-md px-3 py-1 rounded-full text-emerald-100 text-xs font-bold mb-6">
               <Leaf size={14} />
               <span>Scaling the Circular Economy</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">Keep Growing Your Impact</h2>
            <p className="text-emerald-50 text-lg font-medium mb-8 leading-relaxed">
              Every match, every order, and every ton of waste diverted from landfills makes a measurable difference in our global carbon footprint.
            </p>
            <Link 
              to="/buyer-dashboard" 
              className="bg-white text-emerald-600 px-8 py-3.5 rounded-xl font-bold hover:bg-emerald-50 transition-all shadow-xl hover:shadow-2xl hover:scale-[1.05] inline-flex items-center group/btn"
            >
              Browse Waste Resources
              <ArrowRight size={18} className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
            </Link>
         </div>

         {/* Small floating elements for visual interest */}
         <div className="absolute bottom-10 right-10 hidden lg:flex items-center space-x-12 opacity-40 text-white">
            <div className="flex flex-col items-center">
               <Leaf size={48} />
            </div>
            <div className="flex flex-col items-center">
               <BarChart3 size={48} />
            </div>
            <div className="flex flex-col items-center">
               <Globe size={48} />
            </div>
         </div>
      </div>
    </div>
  );
}
