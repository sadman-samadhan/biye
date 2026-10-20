'use client'

import { BilingualField, Select } from '@/ui'
import PanelFrame from '../PanelFrame'
import { usePanelDraft } from '../usePanelDraft'
import { TRADITION_OPTIONS } from '../traditionOptions'

export default function CouplePanel({ data, saveContent, saveSettings, onDirtyChange }) {
  const hero = data.content.hero || {}
  const { draft, update, dirty, reset, commit } = usePanelDraft(
    {
      coupleNames: hero.coupleNames || { en: '', bn: '' },
      date: hero.date || { en: '', bn: '' },
      weddingType: data.site.wedding_type || 'muslim',
    },
    onDirtyChange
  )

  async function save() {
    const latestHero = data.content.hero || {}
    await saveContent('hero', { ...latestHero, coupleNames: draft.coupleNames, date: draft.date })
    if (draft.weddingType !== data.site.wedding_type) await saveSettings({ wedding_type: draft.weddingType })
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
    </PanelFrame>
  )
}
