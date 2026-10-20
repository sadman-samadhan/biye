'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, PlusCircle, ExternalLink, LogOut } from 'lucide-react'
import BrandLogo from '@/components/brand/BrandLogo'
import DeveloperCredit from '@/components/brand/DeveloperCredit'

const NAV_LINKS = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard },
  { label: 'All sites', href: '/admin/sites', icon: Users },
  { label: 'New client', href: '/admin/sites/new', icon: PlusCircle },
]

export default function AdminShell({ email, children }) {
  const pathname = usePathname()
  const isActive = (href) => (href === '/admin' ? pathname === '/admin' : pathname === href || (href === '/admin/sites' && pathname.startsWith('/admin/sites/') && !pathname.endsWith('/new')))

  return (
    <div className="min-h-screen bg-sb-paper text-sb-ink md:flex">
      <aside className="flex shrink-0 flex-col justify-between border-b border-sb-line bg-sb-card md:sticky md:top-0 md:h-screen md:w-60 md:border-b-0 md:border-r">
        <div>
          <div className="flex items-center justify-between gap-3 px-5 py-5">
            <Link href="/admin" aria-label="ShubhoBiye admin home">
              <BrandLogo height={32} />
            </Link>
            <span className="rounded-full bg-sb-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-sb-marigold-deep">Admin</span>
          </div>
          <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:block md:space-y-1">
            {NAV_LINKS.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={`flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    active ? 'bg-sb-ink text-sb-paper' : 'text-sb-ink-soft hover:bg-sb-soft'
                  }`}
                >
                  <Icon size={17} />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="hidden space-y-1 border-t border-sb-line p-3 md:block">
          <p className="truncate px-3 py-1 text-xs text-sb-muted" title={email}>
            {email}
          </p>
          <Link href="/" target="_blank" className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-sb-ink-soft hover:bg-sb-soft">
            Marketing site <ExternalLink size={14} />
          </Link>
          <form action="/auth/signout" method="post">
            <button type="submit" className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-sb-alta hover:bg-[#FBEDEE]">
              <LogOut size={15} /> Sign out
            </button>
          </form>
          <div className="px-3 pt-2 text-xs text-sb-muted">
            <DeveloperCredit />
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-4 py-8 sm:px-8">
        <div className="mx-auto max-w-6xl">{children}</div>
        <div className="mt-12 flex items-center justify-between border-t border-sb-line pt-4 text-xs text-sb-muted md:hidden">
          <form action="/auth/signout" method="post">
            <button type="submit" className="text-sb-alta">
              Sign out
            </button>
          </form>
          <DeveloperCredit />
        </div>
      </main>
    </div>
  )
}
