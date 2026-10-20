'use client'

import { RotateCcw } from 'lucide-react'
import { BilingualField, Button, EmptyState } from '@/ui'
import { getTradition } from '@/traditions'
import PanelFrame from '../PanelFrame'
import { usePanelDraft } from '../usePanelDraft'

/** Duas / blessings (from the tradition, editable order) plus the parents' message. */
export default function BlessingsPanel({ data, saveContent, onDirtyChange }) {
  const tradition = getTradition(data.site.wedding_type, data.site.tradition_variant)
  const saved = data.duas || {}
  const { draft, update, dirty, reset, commit } = usePanelDraft(
    {
      duas: saved.duas?.length ? saved.duas : tradition.defaultDuas || [],
      parentBlessings: {
        title: saved.parentBlessings?.title || tradition.parentBlessings?.title || { en: '', bn: '' },
        message: saved.parentBlessings?.message || tradition.parentBlessings?.message || { en: '', bn: '' },
        attribution: saved.parentBlessings?.attribution || tradition.parentBlessings?.attribution || { en: '', bn: '' },
      },
    },
    onDirtyChange
  )

  const setParent = (patch) => update({ parentBlessings: { ...draft.parentBlessings, ...patch } })

  async function save() {
    await saveContent('duas', draft)
    commit(draft)
  }

  return (
    <PanelFrame title="Blessings" description="Verses and prayers for the couple, and a message from the parents." dirty={dirty} onSave={save} onDiscard={reset}>
      <div>
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-sb-ink">Verses &amp; prayers</p>
          <Button size="sm" variant="ghost" icon={RotateCcw} onClick={() => update({ duas: tradition.defaultDuas || [] })}>
            Use tradition defaults
          </Button>
        </div>
        {draft.duas.length === 0 ? (
          <EmptyState title="No verses">This tradition has no default verses. The section shows only the parents’ message.</EmptyState>
        ) : (
          <ul className="space-y-2">
            {draft.duas.map((dua, i) => (
              <li key={i} className="flex items-start justify-between gap-3 rounded-xl border border-sb-line p-3">
                <div className="min-w-0 text-sm">
                  <p className="text-sb-ink">{dua.english || dua.translation || dua.en}</p>
                  <p className="mt-0.5 text-xs text-sb-muted">{dua.reference?.en || dua.reference}</p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => update({ duas: draft.duas.filter((_, j) => j !== i) })}>
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-4 rounded-xl bg-sb-paper p-4">
        <p className="text-sm font-medium text-sb-ink">From the parents</p>
        <BilingualField label="Heading" value={draft.parentBlessings.title} onChange={(title) => setParent({ title })} />
        <BilingualField label="Message" multiline rows={4} value={draft.parentBlessings.message} onChange={(message) => setParent({ message })} />
        <BilingualField label="Signed" value={draft.parentBlessings.attribution} onChange={(attribution) => setParent({ attribution })} />
      </div>
    </PanelFrame>
  )
}
