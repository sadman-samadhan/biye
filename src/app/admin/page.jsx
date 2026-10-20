import Link from 'next/link'
import { ArrowRight, PlusCircle } from 'lucide-react'
import { Badge, Button, Card, CardHeader, EmptyState, STATUS_BADGE } from '@/ui'
import { requireAdminPage } from '@/lib/server/auth'
import { isSupabaseConfigured, serviceClient } from '@/lib/server/supabase'
import { effectiveStatus } from '@/lib/server/site-data'

export const metadata = { title: 'Overview | ShubhoBiye admin' }

const MILESTONE = 50

async function loadSites() {
  if (!isSupabaseConfigured()) return { sites: [], renewalsSoon: 0 }
  const { data } = await serviceClient()
    .from('sites')
    .select('id, slug, status, owner_name, plan_expiry_date, created_at')
    .order('created_at', { ascending: false })
  const sites = data || []
  const now = Date.now()
  const renewalsSoon = sites.filter((s) => {
    const expiry = s.plan_expiry_date ? new Date(s.plan_expiry_date).getTime() : 0
    return expiry > now && expiry - now < 30 * 86400000
  }).length
  return { sites, renewalsSoon }
}

function Stat({ label, value, hint }) {
  return (
    <Card className="p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-sb-muted">{label}</p>
      <p className="mt-2 font-display text-4xl font-semibold tabular-nums text-sb-ink">{value}</p>
      {hint && <p className="mt-1 text-xs text-sb-muted">{hint}</p>}
    </Card>
  )
}

export default async function AdminOverview() {
  await requireAdminPage('/admin')
  const { sites, renewalsSoon: soon } = await loadSites()
  const statuses = sites.map(effectiveStatus)
  const live = statuses.filter((s) => s === 'live').length
  const drafts = statuses.filter((s) => s === 'draft').length
  const progress = Math.min(100, Math.round((live / MILESTONE) * 100))

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-sb-ink sm:text-4xl">Overview</h1>
          <p className="mt-1 text-sm text-sb-muted">Client sites, drafts in progress and renewals coming up.</p>
        </div>
        <Button href="/admin/sites/new" variant="primary" icon={PlusCircle}>
          New client
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Live sites" value={live} />
        <Stat label="Drafts" value={drafts} />
        <Stat label="Renewals in 30 days" value={soon} />
        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-sb-muted">First {MILESTONE} couples</p>
          <p className="mt-2 font-display text-4xl font-semibold tabular-nums text-sb-ink">{progress}%</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-sb-soft" role="progressbar" aria-valuenow={live} aria-valuemin={0} aria-valuemax={MILESTONE}>
            <div className="h-full rounded-full bg-sb-marigold" style={{ width: `${progress}%` }} />
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Recent sites"
          actions={
            <Link href="/admin/sites" className="inline-flex items-center gap-1 text-sm text-sb-marigold-deep hover:underline">
              All sites <ArrowRight size={14} />
            </Link>
          }
        />
        {sites.length === 0 ? (
          <div className="p-6">
            <EmptyState title="No client sites yet" action={<Button href="/admin/sites/new" variant="primary">Create the first one</Button>} />
          </div>
        ) : (
          <ul className="divide-y divide-sb-line">
            {sites.slice(0, 8).map((site, i) => {
              const status = STATUS_BADGE[statuses[i]] || STATUS_BADGE.draft
              return (
                <li key={site.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6">
                  <div className="min-w-0">
                    <Link href={`/admin/sites/${site.id}`} className="font-medium text-sb-ink hover:underline">
                      {site.owner_name || site.slug}
                    </Link>
                    <p className="text-xs text-sb-muted">/{site.slug}</p>
                  </div>
                  <Badge tone={status.tone}>{status.label}</Badge>
                </li>
              )
            })}
          </ul>
        )}
      </Card>
    </div>
  )
}
