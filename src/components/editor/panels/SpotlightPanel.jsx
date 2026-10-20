'use client'

import { BilingualField } from '@/ui'
import PanelFrame from '../PanelFrame'
import MediaField from '../MediaField'
import { usePanelDraft } from '../usePanelDraft'

export default function SpotlightPanel({ data, saveContent, upload, onDirtyChange }) {
  const spotlight = data.content.brideReveal || {}
  const { draft, update, dirty, reset, commit } = usePanelDraft(
    {
      title: spotlight.title || { en: 'Our Families Said Yes', bn: 'পরিবারের সম্মতিতে এক হলো দুটি মন' },
      description: spotlight.description || { en: '', bn: '' },
      imagePath: spotlight.imagePath || '',
      imagePosition: spotlight.imagePosition || '50% 50%',
    },
    onDirtyChange
  )

  async function save() {
    await saveContent('brideReveal', { ...spotlight, ...draft })
    commit(draft)
  }

  return (
    <PanelFrame title="Spotlight" description="One large photo with a short message, such as the moment both families agreed." dirty={dirty} onSave={save} onDiscard={reset}>
      <BilingualField label="Heading" value={draft.title} onChange={(title) => update({ title })} />
      <BilingualField label="Message" multiline rows={4} value={draft.description} onChange={(description) => update({ description })} />
      <MediaField
        label="Photo"
        value={draft.imagePath}
        position={draft.imagePosition}
        onChange={(imagePath) => update({ imagePath })}
        onPositionChange={(imagePosition) => update({ imagePosition })}
        upload={upload}
        category="spotlight"
        aspect="aspect-[16/9]"
        ratio={1.77}
        aspectLabel="16:9 banner"
      />
    </PanelFrame>
  )
}
