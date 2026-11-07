'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { Copy, Download, Plus, QrCode, Share2, Trash2 } from 'lucide-react'
import { Button, TextInput, useToast } from '@/ui'
import { newGuestListId } from '@/lib/invitation'

/** Links for one saved list: plain (asks for the passcode) and one-tap (passcode built in). */
function ListLinks({ list, access, slug }) {
  const toast = useToast()
  const [qr, setQr] = useState(null)
  const url = `${access.siteUrl}/i/${list.id}`
  const oneTap = access.unlockUrl ? `${access.unlockUrl}?list=${list.id}` : null
  const message = [`You're invited to our wedding!`, oneTap || url, !oneTap && access.passcode ? `Passcode: ${access.passcode}` : null].filter(Boolean).join('\n')

  async function copy(text, what) {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(what)
    } catch {
      toast.error('Copy failed. Select the text and copy it manually.')
    }
  }

  async function showQr() {
    setQr(await QRCode.toDataURL(url, { margin: 1, width: 600, color: { dark: '#1E1A17', light: '#FFFFFF' } }))
  }

  return (
    <div className="space-y-3 border-t border-sb-line pt-3">
      <div className="flex items-center gap-2">
        <p className="min-w-0 flex-1 truncate rounded-lg bg-sb-paper px-3 py-2 font-mono text-xs text-sb-ink" title={url}>
          {url}
        </p>
        <Button size="sm" icon={Copy} onClick={() => copy(url, 'Link copied')}>
          Link
        </Button>
        {oneTap && (
          <Button size="sm" icon={Copy} onClick={() => copy(oneTap, 'One-tap link copied')}>
            One-tap
          </Button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" icon={Share2} href={`https://wa.me/?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener">
          WhatsApp
        </Button>
        <Button size="sm" icon={QrCode} onClick={showQr}>
          QR code
        </Button>
      </div>
      {qr && (
        <div className="flex flex-wrap items-center gap-4 rounded-xl bg-sb-paper p-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- generated QR data URL */}
          <img src={qr} alt={`QR code for ${list.name}`} className="h-28 w-28 rounded-lg bg-white p-1" />
          <div className="space-y-1 text-xs text-sb-muted">
            <p>For printed cards for this group. It asks for the passcode.</p>
            <a href={qr} download={`${slug}-${list.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-qr.png`} className="inline-flex items-center gap-1.5 text-sm font-medium text-sb-marigold-deep hover:underline">
              <Download size={14} /> Download PNG
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Guest lists: most guests are invited to some events, not all. Each list gets
 * its own link, and its invitation shows only the ticked events.
 */
export default function GuestListsSection({ lists, onChange, events, savedLists = [], siteId, slug }) {
  const [access, setAccess] = useState(null)

  useEffect(() => {
    fetch(`/api/sites/${siteId}/access`, { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then(setAccess)
      .catch(() => {})
  }, [siteId])

  const set = (i, patch) => onChange(lists.map((l, j) => (j === i ? { ...l, ...patch } : l)))
  const add = () => onChange([...lists, { id: newGuestListId(), name: '', events: events.map((e) => e.id) }])
  const remove = (i) => onChange(lists.filter((_, j) => j !== i))
  const toggle = (i, id) => {
    const chosen = lists[i].events.includes(id) ? lists[i].events.filter((e) => e !== id) : [...lists[i].events, id]
    set(i, { events: events.map((e) => e.id).filter((e) => chosen.includes(e)) })
  }
  // A list's links work once it is saved unchanged
  const saved = (list) => {
    const s = savedLists.find((l) => l.id === list.id)
    return s && s.name === list.name && s.events.join() === list.events.join()
  }

  return (
    <section className="space-y-4 rounded-xl border border-sb-line p-4">
      <div>
        <p className="text-sm font-medium text-sb-ink">Guest lists</p>
        <p className="mt-1 text-xs text-sb-muted">
          Not everyone is invited to every event. Make a list for each group of guests and send each group its own link: their invitation, countdown and RSVP show only their events. Your main link
          still shows every event.
        </p>
      </div>

      {events.length === 0 && <p className="text-xs text-sb-muted">Add events in Ceremonies first.</p>}

      {lists.map((list, i) => (
        <div key={list.id} className="space-y-3 rounded-xl bg-sb-card p-4 ring-1 ring-sb-line">
          <div className="flex items-end gap-2">
            <TextInput className="flex-1" label="List name" value={list.name} placeholder="e.g. Holud only, Office friends, Family" onChange={(e) => set(i, { name: e.target.value })} />
            <Button size="sm" variant="ghost" icon={Trash2} onClick={() => remove(i)} aria-label={`Delete ${list.name || 'guest list'}`} />
          </div>
          <fieldset>
            <legend className="mb-2 text-xs font-medium uppercase tracking-wider text-sb-muted">Invited to</legend>
            <div className="flex flex-wrap gap-2">
              {events.map((e) => {
                const on = list.events.includes(e.id)
                return (
                  <label key={e.id} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition ${on ? 'border-sb-ink bg-sb-ink text-white' : 'border-sb-line hover:bg-sb-paper'}`}>
                    <input type="checkbox" className="sr-only" checked={on} onChange={() => toggle(i, e.id)} />
                    {e.title?.en || e.title?.bn || e.id}
                  </label>
                )
              })}
            </div>
            {list.events.length === 0 && <p className="mt-2 text-xs text-sb-alta">Choose at least one event.</p>}
          </fieldset>
          {!saved(list) ? (
            <p className="text-xs text-sb-muted">Save to get this list’s link.</p>
          ) : access ? (
            <ListLinks list={list} access={access} slug={slug} />
          ) : (
            <p className="text-xs text-sb-muted">Loading link…</p>
          )}
        </div>
      ))}

      <Button size="sm" icon={Plus} onClick={add} disabled={events.length === 0}>
        Add a guest list
      </Button>
      {lists.length > 0 && <p className="text-xs text-sb-muted">Deleting a list makes its link open your main invitation with every event.</p>}
    </section>
  )
}
