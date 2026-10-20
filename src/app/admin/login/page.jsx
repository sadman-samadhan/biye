'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Lock, ArrowRight, Sparkles } from 'lucide-react'

export default function AdminLoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })

      const data = await res.json()
      if (res.ok && data.success) {
        const next = new URLSearchParams(window.location.search).get('next')
        router.push(next && next.startsWith('/admin') && !next.startsWith('//') ? next : '/admin')
      } else {
        setError(data.error || 'Invalid password')
      }
    } catch {
      setError('Connection failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#111111] text-[#FAF9F6] flex flex-col justify-center items-center px-4">
      <div className="w-full max-w-md bg-[#1A1A1A] border border-white/10 rounded-2xl p-8 md:p-10 shadow-2xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#A67C52]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#A67C52]/20 border border-[#A67C52]/40 text-[#D4A574] text-xs uppercase tracking-widest font-medium mb-4">
            <Sparkles size={12} />
            AmarBiye Platform
          </div>
          <h1 className="font-display text-3xl md:text-4xl text-[#FAF9F6] mb-2">
            Admin Portal
          </h1>
          <p className="font-body text-xs text-white/50 tracking-wider uppercase">
            Wedding Management & Intake
          </p>
        </div>

        {/* Login form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs uppercase tracking-widest text-white/70 mb-2 font-medium">
              Admin Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-11 pr-4 py-3.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#A67C52] transition-colors font-body text-sm"
              />
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-950/50 border border-red-800/60 rounded-xl text-red-300 text-xs text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 bg-gradient-to-r from-[#A67C52] to-[#8C643E] hover:from-[#B88B5E] hover:to-[#9C7046] text-white font-medium text-sm tracking-wider uppercase rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-[#A67C52]/20 disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Authenticating...' : 'Enter Dashboard'}
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <Link
            href="/"
            className="text-xs text-white/40 hover:text-white/70 transition-colors"
          >
            ← Return to AmarBiye Homepage
          </Link>
        </div>
      </div>
    </div>
  )
}
