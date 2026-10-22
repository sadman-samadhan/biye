import { createCanvas, GlobalFonts } from '@napi-rs/canvas'
import fs from 'fs'
import path from 'path'

// Fonts ship with the app (assets/fonts, OFL) so Bangla, Arabic and Devanagari
// render on any server. next.config.mjs includes them in the function bundle.
const FONT_DIR = path.join(process.cwd(), 'assets', 'fonts')
const FONTS = [
  ['CormorantGaramond.ttf', 'Cormorant Garamond'],
  ['CormorantGaramond-Italic.ttf', 'Cormorant Garamond'],
  ['Amiri-Regular.ttf', 'Amiri'],
  ['TiroBangla-Regular.ttf', 'Tiro Bangla'],
  ['TiroDevanagariSanskrit-Regular.ttf', 'Tiro Devanagari Sanskrit'],
  ['HindSiliguri-Medium.ttf', 'Hind Siliguri'],
]

let fontsRegistered = false
export function ensureFonts() {
  if (fontsRegistered) return
  fontsRegistered = true
  for (const [file, family] of FONTS) {
    const fontPath = path.join(FONT_DIR, file)
    if (fs.existsSync(fontPath)) GlobalFonts.registerFromPath(fontPath, family)
  }
}

const SCRIPT_FONT = {
  ar: '"Amiri", serif',
  sa: '"Tiro Devanagari Sanskrit", serif',
  bn: '"Tiro Bangla", serif',
  pi: 'italic "Cormorant Garamond", serif',
}

/**
 * Generate a luxury wedding monogram / emblem with ornamental gold geometry.
 */
export async function generateMonogram({
  name1 = 'Bride',
  name2 = 'Groom',
  header = null, // { text, lang } — the tradition's invocation, or null
  subline = 'TOGETHER WITH THEIR FAMILIES',
  blessingText = '',
  verseSnippet = '',
  venue = '',
  frame = 'plain', // 'star' (aniconic geometry) | 'lotus' | 'plain'
  colors = {},
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

  const ink = colors.ink || '#2B2B2B'
  const accent = colors.accent || '#A67C52'
  const ornament = colors.ornament || '#C59A65'

  // 1. Ornamental frame
  drawOrnamentalFrame(ctx, cx, cy, frame, { accent, ornament })

  // 2. Draw Text Details in Center
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  // Top header: the tradition's invocation (omitted when it has none)
  if (header?.text) {
    ctx.fillStyle = accent
    ctx.font = `30px ${SCRIPT_FONT[header.lang] || SCRIPT_FONT.bn}`
    ctx.fillText(header.text, cx, cy - 220)
  }

  // Subtle divider
  drawGoldDivider(ctx, cx, cy - 180, 160)

  // Couple Names (Large Serif / Script style)
  ctx.fillStyle = ink
  ctx.font = 'italic 600 68px "Cormorant Garamond", serif'
  const coupleText = `${name1} & ${name2}`
  ctx.fillText(coupleText, cx, cy - 100)

  // Subline from the tradition's wording
  ctx.fillStyle = accent
  ctx.font = '500 20px "Hind Siliguri", sans-serif'
  ctx.fillText(String(subline).toUpperCase(), cx, cy - 35)

  // Center Gold Ornament
  drawCenterMedallion(ctx, cx, cy + 20, ornament)

  // Blessing line and verse reference (both optional)
  if (blessingText) {
    ctx.fillStyle = ink
    ctx.font = 'italic 26px "Cormorant Garamond", serif'
    ctx.fillText(fitText(ctx, blessingText, 760), cx, cy + 90)
  }
  if (verseSnippet) {
    ctx.fillStyle = accent
    ctx.font = /[\u0980-\u09FF]/.test(verseSnippet) ? '20px "Tiro Bangla", serif' : '20px "Cormorant Garamond", serif'
    ctx.fillText(fitText(ctx, verseSnippet, 700), cx, cy + 140)
  }

  // Venue & Location
  if (venue) {
    drawGoldDivider(ctx, cx, cy + 185, 200)
    ctx.fillStyle = ink
    ctx.font = '500 20px "Hind Siliguri", sans-serif'
    ctx.fillText(fitText(ctx, venue.toUpperCase(), 700), cx, cy + 225)
  }

  return canvas.toBuffer('image/png')
}

// Shortens text with an ellipsis so it never runs past the frame
export function fitText(ctx, text, maxWidth) {
  let value = String(text)
  while (value.length > 4 && ctx.measureText(value).width > maxWidth) value = value.slice(0, -2)
  return value === String(text) ? value : `${value.trimEnd()}…`
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

function drawCenterMedallion(ctx, cx, cy, color = '#C59A65') {
  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = 1.5

  ctx.beginPath()
  ctx.arc(cx, cy, 14, 0, Math.PI * 2)
  ctx.stroke()

  ctx.fillStyle = color
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

function drawOrnamentalFrame(ctx, cx, cy, type, { accent, ornament }) {
  ctx.save()

  // Metallic gradient in the site's own accent/ornament colours
  const gold = ctx.createLinearGradient(0, 0, 1200, 1200)
  gold.addColorStop(0, accent)
  gold.addColorStop(0.4, ornament)
  gold.addColorStop(0.6, ornament)
  gold.addColorStop(1, accent)

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
    ctx.fillStyle = ornament
    ctx.beginPath()
    ctx.arc(x, y, 2.5, 0, Math.PI * 2)
    ctx.fill()
  }

  if (type === 'lotus') {
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
      ctx.fillStyle = ornament
      ctx.beginPath()
      ctx.arc(xm, ym, 3, 0, Math.PI * 2)
      ctx.fill()
    }
  } else if (type === 'star') {
    // Geometric 16-point star lattice between circles (aniconic)
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
      ctx.fillStyle = ornament
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

    ctx.fillStyle = ornament
    ctx.beginPath()
    ctx.arc(c.x + c.dx * 8, c.y + c.dy * 8, 3, 0, Math.PI * 2)
    ctx.fill()
  })
}
