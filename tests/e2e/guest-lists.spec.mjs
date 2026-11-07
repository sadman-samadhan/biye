import { test, expect } from '@playwright/test'
import { OPERATOR, signIn, uniqueSlug } from './helpers.mjs'

const dhaka = (days, hour) => `${new Date(Date.now() + days * 86400000).toISOString().slice(0, 10)}T${String(hour).padStart(2, '0')}:00:00+06:00`
const pathOf = (url) => {
  const u = new URL(url)
  return u.pathname + u.search
}

test('a guest list only ever shows its own events, however the guest comes in', async ({ page, browser }) => {
  await signIn(page, OPERATOR)
  const slug = uniqueSlug('lists')
  const LIST = { id: 'e2eHoludOnly01', name: 'Holud only', events: ['gaye-holud'], passcode: 'bokul-4821' }

  const created = await page.request.post('/api/admin/sites', {
    data: { slug, consent: true, status: 'live', wedding_type: 'muslim', products: ['invite', 'site'], owner_name: 'Arefin & Sumaiya', content: { hero: { coupleNames: { en: 'Arefin & Sumaiya' } } } },
  })
  expect(created.ok()).toBeTruthy()
  const { site } = await created.json()
  const content = (section, data) => page.request.patch(`/api/sites/${site.id}/content`, { data: { section, data } })
  expect(
    (
      await content('ceremonies', [
        { id: 'gaye-holud', title: { en: 'Gaye Holud' }, startsAt: dhaka(20, 17), venue: { en: 'Holud Garden' } },
        { id: 'akht', title: { en: 'The Akht' }, startsAt: dhaka(22, 19), venue: { en: 'Grand Hall' } },
      ])
    ).ok()
  ).toBeTruthy()
  expect((await content('invitation', { rsvp: { enabled: true }, guestLists: [LIST] })).ok()).toBeTruthy()
  // Duplicate list passcodes are refused
  expect((await content('invitation', { guestLists: [LIST, { ...LIST, id: 'e2eOtherList01' }] })).status()).toBe(400)

  expect((await page.request.patch(`/api/sites/${site.id}/access`, { data: { inviteAccess: 'passcode' } })).ok()).toBeTruthy()
  const access = await (await page.request.get(`/api/sites/${site.id}/access`)).json()
  expect(access.listUnlockUrls[LIST.id]).toBeTruthy()

  /** A fresh guest browser; returns what its invitation lists. */
  async function guest() {
    const context = await browser.newContext()
    const g = await context.newPage()
    const events = async (path) => {
      await g.goto(path)
      await g.getByRole('button', { name: /skip/i }).click({ timeout: 3000 }).catch(() => {})
      return g.locator('#events').innerText()
    }
    const enter = async (path, passcode) => {
      await g.goto(path)
      await g.getByPlaceholder(/Passcode/).fill(passcode)
      await g.getByRole('button', { name: /open|enter|unlock/i }).first().click()
      await expect(g.locator('#events')).toBeVisible()
    }
    return { context, g, events, enter }
  }
  const onlyHolud = (text) => {
    expect(text).toContain('Holud Garden')
    expect(text).not.toContain('Grand Hall')
  }

  // 1. The list's one-tap link, then the main address with the end of the link removed
  {
    const { context, g, events } = await guest()
    await g.goto(pathOf(access.listUnlockUrls[LIST.id]))
    await expect(g).toHaveURL(new RegExp(`/${slug}/i/${LIST.id}$`))
    onlyHolud(await events(`/${slug}/i/${LIST.id}`))
    onlyHolud(await events(`/${slug}`))
    onlyHolud(await events(`/${slug}/invite`))
    // RSVP and calendar files are limited too
    const rsvp = await g.request.post(`/api/g/${slug}/rsvp`, {
      data: { name: 'Sneaky', attending: true, partySize: 1, events: ['akht'] },
      headers: { origin: new URL(g.url()).origin },
    })
    expect(rsvp.status()).toBe(400)
    expect((await g.request.get(`/${slug}/calendar.ics?event=akht`)).status()).toBe(404)
    expect((await g.request.get(`/${slug}/calendar.ics?event=gaye-holud`)).status()).toBe(200)
    await context.close()
  }

  // 2. The site's main one-tap key no longer opens a list link
  {
    const { context, g } = await guest()
    await g.goto(`${pathOf(access.unlockUrl)}?list=${LIST.id}`)
    await expect(g.getByPlaceholder(/Passcode/)).toBeVisible()
    await context.close()
  }

  // 3. The list's passcode, typed on the main address
  {
    const { context, events, enter } = await guest()
    await enter(`/${slug}`, LIST.passcode)
    onlyHolud(await events(`/${slug}`))
    await context.close()
  }

  // 4. The site passcode typed on the list's page signs in to that list only
  {
    const { context, events, enter } = await guest()
    await enter(`/${slug}/i/${LIST.id}`, access.passcode)
    onlyHolud(await events(`/${slug}`))
    await context.close()
  }

  // 5. The site passcode on the main address shows every event
  {
    const { context, events, enter } = await guest()
    await enter(`/${slug}`, access.passcode)
    const text = await events(`/${slug}`)
    expect(text).toContain('Holud Garden')
    expect(text).toContain('Grand Hall')
    await context.close()
  }

  await page.request.delete(`/api/admin/sites/${site.id}`)
  await page.request.delete(`/api/admin/sites/${site.id}?permanent=true`)
})
