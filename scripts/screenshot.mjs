#!/usr/bin/env node
/**
 * Screenshot pages for visual review.
 *
 *   node scripts/screenshot.mjs <outDir> <url> [url...] [--mobile] [--login=email:password] [--full]
 *
 * --login signs in through /auth/login first (same origin as the first URL).
 */
import { chromium } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'

const args = process.argv.slice(2)
const outDir = args.shift()
const flags = args.filter((a) => a.startsWith('--'))
const urls = args.filter((a) => !a.startsWith('--'))
const mobile = flags.includes('--mobile')
const full = flags.includes('--full')
const login = flags.find((f) => f.startsWith('--login='))?.slice(8)

fs.mkdirSync(outDir, { recursive: true })
const browser = await chromium.launch()
const context = await browser.newContext(
  mobile
    ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }
    : { viewport: { width: 1280, height: 860 } }
)
const page = await context.newPage()

if (login) {
  const [email, password] = login.split(':')
  const origin = new URL(urls[0]).origin
  const res = await page.request.post(`${origin}/auth/login`, {
    data: { email, password },
    headers: { origin },
  })
  if (!res.ok()) console.error('login failed', res.status(), await res.text())
}

for (const url of urls) {
  await page.goto(url, { waitUntil: 'networkidle', timeout: 120_000 }).catch((e) => console.error(url, e.message))
  await page.waitForTimeout(1200)
  const name = url.replace(/^https?:\/\/[^/]+/, '').replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '') || 'home'
  const file = path.join(outDir, `${name}${mobile ? '.mobile' : ''}.png`)
  await page.screenshot({ path: file, fullPage: full })
  console.log(file)
}
await browser.close()
