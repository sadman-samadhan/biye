import { NextResponse } from 'next/server'
import { PRESET_PALETTES, normalizePalette } from '@/lib/palettes'
import fs from 'fs'
import path from 'path'

export async function POST(req) {
  try {
    const body = await req.json()
    const { imageUrl, imageBase64, mimeType = 'image/jpeg' } = body

    const apiKey = process.env.GEMINI_API_KEY

    // If no API key or image provided, return preset palettes
    if (!apiKey || (!imageUrl && !imageBase64)) {
      return NextResponse.json({
        success: true,
        isAiGenerated: false,
        message: !apiKey 
          ? 'GEMINI_API_KEY not configured. Returning curated presets.' 
          : 'No image provided. Returning curated presets.',
        palettes: PRESET_PALETTES
      })
    }

    // Prepare image payload for Gemini Vision
    let imagePart = null

    if (imageBase64) {
      const cleanBase64 = imageBase64.includes('base64,')
        ? imageBase64.split('base64,')[1]
        : imageBase64

      // Extract mime type if present in data URL
      let detectedMime = mimeType
      if (imageBase64.startsWith('data:')) {
        const matches = imageBase64.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/)
        if (matches && matches[1]) {
          detectedMime = matches[1]
        }
      }

      imagePart = {
        inlineData: {
          mimeType: detectedMime,
          data: cleanBase64
        }
      }
    } else if (imageUrl) {
      // If it's a local path like /images/..., read from public folder directly
      if (imageUrl.startsWith('/')) {
        try {
          const localPath = path.join(process.cwd(), 'public', imageUrl.replace(/^\//, ''))
          if (fs.existsSync(localPath)) {
            const buffer = fs.readFileSync(localPath)
            const ext = path.extname(localPath).toLowerCase().replace('.', '')
            const localMime = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg'
            imagePart = {
              inlineData: {
                mimeType: localMime,
                data: buffer.toString('base64')
              }
            }
          }
        } catch (localErr) {
          console.warn('Failed to read local image:', localErr.message)
        }
      }

      // If not resolved locally, fetch via HTTP
      if (!imagePart && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))) {
        try {
          const imgRes = await fetch(imageUrl)
          if (imgRes.ok) {
            const arrayBuffer = await imgRes.arrayBuffer()
            const fetchedMime = imgRes.headers.get('content-type') || mimeType
            const buffer = Buffer.from(arrayBuffer)
            imagePart = {
              inlineData: {
                mimeType: fetchedMime,
                data: buffer.toString('base64')
              }
            }
          }
        } catch (fetchErr) {
          console.warn('Failed to fetch imageUrl for Gemini:', fetchErr.message)
        }
      }
    }

    if (!imagePart) {
      return NextResponse.json({
        success: true,
        isAiGenerated: false,
        message: 'Could not process image data. Returning curated presets.',
        palettes: PRESET_PALETTES
      })
    }

    const promptText = `
Analyze this wedding photograph. Extract a cohesive, luxury wedding color palette and return exactly 6 hex colors mapped to these UI roles:
- bone: the lightest background color (luxurious soft ivory, cream, or warm white, e.g. #FAF9F6)
- graphite: the primary text color (MUST be very dark, e.g. #1A1815 or #2B2B2B, minimum 4.5:1 contrast against bone)
- warmGrey: a subtle neutral for borders and dividers (e.g. #E8E2DB)
- accent: the primary accent (the most visually captivating outfit, embroidery, or floral color from the photo)
- deepAccent: a darker complementary accent (e.g. deep wine, navy, dark emerald, or rich velvet)
- warmAccent: a warm secondary accent (e.g. gold, saffron, champagne, or peach)

You must respond ONLY with a raw JSON object (no markdown formatting, no backticks):
{
  "name": "Custom Palette Name (e.g. Saffron & Deep Velvet)",
  "description": "Brief description of the mood inspired by the photo",
  "bone": "#...",
  "graphite": "#...",
  "warmGrey": "#...",
  "accent": "#...",
  "deepAccent": "#...",
  "warmAccent": "#..."
}
`

    // Candidate models in order of preference
    const candidateModels = ['gemini-3.6-flash', 'gemini-flash-latest', 'gemini-2.5-flash']
    let geminiData = null
    let lastError = null

    for (const model of candidateModels) {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
      try {
        const geminiRes = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: promptText },
                  imagePart
                ]
              }
            ],
            generationConfig: {
              temperature: 0.2,
              responseMimeType: 'application/json'
            }
          })
        })

        if (geminiRes.ok) {
          geminiData = await geminiRes.json()
          break
        } else {
          const errText = await geminiRes.text()
          lastError = `Model ${model} returned ${geminiRes.status}: ${errText}`
          console.warn(lastError)
        }
      } catch (err) {
        lastError = err.message
        console.warn(`Model ${model} fetch failed:`, err.message)
      }
    }

    const rawContent = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text

    if (!rawContent) {
      console.error('Gemini extraction failed across models:', lastError)
      return NextResponse.json({
        success: true,
        isAiGenerated: false,
        message: lastError || 'No response from Gemini Vision. Returning presets.',
        palettes: PRESET_PALETTES
      })
    }

    // Clean any accidental markdown fence formatting
    const cleanedJson = rawContent
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim()

    const parsed = JSON.parse(cleanedJson)
    const aiPalette = normalizePalette({
      id: 'ai-generated',
      name: parsed.name || 'From Your Photo',
      description: parsed.description || 'Colors extracted from your wedding photography',
      bone: parsed.bone,
      graphite: parsed.graphite,
      warmGrey: parsed.warmGrey,
      accent: parsed.accent,
      deepAccent: parsed.deepAccent,
      warmAccent: parsed.warmAccent,
    })

    return NextResponse.json({
      success: true,
      isAiGenerated: true,
      aiPalette,
      palettes: [aiPalette, ...PRESET_PALETTES]
    })
  } catch (err) {
    console.error('Palette generation route error:', err)
    return NextResponse.json({
      success: true,
      isAiGenerated: false,
      error: err.message,
      palettes: PRESET_PALETTES
    })
  }
}
