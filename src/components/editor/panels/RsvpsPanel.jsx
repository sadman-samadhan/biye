'use client'

import { useCallback, useEffect, useState } from 'react'
import { Download, RefreshCw, Trash2 } from 'lucide-react'
import { Badge, Button, EmptyState, useConfirm, useToast } from '@/ui'
import { rsvpEvents } from '@/lib/invitation'
import PanelFrame from '../PanelFrame'

const SIDE = { bride: "Bride's side", groom: "Groom's side", both: 'Both' }

function Stat({ label, value }) {
  return (
    <div className="rounded-xl border border-sb-line bg-sb-card px-4 py-3">
      <p className="text-2xl font-semibold tabular-nums text-sb-ink">{value}</p>
      <p className="text-xs text-sb-muted">{label}</p>
    </div>
  )
}

/** Replies from the invitation, with a count per event and a spreadsheet export. */
export default function RsvpsPanel({ data, active }) {
  const toast = useToast()
  const confirm = useConfirm()
  const siteId = data.site.id
  const [rsvps, setRsvps] = useState(null)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setError(null)
    try {
      const res = await fetch(`/api/sites/${siteId}/rsvps`, { cache: 'no-store' })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body.error || 'Could not load replies')
      setRsvps(body.rsvps || [])
    } catch (err) {
      setError(err.message)
    }
  }, [siteId])

  // Fresh replies every time the panel is opened
  useEffect(() => {
    if (active) load()
  }, [active, load])

  async function remove(r) {
    const ok = await confirm({ title: 'Delete this reply?', body: `From ${r.name}. This can't be undone.`, confirmLabel: 'Delete', tone: 'danger' })
    if (!ok) return
    const res = await fetch(`/api/sites/${siteId}/rsvps/${r.id}`, { method: 'DELETE' })
    if (!res.ok) return toast.error('Could not delete the reply')
    setRsvps((list) => list.filter((x) => x.id !== r.id))
  }

  const events = rsvpEvents(data.ceremonies || [])
  const title = (id) => events.find((e) => e.id === id)?.title?.en || id
  const yes = (rsvps || []).filter((r) => r.attending)
  const guests = yes.reduce((n, r) => n + (r.party_size || 0), 0)
  const enabled = Boolean(data.invitation?.rsvp?.enabled)

  return (
    <PanelFrame
      title="RSVPs"
      description={enabled ? 'Replies from the invitation. Guests can change their own reply until replies close.' : 'RSVPs are off. Turn them on under Invitation.'}
      actions={
        <>
          <Button size="sm" variant="ghost" icon={RefreshCw} onClick={load}>
            Refresh
          </Button>
          <Button size="sm" icon={Download} href={`/api/sites/${siteId}/rsvps?format=csv`} disabled={!rsvps?.length}>
            Download CSV
          </Button>
        </>
      }
    >
      {error && <p className="text-sm text-[#7A2229]">{error}</p>}
      {rsvps && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Replies" value={rsvps.length} />
            <Stat label="Coming" value={yes.length} />
            <Stat label="Guests in total" value={guests} />
            <Stat label="Can't come" value={rsvps.length - yes.length} />
          </div>
          {events.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {events.map((e) => (
                <Badge key={e.id} tone="neutral">
                  {e.title?.en || e.id}: {yes.filter((r) => r.events?.includes(e.id)).reduce((n, r) => n + (r.party_size || 0), 0)} guests
                </Badge>
              ))}
            </div>
          )}
          {rsvps.length === 0 ? (
            <EmptyState title="No replies yet">Replies appear here as guests answer the invitation.</EmptyState>
          ) : (
            <ul className="divide-y divide-sb-line">
              {rsvps.map((r) => (
                <li key={r.id} className="flex flex-wrap items-start gap-3 py-4 first:pt-0">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-sb-ink">{r.name}</span>
                      <Badge tone={r.attending ? 'live' : 'draft'}>{r.attending ? `Coming · ${r.party_size}` : "Can't come"}</Badge>
                      {r.side && <span className="text-xs text-sb-muted">{SIDE[r.side]}</span>}
                      {r.phone && <span className="text-xs text-sb-muted">{r.phone}</span>}
                    </div>
                    {r.attending && r.events?.length > 0 && <p className="mt-1 text-sm text-sb-ink-soft">{r.events.map(title).join(' · ')}</p>}
                    {r.note && <p className="mt-1 text-sm italic text-sb-ink-soft">“{r.note}”</p>}
                    <p className="mt-1 text-xs text-sb-muted">{new Date(r.updated_at || r.created_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                  </div>
                  <Button size="sm" variant="ghost" icon={Trash2} aria-label={`Delete reply from ${r.name}`} onClick={() => remove(r)} />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </PanelFrame>
  )
}
