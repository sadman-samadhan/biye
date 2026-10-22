import { test, expect } from '@playwright/test'
import { OPERATOR, panel, signIn, uniqueSlug } from './helpers.mjs'

// A Dhaka-time ISO string `days` from now, at the given hour
const dhaka = (days, hour) => `${new Date(Date.now() + days * 86400000).toISOString().slice(0, 10)}T${String(hour).padStart(2, '0')}:00:00+06:00`

test('couple sets up the invitation, a guest replies and changes the reply', async ({ page, browser }) => {
  await signIn(page, OPERATOR)
  const slug = uniqueSlug('invite')

  // Site with an invitation, two events in the future (Hindu, Bengali variant)
  const created = await page.request.post('/api/admin/sites', {
    data: {
      slug,
      consent: true,
      status: 'live',
      wedding_type: 'hindu',
      products: ['invite', 'site'],
      owner_name: 'Priya & Arjun',
      content: { hero: { coupleNames: { en: 'Priya & Arjun', bn: 'প্রিয়া ও অর্জুন' } } },
    },
  })
  expect(created.ok()).toBeTruthy()
  const { site } = await created.json()
  const saved = await page.request.patch(`/api/sites/${site.id}/content`, {
    data: {
      section: 'ceremonies',
      data: [
        { id: 'gaye-holud', title: { en: 'Gaye Holud', bn: 'গায়ে হলুদ' }, startsAt: dhaka(20, 17), venue: { en: 'Family home', mapUrl: 'https://maps.app.goo.gl/x' } },
        { id: 'saat-paak', title: { en: 'The Wedding', bn: 'শুভ বিবাহ' }, startsAt: dhaka(22, 19), venue: { en: 'Grand Hall', address: { en: 'Gulshan, Dhaka' } } },
      ],
    },
  })
  expect(saved.ok()).toBeTruthy()

  // Invitation panel: one family and RSVPs on
  await page.goto(`/admin/sites/${site.id}#invitation`)
  const invitation = panel(page, 'Invitation')
  await invitation.getByRole('textbox', { name: 'Name (English)' }).first().fill('Priya Sen')
  await invitation.getByRole('textbox', { name: 'Parents (English)' }).first().fill('Mr. & Mrs. Sen')
  await invitation.getByRole('textbox', { name: 'Parents (বাংলা)' }).first().fill('শ্রী অমল সেন ও শ্রীমতী রমা সেন')
  await invitation.getByRole('switch', { name: 'Ask guests to RSVP' }).click()
  await invitation.getByLabel('Reply by (optional)').fill(dhaka(15, 12).slice(0, 10))
  await invitation.getByRole('button', { name: 'Save changes' }).click()
  await expect(page.getByText('Invitation saved')).toBeVisible()

  // A guest opens the link: the invitation, not the full site
  const guest = await browser.newContext()
  const g = await guest.newPage()
  expect((await g.goto(`/${slug}`)).status()).toBe(200)
  await g.getByRole('button', { name: /skip/i }).click().catch(() => {})
  await expect(g.getByText('শ্রীশ্রী প্রজাপতয়ে নমঃ').first()).toBeVisible()
  await expect(g.getByText('Priya Sen')).toBeVisible()
  await expect(g.getByText('শ্রী অমল সেন ও শ্রীমতী রমা সেন-এর কন্যা')).toBeVisible()
  await expect(g.locator('#countdown')).toContainText('The Wedding')
  await expect(g.locator('#events')).toContainText('Grand Hall')

  // RSVP, then change it
  const rsvp = g.locator('#rsvp')
  await rsvp.getByLabel(/Your name/).fill('Rahim Uncle')
  await rsvp.getByRole('button', { name: /Joyfully accept/ }).click()
  await rsvp.getByLabel(/Guests, including you/).selectOption('3')
  await rsvp.getByRole('button', { name: 'Send reply' }).click()
  await expect(rsvp.getByText('Thank you! Your reply has reached the couple.')).toBeVisible()

  await g.reload()
  await g.getByRole('button', { name: /skip/i }).click().catch(() => {})
  await expect(g.locator('#rsvp')).toContainText('Rahim Uncle')
  await g.locator('#rsvp').getByRole('button', { name: 'Update reply' }).click()
  await g.locator('#rsvp').getByLabel(/Guests, including you/).selectOption('2')
  await g.locator('#rsvp').getByRole('button', { name: 'Update reply' }).click()
  await expect(g.locator('#rsvp')).toContainText('Joyfully accept · 2')

  // Calendar file with both events
  const ics = await g.request.get(`/${slug}/calendar.ics`)
  expect(ics.headers()['content-type']).toContain('text/calendar')
  expect(((await ics.text()).match(/BEGIN:VEVENT/g) || []).length).toBe(2)
  await guest.close()

  // The couple sees one reply (the change didn't add a second)
  await page.locator('[data-editor-nav="rsvps"]').click()
  const replies = panel(page, 'RSVPs')
  await expect(replies.getByText('Rahim Uncle')).toHaveCount(1)
  await expect(replies.getByText('Coming · 2')).toBeVisible()

  // Clean up
  await page.request.delete(`/api/admin/sites/${site.id}`)
  await page.request.delete(`/api/admin/sites/${site.id}?permanent=true`)
})
