"use client"

import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import toast from "react-hot-toast"
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
  Plus,
} from "lucide-react"

type CardProps = {
  icon: LucideIcon
  title: string
  value: string | number
  sub: string
}

const Card: React.FC<CardProps> = ({ icon: Icon, title, value, sub }) => {
  return (
    <div className="p-5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 dark:backdrop-blur-xl hover:scale-[1.03] transition-all duration-300 ease-in-out shadow-sm dark:hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]">
      <div className="flex items-center justify-between mb-3">
        <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/20 dark:shadow-[0_0_15px_rgba(16,185,129,0.4)]">
          <Icon className="w-5 h-5 text-purple-500" />
        </div>
      </div>
      <h3 className="text-sm text-gray-600 dark:text-gray-400">{title}</h3>
      <p className="text-2xl font-bold mt-1">{value}</p>
      <p className="text-xs text-purple-500 mt-1">{sub}</p>
    </div>
  )
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMyListings = async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await axios.get('/api/listings/my', {
          headers: { Authorization: `Bearer ${token}` }
        })
        setListings(res.data.listings)
      } catch (error: any) {
        console.error("Failed to fetch listings:", error)
        toast.error(`Error: ${error.response?.status || 'Unknown'} - ${error.response?.data?.error || error.message}`)
      } finally {
        setLoading(false)
      }
    }
    fetchMyListings()
  }, [])

  // Calculate dynamic stats
  const totalQuantity = listings.reduce((acc, curr) => acc + Number(curr.quantity || 0), 0)
  const totalCo2 = listings.reduce((acc, curr) => acc + Number(curr.co2Savings || 0), 0)
  const estRevenue = listings.reduce((acc, curr) => acc + Number(curr.logisticsEstimate || 0), 0)
  const totalCarbonCredits = listings.reduce((acc, curr) => acc + (curr.isHazardous ? 0.5 : 2.5), 0); // Mock logic for credits
  const activeListings = listings.filter(l => l.status === 'Active' || l.status === 'Available').length

  return (
    <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              Waste Intelligence Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track, match, and monetize your industrial waste
            </p>
          </div>
          <button 
            onClick={() => navigate('/offload')}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 dark:bg-gradient-to-r dark:from-emerald-500 dark:to-green-500 dark:text-white font-bold px-6 py-2.5 rounded-xl transition-all duration-300 ease-in-out shadow-sm dark:shadow-[0_0_20px_rgba(16,185,129,0.5)] hover:scale-[1.03] flex items-center"
          >
            <Plus size={20} className="mr-2" /> List New Waste
          </button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card
            icon={Package}
            title="Total Waste Listed"
            value={`${totalQuantity.toFixed(1)}`}
            sub="Lifetime units"
          />
          <Card
            icon={TrendingUp}
            title="Active Listings"
            value={activeListings}
            sub="Ready to match"
          />
          <Card
            icon={Leaf}
            title="CO₂ Saved"
            value={`${totalCo2.toFixed(1)}t`}
            sub="Environmental impact"
          />
          <Card
            icon={TrendingUp}
            title="Carbon Credits"
            value={totalCarbonCredits.toFixed(1)}
            sub="ESG Generation"
          />
          <Card
            icon={DollarSign}
            title="Logistics Value"
            value={`₹${estRevenue.toLocaleString()}`}
            sub="AI Est. Savings"
          />
        </div>

        {/* Content */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* My Listings */}
          <div className="lg:col-span-2 bg-white dark:bg-white/5 dark:backdrop-blur-xl p-6 rounded-xl border border-gray-200 dark:border-white/10">
            <h2 className="text-lg font-semibold mb-4 flex justify-between items-center">
              <span>My Recent Listings</span>
            </h2>

            {loading ? (
              <div className="text-sm text-slate-500 py-4">Loading your data...</div>
            ) : listings.length === 0 ? (
              <div className="text-sm text-slate-500 py-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                You haven't listed any waste yet.<br/>
                <button onClick={() => navigate('/offload')} className="mt-2 text-purple-500 hover:underline">Click here to start.</button>
              </div>
            ) : (
              <ul className="space-y-4">
                {listings.slice(0, 5).map((listing, i) => (
                  <li key={i} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-100 dark:border-white/10 gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${listing.status === 'Matched' ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white">{listing.wasteType}</div>
                        <div className="text-xs text-slate-500">{listing.quantity} {listing.unit} • {listing.location}</div>
                      </div>
                    </div>
                    <div className="text-xs text-right">
                       <span className="bg-white dark:bg-white/5 px-2 py-1 rounded border border-slate-200 dark:border-white/10 shadow-sm block mb-1">
                         {listing.status || 'Active'}
                       </span>
                       <span className="text-purple-500 font-medium">{listing.co2Savings}t CO₂</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Right Side */}
          <div className="space-y-6">

            {/* Smart Actions */}
            <div className="bg-white dark:bg-white/5 dark:backdrop-blur-xl p-6 rounded-xl border border-gray-200 dark:border-white/10">
              <h2 className="text-lg font-semibold mb-4">
                Smart Actions
              </h2>

              <div className="space-y-3">
                <button onClick={() => navigate('/ai-matcher')} className="w-full p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 text-left hover:scale-[1.02] transition-transform">
                  <div className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center"><TrendingUp size={16} className="mr-2"/> AI Matcher</div>
                  <div className="text-xs text-emerald-600/80 dark:text-emerald-400/80 mt-1">Find buyers instantly for your listings.</div>
                </button>
              </div>
            </div>

            {/* Compliance */}
            <div className="bg-white dark:bg-white/5 dark:backdrop-blur-xl p-6 rounded-xl border border-gray-200 dark:border-white/10">
              <h2 className="text-lg font-semibold mb-4">
                Compliance Status
              </h2>

              <div className="space-y-3 text-sm font-medium">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Hazardous Listings</span>
                  <span className="text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30 px-2 py-1 rounded-md">
                    {listings.filter(l => l.isHazardous).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Non-Hazardous</span>
                  <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-md">
                    {listings.filter(l => !l.isHazardous).length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

    </div>
  )
}

export default Dashboard
