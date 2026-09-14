'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { PRESET_PALETTES } from '@/lib/palettes'
import {
  TRADITIONS,
  getTradition,
  CUSTOM_EVENT_PRESETS,
  getProgramTogglePresets,
  sortCeremoniesChronologically,
  isWeddingAnchorCeremony
} from '@/lib/traditions'
import {
  ExternalLink,
  Check,
  Trash2,
  CheckCircle,
  XCircle,
  Save,
  Upload,
  Sparkles,
  Loader2,
  Image as ImageIcon,
  CheckCircle2,
  X,
  FileImage,
  Plus,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  ChevronUp,
  Video,
  Eye,
  Layers,
  Heart,
  Calendar,
  User,
  Clock,
  MapPin,
  BookOpen,
  MessageSquare,
  Sparkle
} from 'lucide-react'
import FocalPointPicker from '@/components/admin/FocalPointPicker'
import CeremonyCarouselPicker from '@/components/admin/CeremonyCarouselPicker'

export default function EditSitePage({ params }) {
  const resolvedParams = use(params)
  const id = resolvedParams.id

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Site core state
  const [site, setSite] = useState(null)
  const [weddingType, setWeddingType] = useState('muslim')
  const tradition = getTradition(weddingType)

  // Section Selector Toggles
  const [sectionToggles, setSectionToggles] = useState({
    hero: true,
    spotlight: true,
    story: true,
    ceremonies: true,
    gallery: true,
    blessings: true,
    messages: true,
    monogram: true,
    palette: true
  })

  // Form Data (Hero, Spotlight, Story, Blessings, etc.)
  const [formData, setFormData] = useState({
    coupleNamesEn: '',
    coupleNamesBn: '',
    slug: '',
    dateEn: '',
    dateBn: '',
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    status: 'live',
    // Hero Media
    mediaType: 'photo',
    heroImageUrl: '',
    heroImagePosition: 'center',
    heroVideoUrl: '',
    // Spotlight / Bride Reveal
    spotlightTitleEn: '',
    spotlightTitleBn: '',
    spotlightDescEn: '',
    spotlightDescBn: '',
    spotlightImageUrl: '',
    spotlightImagePosition: 'center',
    // Blessings & Scriptures
    blessingText: '',
    blessingEn: '',
    blessingBn: '',
    blessingRef: '',
    // Parent Blessings
    parentTitleEn: '',
    parentTitleBn: '',
    parentMessageEn: '',
    parentMessageBn: '',
    parentAttrEn: '',
    parentAttrBn: ''
  })

  // Dynamic Lists
  const [storyMilestones, setStoryMilestones] = useState([])
  const [ceremonies, setCeremonies] = useState([])
  const [gallery, setGallery] = useState([])
  const [messages, setMessages] = useState([])
  const [collapsedCeremonies, setCollapsedCeremonies] = useState({})

  // Monogram state
  const [monogramUrl, setMonogramUrl] = useState('')
  const [generatingMonogram, setGeneratingMonogram] = useState(false)
  const [monogramStatus, setMonogramStatus] = useState(null)

  // Palette & Hero Upload states
  const [selectedPaletteIndex, setSelectedPaletteIndex] = useState(0)
  const [heroUploadState, setHeroUploadState] = useState({
    fileName: '',
    previewUrl: '',
    uploading: false,
    uploaded: false,
    error: null
  })
  const [batchUploading, setBatchUploading] = useState(false)
  const [batchProgress, setBatchProgress] = useState('')
  const [extractingPalette, setExtractingPalette] = useState(false)
  const [paletteStatus, setPaletteStatus] = useState(null)
  const [heroBase64, setHeroBase64] = useState(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch site data on mount
  const fetchSiteData = async () => {
    try {
      const res = await fetch(`/api/admin/sites/${id}`)
      const data = await res.json()
      if (data.site) {
        const s = data.site
        const c = data.content || {}
        const ceremoniesList = data.ceremonies || c.ceremonies || []
        const duasData = data.duas || c.duas || {}
        const galleryList = data.gallery || c.gallery || []

        setSite(s)
        const currentType = s.wedding_type || c.wedding_type || 'muslim'
        setWeddingType(currentType)

        // Section Toggles
        if (c.sectionToggles) {
          setSectionToggles(prev => ({ ...prev, ...c.sectionToggles }))
        }

        // Form Data
        setFormData({
          coupleNamesEn: c?.hero?.coupleNames?.en || s.owner_name || '',
          coupleNamesBn: c?.hero?.coupleNames?.bn || '',
          slug: s.slug || '',
          dateEn: c?.hero?.date?.en || '',
          dateBn: c?.hero?.date?.bn || '',
          ownerName: s.owner_name || '',
          ownerEmail: s.owner_email || '',
          ownerPhone: s.owner_phone || '',
          status: s.status || 'live',
          // Hero
          mediaType: c?.hero?.mediaType || (c?.hero?.videoPath ? 'video' : 'photo'),
          heroImageUrl: c?.hero?.posterPath || '',
          heroImagePosition: c?.hero?.posterPosition || 'center',
          heroVideoUrl: c?.hero?.videoPath || '',
          // Spotlight
          spotlightTitleEn: c?.brideReveal?.title?.en || 'Our Families Said Yes',
          spotlightTitleBn: c?.brideReveal?.title?.bn || 'পরিবারের সম্মতিতে এক হলো দুটি মন',
          spotlightDescEn: c?.brideReveal?.description?.en || '',
          spotlightDescBn: c?.brideReveal?.description?.bn || '',
          spotlightImageUrl: c?.brideReveal?.imagePath || '',
          spotlightImagePosition: c?.brideReveal?.imagePosition || 'center',
          // Blessings
          blessingText: c?.blessing?.ar || c?.blessing?.sa || c?.hero?.blessing?.ar || c?.hero?.blessing?.sa || '',
          blessingEn: c?.blessing?.en || c?.hero?.blessing?.en || '',
          blessingBn: c?.blessing?.bn || c?.hero?.blessing?.bn || '',
          blessingRef: c?.blessing?.reference || c?.hero?.blessing?.reference || '',
          // Parent Blessings
          parentTitleEn: duasData?.parentBlessings?.title?.en || '',
          parentTitleBn: duasData?.parentBlessings?.title?.bn || '',
          parentMessageEn: duasData?.parentBlessings?.message?.en || '',
          parentMessageBn: duasData?.parentBlessings?.message?.bn || '',
          parentAttrEn: duasData?.parentBlessings?.attribution?.en || '',
          parentAttrBn: duasData?.parentBlessings?.attribution?.bn || ''
        })

        // Milestones
        setStoryMilestones(c?.story?.milestones || [])

        // Ceremonies canonically sorted
        setCeremonies(sortCeremoniesChronologically(ceremoniesList, s.wedding_type || 'muslim'))

        // Monogram
        setMonogramUrl(c?.logoUrl || '')

        // Gallery & Messages
        setGallery(galleryList)
        setMessages(data.messages || [])
        setSelectedPaletteIndex(s.selected_palette_index || 0)
      }
    } catch (err) {
      console.error('Failed to load site:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSiteData()
  }, [id])

  // Handle Hero Image Upload with Live Preview
  const handleHeroUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const localPreview = URL.createObjectURL(file)
    setHeroUploadState({
      fileName: file.name,
      previewUrl: localPreview,
      uploading: true,
      uploaded: false,
      error: null
    })

    // Read base64 for Gemini Vision AI palette extraction
    const reader = new FileReader()
    reader.onload = () => {
      const b64 = reader.result
      setHeroBase64(b64)
      extractPaletteFromImage(null, b64)
    }
    reader.readAsDataURL(file)

    const uploadFormData = new FormData()
    uploadFormData.append('file', file)
    uploadFormData.append('siteId', site?.slug || id)
    uploadFormData.append('category', 'hero')

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData
      })
      const data = await res.json()
      if (data.publicUrl) {
        setFormData(prev => ({
          ...prev,
          heroImageUrl: data.publicUrl
        }))

        setHeroUploadState(prev => ({
          ...prev,
          previewUrl: data.publicUrl,
          uploading: false,
          uploaded: true
        }))
      } else {
        throw new Error(data.error || 'Upload failed')
      }
    } catch (err) {
      console.error('Upload failed:', err)
      setHeroUploadState(prev => ({
        ...prev,
        uploading: false,
        error: err.message || 'Upload failed'
      }))
    }
  }

  // Handle Video Upload
  const handleHeroVideoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const uploadFormData = new FormData()
    uploadFormData.append('file', file)
    uploadFormData.append('siteId', site?.slug || id)
    uploadFormData.append('category', 'hero-video')

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData
      })
      const data = await res.json()
      if (data.publicUrl) {
        setFormData(prev => ({ ...prev, heroVideoUrl: data.publicUrl }))
      }
    } catch (err) {
      console.error('Video upload failed:', err)
    }
  }

  // Handle Spotlight Image Upload
  const handleSpotlightUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const uploadFormData = new FormData()
    uploadFormData.append('file', file)
    uploadFormData.append('siteId', site?.slug || id)
    uploadFormData.append('category', 'spotlight')

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: uploadFormData })
      const data = await res.json()
      if (data.publicUrl) {
        setFormData(prev => ({ ...prev, spotlightImageUrl: data.publicUrl }))
      }
    } catch (err) {
      console.error('Spotlight upload failed:', err)
    }
  }

  // Milestone Image Upload
  const handleMilestoneUpload = async (index, e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const uploadFormData = new FormData()
    uploadFormData.append('file', file)
    uploadFormData.append('siteId', site?.slug || id)
    uploadFormData.append('category', 'story')

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: uploadFormData })
      const data = await res.json()
      if (data.publicUrl) {
        setStoryMilestones(prev => {
          const updated = [...prev]
          updated[index] = { ...updated[index], imagePath: data.publicUrl }
          return updated
        })
      }
    } catch (err) {
      console.error('Milestone image upload failed:', err)
    }
  }

  // Ceremony Banner Upload
  const handleCeremonyBannerUpload = async (index, e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const uploadFormData = new FormData()
    uploadFormData.append('file', file)
    uploadFormData.append('siteId', site?.slug || id)
    uploadFormData.append('category', 'ceremony-banners')

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: uploadFormData })
      const data = await res.json()
      if (data.publicUrl) {
        setCeremonies(prev => {
          const updated = [...prev]
          updated[index] = { ...updated[index], heroImage: data.publicUrl }
          return updated
        })
      }
    } catch (err) {
      console.error('Ceremony banner upload failed:', err)
    }
  }

  // Gemini Vision palette extraction
  const extractPaletteFromImage = async (imageUrl, b64) => {
    const targetBase64 = b64 || heroBase64
    if (!imageUrl && !targetBase64) return
    setExtractingPalette(true)
    setPaletteStatus('Creating your color palette...')
    try {
      const res = await fetch('/api/palette', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: imageUrl?.startsWith('blob:') ? undefined : imageUrl,
          imageBase64: targetBase64
        })
      })
      const data = await res.json()
      if (data.palettes && data.palettes.length > 0) {
        setSite(prev => ({
          ...prev,
          palette_options: data.palettes,
          palette: data.palettes[0]
        }))
        setSelectedPaletteIndex(0)
        if (data.isAiGenerated && data.aiPalette) {
          setPaletteStatus(`✨ AI Extracted: "${data.aiPalette.name}" (${data.aiPalette.description || 'Colors tailored to attire & florals'})`)
        } else if (data.message) {
          setPaletteStatus(`Note: ${data.message}`)
        }
      }
    } catch (err) {
      console.error('Palette extraction failed:', err)
      setPaletteStatus('Palette extraction failed: ' + err.message)
    } finally {
      setExtractingPalette(false)
    }
  }

  // Handle Batch Gallery Upload
  const handleBatchGalleryUpload = async (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setBatchUploading(true)
    setBatchProgress(`Uploading 0 of ${files.length}...`)

    const newItems = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      setBatchProgress(`Uploading photo ${i + 1} of ${files.length}...`)

      const uploadFormData = new FormData()
      uploadFormData.append('file', file)
      uploadFormData.append('siteId', site?.slug || id)
      uploadFormData.append('category', 'gallery')

      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData
        })
        const data = await res.json()
        if (data.publicUrl) {
          newItems.push({
            id: `gallery-${Date.now()}-${i}`,
            filename: data.publicUrl,
            category: 'wedding',
            alt: file.name,
            name: file.name,
            sizeKb: Math.round((data.optimizedSize || file.size) / 1024)
          })
        }
      } catch (err) {
        console.error(`Failed to upload ${file.name}:`, err)
      }
    }

    setGallery(prev => [...prev, ...newItems])
    setBatchUploading(false)
    setBatchProgress('')
  }

  const removeGalleryImage = (idxToRemove) => {
    setGallery(prev => prev.filter((_, idx) => idx !== idxToRemove))
  }

  // Ceremony Reordering & Quick Program Presets
  const moveCeremony = (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= ceremonies.length) return
    setCeremonies(prev => {
      const updated = [...prev]
      const temp = updated[index]
      updated[index] = updated[targetIndex]
      updated[targetIndex] = temp
      return updated
    })
  }

  const toggleProgramPreset = (presetId) => {
    const existingIndex = ceremonies.findIndex(c => c.id === presetId || c.slug === presetId)
    if (existingIndex >= 0) {
      setCeremonies(prev => {
        const updated = [...prev]
        const willEnable = !updated[existingIndex].enabled
        updated[existingIndex] = { ...updated[existingIndex], enabled: willEnable }
        return willEnable ? sortCeremoniesChronologically(updated, weddingType) : updated
      })
    } else {
      const traditionCeremony = tradition.ceremonies?.find(c => c.id === presetId || c.slug === presetId)
      const customCeremony = CUSTOM_EVENT_PRESETS.find(c => c.id === presetId || c.slug === presetId)
      const ceremonyToAdd = traditionCeremony || customCeremony
      if (ceremonyToAdd) {
        setCeremonies(prev => {
          const updated = [...prev, { ...ceremonyToAdd, enabled: true }]
          return sortCeremoniesChronologically(updated, weddingType)
        })
      }
    }
  }

  const addPresetCeremony = (preset) => {
    const newId = `${preset.id}-${Date.now()}`
    setCeremonies(prev => {
      const updated = [
        ...prev,
        {
          ...preset,
          id: newId,
          slug: newId,
          enabled: true
        }
      ]
      return sortCeremoniesChronologically(updated, weddingType)
    })
  }

  // Generate / Regenerate Monogram
  const handleGenerateMonogram = async () => {
    setGeneratingMonogram(true)
    setMonogramStatus('Generating luxury emblem...')

    const names = formData.coupleNamesEn.includes('&')
      ? formData.coupleNamesEn.split('&').map(s => s.trim())
      : [formData.coupleNamesEn, '']

    try {
      const res = await fetch('/api/monogram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name1: names[0] || 'Bride',
          name2: names[1] || 'Groom',
          blessingText: formData.blessingEn,
          verseSnippet: formData.blessingRef,
          venue: ceremonies[0]?.venue?.en || '',
          weddingType: weddingType,
          siteId: site?.id || id
        })
      })

      const data = await res.json()
      if (data.url) {
        setMonogramUrl(data.url)
        setMonogramStatus('✨ Monogram created successfully!')
      } else {
        throw new Error(data.error || 'Failed to generate monogram')
      }
    } catch (err) {
      console.error('Monogram generation failed:', err)
      setMonogramStatus('Generation failed: ' + err.message)
    } finally {
      setGeneratingMonogram(false)
    }
  }

  // Save all changes
  const handleSave = async (e) => {
    if (e) e.preventDefault()
    setSaving(true)

    const paletteList = site.palette_options?.length > 0 ? site.palette_options : PRESET_PALETTES
    const chosenPalette = paletteList[selectedPaletteIndex] || PRESET_PALETTES[0]

    // Construct full content structure
    const updatedContent = {
      sectionToggles,
      wedding_type: weddingType,
      logoUrl: monogramUrl || undefined,
      hero: {
        coupleNames: {
          en: formData.coupleNamesEn,
          bn: formData.coupleNamesBn
        },
        date: {
          en: formData.dateEn,
          bn: formData.dateBn
        },
        blessing: {
          [weddingType === 'hindu' ? 'sa' : 'ar']: formData.blessingText,
          en: formData.blessingEn,
          bn: formData.blessingBn,
          reference: formData.blessingRef
        },
        mediaType: formData.mediaType,
        posterPath: formData.heroImageUrl,
        posterPosition: formData.heroImagePosition,
        videoPath: formData.heroVideoUrl
      },
      brideReveal: sectionToggles.spotlight ? {
        title: { en: formData.spotlightTitleEn, bn: formData.spotlightTitleBn },
        description: { en: formData.spotlightDescEn, bn: formData.spotlightDescBn },
        imagePath: formData.spotlightImageUrl,
        imagePosition: formData.spotlightImagePosition
      } : undefined,
      story: sectionToggles.story ? {
        title: { en: 'Our Journey', bn: 'আমাদের পথচলা' },
        milestones: storyMilestones
      } : undefined,
      blessing: {
        [weddingType === 'hindu' ? 'sa' : 'ar']: formData.blessingText,
        en: formData.blessingEn,
        bn: formData.blessingBn,
        reference: formData.blessingRef
      },
      footer: {
        copyright: `© 2026 ${formData.coupleNamesEn || 'AmarBiye'}. All rights reserved.`
      }
    }

    const updatedDuas = {
      duas: tradition.defaultDuas || [],
      parentBlessings: {
        title: { en: formData.parentTitleEn, bn: formData.parentTitleBn },
        message: { en: formData.parentMessageEn, bn: formData.parentMessageBn },
        attribution: { en: formData.parentAttrEn, bn: formData.parentAttrBn }
      }
    }

    try {
      const res = await fetch(`/api/admin/sites/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: formData.status,
          wedding_type: weddingType,
          owner_name: formData.ownerName || formData.coupleNamesEn,
          owner_email: formData.ownerEmail,
          owner_phone: formData.ownerPhone,
          palette: chosenPalette,
          palette_options: paletteList,
          selected_palette_index: selectedPaletteIndex,
          content: updatedContent,
          ceremonies: ceremonies,
          duas: updatedDuas,
          gallery: gallery
        })
      })

      if (res.ok) {
        alert('✨ Wedding site updated successfully!')
        fetchSiteData()
      } else {
        alert('Failed to update site')
      }
    } catch (err) {
      alert('Error updating site: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  // Message Moderation Handlers
  const handleMessageToggle = async (messageId, currentApproved) => {
    try {
      await fetch(`/api/admin/messages/${messageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved: !currentApproved })
      })
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, approved: !currentApproved } : m))
    } catch (err) {
      console.error(err)
    }
  }

  const handleMessageDelete = async (messageId) => {
    if (!confirm('Delete this message permanently?')) return
    try {
      await fetch(`/api/admin/messages/${messageId}`, { method: 'DELETE' })
      setMessages(prev => prev.filter(m => m.id !== messageId))
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) {
    return <div className="p-12 text-center text-zinc-500 font-light">Loading wedding site details...</div>
  }

  if (!site) {
    return <div className="p-12 text-center text-rose-400">Site not found.</div>
  }

  const availablePalettes = site.palette_options?.length > 0 ? site.palette_options : PRESET_PALETTES
  const currentHeroImg = formData.heroImageUrl || heroUploadState.previewUrl || ''

  return (
    <div className="space-y-10 pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#141418] p-6 rounded-2xl border border-white/5 shadow-md">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl md:text-3xl text-white font-semibold tracking-tight">
              {formData.coupleNamesEn || site.owner_name || site.slug}
            </h1>
            <span
              className={`text-[10px] uppercase tracking-wider font-semibold px-2.5 py-0.5 rounded-full ${formData.status === 'live'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                }`}
            >
              {formData.status}
            </span>
          </div>
          <p className="text-zinc-500 text-xs font-mono mt-1">
            Path: /s/{site.slug}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/s/${site.slug}`}
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-xl transition-colors"
          >
            <span>View Public Site</span>
            <ExternalLink size={14} />
          </Link>

          <button
            onClick={handleSave}
            disabled={saving || heroUploadState.uploading || batchUploading}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#A67C52] to-[#8C643E] hover:from-[#B88B5E] text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            <Save size={15} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {/* ========================================================
            SECTION A: CELEBRATION TRADITION & COUPLE IDENTITY
            ======================================================== */}
        <div className="p-8 rounded-2xl bg-[#141418] border border-white/5 space-y-6">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <div className="w-8 h-8 rounded-lg bg-[#A67C52]/20 flex items-center justify-center text-[#D4A574]">
              <Heart size={18} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Section A: Celebration Tradition &amp; Couple Identity</h2>
              <p className="text-xs text-zinc-400 font-light">Sets cultural customs, default ceremony structures, and couple identities</p>
            </div>
          </div>

          {/* Tradition Toggle */}
          <div>
            <label className="text-xs uppercase tracking-wider text-zinc-400 block mb-3 font-medium">
              Cultural &amp; Religious Tradition
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.values(TRADITIONS).map((trad) => {
                const isSelected = weddingType === trad.id
                return (
                  <button
                    key={trad.id}
                    type="button"
                    onClick={() => {
                      setWeddingType(trad.id)
                      // Update blessings to match tradition default if user hasn't heavily customized
                      if (!formData.blessingText || formData.blessingText === tradition.defaultBlessing.ar || formData.blessingText === tradition.defaultBlessing.sa) {
                        setFormData(p => ({
                          ...p,
                          blessingText: trad.defaultBlessing.ar || trad.defaultBlessing.sa || '',
                          blessingEn: trad.defaultBlessing.en,
                          blessingBn: trad.defaultBlessing.bn,
                          blessingRef: trad.defaultBlessing.reference
                        }))
                      }
                    }}
                    className={`p-5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${isSelected
                        ? 'bg-[#A67C52]/15 border-[#A67C52] ring-1 ring-[#A67C52]'
                        : 'bg-white/5 border-white/10 hover:border-white/20'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{trad.icon}</span>
                      <div>
                        <p className="text-sm font-semibold text-white">{trad.label.en}</p>
                        <p className="text-xs text-zinc-400 font-bangla">{trad.label.bn}</p>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-[#A67C52] text-white flex items-center justify-center">
                        <Check size={12} />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Names & Slug */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            <div>
              <label className="text-xs uppercase tracking-wider text-zinc-400 block mb-2 font-medium">
                Couple Names (English) *
              </label>
              <input
                type="text"
                value={formData.coupleNamesEn}
                onChange={(e) => setFormData(p => ({ ...p, coupleNamesEn: e.target.value }))}
                placeholder={tradition.placeholderCouple.en}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4A574]"
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider text-zinc-400 block mb-2 font-medium">
                Couple Names (Bangla / বাংলা)
              </label>
              <input
                type="text"
                value={formData.coupleNamesBn}
                onChange={(e) => setFormData(p => ({ ...p, coupleNamesBn: e.target.value }))}
                placeholder={tradition.placeholderCouple.bn}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-bangla placeholder-zinc-500 focus:outline-none focus:border-[#D4A574]"
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider text-zinc-400 block mb-2 font-medium">
                Main Wedding Date (English)
              </label>
              <input
                type="text"
                value={formData.dateEn}
                onChange={(e) => setFormData(p => ({ ...p, dateEn: e.target.value }))}
                placeholder="e.g. 18 December 2026"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4A574]"
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider text-zinc-400 block mb-2 font-medium">
                Main Wedding Date (Bangla / বাংলা)
              </label>
              <input
                type="text"
                value={formData.dateBn}
                onChange={(e) => setFormData(p => ({ ...p, dateBn: e.target.value }))}
                placeholder="১৮ ডিসেম্বর ২০২৬"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-bangla placeholder-zinc-500 focus:outline-none focus:border-[#D4A574]"
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider text-zinc-400 block mb-2 font-medium">
                Publish Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(p => ({ ...p, status: e.target.value }))}
                className="w-full px-4 py-3 bg-[#18181C] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#D4A574]"
              >
                <option value="live">Live (Publicly Accessible)</option>
                <option value="draft">Draft (Under Preparation)</option>
                <option value="expired">Expired / Archived</option>
              </select>
            </div>
          </div>
        </div>

        {/* ========================================================
            SECTION A½: SECTION SELECTOR PANEL
            ======================================================== */}
        <div className="p-8 rounded-2xl bg-[#141418] border border-white/5 space-y-4">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <div className="w-8 h-8 rounded-lg bg-[#A67C52]/20 flex items-center justify-center text-[#D4A574]">
              <Layers size={18} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Section Selector Panel: What's Included?</h2>
              <p className="text-xs text-zinc-400 font-light">Toggle modules on or off for this couple. Disabled sections will be omitted from the live celebration site.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 pt-2">
            {[
              { id: 'hero', label: 'Hero Banner', icon: '🖼️', required: true },
              { id: 'spotlight', label: 'Couple Spotlight', icon: '💑' },
              { id: 'story', label: 'Our Journey', icon: '📖' },
              { id: 'ceremonies', label: 'Ceremonies', icon: '🎊', required: true },
              { id: 'gallery', label: 'Photo Gallery', icon: '📸' },
              { id: 'blessings', label: 'Blessings & Duas', icon: '🤲' },
              { id: 'messages', label: 'Guest Messages', icon: '💌' },
              { id: 'monogram', label: 'Wedding Emblem', icon: '💍' },
              { id: 'palette', label: 'Custom Palette', icon: '🎨' }
            ].map(sec => {
              const active = sectionToggles[sec.id] !== false
              return (
                <button
                  key={sec.id}
                  type="button"
                  disabled={sec.required}
                  onClick={() => {
                    if (!sec.required) {
                      setSectionToggles(p => ({ ...p, [sec.id]: !p[sec.id] }))
                    }
                  }}
                  className={`p-3.5 rounded-xl border flex items-center justify-between transition-all text-left ${active
                      ? 'bg-[#A67C52]/20 border-[#A67C52] text-white shadow-sm'
                      : 'bg-white/5 border-white/5 text-zinc-500 opacity-60'
                    } ${sec.required ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center gap-2">
                    <span>{sec.icon}</span>
                    <span className="text-xs font-medium">{sec.label}</span>
                  </div>
                  {active ? (
                    <div className="w-4 h-4 rounded-full bg-[#A67C52] text-white flex items-center justify-center shrink-0">
                      <Check size={10} />
                    </div>
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-white/10 shrink-0" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* ========================================================
            SECTION B: HERO SECTION (MEDIA & FOCAL POINT)
            ======================================================== */}
        <div className="p-8 rounded-2xl bg-[#141418] border border-white/5 space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#A67C52]/20 flex items-center justify-center text-[#D4A574]">
                <ImageIcon size={18} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Section B: Wedding Photo &amp; Color Theme</h2>
                <p className="text-xs text-zinc-400 font-light">Main portrait or video with automatic color palette extraction</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                const raw = formData.heroImageUrl || currentHeroImg
                const resolved = raw?.startsWith('http') || raw?.startsWith('blob:') || raw?.startsWith('/')
                  ? raw
                  : `/images/${raw}`
                extractPaletteFromImage(resolved, heroBase64)
              }}
              disabled={extractingPalette || heroUploadState.uploading}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#A67C52]/20 hover:bg-[#A67C52]/30 text-[#D4A574] border border-[#A67C52]/40 rounded-xl text-xs font-medium cursor-pointer transition-all disabled:opacity-50"
            >
              <Sparkles size={14} className={extractingPalette ? 'animate-spin' : ''} />
              <span>{extractingPalette ? 'Creating your color palette...' : 'Refresh Color Theme'}</span>
            </button>
          </div>

          {/* Media Type Toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setFormData(p => ({ ...p, mediaType: 'photo' }))}
              className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${formData.mediaType === 'photo'
                  ? 'bg-[#A67C52] border-[#D4A574] text-white'
                  : 'bg-white/5 border-white/10 text-zinc-400'
                }`}
            >
              High-Definition Photograph
            </button>
            <button
              type="button"
              onClick={() => setFormData(p => ({ ...p, mediaType: 'video' }))}
              className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${formData.mediaType === 'video'
                  ? 'bg-[#A67C52] border-[#D4A574] text-white'
                  : 'bg-white/5 border-white/10 text-zinc-400'
                }`}
            >
              Looping Background Video
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
            {/* Live Interactive Preview & Custom Focal Point Reticle */}
            <FocalPointPicker
              value={formData.heroImagePosition || '50% 50%'}
              onChange={(newPos) => setFormData(p => ({ ...p, heroImagePosition: newPos }))}
              imageUrl={currentHeroImg}
              isVideo={formData.mediaType === 'video'}
              videoUrl={formData.heroVideoUrl}
              fileName={heroUploadState.fileName || formData.heroImageUrl}
              aspectRatio="aspect-[16/10]"
            />

            {/* Upload Controls */}
            <div className="space-y-4">
              {formData.mediaType === 'photo' ? (
                <>
                  <label className="text-xs uppercase tracking-wider text-zinc-400 block font-medium">
                    Upload Main Wedding Photo
                  </label>
                  <label className="flex items-center justify-center gap-2.5 px-4 py-5 bg-black/40 border border-dashed border-white/20 hover:border-[#A67C52] rounded-xl text-zinc-300 text-xs cursor-pointer transition-colors">
                    <Upload size={16} className="text-[#A67C52]" />
                    <span>Choose photo to upload...</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleHeroUpload}
                      className="hidden"
                    />
                  </label>

                  {heroUploadState.uploading && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-[#A67C52]/10 border border-[#A67C52]/30 text-xs text-[#D4A574]">
                      <Loader2 size={14} className="animate-spin shrink-0" />
                      <span>Optimizing &amp; uploading your photo...</span>
                    </div>
                  )}

                  <div>
                    <label className="text-xs uppercase tracking-wider text-zinc-400 block mb-1 font-medium">
                      Or Direct Image URL / Path
                    </label>
                    <input
                      type="text"
                      value={formData.heroImageUrl}
                      onChange={(e) => setFormData(p => ({ ...p, heroImageUrl: e.target.value }))}
                      className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-[#D4A574]"
                    />
                  </div>
                </>
              ) : (
                <>
                  <label className="text-xs uppercase tracking-wider text-zinc-400 block font-medium">
                    Upload Background Video (MP4/WebM)
                  </label>
                  <label className="flex items-center justify-center gap-2.5 px-4 py-5 bg-black/40 border border-dashed border-white/20 hover:border-[#A67C52] rounded-xl text-zinc-300 text-xs cursor-pointer transition-colors">
                    <Video size={16} className="text-[#A67C52]" />
                    <span>Choose short video (≤20MB)...</span>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleHeroVideoUpload}
                      className="hidden"
                    />
                  </label>

                  <div>
                    <label className="text-xs uppercase tracking-wider text-zinc-400 block mb-1 font-medium">
                      Or Video URL / Path
                    </label>
                    <input
                      type="text"
                      value={formData.heroVideoUrl}
                      onChange={(e) => setFormData(p => ({ ...p, heroVideoUrl: e.target.value }))}
                      className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-[#D4A574]"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================
            SECTION C: COUPLE / BRIDE SPOTLIGHT
            ======================================================== */}
        {sectionToggles.spotlight && (
          <div className="p-8 rounded-2xl bg-[#141418] border border-white/5 space-y-6">
            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
              <div className="w-8 h-8 rounded-lg bg-[#A67C52]/20 flex items-center justify-center text-[#D4A574]">
                <Heart size={18} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Section C: Couple Spotlight ("Our Families Said Yes")</h2>
                <p className="text-xs text-zinc-400 font-light">Dedicated portrait section celebrating family union and devotion</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="text-xs uppercase tracking-wider text-zinc-400 block mb-2 font-medium">
                  Spotlight Title (English)
                </label>
                <input
                  type="text"
                  value={formData.spotlightTitleEn}
                  onChange={(e) => setFormData(p => ({ ...p, spotlightTitleEn: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-[#D4A574]"
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-zinc-400 block mb-2 font-medium">
                  Spotlight Title (Bangla / বাংলা)
                </label>
                <input
                  type="text"
                  value={formData.spotlightTitleBn}
                  onChange={(e) => setFormData(p => ({ ...p, spotlightTitleBn: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white font-bangla text-xs focus:outline-none focus:border-[#D4A574]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs uppercase tracking-wider text-zinc-400 block mb-2 font-medium">
                  Description (English)
                </label>
                <textarea
                  rows={2}
                  value={formData.spotlightDescEn}
                  onChange={(e) => setFormData(p => ({ ...p, spotlightDescEn: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-[#D4A574]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs uppercase tracking-wider text-zinc-400 block mb-2 font-medium">
                  Description (Bangla / বাংলা)
                </label>
                <textarea
                  rows={2}
                  value={formData.spotlightDescBn}
                  onChange={(e) => setFormData(p => ({ ...p, spotlightDescBn: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white font-bangla text-xs focus:outline-none focus:border-[#D4A574]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs uppercase tracking-wider text-zinc-400 block mb-2 font-medium">
                  Spotlight Photograph
                </label>
                <label className="flex items-center justify-center gap-2 px-4 py-3 bg-black/40 border border-dashed border-white/20 hover:border-[#A67C52] rounded-xl text-zinc-300 text-xs cursor-pointer transition-colors">
                  <Upload size={14} className="text-[#A67C52]" />
                  <span>{formData.spotlightImageUrl ? 'Change Spotlight Photo...' : 'Choose Spotlight Photo...'}</span>
                  <input type="file" accept="image/*" onChange={handleSpotlightUpload} className="hidden" />
                </label>
              </div>

              {formData.spotlightImageUrl && (
                <div className="sm:col-span-2 pt-2">
                  <FocalPointPicker
                    value={formData.spotlightImagePosition || '50% 50%'}
                    onChange={(newPos) => setFormData(p => ({ ...p, spotlightImagePosition: newPos }))}
                    imageUrl={formData.spotlightImageUrl}
                    aspectRatio="aspect-[16/9]"
                    targetRatioNumber={1.77}
                    label="Spotlight Photo Preview"
                    aspectLabel="16:9 Banner Frame"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================
            SECTION D: OUR JOURNEY TIMELINE MILESTONES
            ======================================================== */}
        {sectionToggles.story && (
          <div className="p-8 rounded-2xl bg-[#141418] border border-white/5 space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#A67C52]/20 flex items-center justify-center text-[#D4A574]">
                  <BookOpen size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Section D: "Our Journey" Milestones</h2>
                  <p className="text-xs text-zinc-400 font-light">Custom milestones tracing how the couple first met, grew, and decided on forever</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStoryMilestones(prev => [
                  ...prev,
                  {
                    year: '2026',
                    title: { en: 'A New Chapter', bn: 'নতুন অধ্যায়' },
                    story: { en: '', bn: '' },
                    imagePath: '',
                    imagePosition: 'center'
                  }
                ])}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-medium cursor-pointer transition-all"
              >
                <Plus size={14} />
                <span>Add Milestone</span>
              </button>
            </div>

            {storyMilestones.length === 0 ? (
              <div className="p-8 rounded-xl border border-dashed border-white/10 text-center text-zinc-500 text-xs">
                No milestones added yet. Click &quot;Add Milestone&quot; to begin building your couple&apos;s story.
              </div>
            ) : (
              <div className="space-y-4">
                {storyMilestones.map((ms, idx) => (
                  <div key={idx} className="p-5 rounded-xl bg-black/40 border border-white/10 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-semibold text-[#D4A574]">Milestone {idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => setStoryMilestones(prev => prev.filter((_, i) => i !== idx))}
                        className="text-zinc-500 hover:text-rose-400 p-1 cursor-pointer"
                        title="Delete milestone"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="text-[11px] uppercase tracking-wider text-zinc-400 block mb-1">Year / Date</label>
                        <input
                          type="text"
                          value={ms.year || ''}
                          onChange={(e) => {
                            const val = e.target.value
                            setStoryMilestones(prev => {
                              const updated = [...prev]
                              updated[idx] = { ...updated[idx], year: val }
                              return updated
                            })
                          }}
                          placeholder="e.g. 2022"
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] uppercase tracking-wider text-zinc-400 block mb-1">Title (English)</label>
                        <input
                          type="text"
                          value={ms.title?.en || ''}
                          onChange={(e) => {
                            const val = e.target.value
                            setStoryMilestones(prev => {
                              const updated = [...prev]
                              updated[idx] = { ...updated[idx], title: { ...updated[idx].title, en: val } }
                              return updated
                            })
                          }}
                          placeholder="First Meeting"
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] uppercase tracking-wider text-zinc-400 block mb-1">Title (Bangla)</label>
                        <input
                          type="text"
                          value={ms.title?.bn || ''}
                          onChange={(e) => {
                            const val = e.target.value
                            setStoryMilestones(prev => {
                              const updated = [...prev]
                              updated[idx] = { ...updated[idx], title: { ...updated[idx].title, bn: val } }
                              return updated
                            })
                          }}
                          placeholder="প্রথম দেখা"
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-bangla text-xs"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="text-[11px] uppercase tracking-wider text-zinc-400 block mb-1">Story (English)</label>
                        <textarea
                          rows={2}
                          value={ms.story?.en || ''}
                          onChange={(e) => {
                            const val = e.target.value
                            setStoryMilestones(prev => {
                              const updated = [...prev]
                              updated[idx] = { ...updated[idx], story: { ...updated[idx].story, en: val } }
                              return updated
                            })
                          }}
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="text-[11px] uppercase tracking-wider text-zinc-400 block mb-1">Story (Bangla)</label>
                        <textarea
                          rows={2}
                          value={ms.story?.bn || ''}
                          onChange={(e) => {
                            const val = e.target.value
                            setStoryMilestones(prev => {
                              const updated = [...prev]
                              updated[idx] = { ...updated[idx], story: { ...updated[idx].story, bn: val } }
                              return updated
                            })
                          }}
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-bangla text-xs"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="text-[11px] uppercase tracking-wider text-zinc-400 block mb-1">Milestone Photo Upload</label>
                        <label className="flex items-center justify-center gap-2 px-3 py-2 bg-white/5 border border-dashed border-white/20 hover:border-[#A67C52] rounded-lg text-zinc-300 text-xs cursor-pointer">
                          <Upload size={12} className="text-[#A67C52]" />
                          <span>{ms.imagePath ? 'Change Milestone Photo' : 'Upload Milestone Photo'}</span>
                          <input type="file" accept="image/*" onChange={(e) => handleMilestoneUpload(idx, e)} className="hidden" />
                        </label>
                      </div>

                      {ms.imagePath && (
                        <div className="sm:col-span-3 pt-1">
                          <FocalPointPicker
                            value={ms.imagePosition || '50% 50%'}
                            onChange={(newPos) => {
                              setStoryMilestones(prev => {
                                const updated = [...prev]
                                updated[idx] = { ...updated[idx], imagePosition: newPos }
                                return updated
                              })
                            }}
                            imageUrl={ms.imagePath}
                            aspectRatio="aspect-[4/3]"
                            targetRatioNumber={1.33}
                            label="Milestone Photo Crop"
                            aspectLabel="4:3 Frame"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            SECTION E: CEREMONIES & PROGRAMS BUILDER
            ======================================================== */}
        {sectionToggles.ceremonies && (
          <div className="p-8 rounded-2xl bg-[#141418] border border-white/5 space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#A67C52]/20 flex items-center justify-center text-[#D4A574]">
                  <Calendar size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Section E: Ceremonies &amp; Programs ({ceremonies.length})</h2>
                  <p className="text-xs text-zinc-400 font-light">Customizable multi-program events tailored to {tradition.label.en}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCeremonies(prev => [
                    ...prev,
                    {
                      id: `ceremony-${Date.now()}`,
                      title: { en: 'Special Event', bn: 'বিশেষ অনুষ্ঠান' },
                      subtitle: { en: 'Celebration of Union', bn: 'শুভ মিলন' },
                      date: { en: '', bn: '' },
                      venue: { en: '', bn: '' },
                      description: { en: '', bn: '' },
                      heroImage: '',
                      heroImagePosition: 'center',
                      accentColor: 'clay',
                      enabled: true,
                      galleryImages: [],
                      beats: []
                    }
                  ])}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#D4A574]/20 hover:bg-[#D4A574]/30 text-[#D4A574] rounded-xl text-xs font-semibold cursor-pointer transition-all"
                >
                  <Plus size={14} />
                  <span>Add Custom Event</span>
                </button>
              </div>
            </div>

            {/* Quick Program Selection Toggles */}
            <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-zinc-300 font-semibold flex items-center gap-2">
                  <span>{weddingType === 'hindu' ? '🪔 সনাতন বৈদিক মাঙ্গলিক পর্বসমূহ' : '🌙 ঐতিহ্যবাহী বিয়ের প্রধান পর্বসমূহ'}</span>
                  <span className="text-[11px] text-zinc-500 font-normal">(Quick Selection Toggles)</span>
                </span>
                <span className="text-[11px] text-zinc-400">Click to toggle inclusion in this wedding site</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5">
                {getProgramTogglePresets(weddingType).map(preset => {
                  const isIncluded = ceremonies.some(c => (c.id === preset.id || c.slug === preset.id) && c.enabled !== false)
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => toggleProgramPreset(preset.id)}
                      className={`px-3 py-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${isIncluded
                          ? 'bg-[#A67C52]/20 border-[#D4A574] text-white shadow-sm'
                          : 'bg-white/[0.02] border-white/10 text-zinc-400 hover:text-white hover:border-white/20'
                        }`}
                    >
                      <span className="text-lg shrink-0">{preset.icon}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold truncate leading-tight text-white">{preset.labelEn}</p>
                        <p className="text-[11px] text-[#D4A574] font-bangla truncate leading-tight">{preset.labelBn}</p>
                      </div>
                      <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 text-[10px] border transition-colors ${isIncluded ? 'bg-[#D4A574] border-[#D4A574] text-black font-bold' : 'border-white/20'
                        }`}>
                        {isIncluded ? '✓' : ''}
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Extra Celebration Presets (e.g. Sangeet, Mehendi, Qawwali) */}
              <div className="pt-2 border-t border-white/5 flex flex-wrap items-center gap-2">
                <span className="text-[11px] text-zinc-400 font-medium">Add Common Celebrations:</span>
                {CUSTOM_EVENT_PRESETS.map(preset => {
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => addPresetCeremony(preset)}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Plus size={11} className="text-[#D4A574]" />
                      <span>{preset.title.en}</span>
                      <span className="font-bangla text-[10px] text-zinc-400">({preset.title.bn})</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
                <span>Chronological Program Sequence ({ceremonies.length} events) — Use ↑ / ↓ to adjust serial:</span>
                <span className="text-[#D4A574] font-mono text-[11px]">Serial governs public website order</span>
              </div>

              {ceremonies.map((c, idx) => {
                const isCollapsed = collapsedCeremonies[c.id || idx]
                const isMandatory = isWeddingAnchorCeremony(c)
                return (
                  <div key={c.id || idx} className={`rounded-2xl border transition-all overflow-hidden ${c.enabled !== false ? 'bg-black/40 border-white/10' : 'bg-black/20 border-white/5 opacity-60'
                    }`}>
                    {/* Header */}
                    <div className="p-4 bg-white/5 flex items-center justify-between cursor-pointer" onClick={() => setCollapsedCeremonies(p => ({ ...p, [c.id || idx]: !p[c.id || idx] }))}>
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 rounded-lg bg-black/60 border border-white/10 text-[#D4A574] font-mono text-xs font-bold shrink-0">
                          #{idx + 1}
                        </span>

                        {isMandatory ? (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold shrink-0"
                            title="The Wedding is the mandatory main event and cannot be removed"
                          >
                            <CheckCircle2 size={13} />
                            <span>Mandatory Event</span>
                          </div>
                        ) : (
                          <input
                            type="checkbox"
                            checked={c.enabled !== false}
                            onChange={(e) => {
                              e.stopPropagation()
                              const checked = e.target.checked
                              setCeremonies(prev => {
                                const updated = [...prev]
                                updated[idx] = { ...updated[idx], enabled: checked }
                                return checked ? sortCeremoniesChronologically(updated, weddingType) : updated
                              })
                            }}
                            className="w-4 h-4 rounded accent-[#D4A574] cursor-pointer shrink-0"
                            title={c.enabled !== false ? 'Enabled for site' : 'Disabled (Hidden from site)'}
                          />
                        )}
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {c.title?.en || `Ceremony ${idx + 1}`}
                            <span className="ml-2 text-xs text-zinc-400 font-bangla">{c.title?.bn}</span>
                          </p>
                          <p className="text-[10px] text-zinc-500">{c.venue?.en || 'Venue not specified'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Serial Ordering: Move Up and Move Down */}
                        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/10" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              moveCeremony(idx, 'up')
                            }}
                            disabled={idx === 0}
                            title="Move Earlier in Chronological Order"
                            className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-zinc-400 cursor-pointer transition-all"
                          >
                            <ArrowUp size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              moveCeremony(idx, 'down')
                            }}
                            disabled={idx === ceremonies.length - 1}
                            title="Move Later in Chronological Order"
                            className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-zinc-400 cursor-pointer transition-all"
                          >
                            <ArrowDown size={14} />
                          </button>
                        </div>

                        {!isMandatory && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              if (confirm('Delete this ceremony?')) {
                                setCeremonies(prev => prev.filter((_, i) => i !== idx))
                              }
                            }}
                            className="text-zinc-500 hover:text-rose-400 p-1.5 cursor-pointer"
                            title="Delete ceremony"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                        {isCollapsed ? <ChevronDown size={18} className="text-zinc-400" /> : <ChevronUp size={18} className="text-zinc-400" />}
                      </div>
                    </div>

                    {/* Body */}
                    {!isCollapsed && (
                      <div className="p-6 space-y-4 border-t border-white/5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-[11px] uppercase tracking-wider text-zinc-400 block mb-1">Title (English)</label>
                            <input
                              type="text"
                              value={c.title?.en || ''}
                              onChange={(e) => {
                                const val = e.target.value
                                setCeremonies(prev => {
                                  const updated = [...prev]
                                  updated[idx] = { ...updated[idx], title: { ...updated[idx].title, en: val } }
                                  return updated
                                })
                              }}
                              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] uppercase tracking-wider text-zinc-400 block mb-1">Title (Bangla)</label>
                            <input
                              type="text"
                              value={c.title?.bn || ''}
                              onChange={(e) => {
                                const val = e.target.value
                                setCeremonies(prev => {
                                  const updated = [...prev]
                                  updated[idx] = { ...updated[idx], title: { ...updated[idx].title, bn: val } }
                                  return updated
                                })
                              }}
                              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-bangla text-xs"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] uppercase tracking-wider text-zinc-400 block mb-1">Subtitle (English)</label>
                            <input
                              type="text"
                              value={c.subtitle?.en || ''}
                              onChange={(e) => {
                                const val = e.target.value
                                setCeremonies(prev => {
                                  const updated = [...prev]
                                  updated[idx] = { ...updated[idx], subtitle: { ...updated[idx].subtitle, en: val } }
                                  return updated
                                })
                              }}
                              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] uppercase tracking-wider text-zinc-400 block mb-1">Subtitle (Bangla)</label>
                            <input
                              type="text"
                              value={c.subtitle?.bn || ''}
                              onChange={(e) => {
                                const val = e.target.value
                                setCeremonies(prev => {
                                  const updated = [...prev]
                                  updated[idx] = { ...updated[idx], subtitle: { ...updated[idx].subtitle, bn: val } }
                                  return updated
                                })
                              }}
                              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-bangla text-xs"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] uppercase tracking-wider text-zinc-400 block mb-1">Venue &amp; Location (English)</label>
                            <input
                              type="text"
                              value={c.venue?.en || ''}
                              onChange={(e) => {
                                const val = e.target.value
                                setCeremonies(prev => {
                                  const updated = [...prev]
                                  updated[idx] = { ...updated[idx], venue: { ...updated[idx].venue, en: val } }
                                  return updated
                                })
                              }}
                              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] uppercase tracking-wider text-zinc-400 block mb-1">Venue &amp; Location (Bangla)</label>
                            <input
                              type="text"
                              value={c.venue?.bn || ''}
                              onChange={(e) => {
                                const val = e.target.value
                                setCeremonies(prev => {
                                  const updated = [...prev]
                                  updated[idx] = { ...updated[idx], venue: { ...updated[idx].venue, bn: val } }
                                  return updated
                                })
                              }}
                              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-bangla text-xs"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="text-[11px] uppercase tracking-wider text-zinc-400 block mb-1">Description (English)</label>
                            <textarea
                              rows={2}
                              value={c.description?.en || ''}
                              onChange={(e) => {
                                const val = e.target.value
                                setCeremonies(prev => {
                                  const updated = [...prev]
                                  updated[idx] = { ...updated[idx], description: { ...updated[idx].description, en: val } }
                                  return updated
                                })
                              }}
                              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="text-[11px] uppercase tracking-wider text-zinc-400 block mb-1">Description (Bangla)</label>
                            <textarea
                              rows={2}
                              value={c.description?.bn || ''}
                              onChange={(e) => {
                                const val = e.target.value
                                setCeremonies(prev => {
                                  const updated = [...prev]
                                  updated[idx] = { ...updated[idx], description: { ...updated[idx].description, bn: val } }
                                  return updated
                                })
                              }}
                              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-bangla text-xs"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="text-[11px] uppercase tracking-wider text-zinc-400 block mb-1">Ceremony Hero Banner Photo</label>
                            <label className="flex items-center justify-center gap-2 px-3 py-3 bg-white/5 border border-dashed border-white/20 hover:border-[#A67C52] rounded-lg text-zinc-300 text-xs cursor-pointer transition-colors">
                              <Upload size={14} className="text-[#A67C52]" />
                              <span>{c.heroImage ? 'Change Ceremony Banner...' : 'Upload Ceremony Banner...'}</span>
                              <input type="file" accept="image/*" onChange={(e) => handleCeremonyBannerUpload(idx, e)} className="hidden" />
                            </label>
                          </div>

                          {c.heroImage && (
                            <div className="sm:col-span-2 pt-2">
                              <FocalPointPicker
                                value={c.heroImagePosition || '50% 50%'}
                                onChange={(newPos) => {
                                  setCeremonies(prev => {
                                    const updated = [...prev]
                                    updated[idx] = { ...updated[idx], heroImagePosition: newPos }
                                    return updated
                                  })
                                }}
                                imageUrl={c.heroImage}
                                aspectRatio="aspect-[16/9]"
                                targetRatioNumber={1.77}
                                label={`${c.title?.en || 'Ceremony'} Banner Preview`}
                                aspectLabel="16:9 Banner Frame"
                              />
                            </div>
                          )}

                          {/* Program Carousel Photos (Up to 5 images with crop) */}
                          <div className="sm:col-span-2 pt-4 border-t border-white/5">
                            <CeremonyCarouselPicker
                              images={c.carouselImages || c.galleryImages || []}
                              onChange={(newImages) => {
                                setCeremonies(prev => {
                                  const updated = [...prev]
                                  updated[idx] = {
                                    ...updated[idx],
                                    carouselImages: newImages,
                                    galleryImages: newImages.map(img => img.url || img)
                                  }
                                  return updated
                                })
                              }}
                              onUpload={async (file) => {
                                const uploadFormData = new FormData()
                                uploadFormData.append('file', file)
                                uploadFormData.append('siteId', site?.slug || id)
                                uploadFormData.append('category', `ceremony-${idx}-carousel`)
                                const res = await fetch('/api/upload', { method: 'POST', body: uploadFormData })
                                const data = await res.json()
                                if (!data.publicUrl) throw new Error(data.error || 'Upload failed')
                                return data.publicUrl
                              }}
                              label={`${c.title?.en || 'Ceremony'} Moments Carousel (Up to 5)`}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ========================================================
            SECTION F: SPIRITUAL BLESSINGS & PARENT BLESSINGS
            ======================================================== */}
        {sectionToggles.blessings && (
          <div className="p-8 rounded-2xl bg-[#141418] border border-white/5 space-y-6">
            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
              <div className="w-8 h-8 rounded-lg bg-[#A67C52]/20 flex items-center justify-center text-[#D4A574]">
                <Sparkle size={18} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Section F: Spiritual Blessings &amp; Parent Blessings</h2>
                <p className="text-xs text-zinc-400 font-light">Sacred scriptures (Quranic verse or Vedic Shloka) and blessings from elders</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="sm:col-span-2">
                <label className="text-xs uppercase tracking-wider text-zinc-400 block mb-2 font-medium">
                  {weddingType === 'hindu' ? 'Vedic Sanskrit Shloka (সংস্কৃত শ্লোক)' : 'Arabic Quranic Verse (القرآن الكريم)'}
                </label>
                <textarea
                  rows={2}
                  value={formData.blessingText}
                  onChange={(e) => setFormData(p => ({ ...p, blessingText: e.target.value }))}
                  className={`w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#D4A574] ${weddingType === 'muslim' ? 'font-arabic direction-rtl text-right' : 'font-serif'
                    }`}
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-zinc-400 block mb-2 font-medium">
                  English Translation
                </label>
                <textarea
                  rows={2}
                  value={formData.blessingEn}
                  onChange={(e) => setFormData(p => ({ ...p, blessingEn: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-[#D4A574]"
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-zinc-400 block mb-2 font-medium">
                  Bangla Translation (বাংলা অর্থ)
                </label>
                <textarea
                  rows={2}
                  value={formData.blessingBn}
                  onChange={(e) => setFormData(p => ({ ...p, blessingBn: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white font-bangla text-xs focus:outline-none focus:border-[#D4A574]"
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-zinc-400 block mb-2 font-medium">
                  Reference (সূরা / গ্রন্থ)
                </label>
                <input
                  type="text"
                  value={formData.blessingRef}
                  onChange={(e) => setFormData(p => ({ ...p, blessingRef: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-[#D4A574]"
                />
              </div>

              <div className="sm:col-span-2 pt-4 border-t border-white/5">
                <h3 className="text-sm font-semibold text-white mb-4">Parent Blessings (মুরুব্বিদের আশীর্বাদ)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-zinc-400 block mb-1">Title (English)</label>
                    <input
                      type="text"
                      value={formData.parentTitleEn}
                      onChange={(e) => setFormData(p => ({ ...p, parentTitleEn: e.target.value }))}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-zinc-400 block mb-1">Title (Bangla)</label>
                    <input
                      type="text"
                      value={formData.parentTitleBn}
                      onChange={(e) => setFormData(p => ({ ...p, parentTitleBn: e.target.value }))}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-bangla text-xs"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[11px] uppercase tracking-wider text-zinc-400 block mb-1">Message (Bangla)</label>
                    <textarea
                      rows={2}
                      value={formData.parentMessageBn}
                      onChange={(e) => setFormData(p => ({ ...p, parentMessageBn: e.target.value }))}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-bangla text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            SECTION MONOGRAM / EMBLEM
            ======================================================== */}
        {sectionToggles.monogram && (
          <div className="p-8 rounded-2xl bg-[#141418] border border-white/5 space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#A67C52]/20 flex items-center justify-center text-[#D4A574]">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Wedding Monogram &amp; Emblem</h2>
                  <p className="text-xs text-zinc-400 font-light">Custom gold ornamental circular crest with couple names and sacred blessing</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGenerateMonogram}
                disabled={generatingMonogram}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#A67C52]/20 hover:bg-[#A67C52]/30 text-[#D4A574] border border-[#A67C52]/40 rounded-xl text-xs font-medium cursor-pointer transition-all disabled:opacity-50"
              >
                <Sparkles size={14} className={generatingMonogram ? 'animate-spin' : ''} />
                <span>{generatingMonogram ? 'Generating emblem...' : 'Regenerate Monogram'}</span>
              </button>
            </div>

            {monogramStatus && (
              <p className="text-xs text-[#D4A574]">{monogramStatus}</p>
            )}

            <div className="flex items-center gap-6">
              <div className="w-32 h-32 rounded-2xl border border-white/10 bg-black/60 p-2 flex items-center justify-center overflow-hidden">
                {monogramUrl ? (
                  <img src={monogramUrl} alt="Wedding Monogram" className="w-full h-full object-contain" />
                ) : (
                  <span className="text-[10px] text-zinc-500 text-center">No monogram generated</span>
                )}
              </div>
              <div className="text-xs text-zinc-400 space-y-1">
                <p className="font-semibold text-white">Dynamic Ornamental Frame</p>
                <p>Auto-composed using couple names, tradition frame, and wedding venue.</p>
                <p className="text-[11px] text-zinc-500">Displayed in the Logo Reveal hero section of your celebration page.</p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            SECTION G: GALLERY & ACTIVE COLOR PALETTE
            ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Gallery List */}
          <div className="lg:col-span-2 space-y-6">
            {sectionToggles.gallery && (
              <div className="p-8 rounded-2xl bg-[#141418] border border-white/5 space-y-6">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div className="flex items-center gap-2.5">
                    <FileImage size={18} className="text-[#D4A574]" />
                    <h2 className="text-lg font-semibold text-white">
                      Gallery Photographs ({gallery.length})
                    </h2>
                  </div>

                  <label className="inline-flex items-center gap-2 px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-white/10 rounded-xl text-xs font-medium cursor-pointer transition-colors">
                    <Upload size={14} className="text-[#A67C52]" />
                    <span>Upload Batch Photos...</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleBatchGalleryUpload}
                      disabled={batchUploading}
                      className="hidden"
                    />
                  </label>
                </div>

                {batchUploading && (
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#A67C52]/10 border border-[#A67C52]/30 text-xs text-[#D4A574]">
                    <Loader2 size={15} className="animate-spin shrink-0" />
                    <span>{batchProgress}</span>
                  </div>
                )}

                {gallery.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[360px] overflow-y-auto pr-1">
                    {gallery.map((img, idx) => {
                      const displayName = img.name || img.alt || img.filename?.split('/').pop() || `Photo ${idx + 1}`
                      const src = img.filename?.startsWith('http') ? img.filename : `/images/${img.filename}`

                      return (
                        <div
                          key={img.id || idx}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5 text-xs text-zinc-300 group hover:border-[#A67C52]/30 transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            <div className="w-8 h-8 rounded-lg overflow-hidden bg-zinc-800 shrink-0 border border-white/10">
                              <img
                                src={src}
                                alt={displayName}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-medium text-white text-xs" title={displayName}>
                                {displayName}
                              </p>
                              <p className="text-[10px] text-zinc-500">
                                {img.category || 'wedding'}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeGalleryImage(idx)}
                            className="text-zinc-500 hover:text-rose-400 p-1 transition-colors cursor-pointer"
                            title="Remove photo"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500 py-4 text-center">
                    No gallery photos added yet. Click &quot;Upload Batch Photos&quot; to add pictures.
                  </p>
                )}
              </div>
            )}

            {/* Color Palette Selector */}
            <div className="p-8 rounded-2xl bg-[#141418] border border-white/5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h2 className="text-lg font-semibold text-white">Active Color Palette</h2>
                {extractingPalette && (
                  <span className="text-[11px] text-[#D4A574] flex items-center gap-1.5">
                    <Loader2 size={12} className="animate-spin" />
                    Analyzing colors...
                  </span>
                )}
              </div>

              {paletteStatus && (
                <div className={`p-3 rounded-xl border text-xs leading-relaxed flex items-start gap-2.5 ${paletteStatus.startsWith('✨')
                    ? 'bg-purple-500/10 border-purple-500/30 text-purple-200'
                    : 'bg-[#A67C52]/10 border-[#A67C52]/30 text-[#D4A574]'
                  }`}>
                  <Sparkles size={15} className="shrink-0 mt-0.5 text-purple-400" />
                  <span>{paletteStatus}</span>
                </div>
              )}

              <div className="space-y-3">
                {availablePalettes.map((pal, idx) => {
                  const isSelected = selectedPaletteIndex === idx
                  return (
                    <div
                      key={pal.id || idx}
                      onClick={() => setSelectedPaletteIndex(idx)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${isSelected
                          ? 'bg-[#A67C52]/10 border-[#A67C52] ring-1 ring-[#A67C52]'
                          : 'bg-black/30 border-white/5 hover:border-white/20'
                        }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {isSelected ? (
                            <div className="w-4 h-4 rounded-full bg-[#A67C52] text-white flex items-center justify-center">
                              <Check size={10} />
                            </div>
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-white/20" />
                          )}
                          <span className="text-sm font-medium text-white">{pal.name}</span>
                          {pal.id === 'ai-generated' && (
                            <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-semibold border border-purple-500/30">
                              Gemini AI ✨
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-2">
                        <div className="w-6 h-6 rounded-md border border-white/10" style={{ backgroundColor: pal.bone }} title="Bone" />
                        <div className="w-6 h-6 rounded-md border border-white/10" style={{ backgroundColor: pal.graphite }} title="Graphite" />
                        <div className="w-6 h-6 rounded-md border border-white/10" style={{ backgroundColor: pal.warmGrey }} title="Neutral" />
                        <div className="w-6 h-6 rounded-md border border-white/10" style={{ backgroundColor: pal.accent }} title="Accent" />
                        <div className="w-6 h-6 rounded-md border border-white/10" style={{ backgroundColor: pal.deepAccent }} title="Deep Accent" />
                        <div className="w-6 h-6 rounded-md border border-white/10" style={{ backgroundColor: pal.warmAccent }} title="Warm Accent" />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Right Col: Message Moderation */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-[#141418] border border-white/5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h2 className="text-base font-semibold text-white">
                  Guest Messages ({messages.length})
                </h2>
              </div>

              {messages.length === 0 ? (
                <p className="text-xs text-zinc-500 py-6 text-center">
                  No guest messages left yet.
                </p>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className="p-4 bg-black/40 border border-white/5 rounded-xl space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white">{msg.name || msg.name_bn}</span>
                        <span
                          className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-medium ${msg.approved
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-amber-500/20 text-amber-300'
                            }`}
                        >
                          {msg.approved ? 'Approved' : 'Pending'}
                        </span>
                      </div>

                      <p className="text-zinc-300 leading-relaxed italic">
                        &ldquo;{msg.message || msg.message_bn}&rdquo;
                      </p>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                        <button
                          type="button"
                          onClick={() => handleMessageToggle(msg.id, msg.approved)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${msg.approved
                              ? 'text-amber-400 hover:bg-amber-500/10'
                              : 'text-emerald-400 hover:bg-emerald-500/10'
                            }`}
                          title={msg.approved ? 'Hide message' : 'Approve message'}
                        >
                          {msg.approved ? <XCircle size={15} /> : <CheckCircle size={15} />}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleMessageDelete(msg.id)}
                          className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                          title="Delete message"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================
            SECTION H: CLIENT CONTACT & SAVE
            ======================================================== */}
        <div className="p-8 rounded-2xl bg-[#141418] border border-white/5 space-y-6">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <div className="w-8 h-8 rounded-lg bg-[#A67C52]/20 flex items-center justify-center text-[#D4A574]">
              <User size={18} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Section H: Client Contact &amp; Owner Credentials</h2>
              <p className="text-xs text-zinc-400 font-light">Client coordinator credentials and communication details</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="text-xs uppercase tracking-wider text-zinc-400 block mb-2 font-medium">
                Coordinator / Contact Name
              </label>
              <input
                type="text"
                value={formData.ownerName}
                onChange={(e) => setFormData(p => ({ ...p, ownerName: e.target.value }))}
                placeholder="Contact Name"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4A574]"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-zinc-400 block mb-2 font-medium">
                Client Email
              </label>
              <input
                type="email"
                value={formData.ownerEmail}
                onChange={(e) => setFormData(p => ({ ...p, ownerEmail: e.target.value }))}
                placeholder="info@amarbiye.com"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4A574]"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-zinc-400 block mb-2 font-medium">
                Client WhatsApp
              </label>
              <input
                type="text"
                value={formData.ownerPhone}
                onChange={(e) => setFormData(p => ({ ...p, ownerPhone: e.target.value }))}
                placeholder="01700-000000"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4A574]"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-zinc-500">
              Saving updates the database instantly across all dynamic routes and public invitation URLs.
            </p>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#A67C52] to-[#8C643E] hover:from-[#B88B5E] hover:to-[#9C7046] disabled:opacity-50 text-white text-xs uppercase tracking-widest font-semibold rounded-xl shadow-xl shadow-[#A67C52]/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Saving Updates...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Save All Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
