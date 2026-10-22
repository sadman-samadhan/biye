'use client'

import { useEffect, useId, useState } from 'react'
import { Check } from 'lucide-react'
import { Bilingual } from '../primitives/text'

const field =
  'w-full rounded-[var(--t-radius)] border border-t-line bg-t-surface px-4 py-3 text-base text-t-ink placeholder:text-t-ink-muted/70 focus:border-t-accent focus:outline-none focus:ring-2 focus:ring-t-accent/30'

function Label({ htmlFor, text, children }) {
  return (
    <label htmlFor={htmlFor} className="block text-left">
      <span className="mb-1.5 block text-sm font-medium">
        {text.en}
        {text.bn && (
          <span lang="bn" className="ml-2 font-t-bn text-xs font-normal text-t-ink-muted">
            {text.bn}
          </span>
        )}
      </span>
      {children}
    </label>
  )
}

const EMPTY = { name: '', phone: '', side: '', attending: null, partySize: 1, events: [], note: '', website: '' }

/** Reply card. Remembers this phone's reply (signed cookie) so guests can change it until replies close. */
export default function Rsvp({ slug, open, events = [], settings, deadline, copy }) {
  const id = useId()
  const [form, setForm] = useState({ ...EMPTY, events: events.map((e) => e.id) })
  const [saved, setSaved] = useState(null)
  const [editing, setEditing] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    fetch(`/api/g/${encodeURIComponent(slug)}/rsvp`, { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data?.rsvp) return
        setSaved(data.rsvp)
        setForm({ ...EMPTY, ...data.rsvp, side: data.rsvp.side || '', partySize: data.rsvp.partySize || 1 })
        setEditing(false)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [slug])

  const set = (patch) => setForm((f) => ({ ...f, ...patch }))
  const toggleEvent = (eventId) => set({ events: form.events.includes(eventId) ? form.events.filter((e) => e !== eventId) : [...form.events, eventId] })

  async function submit(e) {
    e.preventDefault()
    if (form.attending == null) return setError('Please choose whether you can come.')
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(`/api/g/${encodeURIComponent(slug)}/rsvp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, side: form.side || null, partySize: Number(form.partySize) }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Could not send your reply. Please try again.')
      setSaved(data.rsvp || form)
      setEditing(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const titleOf = (eventId) => events.find((e) => e.id === eventId)?.title?.en || eventId

  return (
    <section id="rsvp" className="bg-t-bg-alt px-5 py-24 md:py-32">
      <div className="mx-auto max-w-xl">
        <header className="mb-10 text-center">
          <Bilingual value={copy['invite.rsvp.title']} as="h2" enClassName="t-display text-4xl md:text-5xl" bnClassName="mt-2 font-t-bn-display text-xl text-t-ink-muted" />
          {deadline && open && (
            <p className="mt-4 text-sm text-t-ink-muted">
              {copy['invite.rsvp.by'].en} {deadline.en}
              <span lang="bn" className="ml-2 font-t-bn">
                · {copy['invite.rsvp.by'].bn} {deadline.bn}
              </span>
            </p>
          )}
          <Bilingual value={settings.note} className="mt-3 space-y-1" enClassName="text-t-ink-muted" bnClassName="text-sm text-t-ink-muted" />
        </header>

        {!open && !saved && <Bilingual value={copy['invite.rsvp.closed']} className="text-center" enClassName="text-lg" bnClassName="text-t-ink-muted" />}

        {saved && !editing && (
          <div className="rounded-[var(--t-radius)] border border-t-line bg-t-surface p-6 text-center" role="status">
            <span className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-t-accent text-t-on-accent">
              <Check size={20} />
            </span>
            <Bilingual value={copy['invite.rsvp.thanks']} enClassName="text-lg" bnClassName="text-sm text-t-ink-muted" />
            <p className="mt-4 text-sm">
              <strong>{saved.name}</strong> · {saved.attending ? `${copy['invite.rsvp.yes'].en} · ${saved.partySize}` : copy['invite.rsvp.no'].en}
            </p>
            {saved.attending && saved.events?.length > 0 && <p className="mt-1 text-sm text-t-ink-muted">{saved.events.map(titleOf).join(' · ')}</p>}
            {open && (
              <>
                <Bilingual value={copy['invite.rsvp.yours']} className="mt-4" enClassName="text-xs text-t-ink-muted" bnClassName="text-xs text-t-ink-muted" />
                <button type="button" onClick={() => setEditing(true)} className="mt-4 rounded-full border border-t-accent/60 px-5 py-2 text-sm text-t-accent-strong hover:bg-t-accent hover:text-t-on-accent">
                  {copy['invite.rsvp.update'].en}
                </button>
              </>
            )}
          </div>
        )}

        {open && editing && (
          <form onSubmit={submit} className="space-y-6" noValidate>
            <Label htmlFor={`${id}-name`} text={copy['invite.rsvp.name']}>
              <input id={`${id}-name`} className={field} value={form.name} onChange={(e) => set({ name: e.target.value })} maxLength={80} autoComplete="name" required />
            </Label>

            <fieldset>
              <legend className="sr-only">{copy['invite.rsvp.title'].en}</legend>
              <div className="grid grid-cols-2 gap-3">
                {[
                  [true, copy['invite.rsvp.yes']],
                  [false, copy['invite.rsvp.no']],
                ].map(([value, label]) => (
                  <button
                    key={String(value)}
                    type="button"
                    aria-pressed={form.attending === value}
                    onClick={() => set({ attending: value })}
                    className={`rounded-[var(--t-radius)] border px-3 py-4 text-center transition ${form.attending === value ? 'border-t-accent bg-t-accent text-t-on-accent' : 'border-t-line bg-t-surface hover:border-t-accent'}`}
                  >
                    <span className="block font-medium">{label.en}</span>
                    <span lang="bn" className="block font-t-bn text-sm opacity-80">
                      {label.bn}
                    </span>
                  </button>
                ))}
              </div>
            </fieldset>

            {form.attending && (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Label htmlFor={`${id}-party`} text={copy['invite.rsvp.party']}>
                    <select id={`${id}-party`} className={field} value={form.partySize} onChange={(e) => set({ partySize: Number(e.target.value) })}>
                      {Array.from({ length: settings.maxParty }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </Label>
                  <Label htmlFor={`${id}-side`} text={copy['invite.rsvp.side']}>
                    <select id={`${id}-side`} className={field} value={form.side} onChange={(e) => set({ side: e.target.value })}>
                      <option value="">—</option>
                      {['bride', 'groom', 'both'].map((s) => (
                        <option key={s} value={s}>
                          {copy[`invite.rsvp.${s}`].en} · {copy[`invite.rsvp.${s}`].bn}
                        </option>
                      ))}
                    </select>
                  </Label>
                </div>

                {events.length > 1 && (
                  <fieldset>
                    <legend className="mb-2 text-sm font-medium">
                      {copy['invite.rsvp.events'].en}
                      <span lang="bn" className="ml-2 font-t-bn text-xs font-normal text-t-ink-muted">
                        {copy['invite.rsvp.events'].bn}
                      </span>
                    </legend>
                    <div className="space-y-2">
                      {events.map((event) => (
                        <label key={event.id} className="flex cursor-pointer items-center gap-3 rounded-[var(--t-radius)] border border-t-line bg-t-surface px-4 py-3">
                          <input type="checkbox" className="h-4 w-4 accent-[var(--t-accent)]" checked={form.events.includes(event.id)} onChange={() => toggleEvent(event.id)} />
                          <span>
                            {event.title?.en}
                            {event.title?.bn && (
                              <span lang="bn" className="ml-2 font-t-bn text-sm text-t-ink-muted">
                                {event.title.bn}
                              </span>
                            )}
                          </span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                )}

                {settings.collectPhone && (
                  <Label htmlFor={`${id}-phone`} text={copy['invite.rsvp.phone']}>
                    <input id={`${id}-phone`} type="tel" inputMode="tel" className={field} value={form.phone} onChange={(e) => set({ phone: e.target.value })} maxLength={30} autoComplete="tel" placeholder="+8801…" />
                  </Label>
                )}
              </>
            )}

            <Label htmlFor={`${id}-note`} text={copy['invite.rsvp.note']}>
              <textarea id={`${id}-note`} rows={3} className={field} value={form.note} onChange={(e) => set({ note: e.target.value })} maxLength={500} />
            </Label>

            {/* Honeypot: hidden from people, filled by bots */}
            <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" value={form.website} onChange={(e) => set({ website: e.target.value })} />

            {error && (
              <p role="alert" className="text-sm text-t-accent-strong">
                {error}
              </p>
            )}
            <button type="submit" disabled={busy} className="w-full rounded-full bg-t-accent px-6 py-4 font-medium text-t-on-accent transition hover:opacity-90 disabled:opacity-60">
              {busy ? '…' : saved ? copy['invite.rsvp.update'].en : copy['invite.rsvp.send'].en}
            </button>
          </form>
        )}
      </div>
    </section>
  )
}
