'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { ExternalLink, Loader2 } from 'lucide-react'
import { Badge, Button, ConfirmProvider, STATUS_BADGE, ToastProvider } from '@/ui'
import { useSiteEditor } from './useSiteEditor'
import { useUpload } from './useUpload'
import { MediaUrlProvider, useMediaUrlState } from './media-context'
import CouplePanel from './panels/CouplePanel'
import HeroPanel from './panels/HeroPanel'
import StoryPanel from './panels/StoryPanel'
import SpotlightPanel from './panels/SpotlightPanel'
import CeremoniesPanel from './panels/CeremoniesPanel'
import BlessingsPanel from './panels/BlessingsPanel'
import GalleryPanel from './panels/GalleryPanel'
import LookPanel from './panels/LookPanel'
import MonogramPanel from './panels/MonogramPanel'
import FooterPanel from './panels/FooterPanel'
import MessagesPanel from './panels/MessagesPanel'
import AccessPanel from './panels/AccessPanel'
import InvitationPanel from './panels/InvitationPanel'
import RsvpsPanel from './panels/RsvpsPanel'
import AdminSettingsPanel from './panels/AdminSettingsPanel'
import MembersPanel from './panels/MembersPanel'

const PANELS = [
  { key: 'couple', group: 'Basics', label: 'Couple & date', Component: CouplePanel },
  { key: 'look', group: 'Basics', label: 'Theme & colours', Component: LookPanel },
  { key: 'invitation', group: 'Content', label: 'Invitation', Component: InvitationPanel },
  { key: 'hero', group: 'Content', label: 'Opening', Component: HeroPanel },
  { key: 'story', group: 'Content', label: 'Our story', Component: StoryPanel },
  { key: 'spotlight', group: 'Content', label: 'Spotlight', Component: SpotlightPanel },
  { key: 'monogram', group: 'Content', label: 'Monogram', Component: MonogramPanel },
  { key: 'ceremonies', group: 'Content', label: 'Ceremonies', Component: CeremoniesPanel },
  { key: 'gallery', group: 'Content', label: 'Gallery', Component: GalleryPanel },
  { key: 'blessings', group: 'Content', label: 'Blessings', Component: BlessingsPanel },
  { key: 'footer', group: 'Content', label: 'Closing & contact', Component: FooterPanel },
  { key: 'access', group: 'Guests', label: 'Privacy & sharing', Component: AccessPanel },
  { key: 'rsvps', group: 'Guests', label: 'RSVPs', Component: RsvpsPanel },
  { key: 'messages', group: 'Guests', label: 'Guestbook', Component: MessagesPanel },
  { key: 'settings', group: 'Operator', label: 'Site settings', Component: AdminSettingsPanel, adminOnly: true },
  { key: 'members', group: 'Operator', label: 'Couple access', Component: MembersPanel, adminOnly: true },
]

function EditorBody({ siteId, mode }) {
  const { data, error, reload, saveContent, saveSettings, setMessages } = useSiteEditor(siteId)
  if (error) {
    return (
      <div className="rounded-2xl border border-sb-alta/30 bg-[#FBEDEE] p-6 text-sm text-[#7A2229]">
        <p className="font-medium">{error}</p>
        <Button className="mt-3" size="sm" onClick={reload}>
          Try again
        </Button>
      </div>
    )
  }
  if (!data) {
    return (
      <div className="flex items-center gap-2 py-20 text-sb-muted">
        <Loader2 className="animate-spin" size={18} /> Loading site…
      </div>
    )
  }
  return <LoadedEditor siteId={siteId} mode={mode} data={data} saveContent={saveContent} saveSettings={saveSettings} setMessages={setMessages} />
}

function LoadedEditor({ siteId, mode, data, saveContent, saveSettings, setMessages }) {
  const media = useMediaUrlState(data.mediaUrls)
  const upload = useUpload(siteId, { onUploaded: media.register })
  const isAdmin = mode === 'admin'
  const panels = useMemo(() => PANELS.filter((p) => !p.adminOnly || isAdmin), [isAdmin])
  const [active, setActive] = useState('couple')
  const [dirty, setDirty] = useState({})

  const markDirty = useMemo(
    () => Object.fromEntries(panels.map((p) => [p.key, (isDirty) => setDirty((d) => (d[p.key] === isDirty ? d : { ...d, [p.key]: isDirty }))])),
    [panels]
  )
  const anyDirty = Object.values(dirty).some(Boolean)

  useEffect(() => {
    if (!anyDirty) return
    const warn = (e) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [anyDirty])

  useEffect(() => {
    const fromHash = window.location.hash.slice(1)
    // eslint-disable-next-line react-hooks/set-state-in-effect -- restore panel from URL hash
    if (panels.some((p) => p.key === fromHash)) setActive(fromHash)
  }, [panels])

  useEffect(() => {
    document.querySelector(`[data-editor-nav="${active}"]`)?.scrollIntoView({ block: 'nearest', inline: 'center' })
  }, [active, data])

  const choose = useCallback((key) => {
    setActive(key)
    window.history.replaceState(null, '', `#${key}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const status = STATUS_BADGE[data.site.status] || STATUS_BADGE.draft
  const groups = [...new Set(panels.map((p) => p.group))]
  const shared = { data, saveContent, saveSettings, setMessages, upload, canUseAi: true, canGenerate: true }

  return (
    <MediaUrlProvider value={media}>
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate font-display text-3xl font-semibold text-sb-ink">
              {data.content.hero?.coupleNames?.en || data.site.slug}
            </h1>
            <Badge tone={status.tone}>{status.label}</Badge>
          </div>
          <p className="mt-0.5 text-sm text-sb-muted">shubhobiye.com/{data.site.slug}</p>
        </div>
        <Button href={`/${data.site.slug}`} target="_blank" icon={ExternalLink}>
          View site
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[13rem_1fr]">
        <nav aria-label="Editor sections" className="min-w-0 lg:sticky lg:top-6 lg:self-start">
          <div className="-mx-1 flex gap-1 overflow-x-auto pb-1 lg:mx-0 lg:block lg:space-y-5 lg:overflow-visible">
            {groups.map((group) => (
              <div key={group} className="contents lg:block">
                <p className="hidden px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-sb-muted lg:block">{group}</p>
                {panels
                  .filter((p) => p.group === group)
                  .map((p) => (
                    <button
                      key={p.key}
                      type="button"
                      data-editor-nav={p.key}
                      onClick={() => choose(p.key)}
                      aria-current={active === p.key ? 'page' : undefined}
                      className={`flex shrink-0 items-center justify-between gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm transition lg:w-full ${
                        active === p.key ? 'bg-sb-ink text-sb-paper' : 'text-sb-ink-soft hover:bg-sb-soft'
                      }`}
                    >
                      {p.label}
                      {dirty[p.key] && <span className="h-2 w-2 rounded-full bg-sb-marigold" aria-label="unsaved changes" />}
                    </button>
                  ))}
              </div>
            ))}
          </div>
        </nav>

        <div className="min-w-0">
          {panels.map(({ key, Component }) => (
            <div key={key} hidden={active !== key}>
              <Component {...shared} active={active === key} onDirtyChange={markDirty[key]} />
            </div>
          ))}
        </div>
      </div>
    </div>
    </MediaUrlProvider>
  )
}

/** The site editor shared by the operator console (mode="admin") and the couple dashboard (mode="couple"). */
export default function SiteEditor({ siteId, mode = 'couple' }) {
  return (
    <ToastProvider>
      <ConfirmProvider>
        <EditorBody siteId={siteId} mode={mode} />
      </ConfirmProvider>
    </ToastProvider>
  )
}
