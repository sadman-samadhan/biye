/**
 * Loads a page, scrolls through it and prints console errors/warnings.
 *   node scripts/console_check.mjs <url> [--login=email:password] [--mobile]
 */
import { chromium } from '@playwright/test'

const args = process.argv.slice(2)
const url = args.find((a) => !a.startsWith('--'))
const login = args.find((a) => a.startsWith('--login='))?.slice(8)
const mobile = args.includes('--mobile')

const browser = await chromium.launch()
const context = await browser.newContext(mobile ? { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } : {})
const page = await context.newPage()
const logs = []
page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) logs.push(`${m.type()}: ${m.text().slice(0, 600)}`) })
page.on('pageerror', (e) => logs.push(`pageerror: ${e.message.slice(0, 600)}`))

if (login) {
  const [email, password] = login.split(':')
  const origin = new URL(url).origin
  const res = await page.request.post(`${origin}/auth/login`, { data: { email, password }, headers: { origin } })
  if (!res.ok()) console.error('login failed', res.status())
}

await page.goto(url, { waitUntil: 'networkidle' })
await page.evaluate(async () => {
  for (let y = 0; y < document.body.scrollHeight; y += Math.round(window.innerHeight * 0.6)) {
    window.scrollTo(0, y)
    await new Promise((r) => setTimeout(r, 150))
  }
})
await page.waitForTimeout(2000)
console.log(logs.join('\n') || 'no console errors')
await browser.close()
