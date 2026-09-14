'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Users, PlusCircle, ExternalLink, LogOut, Heart } from 'lucide-react'

export default function AdminLayout({ children }) {
  const pathname = usePathname()
  const router = useRouter()

  // Don't render sidebar shell on login page
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' })
    router.push('/admin/login')
  }

  const navLinks = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'All Sites', href: '/admin/sites', icon: Users },
    { label: 'New Client Intake', href: '/admin/sites/new', icon: PlusCircle },
  ]

  return (
    <div className="min-h-screen bg-[#0F0F10] text-[#E4E4E7] flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-[#18181B] border-b md:border-b-0 md:border-r border-white/10 flex flex-col justify-between shrink-0">
        <div>
          {/* Brand Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#A67C52] to-[#6B2C3E] flex items-center justify-center text-white shadow-md">
                <Heart size={16} className="fill-white" />
              </div>
              <div>
                <span className="font-display text-lg text-white font-semibold tracking-wide block leading-tight">
                  AmarBiye
                </span>
                <span className="text-[10px] text-[#A67C52] tracking-widest uppercase font-medium">
                  Admin Console
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {navLinks.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-[#A67C52]/20 text-[#D4A574] border border-[#A67C52]/30'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-4 py-2.5 rounded-xl text-xs text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <span>View Landing Page</span>
            <ExternalLink size={14} />
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
          >
            <LogOut size={16} />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
