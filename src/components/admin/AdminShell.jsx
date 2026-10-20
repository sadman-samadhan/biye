'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, PlusCircle, ExternalLink, LogOut } from 'lucide-react'
import BrandLogo from '@/components/brand/BrandLogo'
import DeveloperCredit from '@/components/brand/DeveloperCredit'

const NAV_LINKS = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'All Sites', href: '/admin/sites', icon: Users },
  { label: 'New Client Intake', href: '/admin/sites/new', icon: PlusCircle },
]

export default function AdminShell({ email, children }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-[#0F0F10] text-[#E4E4E7] flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-[#18181B] border-b md:border-b-0 md:border-r border-white/10 flex flex-col justify-between shrink-0">
        <div>
          <div className="p-6 border-b border-white/10">
            <Link href="/admin" className="block" aria-label="ShubhoBiye admin home">
              <BrandLogo tone="dark" height={34} />
            </Link>
            <span className="mt-2 block text-[10px] text-[#E3A21A] tracking-widest uppercase font-medium">Admin Console</span>
          </div>

          <nav className="p-4 space-y-1">
            {NAV_LINKS.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-[#E3A21A]/15 text-[#F2C35B] border border-[#E3A21A]/30'
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

        <div className="p-4 border-t border-white/10 space-y-2">
          <p className="px-4 text-[11px] text-zinc-500 truncate" title={email}>{email}</p>
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-4 py-2.5 rounded-xl text-xs text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <span>View Landing Page</span>
            <ExternalLink size={14} />
          </Link>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </form>
          <div className="px-4 pt-2 text-[11px] text-zinc-500">
            <DeveloperCredit tone="dark" />
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-6 md:p-10">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  )
}
