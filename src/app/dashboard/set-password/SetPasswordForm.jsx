'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SetPasswordForm() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  const mismatch = confirm.length > 0 && confirm !== password

  async function onSubmit(event) {
    event.preventDefault()
    if (password.length < 10) return setError('Use at least 10 characters.')
    if (password !== confirm) return setError('The two passwords don’t match.')
    setPending(true)
    setError('')
    try {
      const res = await fetch('/auth/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) return setError(data.error || 'Could not save your password.')
      router.replace(data.redirect || '/dashboard')
      router.refresh()
    } catch {
      setError('Could not reach the server. Check your connection and try again.')
    } finally {
      setPending(false)
    }
  }

  const field =
    'w-full rounded-lg border border-[#E2D8C9] bg-white px-4 py-3 text-[15px] outline-none transition focus:border-[#D4741C] focus:ring-2 focus:ring-[#E3A21A]/30'

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div>
        <label htmlFor="new-password" className="mb-1.5 block text-sm font-medium">
          New password
        </label>
        <input id="new-password" type="password" autoComplete="new-password" minLength={10} required value={password} onChange={(e) => setPassword(e.target.value)} className={field} />
        <p className="mt-1 text-xs text-[#6B625A]">At least 10 characters.</p>
      </div>
      <div>
        <label htmlFor="confirm-password" className="mb-1.5 block text-sm font-medium">
          Type it again
        </label>
        <input id="confirm-password" type="password" autoComplete="new-password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} className={field} aria-invalid={mismatch} />
      </div>
      {error && (
        <p role="alert" className="text-sm text-[#A8323A]">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending || !password || !confirm}
        className="w-full rounded-lg bg-[#1E1A17] px-4 py-3 text-sm font-semibold text-[#FBF6EE] transition hover:bg-[#3A332D] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? 'Saving…' : 'Save password'}
      </button>
    </form>
  )
}
