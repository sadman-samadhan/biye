'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { BilingualField, Button, Card, CardBody, CardHeader, Select, Switch, TextInput, ToastProvider, useToast } from '@/ui'
import { getTradition, sortCeremonies } from '@/traditions'
import { slugify, slugProblem } from '@/lib/slugs'
import { TRADITION_OPTIONS } from '@/components/editor/traditionOptions'

function Form() {
  const router = useRouter()
  const toast = useToast()
  const [names, setNames] = useState({ en: '', bn: '' })
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [weddingType, setWeddingType] = useState('muslim')
  const [products, setProducts] = useState({ invite: true, site: true })
  const [owner, setOwner] = useState({ name: '', email: '', phone: '' })
  const [creating, setCreating] = useState(false)
  const [consent, setConsent] = useState(false)

  const effectiveSlug = slugTouched ? slug : slugify(names.en)
  const slugError = effectiveSlug ? slugProblem(effectiveSlug) : null

  async function create(e) {
    e.preventDefault()
    if (slugError || !effectiveSlug) return toast.error(slugError || 'Add the couple’s names or an address')
    setCreating(true)
    try {
      const tradition = getTradition(weddingType)
      const res = await fetch('/api/admin/sites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: effectiveSlug,
          consent,
          status: 'draft',
          wedding_type: weddingType,
          products: [products.invite && 'invite', products.site && 'site'].filter(Boolean),
          owner_name: owner.name || names.en,
          owner_email: owner.email,
          owner_phone: owner.phone,
          content: {
            hero: {
              coupleNames: names,
              blessing: tradition.defaultBlessing,
              openingInvocation: tradition.openingInvocation,
              openingSub: tradition.openingSub,
            },
            blessing: tradition.defaultBlessing,
            sectionToggles: { monogram: false },
          },
          ceremonies: sortCeremonies(tradition.ceremonies || []),
          duas: { duas: tradition.defaultDuas || [], parentBlessings: tradition.parentBlessings || {} },
        }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Could not create the site')
      router.push(`/admin/sites/${result.site.id}#couple`)
    } catch (err) {
      toast.error(err.message)
      setCreating(false)
    }
  }

  return (
    <form onSubmit={create} className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-sb-ink">New client</h1>
        <p className="mt-1 text-sm text-sb-muted">Create the site as a draft. You’ll add photos, ceremonies and wording in the editor next.</p>
      </div>
      <Card>
        <CardHeader title="The couple" />
        <CardBody>
          <BilingualField label="Couple names" value={names} onChange={setNames} placeholder={{ en: 'Rahim & Karima', bn: 'রহিম ও করিমা' }} />
          <TextInput
            label="Address"
            value={effectiveSlug}
            error={slugError}
            hint={`shubhobiye.com/${effectiveSlug || 'rahim-and-karima'}`}
            onChange={(e) => {
              setSlugTouched(true)
              setSlug(slugify(e.target.value) || e.target.value.toLowerCase())
            }}
          />
          <Select label="Tradition" value={weddingType} onChange={(e) => setWeddingType(e.target.value)} options={TRADITION_OPTIONS} />
        </CardBody>
      </Card>
      <Card>
        <CardHeader title="Products" />
        <CardBody>
          <Switch label="Invitation" description="Pre-wedding invitation with RSVP, map and countdown." checked={products.invite} onChange={(invite) => setProducts((p) => ({ ...p, invite }))} />
          <Switch label="Memories site" description="Ceremonies, gallery and guestbook after the wedding." checked={products.site} onChange={(site) => setProducts((p) => ({ ...p, site }))} />
        </CardBody>
      </Card>
      <Card>
        <CardHeader title="Client record" description="Private to operators. Never shown on the site." />
        <CardBody>
          <div className="grid gap-4 sm:grid-cols-3">
            <TextInput label="Name" value={owner.name} onChange={(e) => setOwner({ ...owner, name: e.target.value })} />
            <TextInput label="Email" type="email" value={owner.email} onChange={(e) => setOwner({ ...owner, email: e.target.value })} />
            <TextInput label="Phone / WhatsApp" type="tel" value={owner.phone} onChange={(e) => setOwner({ ...owner, phone: e.target.value })} />
          </div>
        </CardBody>
      </Card>
      <label className="flex items-start gap-3 rounded-xl border border-sb-line bg-sb-card p-4 text-sm text-sb-ink-soft">
        <input type="checkbox" className="mt-0.5 h-4 w-4 accent-[#D4741C]" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
        <span>
          The couple has accepted the{' '}
          <a href="/terms" target="_blank" className="underline">
            terms
          </a>{' '}
          and{' '}
          <a href="/privacy" target="_blank" className="underline">
            privacy notice
          </a>
          , and confirmed they have permission to share the photos they will upload.
        </span>
      </label>
      <div className="flex justify-end">
        <Button type="submit" variant="primary" size="lg" icon={ArrowRight} loading={creating} disabled={!consent || !effectiveSlug || Boolean(slugError) || !(products.invite || products.site)}>
          Create draft site
        </Button>
      </div>
    </form>
  )
}

export default function NewSiteForm() {
  return (
    <ToastProvider>
      <Form />
    </ToastProvider>
  )
}
