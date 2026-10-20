'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ExternalLink, PlusCircle, RotateCcw, Search, Trash2 } from 'lucide-react'
import { Badge, Button, Card, ConfirmProvider, EmptyState, STATUS_BADGE, ToastProvider, useConfirm, useToast } from '@/ui'

const TABS = [
  { id: 'active', label: 'Active' },
  { id: 'live', label: 'Live' },
  { id: 'draft', label: 'Drafts' },
  { id: 'archived', label: 'Trash' },
]

function Table({ sites }) {
  const router = useRouter()
  const toast = useToast()
  const confirm = useConfirm()
  const [tab, setTab] = useState('active')
  const [query, setQuery] = useState('')
  const [busy, setBusy] = useState(null)

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return sites.filter((s) => {
      const inTab = tab === 'active' ? s.status !== 'archived' : s.status === tab
      const matches = !q || s.slug.includes(q) || s.owner_name?.toLowerCase().includes(q) || s.owner_phone?.includes(q)
      return inTab && matches
    })
  }, [sites, tab, query])

  async function act(site, request, success) {
    setBusy(site.id)
    try {
      const res = await request()
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Something went wrong')
      toast.success(success)
      router.refresh()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBusy(null)
    }
  }

  const setStatus = (site, status) =>
    act(
      site,
      () => fetch(`/api/sites/${site.id}/settings`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }),
      status === 'live' ? `${site.slug} is live` : status === 'draft' ? `${site.slug} is a draft` : 'Updated'
    )

  async function trash(site) {
    if (await confirm({ title: `Move ${site.slug} to Trash?`, body: 'Guests will see a “not found” page until you restore it.', confirmLabel: 'Move to Trash', tone: 'danger' })) {
      act(site, () => fetch(`/api/admin/sites/${site.id}`, { method: 'DELETE' }), 'Moved to Trash')
    }
  }

  async function purge(site) {
    if (
      await confirm({
        title: `Delete ${site.slug} forever?`,
        body: 'All photos, videos, messages and content for this site are permanently removed. Other sites are not affected. This cannot be undone.',
        confirmLabel: 'Delete forever',
        tone: 'danger',
      })
    ) {
      act(site, () => fetch(`/api/admin/sites/${site.id}?permanent=true`, { method: 'DELETE' }), 'Site permanently deleted')
    }
  }

  const counts = Object.fromEntries(TABS.map((t) => [t.id, sites.filter((s) => (t.id === 'active' ? s.status !== 'archived' : s.status === t.id)).length]))

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-sb-ink sm:text-4xl">All sites</h1>
          <p className="mt-1 text-sm text-sb-muted">Publish drafts, edit content, and clean up old sites.</p>
        </div>
        <Button href="/admin/sites/new" variant="primary" icon={PlusCircle}>
          New client
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" className="flex gap-1 overflow-x-auto rounded-lg bg-sb-soft p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`whitespace-nowrap rounded-md px-3 py-1.5 text-sm transition ${tab === t.id ? 'bg-sb-card font-medium text-sb-ink shadow-sm' : 'text-sb-muted hover:text-sb-ink'}`}
            >
              {t.label} <span className="tabular-nums text-sb-muted">{counts[t.id]}</span>
            </button>
          ))}
        </div>
        <label className="relative w-full sm:w-72">
          <span className="sr-only">Search sites</span>
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sb-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, address or phone"
            className="w-full rounded-lg border border-sb-line-strong bg-sb-card py-2 pl-9 pr-3 text-sm outline-none focus:border-sb-marigold focus:ring-2 focus:ring-sb-holud/30"
          />
        </label>
      </div>

      {visible.length === 0 ? (
        <EmptyState title={tab === 'archived' ? 'Trash is empty' : 'No sites match'}>
          {tab === 'archived' ? 'Sites moved to Trash appear here before permanent deletion.' : 'Try another tab or search.'}
        </EmptyState>
      ) : (
        <Card className="overflow-hidden">
          <ul className="divide-y divide-sb-line">
            {visible.map((site) => {
              const status = STATUS_BADGE[site.status] || STATUS_BADGE.draft
              const archived = site.status === 'archived'
              return (
                <li key={site.id} className="flex flex-wrap items-center gap-4 px-5 py-4 sm:px-6">
                  <span className="flex h-9 w-9 shrink-0 overflow-hidden rounded-full border border-sb-line" aria-hidden="true">
                    <span className="h-full w-1/2" style={{ background: site.palette?.accent || '#D4741C' }} />
                    <span className="h-full w-1/2" style={{ background: site.palette?.deepAccent || '#1E1A17' }} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/admin/sites/${site.id}`} className="truncate font-medium text-sb-ink hover:underline">
                        {site.owner_name || site.slug}
                      </Link>
                      <Badge tone={status.tone}>{status.label}</Badge>
                      {(site.products || []).includes('invite') && <Badge tone="accent">Invitation</Badge>}
                    </div>
                    <p className="truncate text-xs text-sb-muted">
                      /{site.slug}
                      {site.owner_phone && ` · ${site.owner_phone}`}
                      {site.plan_expiry_date && ` · paid until ${new Date(site.plan_expiry_date).toLocaleDateString('en-GB')}`}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {archived ? (
                      <>
                        <Button size="sm" icon={RotateCcw} loading={busy === site.id} onClick={() => setStatus(site, 'draft')}>
                          Restore
                        </Button>
                        <Button size="sm" variant="danger" icon={Trash2} disabled={busy === site.id} onClick={() => purge(site)}>
                          Delete forever
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button size="sm" variant={site.status === 'live' ? 'ghost' : 'accent'} loading={busy === site.id} onClick={() => setStatus(site, site.status === 'live' ? 'draft' : 'live')}>
                          {site.status === 'live' ? 'Unpublish' : 'Publish'}
                        </Button>
                        <Button size="sm" href={`/admin/sites/${site.id}`}>
                          Edit
                        </Button>
                        <Button size="sm" variant="ghost" icon={ExternalLink} href={`/${site.slug}`} target="_blank" aria-label={`View ${site.slug}`} />
                        <Button size="sm" variant="ghost" icon={Trash2} aria-label={`Move ${site.slug} to Trash`} disabled={busy === site.id} onClick={() => trash(site)} />
                      </>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        </Card>
      )}
    </div>
  )
}

export default function SitesTable({ sites }) {
  return (
    <ToastProvider>
      <ConfirmProvider>
        <Table sites={sites} />
      </ConfirmProvider>
    </ToastProvider>
  )
}
