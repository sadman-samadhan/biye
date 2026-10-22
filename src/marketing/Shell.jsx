import Link from 'next/link'
import { MessageCircle } from 'lucide-react'
import BrandLogo from '@/components/brand/BrandLogo'
import DeveloperCredit from '@/components/brand/DeveloperCredit'
import { MARKETING, whatsappUrl } from '@/i18n/marketing'

/** Header and footer for the marketing pages (warm paper and ink, so the themes stand out). */
export default function Shell({ locale = 'en', children }) {
  const t = MARKETING[locale]
  const home = locale === 'bn' ? '/bn' : '/'
  return (
    <div lang={locale} className={`min-h-screen bg-sb-paper text-sb-ink ${locale === 'bn' ? 'font-bangla-body' : 'font-body'}`}>
      <header className="sticky top-0 z-50 border-b border-sb-line bg-sb-paper/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
          <Link href={home} aria-label="ShubhoBiye home" className="shrink-0">
            <BrandLogo height={34} priority />
          </Link>
          <nav aria-label="Main" className="hidden items-center gap-6 text-sm text-sb-ink-soft md:flex">
            <Link href={`${home === '/' ? '' : home}/#themes`} className="hover:text-sb-ink">
              {t.nav.themes}
            </Link>
            <Link href={`${home === '/' ? '' : home}/#how`} className="hover:text-sb-ink">
              {t.nav.how}
            </Link>
            <Link href={`${home === '/' ? '' : home}/#pricing`} className="hover:text-sb-ink">
              {t.nav.pricing}
            </Link>
            <Link href={`${home === '/' ? '' : home}/#faq`} className="hover:text-sb-ink">
              {t.nav.faq}
            </Link>
          </nav>
          <div className="flex items-center gap-2 text-sm">
            <Link href={t.other.href} lang={locale === 'bn' ? 'en' : 'bn'} className={`rounded-md px-2.5 py-1.5 hover:bg-sb-soft ${locale === 'bn' ? '' : 'font-bangla-body'}`}>
              {t.other.label}
            </Link>
            <Link href="/login" className="hidden rounded-md px-2.5 py-1.5 hover:bg-sb-soft sm:inline">
              {t.nav.login}
            </Link>
            <a href={whatsappUrl(locale)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-sb-ink px-3 py-2 font-medium text-sb-paper hover:bg-sb-ink-soft">
              <MessageCircle size={15} />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>
          </div>
        </div>
      </header>
      {children}
      <footer className="border-t border-sb-line bg-sb-card">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 text-sm text-sb-muted md:flex-row md:items-center md:justify-between">
          <div>
            <BrandLogo height={30} />
            <p className="mt-2">{t.footer.tagline}</p>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link href="/themes" className="hover:text-sb-ink">
              {t.footer.themes}
            </Link>
            <Link href="/demo/credits" className="hover:text-sb-ink">
              {t.footer.credits}
            </Link>
            <Link href="/login" className="hover:text-sb-ink">
              {t.footer.login}
            </Link>
            <Link href="/privacy" className="hover:text-sb-ink">
              {t.footer.privacy}
            </Link>
            <Link href="/terms" className="hover:text-sb-ink">
              {t.footer.terms}
            </Link>
            <DeveloperCredit />
          </div>
        </div>
      </footer>
    </div>
  )
}
