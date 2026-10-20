'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PlusCircle, Users, CheckCircle, Clock, ExternalLink, Sparkles, ArrowRight } from 'lucide-react'

export default function AdminDashboard() {
  const [sites, setSites] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadSites() {
      try {
        const res = await fetch('/api/admin/sites')
        const data = await res.json()
        setSites(data.sites || [])
      } catch (err) {
        console.error('Failed to load sites:', err)
      } finally {
        setLoading(false)
      }
    }
    loadSites()
  }, [])

  const totalSites = sites.length
  const liveSites = sites.filter(s => s.status === 'live').length
  const draftSites = sites.filter(s => s.status === 'draft').length
  const targetClients = 50
  const progressPercent = Math.min(Math.round((liveSites / targetClients) * 100), 100)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl text-white font-semibold tracking-tight">
            ShubhoBiye Dashboard
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Operator Console • Manage client wedding sites & intake pipeline
          </p>
        </div>

        <Link
          href="/admin/sites/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#A67C52] to-[#8C643E] hover:from-[#B88B5E] hover:to-[#9C7046] text-white text-sm font-medium rounded-xl shadow-lg shadow-[#A67C52]/20 transition-all duration-300 shrink-0"
        >
          <PlusCircle size={18} />
          New Client Intake
        </Link>
      </div>

      {/* Target Progress Bar (0 to 50 Clients) */}
      <div className="p-6 bg-gradient-to-r from-zinc-900 to-zinc-950 border border-white/10 rounded-2xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[#D4A574]" />
            <span className="text-sm font-medium text-white">V1 Growth Milestone: First 50 Clients</span>
          </div>
          <span className="text-xs font-semibold text-[#D4A574] px-2.5 py-1 bg-[#A67C52]/20 rounded-full">
            {liveSites} / {targetClients} Clients ({progressPercent}%)
          </span>
        </div>
        <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#A67C52] via-[#D4A574] to-emerald-500 transition-all duration-500 rounded-full"
            style={{ width: `${Math.max(progressPercent, 4)}%` }}
          />
        </div>
        <p className="text-xs text-zinc-500 mt-2">
          Keep monthly cost at $0 until reaching 50 paying couples.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 bg-zinc-900/60 border border-white/5 rounded-2xl">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs uppercase tracking-wider font-medium">Total Sites</span>
            <Users size={18} className="text-zinc-500" />
          </div>
          <div className="font-display text-3xl font-semibold text-white">
            {loading ? '...' : totalSites}
          </div>
        </div>

        <div className="p-6 bg-zinc-900/60 border border-white/5 rounded-2xl">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs uppercase tracking-wider font-medium">Live Sites</span>
            <CheckCircle size={18} className="text-emerald-400" />
          </div>
          <div className="font-display text-3xl font-semibold text-emerald-400">
            {loading ? '...' : liveSites}
          </div>
        </div>

        <div className="p-6 bg-zinc-900/60 border border-white/5 rounded-2xl">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs uppercase tracking-wider font-medium">Drafts</span>
            <Clock size={18} className="text-amber-400" />
          </div>
          <div className="font-display text-3xl font-semibold text-amber-400">
            {loading ? '...' : draftSites}
          </div>
        </div>
      </div>

      {/* Recent Sites */}
      <div className="bg-zinc-900/40 border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h2 className="font-display text-xl text-white font-medium">
            Recent Wedding Sites
          </h2>
          <Link
            href="/admin/sites"
            className="text-xs text-[#D4A574] hover:underline flex items-center gap-1"
          >
            View All Sites <ArrowRight size={14} />
          </Link>
        </div>

        <div className="divide-y divide-white/5">
          {loading ? (
            <div className="p-8 text-center text-zinc-500 text-sm">Loading sites...</div>
          ) : sites.length === 0 ? (
            <div className="p-12 text-center text-zinc-500 space-y-3">
              <p>No wedding sites created yet.</p>
              <Link
                href="/admin/sites/new"
                className="inline-block text-xs text-[#D4A574] underline"
              >
                Start your first client intake →
              </Link>
            </div>
          ) : (
            sites.slice(0, 5).map((site) => (
              <div
                key={site.id}
                className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-display text-lg text-white font-medium">
                      {site.owner_name || site.slug}
                    </span>
                    <span
                      className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full ${
                        site.status === 'live'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : site.status === 'expired'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {site.status}
                    </span>
                  </div>
                  <div className="text-xs text-zinc-500 font-mono">
                    /s/{site.slug}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    href={`/s/${site.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs rounded-lg transition-colors"
                  >
                    <span>View Site</span>
                    <ExternalLink size={13} />
                  </Link>
                  <Link
                    href={`/admin/sites/${site.id}`}
                    className="px-3 py-1.5 bg-[#A67C52]/20 hover:bg-[#A67C52]/30 text-[#D4A574] border border-[#A67C52]/40 text-xs rounded-lg transition-colors font-medium"
                  >
                    Edit / Moderate
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
