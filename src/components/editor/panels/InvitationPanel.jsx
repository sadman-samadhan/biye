'use client'

import { BilingualField, Select, Switch, TextInput } from '@/ui'
import { createCopy, getTradition } from '@/traditions'
import { inviteEvents } from '@/lib/invitation'
import CeremonyCarouselPicker from '@/components/admin/CeremonyCarouselPicker'
import PanelFrame from '../PanelFrame'
import MediaField from '../MediaField'
import { usePanelDraft } from '../usePanelDraft'
import { useMediaUrls } from '../media-context'

const EMPTY = { en: '', bn: '' }

const emptyHost = (side) => ({ side, relation: side === 'bride' ? 'daughter' : 'son', child: { ...EMPTY }, parents: { ...EMPTY }, address: { ...EMPTY } })

function initial(invitation = {}) {
  const hosts = invitation.hosts?.length ? invitation.hosts : [emptyHost('bride'), emptyHost('groom')]
  return {
    showVerse: invitation.showVerse !== false,
    hosts: [hosts[0] || emptyHost('bride'), hosts[1] || emptyHost('groom')],
    wording: invitation.wording || { ...EMPTY },
    closing: invitation.closing || { ...EMPTY },
    signedBy: invitation.signedBy || { ...EMPTY },
    cover: invitation.cover || '',
    coverPosition: invitation.coverPosition || '50% 50%',
    photos: invitation.photos || [],
    countdownTo: invitation.countdownTo || '',
    shareCardPhoto: Boolean(invitation.shareCardPhoto),
    rsvp: { enabled: false, deadline: '', maxParty: 5, collectPhone: false, note: { ...EMPTY }, ...(invitation.rsvp || {}) },
  }
}

const filled = (v) => Boolean(v?.en?.trim() || v?.bn?.trim())

function HostEditor({ host, onChange, title }) {
  const set = (patch) => onChange({ ...host, ...patch })
  return (
    <div className="space-y-4 rounded-xl border border-sb-line p-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <p className="text-sm font-medium text-sb-ink">{title}</p>
        <Select
          className="w-40"
          label="Relation"
          value={host.relation}
          onChange={(e) => set({ relation: e.target.value })}
          options={[
            { value: 'daughter', label: 'Daughter of' },
            { value: 'son', label: 'Son of' },
          ]}
        />
      </div>
      <BilingualField label="Name" value={host.child} onChange={(child) => set({ child })} placeholder={{ en: 'Ayesha Rahman', bn: 'আয়েশা রহমান' }} />
      <BilingualField label="Parents" value={host.parents} onChange={(parents) => set({ parents })} placeholder={{ en: 'Mr. & Mrs. Abdur Rahman', bn: 'জনাব আব্দুর রহমান ও মিসেস রোকেয়া রহমান' }} />
      <BilingualField label="Home town or address (optional)" value={host.address} onChange={(address) => set({ address })} />
    </div>
  )
}

export default function InvitationPanel({ data, saveContent, upload, onDirtyChange }) {
  const { resolve } = useMediaUrls()
  const tradition = getTradition(data.site.wedding_type || 'muslim', data.site.tradition_variant)
  const t = createCopy(tradition)
  const { draft, setDraft, update, dirty, reset, commit } = usePanelDraft(initial(data.invitation), onDirtyChange)
  const events = inviteEvents(data.ceremonies || []).filter((c) => c.startsAt)
  const rsvp = draft.rsvp
  const setRsvp = (patch) => update({ rsvp: { ...rsvp, ...patch } })

  async function save() {
    const value = {
      ...(data.invitation || {}),
      ...draft,
      hosts: draft.hosts.filter((h) => filled(h.child) || filled(h.parents)),
      countdownTo: draft.countdownTo || null,
      cover: draft.cover || null,
      rsvp: { ...rsvp, maxParty: Number(rsvp.maxParty) || 5 },
    }
    const saved = await saveContent('invitation', value)
    commit(initial(saved))
  }

  return (
    <PanelFrame
      title="Invitation"
      description="What guests see before the wedding: the wording, both families, the events and the RSVP. Events, dates and venues come from Ceremonies."
      dirty={dirty}
      onSave={save}
      onDiscard={reset}
    >
      <section className="space-y-4">
        <BilingualField
          label="Invitation wording"
          multiline
          rows={2}
          hint="Leave empty to use the wording for this tradition."
          value={draft.wording}
          onChange={(wording) => update({ wording })}
          placeholder={t('invite.wording')}
        />
        <Switch label="Show the verse" description="The verse from Blessings, or the tradition's default." checked={draft.showVerse} onChange={(showVerse) => update({ showVerse })} />
      </section>

      <section className="space-y-3">
        <p className="text-sm font-medium text-sb-ink">Families</p>
        <div className="grid gap-4 xl:grid-cols-2">
          {draft.hosts.map((host, i) => (
            <HostEditor key={host.side} title={host.side === 'bride' ? "Bride's family" : "Groom's family"} host={host} onChange={(h) => update({ hosts: draft.hosts.map((x, j) => (j === i ? h : x)) })} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <MediaField
          label="Cover photo"
          hint="Leave empty to use the opening photo."
          value={draft.cover}
          position={draft.coverPosition}
          onChange={(cover) => update({ cover })}
          onPositionChange={(coverPosition) => update({ coverPosition })}
          upload={upload}
          slot="invite"
          aspect="aspect-[3/4]"
          ratio={0.75}
          aspectLabel="3:4 portrait"
        />
        <CeremonyCarouselPicker
          images={draft.photos}
          maxImages={10}
          onChange={(photos) => update({ photos })}
          onUpload={async (file) => (await upload(file, { slot: 'invite' })).token}
          resolveSrc={(value) => resolve(value)}
          label="Invitation photos (up to 10)"
        />
        <p className="text-xs text-sb-muted">Photos on the invitation are visible to everyone who can open it, including when the invitation is public.</p>
        <Switch
          label="Cover photo on the link preview"
          description="Shows the cover in WhatsApp and Messenger link previews. Anyone holding the link can see the preview, even without the passcode."
          checked={draft.shareCardPhoto}
          onChange={(shareCardPhoto) => update({ shareCardPhoto })}
        />
      </section>

      <section className="space-y-4 rounded-xl bg-sb-paper p-4">
        <Select
          label="Countdown to"
          value={draft.countdownTo}
          onChange={(e) => update({ countdownTo: e.target.value })}
          options={[{ value: '', label: 'The main ceremony (automatic)' }, ...events.map((c) => ({ value: c.id, label: c.title?.en || c.id }))]}
        />
        {events.length === 0 && <p className="text-xs text-sb-muted">Add start times in Ceremonies to show a countdown and calendar buttons.</p>}
      </section>

      <section className="space-y-4 rounded-xl border border-sb-line p-4">
        <Switch label="Ask guests to RSVP" description="Guests reply on the invitation; you see the replies under RSVPs." checked={Boolean(rsvp.enabled)} onChange={(enabled) => setRsvp({ enabled })} />
        {rsvp.enabled && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput label="Reply by (optional)" type="date" value={rsvp.deadline || ''} onChange={(e) => setRsvp({ deadline: e.target.value })} hint="Without a date, replies close when the last event starts." />
              <Select
                label="Most guests per reply"
                value={String(rsvp.maxParty || 5)}
                onChange={(e) => setRsvp({ maxParty: Number(e.target.value) })}
                options={Array.from({ length: 20 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }))}
              />
            </div>
            <Switch label="Ask for a phone number" checked={Boolean(rsvp.collectPhone)} onChange={(collectPhone) => setRsvp({ collectPhone })} />
            <BilingualField label="Note above the form (optional)" value={rsvp.note} onChange={(note) => setRsvp({ note })} placeholder={{ en: 'Kindly reply so we can plan seating', bn: 'আসন ব্যবস্থার জন্য অনুগ্রহ করে জানান' }} />
          </>
        )}
      </section>

      <section className="space-y-4">
        <BilingualField label="Closing" value={draft.closing} onChange={(closing) => update({ closing })} placeholder={t('invite.closing')} hint="Leave empty to use the tradition's closing." />
        <BilingualField label="Signed by (optional)" value={draft.signedBy} onChange={(signedBy) => update({ signedBy })} placeholder={{ en: 'The Rahman and Chowdhury families', bn: 'রহমান ও চৌধুরী পরিবার' }} />
      </section>
    </PanelFrame>
  )
}
