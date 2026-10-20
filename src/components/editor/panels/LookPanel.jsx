'use client'

import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { Button, Switch, useToast } from '@/ui'
import { PRESET_PALETTES } from '@/lib/palettes'
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

const SWATCH_KEYS = ['bone', 'graphite', 'accent', 'deepAccent', 'warmAccent']

function Swatches({ palette }) {
  return (
    <span className="flex overflow-hidden rounded-md border border-sb-line">
      {SWATCH_KEYS.map((k) => (
        <span key={k} className="h-8 w-6" style={{ background: palette[k] }} />
      ))}
    </span>
  )
}

export default function LookPanel({ data, saveContent, saveSettings, onDirtyChange, canUseAi }) {
  const toast = useToast()
  const site = data.site
  const options = site.palette_options?.length ? site.palette_options : PRESET_PALETTES
  const { draft, update, dirty, reset, commit } = usePanelDraft(
    {
      options,
      selected: Math.min(site.selected_palette_index || 0, options.length - 1),
      toggles: { story: true, spotlight: true, monogram: true, ceremonies: true, gallery: true, blessings: true, messages: true, ...(data.content.sectionToggles || {}) },
    },
    onDirtyChange
  )
  const [extracting, setExtracting] = useState(false)
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
      if (!result.isAiGenerated) toast.info(result.message || 'Showing curated palettes')
      update({ options: result.palettes, selected: 0 })
    } catch (err) {
      toast.error(err.message)
    } finally {
      setExtracting(false)
    }
  }

  async function save() {
    await saveSettings({ palette: draft.options[draft.selected], palette_options: draft.options, selected_palette_index: draft.selected })
    await saveContent('sectionToggles', draft.toggles)
    commit(draft)
  }

  return (
    <PanelFrame title="Look & sections" description="Colours for the site, and which sections guests see." dirty={dirty} onSave={save} onDiscard={reset}>
      <div>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium text-sb-ink">Colour palette</p>
          {canUseAi && (
            <Button size="sm" variant="ghost" icon={Sparkles} loading={extracting} disabled={!heroImage} onClick={extract} title={heroImage ? '' : 'Add a cover photo first'}>
              Match my cover photo
            </Button>
          )}
        </div>
        <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Colour palette">
          {draft.options.map((palette, i) => (
            <button
              key={`${palette.id || palette.name}-${i}`}
              type="button"
              role="radio"
              aria-checked={draft.selected === i}
              onClick={() => update({ selected: i })}
              className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${draft.selected === i ? 'border-sb-marigold bg-[#FCF3E6] ring-2 ring-sb-holud/30' : 'border-sb-line hover:bg-sb-paper'}`}
            >
              <Swatches palette={palette} />
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-sb-ink">{palette.name}</span>
                {palette.description && <span className="line-clamp-1 text-xs text-sb-muted">{palette.description}</span>}
              </span>
            </button>
          ))}
        </div>
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
