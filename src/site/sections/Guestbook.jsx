'use client'

import { useCallback, useEffect, useState } from 'react'
import { Bilingual } from '../primitives/text'

const field =
  'w-full rounded-[var(--t-radius)] border border-t-line bg-t-surface px-4 py-3 text-base text-t-ink outline-none transition placeholder:text-t-ink-muted/60 focus:border-t-accent focus:ring-2 focus:ring-t-accent/20'

export default function Guestbook({ slug, copy }) {
  const [messages, setMessages] = useState([])
  const [form, setForm] = useState({ name: '', nameBn: '', message: '', messageBn: '', website: '' })
  const [state, setState] = useState({ sending: false, done: null, error: null })

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/g/${encodeURIComponent(slug)}/messages`)
      if (res.ok) setMessages((await res.json()).messages || [])
    } catch {
      // offline: keep what we have
    }
  }, [slug])

  useEffect(() => {
    load()
  }, [load])

  async function submit(e) {
    e.preventDefault()
    setState({ sending: true, done: null, error: null })
    try {
      const res = await fetch(`/api/g/${encodeURIComponent(slug)}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Could not send your message')
      setForm({ name: '', nameBn: '', message: '', messageBn: '', website: '' })
      setState({ sending: false, done: data.pendingApproval ? 'pending' : 'thanks', error: null })
      load()
    } catch (err) {
      setState({ sending: false, done: null, error: err.message })
    }
  }

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  return (
    <section id="guestbook" className="bg-t-bg py-24 md:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <header className="mb-14 text-center">
          <Bilingual value={copy['guestbook.title']} as="h2" enClassName="t-display text-4xl md:text-5xl" bnClassName="mt-2 font-t-bn-display text-2xl text-t-ink-muted" />
        </header>

        <form onSubmit={submit} className="relative mx-auto max-w-2xl space-y-4">
          <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
            <label>
              Website
              <input type="text" tabIndex={-1} autoComplete="off" value={form.website} onChange={set('website')} />
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm text-t-ink-muted">{copy['guestbook.name'].en}</span>
              <input required maxLength={50} value={form.name} onChange={set('name')} className={field} autoComplete="name" />
            </label>
            <label className="block">
              <span lang="bn" className="mb-1.5 block font-t-bn text-sm text-t-ink-muted">
                {copy['guestbook.name'].bn} · {copy['guestbook.optionalBn'].bn}
              </span>
              <input lang="bn" maxLength={50} value={form.nameBn} onChange={set('nameBn')} className={`${field} font-t-bn`} />
            </label>
          </div>
          <label className="block">
            <span className="mb-1.5 block text-sm text-t-ink-muted">{copy['guestbook.message'].en}</span>
            <textarea required maxLength={300} rows={4} value={form.message} onChange={set('message')} className={`${field} resize-none`} />
          </label>
          <label className="block">
            <span lang="bn" className="mb-1.5 block font-t-bn text-sm text-t-ink-muted">
              {copy['guestbook.message'].bn} · {copy['guestbook.optionalBn'].bn}
            </span>
            <textarea lang="bn" maxLength={300} rows={3} value={form.messageBn} onChange={set('messageBn')} className={`${field} resize-none font-t-bn`} />
          </label>
          <div className="flex flex-wrap items-center gap-4">
            <button type="submit" disabled={state.sending} className="rounded-[var(--t-radius)] bg-t-ink px-7 py-3 text-sm uppercase tracking-[0.2em] text-t-bg transition hover:bg-t-accent hover:text-t-on-accent disabled:opacity-50">
              {state.sending ? '…' : copy['guestbook.send'].en}
            </button>
            {state.done && <p className="text-sm text-t-accent-strong">{copy[state.done === 'pending' ? 'guestbook.pending' : 'guestbook.thanks'].en}</p>}
            {state.error && <p className="text-sm text-[#a33]">{state.error}</p>}
          </div>
        </form>

        {messages.length > 0 && (
          <div className="mt-20">
            <h3 className="mb-8 text-center text-xs uppercase tracking-[0.35em] text-t-ink-muted">
              {copy['guestbook.recent'].en} · {messages.length}
            </h3>
            <ul className="grid gap-5 md:grid-cols-2">
              {messages.map((m) => (
                <li key={m.id} className="rounded-[var(--t-radius)] border border-t-line bg-t-surface p-6">
                  <p className="leading-relaxed">“{m.message}”</p>
                  {m.message_bn && (
                    <p lang="bn" className="mt-2 font-t-bn text-t-ink-muted">
                      “{m.message_bn}”
                    </p>
                  )}
                  <p className="mt-4 border-t border-t-line pt-3 text-xs uppercase tracking-[0.2em] text-t-accent">
                    {m.name}
                    {m.name_bn && (
                      <span lang="bn" className="ml-2 font-t-bn normal-case tracking-normal text-t-ink-muted">
                        {m.name_bn}
                      </span>
                    )}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}
