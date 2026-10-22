import Link from 'next/link'
import { THEME_LIST } from '@/themes/registry'
import { TRADITIONS } from '@/traditions'
import { DEMO_TRADITIONS } from './packs'

const chip = 'shrink-0 rounded-lg border px-3 py-1.5 transition'
const on = 'border-[#1E1A17] bg-[#1E1A17] text-white'
const off = 'border-[#D9CDBB] hover:bg-[#F4ECDF]'

/** Floating bar on demo pages: what you are looking at, and every other combination. */
export default function DemoBar({ themeId, traditionId, view }) {
  const theme = THEME_LIST.find((t) => t.id === themeId)
  const tradition = TRADITIONS[traditionId]
  const href = (t, tr, v = view) => `/demo/${t}/${tr}${v === 'invite' ? '/invite' : ''}`
  return (
    <div className="fixed inset-x-0 bottom-0 z-[70] px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] font-sans text-[13px] text-[#1E1A17]">
      <details className="group mx-auto max-w-3xl overflow-hidden rounded-2xl border border-[#E8DFD2] bg-white/95 shadow-2xl backdrop-blur">
        <summary className="flex cursor-pointer list-none flex-wrap items-center gap-2 px-4 py-2.5 [&::-webkit-details-marker]:hidden">
          <span className="rounded bg-[#F4ECDF] px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-[#B05A10]">Demo</span>
          <span className="min-w-0 flex-1 truncate font-medium">
            {theme?.name.en} · {tradition?.label?.en}
          </span>
          <span className="flex overflow-hidden rounded-md border border-[#E8DFD2]">
            <Link href={href(themeId, traditionId, 'invite')} className={`px-2 py-1 ${view === 'invite' ? 'bg-[#1E1A17] text-white' : 'hover:bg-[#F4ECDF]'}`}>
              Invitation
            </Link>
            <Link href={href(themeId, traditionId, 'site')} className={`px-2 py-1 ${view !== 'invite' ? 'bg-[#1E1A17] text-white' : 'hover:bg-[#F4ECDF]'}`}>
              Full site
            </Link>
          </span>
          <span className="rounded-md px-2 py-1 hover:bg-[#F4ECDF]">
            Try another <span className="inline-block transition group-open:rotate-180">▴</span>
          </span>
        </summary>
        <div className="space-y-3 border-t border-[#E8DFD2] px-4 py-3">
          <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Themes">
            {THEME_LIST.map((t) => (
              <Link key={t.id} href={href(t.id, traditionId)} className={`${chip} ${t.id === themeId ? on : off}`}>
                {t.name.en}
              </Link>
            ))}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Traditions">
            {DEMO_TRADITIONS.map((id) => (
              <Link key={id} href={href(themeId, id)} className={`${chip} ${id === traditionId ? on : off}`}>
                {TRADITIONS[id]?.label?.en}
              </Link>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 text-[12px] text-[#6B625A]">
            <span>
              Demo couple and photos (
              <Link href="/demo/credits" className="underline">
                credits
              </Link>
              ). Nothing you type here is sent.
            </span>
            <Link href="/#pricing" className="rounded-lg bg-[#1E1A17] px-3 py-1.5 font-medium text-white">
              Get this for your wedding
            </Link>
          </div>
        </div>
      </details>
    </div>
  )
}
