#!/usr/bin/env node
/**
 * Captures the theme gallery images from the demo pages:
 *   public/themes/<id>/cover.jpg  (1280×800 first screen, saved at 1200 px wide)
 *   public/themes/<id>/phone.jpg  (390×844 first screen, saved at 2× pixel density)
 *
 *   node scripts/capture-theme-covers.mjs [--base=http://localhost:3210]
 */
import fs from 'node:fs'
import path from 'node:path'
import { chromium } from '@playwright/test'
import sharp from 'sharp'
import { THEMES } from '../src/themes/registry.js'

const base = (process.argv.find((a) => a.startsWith('--base='))?.slice(7) || 'http://localhost:3210').replace(/\/$/, '')
const hide = 'nextjs-portal{display:none!important} [class*="z-[70]"]{display:none!important}'

const browser = await chromium.launch()
for (const theme of Object.values(THEMES)) {
  const tradition = theme.recommendedFor[0] || 'universal'
  const dir = path.join('public', 'themes', theme.id)
  fs.mkdirSync(dir, { recursive: true })
  for (const [name, options] of [
    ['cover', { viewport: { width: 1280, height: 800 } }],
    ['phone', { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }],
  ]) {
    const context = await browser.newContext({ ...options, reducedMotion: 'reduce' })
    const page = await context.newPage()
    await page.goto(`${base}/demo/${theme.id}/${tradition}`, { waitUntil: 'networkidle' })
    await page.addStyleTag({ content: hide })
    await page.waitForTimeout(1200)
    const png = await page.screenshot()
    await sharp(png).resize({ width: name === 'cover' ? 1200 : 780 }).jpeg({ quality: 80, mozjpeg: true }).toFile(path.join(dir, `${name}.jpg`))
    console.log(theme.id, name)
    await context.close()
  }
}
await browser.close()
