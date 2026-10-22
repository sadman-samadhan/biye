'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Check, ChevronDown, ChevronUp, Eye, Palette, RotateCcw, X } from 'lucide-react'
import { THEME_LIST } from '@/themes/registry'

const STATUS = { draft: 'Draft — guests can’t see this yet', archived: 'In Trash — guests get “not found”', expired: 'Expired — guests get “not found”', live: 'Live' }

/**
 * Shown only to the couple and operators. Try other themes and palettes on the
 * real site (?theme=&palette=), then apply one or go back. When the site has an
 * invitation, switch between it and the full site.
 */
export default function PreviewBar({ siteId, slug, status, isAdmin, themeId, savedThemeId, paletteId, previewing, views }) {
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(Boolean(previewing))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const theme = THEME_LIST.find((t) => t.id === themeId) || THEME_LIST[0]

  const go = (params) => {
    const q = new URLSearchParams(params)
    router.replace(`${pathname}${q.toString() ? `?${q}` : ''}`, { scroll: false })
  }

  async function apply() {
    setSaving(true)
    setError(null)
    try {
      const palette = theme.palettes.find((p) => p.id === paletteId) || theme.palettes[0]
      const res = await fetch(`/api/sites/${siteId}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template_id: themeId, palette, theme_settings: { paletteId: palette.id } }),
      })
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Could not apply')
      go({})
      router.refresh()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  // The opening plays once per visit (OpeningGate); forget that and reload to see it again
  function replayOpening() {
    try {
      sessionStorage.removeItem(`shb-opening-${slug}`)
    } catch {}
    window.location.reload()
  }

  const editor = isAdmin ? `/admin/sites/${siteId}#look` : `/dashboard/${siteId}#look`

  return (
    <div className="fixed inset-x-0 bottom-0 z-[70] px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] font-sans text-[13px] text-[#1E1A17]">
      <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-[#E8DFD2] bg-white/95 shadow-2xl backdrop-blur">
        <div className="flex flex-wrap items-center gap-2 px-4 py-2.5">
          <Eye size={16} className="text-[#B05A10]" />
          <span className="min-w-0 flex-1 truncate font-medium">{previewing ? `Previewing ${theme.name.en}` : STATUS[status] || 'Preview'}</span>
          {views && (
            <span className="flex overflow-hidden rounded-md border border-[#E8DFD2]">
              {[
                ['invite', 'Invitation', `/${slug}/invite`],
                ['memories', 'Full site', `/${slug}/memories`],
              ].map(([id, label, href]) => (
                <a key={id} href={href} aria-current={views.current === id ? 'page' : undefined} className={`px-2 py-1 ${views.current === id ? 'bg-[#1E1A17] text-white' : 'hover:bg-[#F4ECDF]'}`}>
                  {label}
                </a>
              ))}
            </span>
          )}
          <a href={editor} className="rounded-md px-2 py-1 text-[#6B625A] hover:bg-[#F4ECDF]">
            Editor
          </a>
          <button type="button" onClick={() => setOpen((o) => !o)} className="inline-flex items-center gap-1 rounded-md px-2 py-1 hover:bg-[#F4ECDF]" aria-expanded={open}>
            <Palette size={15} /> Themes {open ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
        </div>
        {open && (
          <div className="space-y-3 border-t border-[#E8DFD2] px-4 py-3">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {THEME_LIST.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => go(t.id === savedThemeId ? {} : { theme: t.id })}
                  className={`shrink-0 rounded-lg border px-3 py-1.5 ${t.id === themeId ? 'border-[#1E1A17] bg-[#1E1A17] text-white' : 'border-[#D9CDBB] hover:bg-[#F4ECDF]'}`}
                >
                  {t.name.en}
                  {t.id === savedThemeId && <span className="ml-1.5 text-[11px] opacity-70">(current)</span>}
                </button>
              ))}
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {theme.palettes.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  title={p.name}
                  onClick={() => go({ ...(themeId !== savedThemeId ? { theme: themeId } : {}), palette: p.id })}
                  className={`flex shrink-0 items-center gap-2 rounded-lg border px-2 py-1 ${p.id === paletteId ? 'border-[#1E1A17]' : 'border-[#E8DFD2] hover:bg-[#F4ECDF]'}`}
                >
                  <span className="flex overflow-hidden rounded">
                    {['bone', 'accent', 'deepAccent', 'warmAccent'].map((k) => (
                      <span key={k} className="h-5 w-3" style={{ background: p[k] }} />
                    ))}
                  </span>
                  {p.name}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {previewing && (
                <>
                  <button type="button" onClick={apply} disabled={saving} className="inline-flex items-center gap-1.5 rounded-lg bg-[#1E1A17] px-3 py-1.5 font-medium text-white disabled:opacity-50">
                    <Check size={14} /> {saving ? 'Applying…' : `Use ${theme.name.en}`}
                  </button>
                  <button type="button" onClick={() => go({})} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 hover:bg-[#F4ECDF]">
                    <X size={14} /> Cancel preview
                  </button>
                </>
              )}
              <button type="button" onClick={replayOpening} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 hover:bg-[#F4ECDF]">
                <RotateCcw size={14} /> Replay opening
              </button>
              <span className="text-[12px] text-[#6B625A]">Only you see this bar. Guests see /{slug} as saved.</span>
              {error && <span className="text-[12px] text-[#A8323A]">{error}</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
