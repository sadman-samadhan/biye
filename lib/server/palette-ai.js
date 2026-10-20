import 'server-only'
import { PRESET_PALETTES, normalizePalette } from '../palettes'

const PROMPT = `
Analyze this wedding photograph. Extract a cohesive, luxury wedding color palette and return exactly 6 hex colors mapped to these UI roles:
- bone: the lightest background color (luxurious soft ivory, cream, or warm white, e.g. #FAF9F6)
- graphite: the primary text color (MUST be very dark, e.g. #1A1815 or #2B2B2B, minimum 4.5:1 contrast against bone)
- warmGrey: a subtle neutral for borders and dividers (e.g. #E8E2DB)
- accent: the primary accent (the most visually captivating outfit, embroidery, or floral color from the photo)
- deepAccent: a darker complementary accent (e.g. deep wine, navy, dark emerald, or rich velvet)
- warmAccent: a warm secondary accent (e.g. gold, saffron, champagne, or peach)

You must respond ONLY with a raw JSON object (no markdown formatting, no backticks):
{"name": "...", "description": "...", "bone": "#...", "graphite": "#...", "warmGrey": "#...", "accent": "#...", "deepAccent": "#...", "warmAccent": "#..."}
`

const MODELS = ['gemini-3.6-flash', 'gemini-flash-latest', 'gemini-2.5-flash']

/**
 * Asks Gemini for a palette that matches a photo. Always resolves: falls back to
 * the curated presets when the key is missing or the model can't answer.
 */
export async function palettesFromImage(buffer, mimeType = 'image/webp') {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return { isAiGenerated: false, message: 'AI colours are not configured. Showing curated palettes.', palettes: PRESET_PALETTES }

  const imagePart = { inlineData: { mimeType, data: buffer.toString('base64') } }
  for (const model of MODELS) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({
          contents: [{ parts: [{ text: PROMPT }, imagePart] }],
          generationConfig: { temperature: 0.2, responseMimeType: 'application/json' },
        }),
      })
      if (!res.ok) continue
      const data = await res.json()
      const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text
      if (!raw) continue
      const parsed = JSON.parse(raw.replace(/```json/gi, '').replace(/```/g, '').trim())
      const aiPalette = normalizePalette({ id: 'ai-generated', ...parsed, name: parsed.name || 'From your photo' })
      aiPalette.description = typeof parsed.description === 'string' ? parsed.description.slice(0, 200) : 'Colours from your cover photo'
      return { isAiGenerated: true, palettes: [aiPalette, ...PRESET_PALETTES] }
    } catch (err) {
      console.warn(`[palette-ai] ${model} failed:`, err.message)
    }
  }
  return { isAiGenerated: false, message: 'Could not read colours from the photo. Showing curated palettes.', palettes: PRESET_PALETTES }
}
