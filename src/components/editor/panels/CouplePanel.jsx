'use client'

import { BilingualField, Select } from '@/ui'
import PanelFrame from '../PanelFrame'
import { usePanelDraft } from '../usePanelDraft'
import { TRADITION_OPTIONS } from '../traditionOptions'
import { TRADITIONS } from '@/traditions'

export default function CouplePanel({ data, saveContent, saveSettings, onDirtyChange }) {
  const hero = data.content.hero || {}
  const { draft, update, dirty, reset, commit } = usePanelDraft(
    {
      coupleNames: hero.coupleNames || { en: '', bn: '' },
      date: hero.date || { en: '', bn: '' },
      weddingType: data.site.wedding_type === 'general' ? 'universal' : data.site.wedding_type || 'muslim',
      variant: data.site.tradition_variant || '',
    },
    onDirtyChange
  )

  async function save() {
    const latestHero = data.content.hero || {}
    await saveContent('hero', { ...latestHero, coupleNames: draft.coupleNames, date: draft.date })
    const variant = TRADITIONS[draft.weddingType]?.variants ? draft.variant || TRADITIONS[draft.weddingType].defaultVariant : null
    if (draft.weddingType !== data.site.wedding_type || variant !== (data.site.tradition_variant || null)) {
      await saveSettings({ wedding_type: draft.weddingType, tradition_variant: variant })
    }
    commit(draft)
  }

  return (
    <PanelFrame
      title="Couple & date"
      description="How the couple's names and the wedding date appear across the site."
      dirty={dirty}
      onSave={save}
      onDiscard={reset}
    >
      <BilingualField
        label="Couple names"
        hint="Write them as you'd like guests to read them, e.g. “Rahim & Karima”."
        value={draft.coupleNames}
        onChange={(coupleNames) => update({ coupleNames })}
        placeholder={{ en: 'Rahim & Karima', bn: 'রহিম ও করিমা' }}
        maxLength={120}
      />
      <BilingualField
        label="Wedding date (as displayed)"
        hint="Exact dates and times for each event are set under Ceremonies."
        value={draft.date}
        onChange={(date) => update({ date })}
        placeholder={{ en: '18 December 2026', bn: '১৮ ডিসেম্বর ২০২৬' }}
        maxLength={120}
      />
      <Select
        label="Tradition"
        hint="Sets the ceremony presets, blessings and wording. You can still edit everything."
        value={draft.weddingType}
        onChange={(e) => update({ weddingType: e.target.value })}
        options={TRADITION_OPTIONS}
      />
      {TRADITIONS[draft.weddingType]?.variants && (
        <Select
          label="Style"
          value={draft.variant || TRADITIONS[draft.weddingType].defaultVariant}
          onChange={(e) => update({ variant: e.target.value })}
          options={Object.entries(TRADITIONS[draft.weddingType].variants).map(([value, v]) => ({ value, label: `${v.label.en} — ${v.label.bn}` }))}
        />
      )}
    </PanelFrame>
  )
}
