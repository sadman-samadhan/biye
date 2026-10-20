'use client'

import { useState } from 'react'
import { Wand2 } from 'lucide-react'
import { Button, useToast } from '@/ui'
import { getImagePath } from '@/lib/media'
import PanelFrame from '../PanelFrame'
import MediaField from '../MediaField'
import { usePanelDraft } from '../usePanelDraft'

export default function MonogramPanel({ data, saveContent, upload, onDirtyChange, canGenerate }) {
  const toast = useToast()
  const { draft, setDraft, dirty, reset, commit } = usePanelDraft(data.content.logoUrl || '', onDirtyChange)
  const [generating, setGenerating] = useState(false)

  async function generate() {
    setGenerating(true)
    try {
      const names = (data.content.hero?.coupleNames?.en || '').split(/\s*(?:&|and|ও)\s*/i)
      const blessing = data.content.hero?.blessing || data.content.blessing || {}
      const res = await fetch('/api/monogram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name1: names[0] || 'Bride',
          name2: names[1] || 'Groom',
          blessingText: blessing.en,
          verseSnippet: blessing.reference,
          venue: data.ceremonies?.[0]?.venue?.en || '',
          weddingType: data.site.wedding_type,
          siteId: data.site.id,
        }),
      })
      const result = await res.json()
      if (!res.ok || !result.url) throw new Error(result.error || 'Could not generate the monogram')
      setDraft(result.url)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setGenerating(false)
    }
  }

  async function save() {
    await saveContent('logoUrl', draft || null)
    commit(draft)
  }

  return (
    <PanelFrame
      title="Monogram"
      description="A crest with the couple's initials, shown between the story and the ceremonies."
      dirty={dirty}
      onSave={save}
      onDiscard={reset}
      actions={
        canGenerate && (
          <Button size="sm" icon={Wand2} loading={generating} onClick={generate}>
            Generate from names
          </Button>
        )
      }
    >
      {draft && draft.startsWith('data:') ? (
        // eslint-disable-next-line @next/next/no-img-element -- generated preview
        <img src={draft} alt="Monogram preview" className="mx-auto aspect-square w-64 rounded-xl border border-sb-line object-contain" />
      ) : (
        <MediaField
          label="Monogram image"
          hint="Square PNG with a transparent background works best."
          value={draft}
          onChange={setDraft}
          upload={upload}
          category="monogram"
          accept="image/png,image/webp"
          aspect="aspect-square"
        />
      )}
      {draft && !draft.startsWith('data:') && (
        <p className="text-xs text-sb-muted">
          Current file: <span className="break-all">{getImagePath(draft)}</span>
        </p>
      )}
    </PanelFrame>
  )
}
