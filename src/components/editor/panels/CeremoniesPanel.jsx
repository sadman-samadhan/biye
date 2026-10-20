'use client'

import { useState } from 'react'
import { ArrowDown, ArrowUp, ChevronDown, ChevronUp, ListOrdered, Plus, Trash2 } from 'lucide-react'
import { Badge, BilingualField, Button, EmptyState, Switch, TextInput } from '@/ui'
import { CUSTOM_EVENT_PRESETS, getTradition, isWeddingAnchorCeremony, sortCeremoniesChronologically } from '@/lib/traditions'
import CeremonyCarouselPicker from '@/components/admin/CeremonyCarouselPicker'
import PanelFrame from '../PanelFrame'
import MediaField from '../MediaField'
import { usePanelDraft } from '../usePanelDraft'

const DHAKA_OFFSET = '+06:00'

/** ISO with offset → value for <input type="datetime-local"> in Dhaka time. */
function toLocalInput(iso) {
  if (!iso) return ''
  if (iso.endsWith(DHAKA_OFFSET)) return iso.slice(0, 16)
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Dhaka', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(date)
  const get = (t) => parts.find((p) => p.type === t)?.value
  return `${get('year')}-${get('month')}-${get('day')}T${get('hour') === '24' ? '00' : get('hour')}:${get('minute')}`
}

const fromLocalInput = (value) => (value ? `${value}:00${DHAKA_OFFSET}` : '')

function move(list, from, to) {
  if (to < 0 || to >= list.length) return list
  const next = [...list]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}

const clone = (value) => JSON.parse(JSON.stringify(value))

function uniqueId(base, list) {
  const clean = base.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'event'
  let id = clean
  for (let n = 2; list.some((c) => c.id === id); n++) id = `${clean}-${n}`
  return id
}

function CeremonyEditor({ ceremony, onChange, upload }) {
  const set = (patch) => onChange({ ...ceremony, ...patch })
  const beats = ceremony.beats || []
  const setBeat = (i, patch) => set({ beats: beats.map((b, j) => (j === i ? { ...b, ...patch } : b)) })

  return (
    <div className="space-y-5 border-t border-sb-line pt-4">
      <BilingualField label="Name" value={ceremony.title} onChange={(title) => set({ title })} />
      <BilingualField label="Tagline" value={ceremony.subtitle} onChange={(subtitle) => set({ subtitle })} />
      <BilingualField label="Description" multiline rows={3} value={ceremony.description} onChange={(description) => set({ description })} />

      <div className="grid gap-4 rounded-xl bg-sb-paper p-4 sm:grid-cols-2">
        <TextInput
          label="Starts (Dhaka time)"
          type="datetime-local"
          value={toLocalInput(ceremony.startsAt)}
          onChange={(e) => set({ startsAt: fromLocalInput(e.target.value) })}
        />
        <TextInput
          label="Ends (optional)"
          type="datetime-local"
          value={toLocalInput(ceremony.endsAt)}
          onChange={(e) => set({ endsAt: fromLocalInput(e.target.value) })}
        />
        <div className="sm:col-span-2">
          <BilingualField
            label="Date as displayed (optional)"
            hint="Leave empty to show the start time automatically in English and Bangla."
            value={ceremony.date}
            onChange={(date) => set({ date })}
          />
        </div>
        <div className="sm:col-span-2">
          <BilingualField label="Venue" value={ceremony.venue} onChange={(venue) => set({ venue: { ...ceremony.venue, ...venue } })} />
        </div>
        <TextInput
          className="sm:col-span-2"
          label="Google Maps link"
          type="url"
          inputMode="url"
          placeholder="https://maps.app.goo.gl/…"
          value={ceremony.venue?.mapUrl || ''}
          onChange={(e) => set({ venue: { ...ceremony.venue, mapUrl: e.target.value.trim() } })}
          hint="In Google Maps tap Share → Copy link."
        />
      </div>

      <MediaField
        label="Banner photo"
        value={ceremony.heroImage || ''}
        position={ceremony.heroImagePosition || '50% 50%'}
        onChange={(heroImage) => set({ heroImage })}
        onPositionChange={(heroImagePosition) => set({ heroImagePosition })}
        upload={upload}
        category={ceremony.id}
        aspect="aspect-[16/9]"
        ratio={1.77}
        aspectLabel="16:9 banner"
      />

      <CeremonyCarouselPicker
        images={ceremony.carouselImages || []}
        onChange={(carouselImages) => set({ carouselImages })}
        onUpload={(file) => upload(file, ceremony.id)}
        label="Photo carousel (up to 5)"
      />

      <div>
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-sb-ink">Moments</p>
          <Button size="sm" icon={Plus} onClick={() => set({ beats: [...beats, { label: '', title: { en: '', bn: '' }, description: { en: '', bn: '' } }] })} disabled={beats.length >= 20}>
            Add moment
          </Button>
        </div>
        {beats.length === 0 && <p className="text-xs text-sb-muted">Optional: the parts of the day, e.g. “Arrival of the groom”.</p>}
        <ol className="space-y-3">
          {beats.map((beat, i) => (
            <li key={i} className="space-y-3 rounded-xl border border-sb-line p-3">
              <div className="flex items-end gap-2">
                <TextInput className="flex-1" label="Label" value={beat.label || ''} placeholder="The ritual" onChange={(e) => setBeat(i, { label: e.target.value })} />
                <Button size="sm" variant="ghost" icon={Trash2} aria-label="Remove moment" onClick={() => set({ beats: beats.filter((_, j) => j !== i) })} />
              </div>
              <BilingualField label="Title" value={beat.title} onChange={(title) => setBeat(i, { title })} />
              <BilingualField label="Description" multiline rows={2} value={beat.description} onChange={(description) => setBeat(i, { description })} />
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}

export default function CeremoniesPanel({ data, saveContent, upload, onDirtyChange }) {
  const weddingType = data.site.wedding_type || 'muslim'
  const tradition = getTradition(weddingType)
  const { draft, setDraft, dirty, reset, commit } = usePanelDraft(data.ceremonies || [], onDirtyChange)
  const [open, setOpen] = useState(() => new Set())

  const presets = [...(tradition.ceremonies || []), ...CUSTOM_EVENT_PRESETS].filter(
    (preset, index, list) => list.findIndex((p) => p.id === preset.id) === index
  )
  const available = presets.filter((p) => !draft.some((c) => c.id === p.id))

  const toggleOpen = (id) =>
    setOpen((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const replace = (index, ceremony) => setDraft(draft.map((c, i) => (i === index ? ceremony : c)))

  function addPreset(preset) {
    const next = sortCeremoniesChronologically([...draft, { ...clone(preset), enabled: true }], weddingType)
    setDraft(next)
    toggleOpen(preset.id)
  }

  function addCustom() {
    const id = uniqueId('celebration', draft)
    setDraft([
      ...draft,
      { id, slug: id, title: { en: 'New celebration', bn: '' }, subtitle: { en: '', bn: '' }, description: { en: '', bn: '' }, date: { en: '', bn: '' }, venue: { en: '', bn: '' }, enabled: true, beats: [], carouselImages: [] },
    ])
    toggleOpen(id)
  }

  async function save() {
    await saveContent('ceremonies', draft)
    commit(draft)
  }

  return (
    <PanelFrame
      title="Ceremonies"
      description="Each event of the wedding, in the order guests will experience them."
      dirty={dirty}
      onSave={save}
      onDiscard={reset}
      actions={
        <>
          <Button size="sm" variant="ghost" icon={ListOrdered} onClick={() => setDraft(sortCeremoniesChronologically(draft, weddingType))}>
            Sort by tradition
          </Button>
          <Button size="sm" icon={Plus} onClick={addCustom}>
            Custom event
          </Button>
        </>
      }
    >
      {available.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium text-sb-ink">Add from {tradition.label?.en || 'presets'}</p>
          <div className="flex flex-wrap gap-2">
            {available.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => addPreset(preset)}
                className="inline-flex items-center gap-1.5 rounded-full border border-sb-line-strong bg-sb-card px-3 py-1.5 text-sm hover:border-sb-marigold hover:bg-sb-soft"
              >
                <Plus size={14} /> {preset.title?.en}
                {preset.title?.bn && <span lang="bn" className="text-sb-muted">· {preset.title.bn}</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {draft.length === 0 && <EmptyState title="No ceremonies yet">Add the events from the presets above, or a custom one.</EmptyState>}

      <ol className="space-y-3">
        {draft.map((ceremony, i) => {
          const anchor = isWeddingAnchorCeremony(ceremony)
          const isOpen = open.has(ceremony.id)
          return (
            <li key={ceremony.id} className={`rounded-xl border p-4 ${ceremony.enabled === false ? 'border-sb-line bg-sb-paper/60' : 'border-sb-line-strong'}`}>
              <div className="flex flex-wrap items-center gap-3">
                <button type="button" onClick={() => toggleOpen(ceremony.id)} className="flex min-w-0 flex-1 items-center gap-2 text-left" aria-expanded={isOpen}>
                  {isOpen ? <ChevronUp size={18} className="shrink-0" /> : <ChevronDown size={18} className="shrink-0" />}
                  <span className="truncate font-medium text-sb-ink">{ceremony.title?.en || ceremony.id}</span>
                  {ceremony.title?.bn && <span lang="bn" className="hidden truncate text-sm text-sb-muted sm:inline">{ceremony.title.bn}</span>}
                  {anchor && <Badge tone="accent">Main ceremony</Badge>}
                </button>
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="ghost" icon={ArrowUp} aria-label="Move earlier" disabled={i === 0} onClick={() => setDraft(move(draft, i, i - 1))} />
                  <Button size="sm" variant="ghost" icon={ArrowDown} aria-label="Move later" disabled={i === draft.length - 1} onClick={() => setDraft(move(draft, i, i + 1))} />
                  {!anchor && (
                    <Button size="sm" variant="ghost" icon={Trash2} aria-label={`Remove ${ceremony.title?.en || 'event'}`} onClick={() => setDraft(draft.filter((_, j) => j !== i))} />
                  )}
                </div>
                <div className="w-full sm:w-auto">
                  <Switch
                    label="Show on site"
                    checked={ceremony.enabled !== false}
                    disabled={anchor}
                    onChange={(enabled) => replace(i, { ...ceremony, enabled })}
                  />
                </div>
              </div>
              {isOpen && <CeremonyEditor ceremony={ceremony} upload={upload} onChange={(c) => replace(i, c)} />}
            </li>
          )
        })}
      </ol>
    </PanelFrame>
  )
}
