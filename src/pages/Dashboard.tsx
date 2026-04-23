"use client"

import React from "react"
import {
  Home,
  Package,
  TrendingUp,
  Users,
  BarChart3,
  Settings,
  Truck,
  Leaf,
  DollarSign,
  LucideIcon,
} from "lucide-react"

type SidebarItem = {
  icon: LucideIcon
  label: string
}

const sidebarItems: SidebarItem[] = [
  { icon: Home, label: "Dashboard" },
  { icon: Package, label: "Waste Listings" },
  { icon: TrendingUp, label: "Smart Matches" },
  { icon: Users, label: "Buyers" },
  { icon: Truck, label: "Logistics" },
  { icon: BarChart3, label: "Analytics" },
  { icon: Settings, label: "Compliance" },
]

type CardProps = {
  icon: LucideIcon
  title: string
  value: string
  sub: string
}

const Card: React.FC<CardProps> = ({ icon: Icon, title, value, sub }) => {
  return (
    <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:scale-[1.02] transition-all duration-300 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
          <Icon className="w-5 h-5 text-emerald-500" />
        </div>
      </div>
      <h3 className="text-sm text-gray-600 dark:text-gray-400">{title}</h3>
      <p className="text-2xl font-bold mt-1">{value}</p>
      <p className="text-xs text-emerald-500 mt-1">{sub}</p>
    </div>
  )
}

const Dashboard: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 dark:from-gray-950 dark:to-emerald-950/30 text-gray-900 dark:text-gray-100 font-sans">

      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-4">
        <h2 className="text-xl font-bold mb-6 text-emerald-600 flex items-center gap-2">
          <Leaf className="w-6 h-6" />
          EcoMatch
        </h2>

        <div className="space-y-2">
          {sidebarItems.map((item, i) => (
            <button
              key={i}
              className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400"
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Waste Intelligence Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track, match, and monetize your industrial waste
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card
            icon={Package}
            title="Total Waste Listed"
            value="1,243 tons"
            sub="+12% this week"
          />
          <Card
            icon={TrendingUp}
            title="Active Matches"
            value="89"
            sub="+5 today"
          />
          <Card
            icon={Leaf}
            title="CO₂ Saved"
            value="14.2k tons"
            sub="Environmental impact"
          />
          <Card
            icon={DollarSign}
            title="Revenue Generated"
            value="₹4.2M"
            sub="From waste trading"
          />
        </div>

        {/* Content */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-semibold mb-4">
              Recent Activity
            </h2>

            <ul className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
              <li className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-emerald-500"></div>Plastic waste matched with Chennai recycler</li>
              <li className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-emerald-500"></div>Metal scrap sold to JSW</li>
              <li className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-emerald-500"></div>New buyer registered from Bangalore</li>
              <li className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-emerald-500"></div>Compliance verified for chemical batch</li>
              <li className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-emerald-500"></div>Logistics scheduled for pickup</li>
            </ul>
          </div>

          {/* Right Side */}
          <div className="space-y-6">

            {/* AI Matches */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-semibold mb-4">
                Smart AI Matches
              </h2>

              <div className="space-y-3 text-sm">
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30">
                  <div className="font-medium text-gray-900 dark:text-gray-100">Plastic Waste → Cement Industry</div>
                  <div className="text-xs text-gray-500 mt-1">92% match • 120 km</div>
                </div>

                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30">
                  <div className="font-medium text-gray-900 dark:text-gray-100">Metal Scrap → Steel Plant</div>
                  <div className="text-xs text-gray-500 mt-1">96% match • 80 km</div>
                </div>
              </div>
            </div>

            {/* Compliance */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-semibold mb-4">
                Compliance Status
              </h2>

              <div className="space-y-3 text-sm font-medium">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Approved</span>
                  <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-md">3</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Pending</span>
                  <span className="text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30 px-2 py-1 rounded-md">1</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Rejected</span>
                  <span className="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded-md">0</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </main>
    </div>
  )
}

export default Dashboard
