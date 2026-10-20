'use client'

import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'
import { BilingualField, Button, EmptyState, TextInput } from '@/ui'
import PanelFrame from '../PanelFrame'
import MediaField from '../MediaField'
import { usePanelDraft } from '../usePanelDraft'

const blankMilestone = () => ({
  year: '',
  title: { en: '', bn: '' },
  story: { en: '', bn: '' },
  imagePath: '',
  imagePosition: '50% 50%',
})

function move(list, from, to) {
  if (to < 0 || to >= list.length) return list
  const next = [...list]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}

export default function StoryPanel({ data, saveContent, upload, onDirtyChange }) {
  const story = data.content.story || {}
  const { draft, update, dirty, reset, commit } = usePanelDraft(
    {
      title: story.title || { en: 'Our Journey', bn: 'আমাদের পথচলা' },
      milestones: story.milestones || [],
    },
    onDirtyChange
  )

  const setMilestone = (index, patch) =>
    update({ milestones: draft.milestones.map((m, i) => (i === index ? { ...m, ...patch } : m)) })

  async function save() {
    await saveContent('story', { ...story, ...draft })
    commit(draft)
  }

  return (
    <PanelFrame
      title="Our story"
      description="A short timeline of how you met, the proposal and everything in between."
      dirty={dirty}
      onSave={save}
      onDiscard={reset}
      actions={
        <Button size="sm" icon={Plus} onClick={() => update({ milestones: [...draft.milestones, blankMilestone()] })} disabled={draft.milestones.length >= 30}>
          Add moment
        </Button>
      }
    >
      <BilingualField label="Section title" value={draft.title} onChange={(title) => update({ title })} />

      {draft.milestones.length === 0 && (
        <EmptyState title="No moments yet">Add the first moment of your story, like the year you met.</EmptyState>
      )}

      <ol className="space-y-4">
        {draft.milestones.map((m, i) => (
          <li key={i} className="rounded-xl border border-sb-line p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-sb-muted">Moment {i + 1}</span>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" icon={ArrowUp} aria-label="Move up" disabled={i === 0} onClick={() => update({ milestones: move(draft.milestones, i, i - 1) })} />
                <Button size="sm" variant="ghost" icon={ArrowDown} aria-label="Move down" disabled={i === draft.milestones.length - 1} onClick={() => update({ milestones: move(draft.milestones, i, i + 1) })} />
                <Button size="sm" variant="ghost" icon={Trash2} aria-label="Remove moment" onClick={() => update({ milestones: draft.milestones.filter((_, j) => j !== i) })} />
              </div>
            </div>
            <div className="grid gap-4 lg:grid-cols-[1fr_16rem]">
              <div className="space-y-4">
                <TextInput label="Year or date" value={m.year || ''} placeholder="2019" onChange={(e) => setMilestone(i, { year: e.target.value })} className="max-w-48" />
                <BilingualField label="Title" value={m.title} onChange={(title) => setMilestone(i, { title })} />
                <BilingualField label="What happened" multiline rows={4} value={m.story} onChange={(s) => setMilestone(i, { story: s })} />
              </div>
              <MediaField
                label="Photo"
                value={m.imagePath}
                position={m.imagePosition || '50% 50%'}
                onChange={(imagePath) => setMilestone(i, { imagePath })}
                onPositionChange={(imagePosition) => setMilestone(i, { imagePosition })}
                upload={upload}
                slot="story"
                aspect="aspect-[4/3]"
                ratio={1.33}
                aspectLabel="4:3 frame"
              />
            </div>
          </li>
        ))}
      </ol>
    </PanelFrame>
  )
}
