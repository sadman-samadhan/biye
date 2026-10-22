import 'server-only'
import { createCanvas, loadImage } from '@napi-rs/canvas'
import { ensureFonts, fitText } from '../monogramGenerator'
import { splitNames } from '../../src/site/primitives/text'

const W = 1200
const H = 630

function drawCover(ctx, image, x, y, w, h) {
  const scale = Math.max(w / image.width, h / image.height)
  const sw = w / scale
  const sh = h / scale
  ctx.drawImage(image, (image.width - sw) / 2, (image.height - sh) / 2, sw, sh, x, y, w, h)
}

/**
 * The link preview card (WhatsApp, Messenger, Facebook): names, date and the
 * theme's colours, plus the cover photo when the couple allows it. Drawn with
 * canvas because it has to shape Bangla correctly.
 */
export async function renderShareCard({ names, date, eyebrow, roles, photo }) {
  ensureFonts()
  const canvas = createCanvas(W, H)
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = roles.bg
  ctx.fillRect(0, 0, W, H)

  let left = 0
  if (photo) {
    try {
      const image = await loadImage(photo)
      drawCover(ctx, image, 0, 0, 480, H)
      left = 480
    } catch {
      // No photo is better than no card
    }
  }

  const cx = left + (W - left) / 2
  const inner = W - left - 120

  ctx.strokeStyle = roles.ornament
  ctx.lineWidth = 2
  ctx.strokeRect(left + 28, 28, W - left - 56, H - 56)
  ctx.globalAlpha = 0.45
  ctx.lineWidth = 1
  ctx.strokeRect(left + 38, 38, W - left - 76, H - 76)
  ctx.globalAlpha = 1

  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'

  ctx.fillStyle = roles.accent
  ctx.font = '22px "Hind Siliguri", sans-serif'
  ctx.fillText(fitText(ctx, eyebrow, inner), cx, 140)

  const [first, second] = splitNames(names?.en)
  ctx.fillStyle = roles.ink
  const nameLine = second ? `${first} & ${second}` : first
  let size = 96
  ctx.font = `${size}px "Cormorant Garamond", serif`
  while (size > 48 && ctx.measureText(nameLine).width > inner) {
    size -= 4
    ctx.font = `${size}px "Cormorant Garamond", serif`
  }
  ctx.fillText(fitText(ctx, nameLine, inner), cx, 270)

  let y = 270
  if (names?.bn) {
    ctx.fillStyle = roles.accentStrong
    ctx.font = '46px "Tiro Bangla", serif'
    y += 76
    ctx.fillText(fitText(ctx, names.bn, inner), cx, y)
  }

  ctx.strokeStyle = roles.ornament
  ctx.lineWidth = 1.5
  y += 50
  ctx.beginPath()
  ctx.moveTo(cx - 70, y)
  ctx.lineTo(cx + 70, y)
  ctx.stroke()

  if (date?.en) {
    ctx.fillStyle = roles.ink
    ctx.font = '34px "Cormorant Garamond", serif'
    y += 60
    ctx.fillText(fitText(ctx, date.en, inner), cx, y)
  }
  if (date?.bn) {
    ctx.fillStyle = roles.inkMuted
    ctx.font = '30px "Tiro Bangla", serif'
    y += 48
    ctx.fillText(fitText(ctx, date.bn, inner), cx, y)
  }

  return canvas.toBuffer('image/jpeg', 88)
}
