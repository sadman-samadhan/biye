'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock } from 'lucide-react'

/**
 * Shown instead of a private wedding page until the guest enters the passcode
 * from their invitation. Uses the site's palette variables so it matches the site.
 */
export default function PasscodeGate({ slug, coupleNames, date }) {
  const router = useRouter()
  const [passcode, setPasscode] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setPending(true)
    setError('')
    try {
      const res = await fetch(`/api/g/${encodeURIComponent(slug)}/unlock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode, name }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || 'That passcode didn’t work.')
        return
      }
      router.refresh()
    } catch {
      setError('Could not connect. Check your internet and try again.')
    } finally {
      setPending(false)
    }
  }

  const field =
    'w-full rounded-lg border border-warm-grey bg-white/80 px-4 py-3 text-base text-graphite outline-none transition focus:border-clay focus:ring-2 focus:ring-clay/25'

  return (
    <main className="flex min-h-[100svh] items-center justify-center px-5 py-16">
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-clay/40 text-clay">
          <Lock size={22} />
        </div>
        {coupleNames?.en && <h1 className="font-display text-4xl leading-tight text-graphite">{coupleNames.en}</h1>}
        {coupleNames?.bn && (
          <p lang="bn" className="mt-1 font-bangla text-2xl text-graphite/70">
            {coupleNames.bn}
          </p>
        )}
        {date?.en && <p className="mt-3 font-body text-sm uppercase tracking-[0.25em] text-graphite/60">{date.en}</p>}

        <div className="mx-auto my-8 h-px w-16 bg-clay/50" />

        <p className="font-body text-[15px] leading-relaxed text-graphite/80">
          This celebration is for invited guests. Enter the passcode from your invitation.
        </p>
        <p lang="bn" className="mt-1 font-bangla-body text-[15px] leading-relaxed text-graphite/70">
          আমন্ত্রণপত্রে দেওয়া পাসকোডটি লিখুন।
        </p>

        <form onSubmit={submit} className="mt-8 space-y-3 text-left">
          <label htmlFor="gate-passcode" className="sr-only">
            Passcode
          </label>
          <input
            id="gate-passcode"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            placeholder="Passcode · পাসকোড"
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            required
            className={`${field} text-center tracking-wide`}
          />
          <label htmlFor="gate-name" className="sr-only">
            Your name (optional)
          </label>
          <input
            id="gate-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name (optional) · আপনার নাম"
            autoComplete="name"
            maxLength={60}
            className={`${field} text-center`}
          />
          {error && (
            <p role="alert" className="text-center text-sm text-[#9B2C2C]">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={pending || !passcode.trim()}
            className="w-full rounded-lg bg-graphite px-4 py-3 font-body text-sm font-semibold uppercase tracking-[0.2em] text-bone transition hover:bg-clay disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? (
              'Opening…'
            ) : (
              <>
                Enter ·{' '}
                <span lang="bn" className="font-bangla-body normal-case tracking-normal">
                  প্রবেশ করুন
                </span>
              </>
            )}
          </button>
        </form>
        <p className="mt-6 text-xs text-graphite/50">Can’t find it? Ask the family who invited you.</p>
      </div>
    </main>
  )
}
