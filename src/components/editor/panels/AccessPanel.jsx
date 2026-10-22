'use client'

import { useCallback, useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { Copy, Download, KeyRound, LogOut, RefreshCw, Share2 } from 'lucide-react'
import { Button, Card, CardBody, CardHeader, EmptyState, Select, Switch, TextInput, useConfirm, useToast } from '@/ui'

function useCopy() {
  const toast = useToast()
  return useCallback(
    async (text, what = 'Copied') => {
      try {
        await navigator.clipboard.writeText(text)
        toast.success(what)
      } catch {
        toast.error('Copy failed. Select the text and copy it manually.')
      }
    },
    [toast]
  )
}

function Row({ label, value, onCopy, mono = false }) {
  return (
    <div className="min-w-0">
      <p className="mb-1 text-xs font-medium uppercase tracking-wider text-sb-muted">{label}</p>
      <div className="flex items-center gap-2">
        <p className={`min-w-0 flex-1 truncate rounded-lg bg-sb-paper px-3 py-2 text-sm text-sb-ink ${mono ? 'font-mono' : ''}`} title={value}>
          {value}
        </p>
        <Button size="sm" icon={Copy} onClick={onCopy} aria-label={`Copy ${label}`} />
      </div>
    </div>
  )
}

/** Guest privacy: passcode, who can see what, share links, watermark, moderation. */
export default function AccessPanel({ data, saveSettings }) {
  const toast = useToast()
  const confirm = useConfirm()
  const copy = useCopy()
  const siteId = data.site.id
  const products = data.site.products || ['site']
  const [access, setAccess] = useState(null)
  const [qr, setQr] = useState(null)
  const [custom, setCustom] = useState('')
  const [busy, setBusy] = useState(null)
  const [rebuild, setRebuild] = useState(null)
  const [published, setPublished] = useState(Boolean(data.site.memories_published))

  async function setMemoriesPublished(on) {
    setPublished(on)
    try {
      await saveSettings({ memories_published: on })
      toast.success(on ? 'Full site published' : 'Full site hidden')
    } catch (err) {
      setPublished(!on)
      toast.error(err.message)
    }
  }

  const load = useCallback(async () => {
    const res = await fetch(`/api/sites/${siteId}/access`, { cache: 'no-store' })
    if (res.ok) setAccess(await res.json())
    else toast.error('Could not load privacy settings')
  }, [siteId, toast])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (!access?.siteUrl) return
    QRCode.toDataURL(access.siteUrl, { margin: 1, width: 600, color: { dark: '#1E1A17', light: '#FFFFFF' } }).then(setQr)
  }, [access?.siteUrl])

  async function call(path, init, success) {
    setBusy(path)
    try {
      const res = await fetch(`/api/sites/${siteId}/access${path}`, { headers: { 'Content-Type': 'application/json' }, ...init })
      const result = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(result.error || 'Could not save')
      setAccess(result)
      if (success) toast.success(success)
      return result
    } catch (err) {
      toast.error(err.message)
      return null
    } finally {
      setBusy(null)
    }
  }

  const patch = (body, success) => call('', { method: 'PATCH', body: JSON.stringify(body) }, success)

  async function newPasscode(customValue) {
    const ok = await confirm({
      title: customValue ? 'Use this passcode?' : 'Create a new passcode?',
      body: 'Guests who already opened the site will need the new passcode, and old one-tap links stop working.',
      confirmLabel: 'Change passcode',
    })
    if (!ok) return
    const result = await call('/passcode', { method: 'POST', body: JSON.stringify(customValue ? { passcode: customValue } : {}) }, 'Passcode changed')
    if (result) setCustom('')
  }

  async function signOutEveryone() {
    const ok = await confirm({
      title: 'Sign out every guest?',
      body: 'The passcode stays the same, but everyone has to enter it again. Old one-tap links stop working.',
      confirmLabel: 'Sign everyone out',
      tone: 'danger',
    })
    if (ok) call('/revoke', { method: 'POST' }, 'All guests signed out')
  }

  async function setWatermark(mode) {
    const result = await patch({ watermarkMode: mode }, mode === 'site' ? 'Watermark on' : 'Watermark off')
    if (!result) return
    // Re-render guest copies of existing photos from their masters
    setRebuild({ done: 0 })
    let after = null
    let done = 0
    try {
      for (let guard = 0; guard < 200; guard++) {
        const res = await fetch(`/api/sites/${siteId}/media/rebuild`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ after }) })
        const step = await res.json()
        if (!res.ok) throw new Error(step.error || 'Could not update photos')
        done += step.processed
        after = step.after
        setRebuild({ done })
        if (!step.remaining) break
      }
      toast.success(`Updated ${done} photo${done === 1 ? '' : 's'}`)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setRebuild(null)
    }
  }

  if (!access) {
    return (
      <Card>
        <CardHeader title="Privacy & sharing" />
        <CardBody>
          <p className="text-sm text-sb-muted">Loading…</p>
        </CardBody>
      </Card>
    )
  }

  const shareText = `You're invited to our wedding! ${access.siteUrl}\nPasscode: ${access.passcode}`

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="Guest passcode" description="Guests enter this once on each phone. Share it with your invitation." />
        <CardBody>
          <div className="flex flex-wrap items-center gap-3">
            <p className="rounded-xl bg-sb-paper px-5 py-3 font-mono text-2xl tracking-wide text-sb-ink">{access.passcode || '—'}</p>
            <Button icon={Copy} onClick={() => copy(access.passcode, 'Passcode copied')}>
              Copy
            </Button>
            <Button variant="ghost" icon={RefreshCw} loading={busy === '/passcode'} onClick={() => newPasscode()}>
              New passcode
            </Button>
          </div>
          <form
            className="flex flex-wrap items-end gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              if (custom.trim()) newPasscode(custom)
            }}
          >
            <TextInput className="min-w-48 flex-1" label="Or choose your own" placeholder="e.g. rahim-karima-2026" value={custom} onChange={(e) => setCustom(e.target.value)} maxLength={40} hint="At least 6 characters. Capital letters and spaces don't matter." />
            <Button type="submit" icon={KeyRound} disabled={!custom.trim()}>
              Use this
            </Button>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Who can see what" />
        <CardBody>
          {products.includes('invite') && (
            <Select
              label="Invitation (before the wedding)"
              value={access.inviteAccess}
              onChange={(e) => patch({ inviteAccess: e.target.value }, 'Saved')}
              options={[
                { value: 'public', label: 'Anyone with the link — only photos you mark as public are shown' },
                { value: 'passcode', label: 'Only guests with the passcode' },
              ]}
            />
          )}
          {products.includes('site') && products.includes('invite') && (
            <Switch
              label="Show the full site after the wedding"
              description="Once your photos are ready, your link switches from the invitation to the full site with the gallery (the day after the last event)."
              checked={published}
              onChange={setMemoriesPublished}
            />
          )}
          {products.includes('site') && (
            <Select
              label="Photos & memories (after the wedding)"
              value={access.siteAccess}
              onChange={(e) => patch({ siteAccess: e.target.value }, 'Saved')}
              options={[
                { value: 'passcode', label: 'Only guests with the passcode (recommended)' },
                { value: 'public', label: 'Anyone with the link' },
              ]}
            />
          )}
          <Select
            label="Guestbook messages"
            value={access.messageModeration}
            onChange={(e) => patch({ messageModeration: e.target.value }, 'Saved')}
            options={[
              { value: 'auto', label: 'Show new messages straight away' },
              { value: 'manual', label: 'Hide new messages until I approve them' },
            ]}
          />
          <Select
            label="Watermark on photos"
            hint={rebuild ? `Updating photos… ${rebuild.done} done` : 'Adds your site address to the corner of every photo guests see. Your downloads stay clean.'}
            value={access.watermarkMode}
            disabled={Boolean(rebuild)}
            onChange={(e) => setWatermark(e.target.value)}
            options={[
              { value: 'off', label: 'No watermark' },
              { value: 'site', label: `Show “${access.siteUrl.replace(/^https?:\/\//, '')}”` },
            ]}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Share" description="Send the link and passcode together, or the one-tap link that opens without typing." />
        <CardBody>
          <Row label="Site link" value={access.siteUrl} onCopy={() => copy(access.siteUrl, 'Link copied')} />
          <Row label="One-tap link (passcode built in)" value={access.unlockUrl} onCopy={() => copy(access.unlockUrl, 'One-tap link copied')} mono />
          <p className="-mt-2 text-xs text-sb-muted">Anyone with the one-tap link gets in. Changing the passcode turns old one-tap links off.</p>
          <div className="flex flex-wrap gap-2">
            <Button icon={Share2} href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener">
              Share on WhatsApp
            </Button>
            <Button icon={Copy} onClick={() => copy(shareText, 'Invitation text copied')}>
              Copy invitation text
            </Button>
          </div>
          {qr ? (
            <div className="flex flex-wrap items-center gap-4 rounded-xl bg-sb-paper p-4">
              {/* eslint-disable-next-line @next/next/no-img-element -- generated QR data URL */}
              <img src={qr} alt={`QR code for ${access.siteUrl}`} className="h-36 w-36 rounded-lg bg-white p-1" />
              <div className="min-w-0 space-y-2 text-sm">
                <p className="font-medium text-sb-ink">QR code for printed cards</p>
                <p className="max-w-xs text-xs text-sb-muted">Opens the site and asks for the passcode, so printed cards keep working even if you change the passcode later.</p>
                <a href={qr} download={`${data.site.slug}-qr.png`} className="inline-flex items-center gap-1.5 text-sm font-medium text-sb-marigold-deep hover:underline">
                  <Download size={14} /> Download PNG
                </a>
              </div>
            </div>
          ) : (
            <EmptyState title="Preparing QR code…" />
          )}
        </CardBody>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-sb-alta/20 bg-sb-card p-5">
        <div>
          <p className="text-sm font-medium text-sb-ink">Sign out all guests</p>
          <p className="text-xs text-sb-muted">Use this if the passcode spread further than you wanted.</p>
        </div>
        <Button variant="danger" size="sm" icon={LogOut} loading={busy === '/revoke'} onClick={signOutEveryone}>
          Sign everyone out
        </Button>
      </div>
    </div>
  )
}
