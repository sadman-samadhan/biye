import { createCanvas, GlobalFonts } from '@napi-rs/canvas'
import fs from 'fs'

let fontsRegistered = false
function ensureFonts() {
  if (fontsRegistered) return
  fontsRegistered = true
  try {
    const candidates = [
      { path: 'C:/Windows/Fonts/Nirmala.ttf', name: 'Nirmala UI' },
      { path: 'C:/Windows/Fonts/NirmalaB.ttf', name: 'Nirmala UI Bold' },
      { path: 'C:/Windows/Fonts/seguihis.ttf', name: 'Segoe UI Historic' },
      { path: 'C:/Windows/Fonts/times.ttf', name: 'Times New Roman' },
      { path: 'C:/Windows/Fonts/arial.ttf', name: 'Arial' }
    ]
    for (const c of candidates) {
      if (fs.existsSync(c.path)) {
        try {
          GlobalFonts.registerFromPath(c.path, c.name)
        } catch (_) {}
      }
    }
  } catch (_) {}
}

/**
 * Generate a luxury wedding monogram / emblem with ornamental gold geometry.
 */
export async function generateMonogram({
  name1 = 'Arefin',
  name2 = 'Sumaiya',
  blessingText,
  verseSnippet,
  venue = '',
  weddingType = 'muslim',
}) {
  ensureFonts()
  const width = 1200
  const height = 1200
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')

  const cx = width / 2
  const cy = height / 2

  // Transparent background
  ctx.clearRect(0, 0, width, height)

  // 1. Draw Ornamental Gold Outer Frame based on tradition
  drawOrnamentalFrame(ctx, cx, cy, weddingType)

  // 2. Draw Text Details in Center
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  // Top Small Header
  ctx.fillStyle = '#A67C52'
  ctx.font = '500 24px "Nirmala UI", "Segoe UI Historic", "Amiri", "Traditional Arabic", "Times New Roman", serif'
  const headerText = weddingType === 'hindu' 
    ? '॥ ॐ श्री गणेशाय नमः ॥' 
    : 'بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ'
  ctx.fillText(headerText, cx, cy - 220)

  // Subtle divider
  drawGoldDivider(ctx, cx, cy - 180, 160)

  // Couple Names (Large Serif / Script style)
  ctx.fillStyle = '#2B2B2B'
  ctx.font = 'italic bold 64px "Times New Roman", serif'
  const coupleText = `${name1} & ${name2}`
  ctx.fillText(coupleText, cx, cy - 100)

  // "WEDS" or "TOGETHER WITH THEIR FAMILIES"
  ctx.fillStyle = '#8C643E'
  ctx.font = '500 20px sans-serif'
  const subNames = weddingType === 'hindu' 
    ? 'TOGETHER IN SACRED UNION' 
    : 'UNITED UNDER THE GRACE OF ALLAH'
  ctx.fillText(subNames, cx, cy - 35)

  // Center Gold Ornament
  drawCenterMedallion(ctx, cx, cy + 20)

  // Blessing Text
  const defaultBlessing = weddingType === 'hindu'
    ? 'With the eternal blessings of our elders and ancestors'
    : 'With the blessings of Allah and our loving families'
  const activeBlessing = blessingText || defaultBlessing
  ctx.fillStyle = '#4A4A4A'
  ctx.font = 'italic 24px "Times New Roman", serif'
  ctx.fillText(activeBlessing, cx, cy + 90)

  // Verse / Shloka Snippet
  const defaultVerse = weddingType === 'hindu'
    ? 'ॐ यदेतद्धृदयं तव तदस्तु हृदयं मम — अथर्ववेद ७.३६.१'
    : '“And He placed between you affection and mercy” — Qur\'an 30:21'
  const activeVerse = verseSnippet || defaultVerse
  ctx.fillStyle = '#7A7570'
  ctx.font = weddingType === 'hindu'
    ? '19px "Nirmala UI", "Segoe UI Historic", sans-serif'
    : '19px "Times New Roman", "Amiri", sans-serif'
  ctx.fillText(activeVerse, cx, cy + 140)

  // Venue & Location
  if (venue) {
    drawGoldDivider(ctx, cx, cy + 185, 200)
    ctx.fillStyle = '#6B5A4B'
    ctx.font = '600 20px sans-serif'
    ctx.fillText(venue.toUpperCase(), cx, cy + 225)
  }

  return canvas.toBuffer('image/png')
}

function drawGoldDivider(ctx, cx, y, w) {
  const grad = ctx.createLinearGradient(cx - w / 2, y, cx + w / 2, y)
  grad.addColorStop(0, 'rgba(212, 165, 116, 0)')
  grad.addColorStop(0.5, 'rgba(166, 124, 82, 0.9)')
  grad.addColorStop(1, 'rgba(212, 165, 116, 0)')

  ctx.strokeStyle = grad
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(cx - w / 2, y)
  ctx.lineTo(cx + w / 2, y)
  ctx.stroke()

  // Center small diamond
  ctx.fillStyle = '#A67C52'
  ctx.beginPath()
  ctx.arc(cx, y, 3.5, 0, Math.PI * 2)
  ctx.fill()
}

function drawCenterMedallion(ctx, cx, cy) {
  ctx.save()
  ctx.strokeStyle = '#D4A574'
  ctx.lineWidth = 1.5

  ctx.beginPath()
  ctx.arc(cx, cy, 14, 0, Math.PI * 2)
  ctx.stroke()

  ctx.fillStyle = '#A67C52'
  ctx.beginPath()
  ctx.arc(cx, cy, 4, 0, Math.PI * 2)
  ctx.fill()

  // Left & right wing lines
  ctx.beginPath()
  ctx.moveTo(cx - 50, cy)
  ctx.lineTo(cx - 20, cy)
  ctx.moveTo(cx + 20, cy)
  ctx.lineTo(cx + 50, cy)
  ctx.stroke()

  ctx.restore()
}

function drawOrnamentalFrame(ctx, cx, cy, type) {
  ctx.save()

  // Gold gradient
  const gold = ctx.createLinearGradient(0, 0, 1200, 1200)
  gold.addColorStop(0, '#A67C52')
  gold.addColorStop(0.3, '#E0BA88')
  gold.addColorStop(0.5, '#C59A65')
  gold.addColorStop(0.8, '#D8B07D')
  gold.addColorStop(1, '#8C643E')

  ctx.strokeStyle = gold

  // 1. Concentric circles
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.arc(cx, cy, 540, 0, Math.PI * 2)
  ctx.stroke()

  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.arc(cx, cy, 520, 0, Math.PI * 2)
  ctx.stroke()

  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.arc(cx, cy, 460, 0, Math.PI * 2)
  ctx.stroke()

  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.arc(cx, cy, 440, 0, Math.PI * 2)
  ctx.stroke()

  // Decorative beads between outer circles (72 dots)
  const dotCount = 72
  for (let i = 0; i < dotCount; i++) {
    const angle = (i * 2 * Math.PI) / dotCount
    const r = 530
    const x = cx + r * Math.cos(angle)
    const y = cy + r * Math.sin(angle)
    ctx.fillStyle = '#D4A574'
    ctx.beginPath()
    ctx.arc(x, y, 2.5, 0, Math.PI * 2)
    ctx.fill()
  }

  if (type === 'hindu') {
    // Sanatan Mandala: 24 floral lotus petals
    const petals = 24
    ctx.lineWidth = 2
    for (let i = 0; i < petals; i++) {
      const angle = (i * 2 * Math.PI) / petals
      const nextAngle = ((i + 1) * 2 * Math.PI) / petals
      const midAngle = angle + Math.PI / petals

      const rInner = 460
      const rOuter = 515

      const x1 = cx + rInner * Math.cos(angle)
      const y1 = cy + rInner * Math.sin(angle)
      const x2 = cx + rInner * Math.cos(nextAngle)
      const y2 = cy + rInner * Math.sin(nextAngle)
      const xm = cx + rOuter * Math.cos(midAngle)
      const ym = cy + rOuter * Math.sin(midAngle)

      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.quadraticCurveTo(xm, ym, x2, y2)
      ctx.stroke()

      // Small flower bead at tip
      ctx.fillStyle = '#E0BA88'
      ctx.beginPath()
      ctx.arc(xm, ym, 3, 0, Math.PI * 2)
      ctx.fill()
    }
  } else {
    // Islamic Geometric Pattern: 16-point star lattice between circles
    const points = 16
    ctx.lineWidth = 1.5
    for (let i = 0; i < points; i++) {
      const angle = (i * 2 * Math.PI) / points
      const nextAngle = ((i + 1) * 2 * Math.PI) / points
      const midAngle = angle + Math.PI / points

      const rInner = 460
      const rOuter = 515

      const x1 = cx + rInner * Math.cos(angle)
      const y1 = cy + rInner * Math.sin(angle)
      const xm = cx + rOuter * Math.cos(midAngle)
      const ym = cy + rOuter * Math.sin(midAngle)
      const x2 = cx + rInner * Math.cos(nextAngle)
      const y2 = cy + rInner * Math.sin(nextAngle)

      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(xm, ym)
      ctx.lineTo(x2, y2)
      ctx.stroke()

      // Star tip ornament
      ctx.fillStyle = '#D4A574'
      ctx.beginPath()
      ctx.arc(xm, ym, 2.8, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // 4 Corner Flourishes (L-brackets)
  drawCornerAccents(ctx, cx, cy)

  ctx.restore()
}

function drawCornerAccents(ctx, cx, cy) {
  const corners = [
    { x: cx - 470, y: cy - 470, dx: 1, dy: 1 },
    { x: cx + 470, y: cy - 470, dx: -1, dy: 1 },
    { x: cx - 470, y: cy + 470, dx: 1, dy: -1 },
    { x: cx + 470, y: cy + 470, dx: -1, dy: -1 },
  ]

  ctx.lineWidth = 2
  corners.forEach(c => {
    ctx.beginPath()
    ctx.moveTo(c.x + c.dx * 50, c.y)
    ctx.lineTo(c.x, c.y)
    ctx.lineTo(c.x, c.y + c.dy * 50)
    ctx.stroke()

    ctx.fillStyle = '#D4A574'
    ctx.beginPath()
    ctx.arc(c.x + c.dx * 8, c.y + c.dy * 8, 3, 0, Math.PI * 2)
    ctx.fill()
  })
}
