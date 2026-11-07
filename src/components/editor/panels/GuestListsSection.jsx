'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { Copy, Download, Plus, QrCode, RefreshCw, Share2, Trash2 } from 'lucide-react'
import { Button, TextInput, useToast } from '@/ui'
import { newGuestListId } from '@/lib/invitation'
import { generatePasscode, normalizePasscode } from '@/lib/passcode'

const randomInt = (n) => globalThis.crypto.getRandomValues(new Uint32Array(1))[0] % n

/** A passcode no other list (and not the site passcode) uses. */
function freshPasscode(taken) {
  const used = new Set(taken.filter(Boolean).map(normalizePasscode))
  for (;;) {
    const code = generatePasscode(randomInt)
    if (!used.has(code)) return code
  }
}

/** Links for one saved list: plain (asks for the list's passcode) and one-tap (passcode built in). */
function ListLinks({ list, access, slug }) {
  const toast = useToast()
  const [qr, setQr] = useState(null)
  const url = `${access.siteUrl}/i/${list.id}`
  const oneTap = access.listUnlockUrls?.[list.id] || null
  const message = oneTap ? `You're invited to our wedding!\n${oneTap}` : `You're invited to our wedding!\n${url}\nPasscode: ${list.passcode}`

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
            <p>For printed cards for this group. Print the passcode {list.passcode} next to it.</p>
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
 * Guest lists: most guests are invited to some events, not all. Each list has
 * its own link and passcode, and a guest who comes in through them only ever
 * sees the ticked events, even on the main link.
 */
export default function GuestListsSection({ lists, onChange, events, savedLists = [], siteId, slug }) {
  const [access, setAccess] = useState(null)
  // One-tap links depend on each saved list's passcode, so reload them after a save
  const savedKey = savedLists.map((l) => `${l.id}:${l.passcode || ''}`).join()

  useEffect(() => {
    fetch(`/api/sites/${siteId}/access`, { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then(setAccess)
      .catch(() => {})
  }, [siteId, savedKey])

  const taken = (except) => [access?.passcode, ...lists.filter((l) => l.id !== except).map((l) => l.passcode)]
  const set = (i, patch) => onChange(lists.map((l, j) => (j === i ? { ...l, ...patch } : l)))
  const add = () => onChange([...lists, { id: newGuestListId(), name: '', events: events.map((e) => e.id), passcode: freshPasscode(taken()) }])
  const remove = (i) => onChange(lists.filter((_, j) => j !== i))
  const toggle = (i, id) => {
    const chosen = lists[i].events.includes(id) ? lists[i].events.filter((e) => e !== id) : [...lists[i].events, id]
    set(i, { events: events.map((e) => e.id).filter((e) => chosen.includes(e)) })
  }
  // A list's links work once it is saved unchanged
  const saved = (list) => {
    const s = savedLists.find((l) => l.id === list.id)
    return s && s.name === list.name && s.events.join() === list.events.join() && s.passcode === list.passcode
  }
  const clashesWithSite = (list) => access?.passcode && list.passcode && normalizePasscode(access.passcode) === normalizePasscode(list.passcode)

  return (
    <section className="space-y-4 rounded-xl border border-sb-line p-4">
      <div>
        <p className="text-sm font-medium text-sb-ink">Guest lists</p>
        <p className="mt-1 text-xs text-sb-muted">
          Not everyone is invited to every event. Make a list for each group of guests and send each group its own link or passcode: their invitation, countdown and RSVP show only their
          events, even if they open your main link. Your main link and site passcode show every event, so keep those for the people invited to everything.
        </p>
      </div>

      {access?.inviteAccess === 'public' && lists.length > 0 && (
        <p className="rounded-lg bg-[#FCF3E6] px-3 py-2 text-xs text-[#7A4A12]">
          Your invitation is public, so anyone who opens your main link without a list’s link sees every event. To keep the lists apart, set the invitation to need a passcode in Privacy &amp;
          sharing.
        </p>
      )}

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
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-xs font-medium uppercase tracking-wider text-sb-muted">Passcode</span>
            {list.passcode ? <span className="rounded-md bg-sb-paper px-2 py-1 font-mono text-sb-ink">{list.passcode}</span> : <span className="text-xs text-sb-alta">None yet</span>}
            <Button size="sm" variant="ghost" icon={RefreshCw} onClick={() => set(i, { passcode: freshPasscode(taken(list.id)) })}>
              {list.passcode ? 'New passcode' : 'Give this list a passcode'}
            </Button>
          </div>
          {clashesWithSite(list) && <p className="text-xs text-sb-alta">This is the same as your site passcode, which opens every event. Choose a new one.</p>}
          {!list.passcode ? (
            <p className="text-xs text-sb-muted">Give this list a passcode and save to get its link.</p>
          ) : !saved(list) ? (
            <p className="text-xs text-sb-muted">Save to get this list’s link. A new passcode turns the old one and its one-tap link off.</p>
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
