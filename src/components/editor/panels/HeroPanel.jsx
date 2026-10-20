'use client'

import { BilingualField, Select, TextArea, TextInput } from '@/ui'
import PanelFrame from '../PanelFrame'
import MediaField from '../MediaField'
import { usePanelDraft } from '../usePanelDraft'

// Original-language line of the opening verse, where the tradition has one
const SCRIPT = {
  muslim: { key: 'ar', label: 'Arabic', dir: 'rtl' },
  hindu: { key: 'sa', label: 'Sanskrit' },
  buddhist: { key: 'pi', label: 'Pali' },
}

export default function HeroPanel({ data, saveContent, upload, onDirtyChange }) {
  const hero = data.content.hero || {}
  const script = SCRIPT[data.site.wedding_type] || null
  const scriptKey = script?.key || 'ar'
  const blessing = hero.blessing || data.content.blessing || {}

  const { draft, update, dirty, reset, commit } = usePanelDraft(
    {
      mediaType: hero.mediaType === 'video' ? 'video' : 'image',
      posterPath: hero.posterPath || '',
      posterPosition: hero.posterPosition || '50% 50%',
      videoPath: hero.videoPath || '',
      blessingScript: blessing[scriptKey] || '',
      blessing: { en: blessing.en || '', bn: blessing.bn || '' },
      blessingRef: blessing.reference || '',
    },
    onDirtyChange
  )

  async function save() {
    const nextBlessing = {
      ...(script ? { [scriptKey]: draft.blessingScript } : {}),
      en: draft.blessing.en,
      bn: draft.blessing.bn,
      reference: draft.blessingRef,
    }
    const latest = data.content.hero || {}
    await saveContent('hero', {
      ...latest,
      mediaType: draft.mediaType,
      posterPath: draft.posterPath,
      posterPosition: draft.posterPosition,
      videoPath: draft.mediaType === 'video' ? draft.videoPath : '',
      blessing: nextBlessing,
    })
    await saveContent('blessing', nextBlessing)
    commit(draft)
  }

  return (
    <PanelFrame title="Opening" description="The first screen guests see: a cover photo or film, and the opening verse." dirty={dirty} onSave={save} onDiscard={reset}>
      <Select
        label="Cover"
        value={draft.mediaType}
        onChange={(e) => update({ mediaType: e.target.value })}
        options={[
          { value: 'image', label: 'Photo' },
          { value: 'video', label: 'Short film (MP4, muted loop)' },
        ]}
      />
      <MediaField
        label={draft.mediaType === 'video' ? 'Poster photo (shown while the film loads)' : 'Cover photo'}
        value={draft.posterPath}
        position={draft.posterPosition}
        onChange={(posterPath) => update({ posterPath })}
        onPositionChange={(posterPosition) => update({ posterPosition })}
        upload={upload}
        slot="hero"
      />
      {draft.mediaType === 'video' && (
        <MediaField
          label="Cover film"
          hint="MP4 or WebM, up to 20 MB. It plays muted on loop."
          kind="video"
          accept="video/mp4,video/webm"
          value={draft.videoPath}
          onChange={(videoPath) => update({ videoPath })}
          upload={upload}
          slot="video"
        />
      )}

      <div className="space-y-4 rounded-xl bg-sb-paper p-4">
        <p className="text-sm font-medium text-sb-ink">Opening verse</p>
        {script && (
          <TextArea
            label={script.label}
            dir={script.dir}
            lang={script.key}
            rows={2}
            value={draft.blessingScript}
            onChange={(e) => update({ blessingScript: e.target.value })}
            hint="Leave empty to skip the original-language line."
          />
        )}
        <BilingualField label="Meaning" multiline rows={3} value={draft.blessing} onChange={(blessing) => update({ blessing })} />
        <TextInput label="Reference" value={draft.blessingRef} placeholder="Surah Ar-Rum 30:21" onChange={(e) => update({ blessingRef: e.target.value })} />
      </div>
    </PanelFrame>
  )
}
