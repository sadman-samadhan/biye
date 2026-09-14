'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PlusCircle, Search, ExternalLink, Trash2, Edit3, RotateCcw, AlertTriangle } from 'lucide-react'

export default function AdminSitesPage() {
  const [sites, setSites] = useState([])
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)

  const fetchSites = async () => {
    try {
      const res = await fetch('/api/admin/sites')
      const data = await res.json()
      setSites(data.sites || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSites()
  }, [])

  const handleStatusToggle = async (id, currentStatus) => {
    if (currentStatus === 'archived') {
      handleRestore(id)
      return
    }
    const nextStatus = currentStatus === 'live' ? 'draft' : 'live'
    try {
      await fetch(`/api/admin/sites/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      })
      fetchSites()
    } catch (err) {
      console.error('Failed to update status:', err)
    }
  }

  const handleSoftDelete = async (id, slug) => {
    if (!confirm(`Move wedding site "${slug}" to Trash? It will enter a Preview/Archived state and can be restored or permanently purged later.`)) {
      return
    }

    try {
      setActionLoading(id)
      await fetch(`/api/admin/sites/${id}`, { method: 'DELETE' })
      await fetchSites()
    } catch (err) {
      console.error('Failed to move site to trash:', err)
      alert('Failed to move site to trash: ' + err.message)
    } finally {
      setActionLoading(null)
    }
  }

  const handleRestore = async (id) => {
    try {
      setActionLoading(id)
      await fetch(`/api/admin/sites/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'draft' })
      })
      await fetchSites()
    } catch (err) {
      console.error('Failed to restore site:', err)
      alert('Failed to restore site: ' + err.message)
    } finally {
      setActionLoading(null)
    }
  }

  const handlePermanentDelete = async (id, slug) => {
    const confirmation = confirm(
      `⚠️ PERMANENT DELETE WARNING ⚠️\n\nAre you sure you want to permanently delete site "${slug}"?\n\nThis will:\n1. Purge all uploaded photos and videos for this specific site from cloud storage.\n2. Delete all database records for this site.\n3. Keep all other sites and photos completely safe.\n\nThis action CANNOT be undone. Proceed?`
    )
    if (!confirmation) return

    try {
      setActionLoading(id)
      const res = await fetch(`/api/admin/sites/${id}?permanent=true`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to delete')
      await fetchSites()
    } catch (err) {
      console.error('Failed to permanently delete site:', err)
      alert('Permanent delete error: ' + err.message)
    } finally {
      setActionLoading(null)
    }
  }

  const filteredSites = sites.filter((site) => {
    const matchesFilter = filter === 'all' 
      ? site.status !== 'archived' // Default "All" view shows non-archived sites
      : filter === 'archived'
      ? site.status === 'archived'
      : site.status === filter

    const matchesSearch =
      site.slug?.toLowerCase().includes(search.toLowerCase()) ||
      site.owner_name?.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const archivedCount = sites.filter((s) => s.status === 'archived').length

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-white font-semibold tracking-tight">
            All Wedding Sites
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Manage your client sites, preview drafts, and clean up storage
          </p>
        </div>

        <Link
          href="/admin/sites/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#A67C52] to-[#8C643E] text-white text-sm font-medium rounded-xl shadow-md transition-all duration-200 shrink-0 hover:brightness-110"
        >
          <PlusCircle size={16} />
          Create Wedding Site
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-zinc-900/60 p-4 border border-white/5 rounded-2xl">
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {[
            { id: 'all', label: 'Active Sites' },
            { id: 'live', label: 'Live' },
            { id: 'draft', label: 'Draft' },
            { id: 'archived', label: `Trash / Preview ${archivedCount > 0 ? `(${archivedCount})` : ''}` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
                filter === tab.id
                  ? tab.id === 'archived'
                    ? 'bg-rose-900/60 text-rose-200 border border-rose-600/40'
                    : 'bg-[#A67C52] text-white'
                  : 'bg-zinc-800/80 text-zinc-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search by name or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#A67C52]"
          />
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
        </div>
      </div>

      {/* Sites List */}
      <div className="bg-zinc-900/40 border border-white/10 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-zinc-500 text-sm">Loading sites...</div>
        ) : filteredSites.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 text-sm">
            {filter === 'archived'
              ? 'Trash is empty. Deleted sites will appear here for preview before permanent storage purge.'
              : 'No wedding sites match your search or filter.'}
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filteredSites.map((site) => {
              const isArchived = site.status === 'archived'
              const isBusy = actionLoading === site.id

              return (
                <div
                  key={site.id}
                  className={`p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
                    isArchived ? 'bg-rose-950/10 hover:bg-rose-950/20' : 'hover:bg-white/[0.02]'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-display text-xl text-white font-medium">
                        {site.owner_name || site.slug}
                      </h3>
                      <button
                        onClick={() => handleStatusToggle(site.id, site.status)}
                        title={isArchived ? 'Click to restore to draft' : 'Click to toggle status'}
                        className={`text-[10px] uppercase tracking-wider font-semibold px-2.5 py-0.5 rounded-full cursor-pointer transition-transform hover:scale-105 ${
                          isArchived
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : site.status === 'live'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {isArchived ? 'In Trash (Click to Restore)' : `${site.status} (Toggle)`}
                      </button>
                    </div>

                    <div className="text-xs text-zinc-500 font-mono flex items-center gap-2">
                      <span>Path: /s/{site.slug}</span>
                      {site.owner_phone && <span>• {site.owner_phone}</span>}
                      {isArchived && (
                        <span className="text-rose-400 font-sans font-medium flex items-center gap-1">
                          <AlertTriangle size={12} /> Pending Permanent Purge
                        </span>
                      )}
                    </div>

                    {/* Active Palette preview pills */}
                    {site.palette?.accent && (
                      <div className="flex items-center gap-1.5 pt-1">
                        <span className="text-[10px] text-zinc-400">Palette:</span>
                        <div
                          className="w-3.5 h-3.5 rounded-full border border-white/20"
                          style={{ backgroundColor: site.palette.bone || '#FAF9F6' }}
                          title="Background"
                        />
                        <div
                          className="w-3.5 h-3.5 rounded-full border border-white/20"
                          style={{ backgroundColor: site.palette.accent || '#A67C52' }}
                          title="Accent"
                        />
                        <div
                          className="w-3.5 h-3.5 rounded-full border border-white/20"
                          style={{ backgroundColor: site.palette.deepAccent || '#6B2C3E' }}
                          title="Deep Accent"
                        />
                        <span className="text-[10px] text-zinc-500">
                          {site.palette.name || 'Custom'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Preview Public Site (available in all states including archived) */}
                    <Link
                      href={`/s/${site.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs rounded-xl transition-colors"
                      title="Preview this wedding site"
                    >
                      <span>Preview Site</span>
                      <ExternalLink size={13} />
                    </Link>

                    {isArchived ? (
                      <>
                        {/* Restore Button */}
                        <button
                          disabled={isBusy}
                          onClick={() => handleRestore(site.id)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/30 text-xs rounded-xl font-medium transition-colors cursor-pointer"
                          title="Restore site from Trash back to Draft"
                        >
                          <RotateCcw size={13} />
                          <span>Restore</span>
                        </button>

                        {/* Permanent Purge Button */}
                        <button
                          disabled={isBusy}
                          onClick={() => handlePermanentDelete(site.id, site.slug)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-900/60 hover:bg-rose-800/80 text-rose-200 border border-rose-500/50 text-xs rounded-xl font-medium transition-colors cursor-pointer"
                          title="Purge database and delete all photos/videos for this site from storage"
                        >
                          <Trash2 size={13} />
                          <span>Delete Permanently</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          href={`/admin/sites/${site.id}`}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#A67C52]/20 hover:bg-[#A67C52]/30 text-[#D4A574] border border-[#A67C52]/40 text-xs rounded-xl font-medium transition-colors"
                        >
                          <Edit3 size={13} />
                          <span>Edit</span>
                        </Link>

                        <button
                          disabled={isBusy}
                          onClick={() => handleSoftDelete(site.id, site.slug)}
                          className="p-2 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
                          title="Move site to Trash / Preview"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
