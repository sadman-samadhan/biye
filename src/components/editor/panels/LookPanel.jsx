'use client'

import { useState } from 'react'
import { ExternalLink, Sparkles } from 'lucide-react'
import { Badge, Button, Switch, useToast } from '@/ui'
import { getTheme, themesForTradition } from '@/themes/registry'
import { TRADITIONS } from '@/traditions'
import PanelFrame from '../PanelFrame'
import { usePanelDraft } from '../usePanelDraft'

const SECTIONS = [
  { key: 'story', label: 'Our story' },
  { key: 'spotlight', label: 'Spotlight' },
  { key: 'monogram', label: 'Monogram' },
  { key: 'ceremonies', label: 'Ceremonies' },
  { key: 'gallery', label: 'Gallery' },
  { key: 'blessings', label: 'Blessings' },
  { key: 'messages', label: 'Guestbook' },
]

function Swatches({ palette, size = 'h-8 w-6' }) {
  return (
    <span className="flex shrink-0 overflow-hidden rounded-md border border-sb-line">
      {['bone', 'graphite', 'accent', 'deepAccent', 'warmAccent'].map((k) => (
        <span key={k} className={size} style={{ background: palette[k] }} />
      ))}
    </span>
  )
}

export default function LookPanel({ data, saveContent, saveSettings, onDirtyChange, canUseAi }) {
  const toast = useToast()
  const site = data.site
  const tradition = site.wedding_type === 'general' ? 'universal' : site.wedding_type || 'muslim'
  const themes = themesForTradition(tradition)
  const savedTheme = getTheme(site.template_id).id
  const aiOptions = (site.palette_options || []).filter((p) => p.id === 'ai-generated')

  const { draft, update, dirty, reset, commit } = usePanelDraft(
    {
      themeId: savedTheme,
      paletteId: site.theme_settings?.paletteId || (site.palette?.id === 'ai-generated' ? 'ai-generated' : getTheme(savedTheme).palettes[0]?.id),
      ai: aiOptions,
      toggles: { story: true, spotlight: true, monogram: true, ceremonies: true, gallery: true, blessings: true, messages: true, ...(data.content.sectionToggles || {}) },
    },
    onDirtyChange
  )
  const [extracting, setExtracting] = useState(false)
  const theme = getTheme(draft.themeId)
  const palettes = [...theme.palettes, ...draft.ai]
  const heroImage = data.content.hero?.posterPath

  async function extract() {
    setExtracting(true)
    try {
      const res = await fetch(`/api/sites/${site.id}/palette`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ media: heroImage }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Could not read colours from the photo')
      const ai = result.isAiGenerated ? result.palettes.filter((p) => p.id === 'ai-generated') : []
      if (!ai.length) return toast.info(result.message || 'No new colours found; showing the theme palettes')
      update({ ai, paletteId: 'ai-generated' })
    } catch (err) {
      toast.error(err.message)
    } finally {
      setExtracting(false)
    }
  }

  async function save() {
    const palette = palettes.find((p) => p.id === draft.paletteId) || theme.palettes[0]
    const isThemePalette = theme.palettes.some((p) => p.id === palette.id)
    await saveSettings({
      template_id: draft.themeId,
      palette,
      palette_options: draft.ai,
      theme_settings: { ...(site.theme_settings || {}), paletteId: isThemePalette ? palette.id : null },
    })
    await saveContent('sectionToggles', draft.toggles)
    commit(draft)
  }

  return (
    <PanelFrame title="Theme & colours" description="The theme sets layout, typography, ornaments and the opening. Then pick its colours and which sections to show." dirty={dirty} onSave={save} onDiscard={reset}>
      <div>
        <p className="mb-2 text-sm font-medium text-sb-ink">Theme</p>
        <div className="grid gap-3 md:grid-cols-2" role="radiogroup" aria-label="Theme">
          {themes.map((t) => {
            const selected = draft.themeId === t.id
            return (
              <div key={t.id} className={`rounded-xl border p-4 transition ${selected ? 'border-sb-marigold bg-[#FCF3E6] ring-2 ring-sb-holud/30' : 'border-sb-line hover:bg-sb-paper'}`}>
                <button
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => update({ themeId: t.id, paletteId: getTheme(t.id).palettes[0]?.id })}
                  className="block w-full text-left"
                >
                  <span className="flex items-center justify-between gap-3">
                    <span className="font-display text-xl font-semibold text-sb-ink">
                      {t.name.en} <span lang="bn" className="ml-1 font-bangla-body text-base font-normal text-sb-muted">{t.name.bn}</span>
                    </span>
                    <Swatches palette={t.palettes[0]} size="h-6 w-4" />
                  </span>
                  <span className="mt-2 block text-sm text-sb-muted">{t.description.en}</span>
                </button>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {t.recommendedFor.length < 5 &&
                    t.recommendedFor.map((id) => (
                      <Badge key={id} tone={id === tradition ? 'accent' : 'neutral'}>
                        Designed for {TRADITIONS[id]?.label.en.replace(' Wedding', '') || id}
                      </Badge>
                    ))}
                  <a
                    href={`/${site.slug}?theme=${t.id}`}
                    target="_blank"
                    rel="noopener"
                    className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-sb-marigold-deep hover:underline"
                  >
                    Preview on my site <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium text-sb-ink">Colours for {theme.name.en}</p>
          {canUseAi && (
            <Button size="sm" variant="ghost" icon={Sparkles} loading={extracting} disabled={!heroImage} onClick={extract} title={heroImage ? '' : 'Add a cover photo first'}>
              Match my cover photo
            </Button>
          )}
        </div>
        <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Colour palette">
          {palettes.map((palette) => (
            <button
              key={palette.id}
              type="button"
              role="radio"
              aria-checked={draft.paletteId === palette.id}
              onClick={() => update({ paletteId: palette.id })}
              className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${draft.paletteId === palette.id ? 'border-sb-marigold bg-[#FCF3E6] ring-2 ring-sb-holud/30' : 'border-sb-line hover:bg-sb-paper'}`}
            >
              <Swatches palette={palette} />
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-sb-ink">{palette.name}</span>
                {palette.description && <span className="line-clamp-1 text-xs text-sb-muted">{palette.description}</span>}
              </span>
            </button>
          ))}
        </div>
        {theme.paletteAI === 'accents' && draft.ai.length > 0 && (
          <p className="mt-2 text-xs text-sb-muted">With {theme.name.en}, colours from your photo change the accents; the background stays the theme’s own.</p>
        )}
      </div>

      <div className="space-y-3 rounded-xl bg-sb-paper p-4">
        <p className="text-sm font-medium text-sb-ink">Sections</p>
        {SECTIONS.map((s) => (
          <Switch key={s.key} label={s.label} checked={draft.toggles[s.key] !== false} onChange={(on) => update({ toggles: { ...draft.toggles, [s.key]: on } })} />
        ))}
      </div>
    </PanelFrame>
  )
}
