'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginForm({ next }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  async function onSubmit(event) {
    event.preventDefault()
    setPending(true)
    setError('')
    try {
      const res = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, next }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || 'Sign-in failed. Please try again.')
        return
      }
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
        <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium">
          Email
        </label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={field}
        />
      </div>
      <div>
        <label htmlFor="login-password" className="mb-1.5 block text-sm font-medium">
          Password
        </label>
        <input
          id="login-password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={field}
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-[#A8323A]">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending || !email || !password}
        className="w-full rounded-lg bg-[#1E1A17] px-4 py-3 text-sm font-semibold text-[#FBF6EE] transition hover:bg-[#3A332D] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  )
}
