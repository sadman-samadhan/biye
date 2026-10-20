'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
  Sparkles,
  Upload,
  Check,
  Palette,
  Calendar,
  User,
  Heart,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Loader2,
  Image as ImageIcon,
  CheckCircle2,
  X,
  FileImage,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Eye,
  Video,
  MapPin,
  Clock,
  BookOpen,
  MessageSquare,
  Sparkle,
  Sliders,
  Camera,
  Layers,
  HeartHandshake
} from 'lucide-react'
import FocalPointPicker from '@/components/admin/FocalPointPicker'
import CeremonyCarouselPicker from '@/components/admin/CeremonyCarouselPicker'

export default function NewSiteIntakePage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [extractingPalette, setExtractingPalette] = useState(false)
  const [paletteStatus, setPaletteStatus] = useState(null)
  const [heroBase64, setHeroBase64] = useState(null)

  // 1. Tradition & Identity State
  const [traditionId, setTraditionId] = useState('muslim')
  const tradition = getTradition(traditionId)

  // Section Selector Panel: Controls what's included in this site
  const [sectionToggles, setSectionToggles] = useState({
    hero: true,        // always true
    spotlight: true,
    story: true,
    ceremonies: true,   // always true
    gallery: true,
    blessings: true,
    messages: true,
    monogram: true,
    palette: true
  })

  // Form State
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
    mediaType: 'photo', // 'photo' | 'video'
    heroImageUrl: '',
    heroImagePosition: 'center',
    heroVideoUrl: '',
    // Spotlight / Bride Reveal
    spotlightTitleEn: 'Our Families Said Yes',
    spotlightTitleBn: 'পরিবারের সম্মতিতে এক হলো দুটি মন',
    spotlightDescEn: 'In that moment, two paths became one. A journey that began with uncertainty now walks forward with purpose, blessed by elders and bound by love.',
    spotlightDescBn: 'সেই মাহেন্দ্রক্ষণে দুটি পথ এক হয়ে মিশে গেল। অনিশ্চয়তা পেরিয়ে ভালোবাসার শক্তিতে আর গুরুজনদের আশীর্বাদে শুরু হলো এক নতুন জীবনের অনন্ত পথচলা।',
    spotlightImageUrl: '',
    spotlightImagePosition: 'center',
    // Blessings & Scriptures
    blessingText: tradition.defaultBlessing.ar,
    blessingEn: tradition.defaultBlessing.en,
    blessingBn: tradition.defaultBlessing.bn,
    blessingRef: tradition.defaultBlessing.reference,
    // Parent Blessings
    parentTitleEn: tradition.parentBlessings.title.en,
    parentTitleBn: tradition.parentBlessings.title.bn,
    parentMessageEn: tradition.parentBlessings.message.en,
    parentMessageBn: tradition.parentBlessings.message.bn,
    parentAttrEn: tradition.parentBlessings.attribution.en,
    parentAttrBn: tradition.parentBlessings.attribution.bn
  })

  // Dynamic Ceremonies List (pre-populated and canonically sorted from tradition)
  const [ceremonies, setCeremonies] = useState(() => sortCeremoniesChronologically(tradition.ceremonies, 'muslim'))

  // Expanded Ceremony Cards in UI
  const [expandedCeremonies, setExpandedCeremonies] = useState({ 0: true })

  // Story Milestones
  const [milestones, setMilestones] = useState([])

  // Batch Gallery
  const [galleryImages, setGalleryImages] = useState([])
  const [batchUploading, setBatchUploading] = useState(false)
  const [batchProgress, setBatchProgress] = useState('')

  // Palettes
  const [paletteOptions, setPaletteOptions] = useState(PRESET_PALETTES)
  const [selectedPaletteIndex, setSelectedPaletteIndex] = useState(0)

  // Monogram Preview
  const [monogramUrl, setMonogramUrl] = useState('')
  const [generatingMonogram, setGeneratingMonogram] = useState(false)

  // Hero Upload State
  const [heroUploadState, setHeroUploadState] = useState({
    fileName: '',
    previewUrl: '',
    uploading: false,
    uploaded: false,
    error: null
  })

  // Mount
  useEffect(() => {
    setMounted(true)
  }, [])

  // Auto-slug generator
  function slugify(text) {
    return text
      .toLowerCase()
      .trim()
      .replace(/&/g, 'and')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleNamesChange = (e) => {
    const val = e.target.value
    setFormData(prev => ({
      ...prev,
      coupleNamesEn: val,
      slug: prev.slug === '' || prev.slug === slugify(prev.coupleNamesEn)
        ? slugify(val)
        : prev.slug
    }))
  }

  // Tradition Switching Handler
  const handleTraditionChange = (newTraditionId) => {
    setTraditionId(newTraditionId)
    const newTradition = getTradition(newTraditionId)
    
    // Update blessing defaults
    const scriptural = newTradition.id === 'hindu'
      ? newTradition.defaultBlessing.sa
      : newTradition.defaultBlessing.ar

    setFormData(prev => ({
      ...prev,
      blessingText: scriptural,
      blessingEn: newTradition.defaultBlessing.en,
      blessingBn: newTradition.defaultBlessing.bn,
      blessingRef: newTradition.defaultBlessing.reference,
      parentTitleEn: newTradition.parentBlessings.title.en,
      parentTitleBn: newTradition.parentBlessings.title.bn,
      parentMessageEn: newTradition.parentBlessings.message.en,
      parentMessageBn: newTradition.parentBlessings.message.bn,
      parentAttrEn: newTradition.parentBlessings.attribution.en,
      parentAttrBn: newTradition.parentBlessings.attribution.bn,
    }))

    // Reset ceremonies to tradition presets with canonical chronological sorting
    setCeremonies(sortCeremoniesChronologically(newTradition.ceremonies, newTraditionId))
  }

  // Toggle Section Visibility
  const toggleSection = (key) => {
    if (key === 'hero' || key === 'ceremonies') return // always required
    setSectionToggles(prev => ({ ...prev, [key]: !prev[key] }))
  }

  // Hero Photo Upload
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

    const reader = new FileReader()
    reader.onload = () => {
      const b64 = reader.result
      setHeroBase64(b64)
      extractPaletteFromImage(null, b64)
    }
    reader.readAsDataURL(file)

    const uploadFormData = new FormData()
    uploadFormData.append('file', file)
    uploadFormData.append('siteId', formData.slug || 'temp')
    uploadFormData.append('category', 'hero')

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData
      })
      const data = await res.json()
      if (data.publicUrl) {
        setFormData(prev => ({ ...prev, heroImageUrl: data.publicUrl }))
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
        error: err.message || 'Upload failed. Please check credentials.'
      }))
    }
  }

  // Hero Video Upload
  const handleHeroVideoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const localPreview = URL.createObjectURL(file)
    setFormData(prev => ({ ...prev, heroVideoUrl: localPreview }))

    const uploadFormData = new FormData()
    uploadFormData.append('file', file)
    uploadFormData.append('siteId', formData.slug || 'temp')
    uploadFormData.append('category', 'video')

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

  // Generic Image Uploader helper
  const handleGenericUpload = async (file, folder = 'general') => {
    const uploadFormData = new FormData()
    uploadFormData.append('file', file)
    uploadFormData.append('siteId', formData.slug || 'temp')
    uploadFormData.append('category', folder)

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: uploadFormData
    })
    const data = await res.json()
    if (!data.publicUrl) throw new Error(data.error || 'Upload failed')
    return data.publicUrl
  }

  // Palette extraction
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
        setPaletteOptions(data.palettes)
        setSelectedPaletteIndex(0)
        if (data.isAiGenerated && data.aiPalette) {
          setPaletteStatus(`✨ Custom Palette: "${data.aiPalette.name}"`)
        }
      }
    } catch (err) {
      console.error('Palette extraction failed:', err)
      setPaletteStatus('Palette extraction could not complete.')
    } finally {
      setExtractingPalette(false)
    }
  }

  // Milestone management
  const addMilestone = () => {
    setMilestones(prev => [
      ...prev,
      {
        year: '',
        title: { en: '', bn: '' },
        story: { en: '', bn: '' },
        imagePath: '',
        imagePosition: 'center'
      }
    ])
  }

  const updateMilestone = (index, field, value) => {
    setMilestones(prev => {
      const updated = [...prev]
      if (field.includes('.')) {
        const [parent, child] = field.split('.')
        updated[index] = {
          ...updated[index],
          [parent]: { ...updated[index][parent], [child]: value }
        }
      } else {
        updated[index] = { ...updated[index], [field]: value }
      }
      return updated
    })
  }

  const removeMilestone = (index) => {
    setMilestones(prev => prev.filter((_, i) => i !== index))
  }

  // Ceremony management
  const toggleCeremonyEnabled = (index) => {
    setCeremonies(prev => {
      const updated = [...prev]
      const willEnable = !updated[index].enabled
      updated[index] = { ...updated[index], enabled: willEnable }
      return willEnable ? sortCeremoniesChronologically(updated, traditionId) : updated
    })
  }

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
    setExpandedCeremonies(prev => {
      const updated = { ...prev }
      const curr = prev[index]
      const target = prev[targetIndex]
      updated[index] = target
      updated[targetIndex] = curr
      return updated
    })
  }

  const toggleProgramPreset = (presetId) => {
    const existingIndex = ceremonies.findIndex(c => c.id === presetId || c.slug === presetId)
    if (existingIndex >= 0) {
      toggleCeremonyEnabled(existingIndex)
    } else {
      const traditionCeremony = tradition.ceremonies?.find(c => c.id === presetId || c.slug === presetId)
      const customCeremony = CUSTOM_EVENT_PRESETS.find(c => c.id === presetId || c.slug === presetId)
      const ceremonyToAdd = traditionCeremony || customCeremony
      if (ceremonyToAdd) {
        setCeremonies(prev => {
          const updated = [...prev, { ...ceremonyToAdd, enabled: true }]
          return sortCeremoniesChronologically(updated, traditionId)
        })
        setExpandedCeremonies(prev => ({ ...prev, [ceremonies.length]: true }))
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
      return sortCeremoniesChronologically(updated, traditionId)
    })
    setExpandedCeremonies(prev => ({ ...prev, [ceremonies.length]: true }))
  }

  const updateCeremonyField = (index, field, value) => {
    setCeremonies(prev => {
      const updated = [...prev]
      if (field.includes('.')) {
        const [parent, child] = field.split('.')
        updated[index] = {
          ...updated[index],
          [parent]: { ...updated[index][parent], [child]: value }
        }
      } else {
        updated[index] = { ...updated[index], [field]: value }
      }
      return updated
    })
  }

  const addCustomCeremony = () => {
    const newId = `ceremony-${Date.now()}`
    setCeremonies(prev => [
      ...prev,
      {
        id: newId,
        slug: newId,
        title: { en: 'Special Ceremony', bn: 'বিশেষ অনুষ্ঠান' },
        subtitle: { en: 'Celebration of Love', bn: 'শুভ মিলন' },
        description: { en: '', bn: '' },
        culturalNote: { en: '', bn: '' },
        accentColor: 'clay',
        enabled: true,
        date: { en: '', bn: '' },
        venue: { en: '', bn: '' },
        heroImage: '',
        heroImagePosition: 'center',
        galleryImages: [],
        beats: []
      }
    ])
    setExpandedCeremonies(prev => ({ ...prev, [ceremonies.length]: true }))
  }

  const removeCeremony = (index) => {
    setCeremonies(prev => prev.filter((_, i) => i !== index))
  }

  // Flow beats for ceremony
  const addBeatToCeremony = (ceremonyIndex) => {
    setCeremonies(prev => {
      const updated = [...prev]
      const currentBeats = updated[ceremonyIndex].beats || []
      updated[ceremonyIndex] = {
        ...updated[ceremonyIndex],
        beats: [
          ...currentBeats,
          {
            label: 'The Moment',
            title: { en: '', bn: '' },
            description: { en: '', bn: '' },
            images: []
          }
        ]
      }
      return updated
    })
  }

  const updateBeatField = (ceremonyIndex, beatIndex, field, value) => {
    setCeremonies(prev => {
      const updated = [...prev]
      const beats = [...(updated[ceremonyIndex].beats || [])]
      if (field.includes('.')) {
        const [parent, child] = field.split('.')
        beats[beatIndex] = {
          ...beats[beatIndex],
          [parent]: { ...beats[beatIndex][parent], [child]: value }
        }
      } else {
        beats[beatIndex] = { ...beats[beatIndex], [field]: value }
      }
      updated[ceremonyIndex] = { ...updated[ceremonyIndex], beats }
      return updated
    })
  }

  const removeBeatFromCeremony = (ceremonyIndex, beatIndex) => {
    setCeremonies(prev => {
      const updated = [...prev]
      updated[ceremonyIndex] = {
        ...updated[ceremonyIndex],
        beats: updated[ceremonyIndex].beats.filter((_, i) => i !== beatIndex)
      }
      return updated
    })
  }

  // Batch Gallery Upload
  const handleBatchGalleryUpload = async (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setBatchUploading(true)
    setBatchProgress(`Uploading 0 / ${files.length}...`)

    const newItems = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      setBatchProgress(`Uploading photo ${i + 1} of ${files.length}...`)

      try {
        const publicUrl = await handleGenericUpload(file, 'gallery')
        newItems.push({
          id: `batch-${Date.now()}-${i}`,
          name: file.name,
          publicUrl,
          sizeKb: Math.round(file.size / 1024)
        })
      } catch (err) {
        console.error(`Failed to upload ${file.name}:`, err)
      }
    }

    setGalleryImages(prev => [...prev, ...newItems])
    setBatchUploading(false)
    setBatchProgress('')
  }

  // Live Monogram Preview
  const handleGenerateMonogramPreview = async () => {
    setGeneratingMonogram(true)
    try {
      const names = formData.coupleNamesEn.includes('&')
        ? formData.coupleNamesEn.split('&').map(s => s.trim())
        : [formData.coupleNamesEn || 'Bride', 'Groom']

      const res = await fetch('/api/monogram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name1: names[0] || 'Bride',
          name2: names[1] || 'Groom',
          blessingText: formData.blessingEn,
          verseSnippet: formData.blessingRef,
          venue: ceremonies[0]?.venue?.en || '',
          weddingType: traditionId
        })
      })
      const data = await res.json()
      if (data.url || data.dataUri) {
        setMonogramUrl(data.url || data.dataUri)
      }
    } catch (err) {
      console.error('Monogram preview failed:', err)
    } finally {
      setGeneratingMonogram(false)
    }
  }

  // Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const activePalette = paletteOptions[selectedPaletteIndex] || PRESET_PALETTES[0]

    // Assemble payload
    const payload = {
      slug: formData.slug || slugify(formData.coupleNamesEn),
      status: formData.status,
      wedding_type: traditionId,
      template_id: 'classic',
      owner_name: formData.ownerName || formData.coupleNamesEn,
      owner_email: formData.ownerEmail,
      owner_phone: formData.ownerPhone,
      palette: activePalette,
      palette_options: paletteOptions,
      selected_palette_index: selectedPaletteIndex,
      content: {
        wedding_type: traditionId,
        sectionToggles,
        logoUrl: monogramUrl || '',
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
            [traditionId === 'hindu' ? 'sa' : 'ar']: formData.blessingText,
            en: formData.blessingEn,
            bn: formData.blessingBn,
            reference: formData.blessingRef
          },
          mediaType: formData.mediaType,
          videoPath: formData.mediaType === 'video' ? formData.heroVideoUrl : '',
          posterPath: formData.heroImageUrl,
          posterPosition: formData.heroImagePosition
        },
        brideReveal: sectionToggles.spotlight ? {
          title: {
            en: formData.spotlightTitleEn,
            bn: formData.spotlightTitleBn
          },
          description: {
            en: formData.spotlightDescEn,
            bn: formData.spotlightDescBn
          },
          imagePath: formData.spotlightImageUrl || formData.heroImageUrl,
          imagePosition: formData.spotlightImagePosition
        } : null,
        story: sectionToggles.story && milestones.length > 0 ? {
          title: { en: 'Our Journey', bn: 'আমাদের পথচলা' },
          milestones
        } : null,
        footer: {
          thankYou: {
            en: 'Thank you for being part of our journey. Wishing you joy and blessings.',
            bn: 'আমাদের এই আনন্দযাত্রার অংশ হওয়ার জন্য আন্তরিক ধন্যবাদ ও কৃতজ্ঞতা।'
          }
        }
      },
      ceremonies: sectionToggles.ceremonies ? ceremonies.filter(c => c.enabled) : [],
      duas: sectionToggles.blessings ? {
        duas: tradition.defaultDuas,
        parentBlessings: {
          title: { en: formData.parentTitleEn, bn: formData.parentTitleBn },
          message: { en: formData.parentMessageEn, bn: formData.parentMessageBn },
          attribution: { en: formData.parentAttrEn, bn: formData.parentAttrBn }
        }
      } : { duas: [], parentBlessings: {} },
      gallery: sectionToggles.gallery ? galleryImages.map(img => ({
        filename: img.publicUrl,
        category: 'wedding',
        alt: img.name
      })) : []
    }

    try {
      const res = await fetch('/api/admin/sites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()
      if (data.success) {
        const finalSlug = payload.slug
        router.push(`/s/${finalSlug}`)
      } else {
        throw new Error(data.error || 'Failed to create site')
      }
    } catch (err) {
      console.error('Site creation error:', err)
      alert('Error creating site: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0E0E10] text-zinc-300 flex items-center justify-center">
        <Loader2 className="animate-spin text-[#D4A574]" size={36} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-[#F3F2EE] selection:bg-[#A67C52] selection:text-white pb-32">
      {/* Header */}
      <div className="bg-[#121216] border-b border-white/5 py-10 px-6 md:px-12 sticky top-0 z-40 backdrop-blur-md bg-opacity-90">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-[#D4A574] font-medium block mb-1">
              ShubhoBiye Admin
            </span>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-white tracking-tight">
              Create New Wedding Site
            </h1>
            <p className="text-xs md:text-sm text-zinc-400 font-light mt-1">
              Build a beautiful, culturally authentic wedding website for your couple
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push('/admin/sites')}
              className="px-4 py-2 text-xs uppercase tracking-wider text-zinc-400 hover:text-white border border-white/10 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !formData.coupleNamesEn}
              className="px-6 py-2.5 bg-gradient-to-r from-[#A67C52] to-[#8C643E] hover:from-[#B88B5E] hover:to-[#9C7046] disabled:opacity-50 text-white text-xs uppercase tracking-widest font-medium rounded-lg shadow-lg shadow-[#A67C52]/20 flex items-center gap-2 cursor-pointer transition-all"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Creating Site...</span>
                </>
              ) : (
                <>
                  <Check size={15} />
                  <span>Create Wedding Site</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 md:px-12 mt-10 space-y-10">
        
        {/* ========================================================
            SECTION A: TRADITION & COUPLE IDENTITY
            ======================================================== */}
        <div className="p-8 rounded-2xl bg-[#141418] border border-white/5 space-y-6">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <div className="w-8 h-8 rounded-lg bg-[#A67C52]/20 flex items-center justify-center text-[#D4A574]">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Section A: Celebration Tradition & Identity</h2>
              <p className="text-xs text-zinc-400 font-light">Select wedding cultural tradition to load authentic ceremony presets</p>
            </div>
          </div>

          {/* Tradition Toggle */}
          <div>
            <label className="text-xs uppercase tracking-wider text-zinc-400 block mb-3 font-medium">
              Cultural Tradition Preset *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.values(TRADITIONS).map(trad => (
                <button
                  key={trad.id}
                  type="button"
                  onClick={() => handleTraditionChange(trad.id)}
                  className={`p-5 rounded-xl border text-left flex items-start gap-4 transition-all cursor-pointer ${
                    traditionId === trad.id
                      ? 'bg-[#A67C52]/15 border-[#D4A574] text-white ring-1 ring-[#D4A574]'
                      : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10 hover:text-zinc-200'
                  }`}
                >
                  <span className="text-3xl">{trad.icon}</span>
                  <div>
                    <div className="font-semibold text-base text-white">{trad.label.en}</div>
                    <div className="font-bangla text-sm text-[#D4A574] mt-0.5">{trad.label.bn}</div>
                    <p className="text-xs text-zinc-400 mt-2">
                      {trad.id === 'muslim'
                        ? 'Includes Gaye Holud, Mehendi, Akht, Biye, Bou Bhat with Quranic verses'
                        : 'Includes Ashirbad, Aiburo Bhaat, Saat Paak, Bou Bhaat with Vedic Shlokas'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Couple Names */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs uppercase tracking-wider text-zinc-400 block mb-2 font-medium">
                Couple Names (English) *
              </label>
              <input
                type="text"
                required
                value={formData.coupleNamesEn}
                onChange={handleNamesChange}
                placeholder={tradition.placeholderCouple.en}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4A574] transition-colors"
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
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-bangla placeholder-zinc-500 focus:outline-none focus:border-[#D4A574] transition-colors"
              />
            </div>
          </div>

          {/* Slug & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs uppercase tracking-wider text-zinc-400 block mb-2 font-medium">
                Website URL Slug *
              </label>
              <div className="flex items-center bg-white/5 border border-white/10 rounded-xl overflow-hidden focus-within:border-[#D4A574]">
                <span className="px-3 text-xs text-zinc-500 bg-white/5 border-r border-white/5 py-3">
                  shubhobiye.com/s/
                </span>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData(p => ({ ...p, slug: e.target.value }))}
                  className="w-full px-4 py-3 bg-transparent text-white placeholder-zinc-500 focus:outline-none"
                  placeholder="arefin-and-sumaiya"
                />
              </div>
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider text-zinc-400 block mb-2 font-medium">
                Publish Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(p => ({ ...p, status: e.target.value }))}
                className="w-full px-4 py-3 bg-[#18181f] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#D4A574]"
              >
                <option value="live">Live (Publicly Accessible)</option>
                <option value="draft">Draft (Admin Preview Only)</option>
              </select>
            </div>
          </div>
        </div>

        {/* ========================================================
            SECTION A½: SECTION SELECTOR PANEL (TAP TO SELECT)
            ======================================================== */}
        <div className="p-8 rounded-2xl bg-[#141418] border border-white/5 space-y-4">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <div className="w-8 h-8 rounded-lg bg-[#A67C52]/20 flex items-center justify-center text-[#D4A574]">
              <Layers size={18} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Section Selector Panel: What's included in this site?</h2>
              <p className="text-xs text-zinc-400 font-light">Tap to turn sections on or off. Toggled-off sections are kept hidden to declutter your form.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-2">
            {[
              { key: 'hero', label: 'Hero Banner', icon: '🖼️', req: true },
              { key: 'spotlight', label: 'Couple Spotlight', icon: '💑' },
              { key: 'story', label: 'Our Journey', icon: '📖' },
              { key: 'ceremonies', label: 'Ceremonies', icon: '🎊', req: true },
              { key: 'monogram', label: 'Monogram', icon: '💍' },
              { key: 'gallery', label: 'Photo Gallery', icon: '📸' },
              { key: 'blessings', label: 'Blessings & Duas', icon: '🤲' },
              { key: 'messages', label: 'Guest Messages', icon: '💌' },
              { key: 'palette', label: 'Color Theme', icon: '🎨' },
            ].map(sec => {
              const active = sectionToggles[sec.key]
              return (
                <button
                  key={sec.key}
                  type="button"
                  onClick={() => toggleSection(sec.key)}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 cursor-pointer ${
                    active
                      ? 'bg-[#A67C52]/20 border-[#D4A574] text-white ring-1 ring-[#D4A574]/50'
                      : 'bg-white/5 border-white/5 text-zinc-500 hover:bg-white/10 hover:text-zinc-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xl">{sec.icon}</span>
                    {active ? (
                      <span className="w-5 h-5 rounded-full bg-[#D4A574] text-black text-xs flex items-center justify-center font-bold">✓</span>
                    ) : (
                      <span className="w-5 h-5 rounded-full border border-zinc-600 text-zinc-600 text-xs flex items-center justify-center">✕</span>
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-semibold block">{sec.label}</span>
                    {sec.req && <span className="text-[10px] text-[#D4A574]">Required</span>}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* ========================================================
            SECTION B: HERO SECTION (VIDEO / PHOTO + FOCAL POINT)
            ======================================================== */}
        <div className="p-8 rounded-2xl bg-[#141418] border border-white/5 space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#A67C52]/20 flex items-center justify-center text-[#D4A574]">
                <Camera size={18} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Section B: Wedding Photo & Color Theme</h2>
                <p className="text-xs text-zinc-400 font-light">Upload your main wedding photo or looping background video</p>
              </div>
            </div>
            {paletteStatus && (
              <span className="text-xs text-[#D4A574] bg-[#D4A574]/10 px-3 py-1 rounded-full border border-[#D4A574]/30">
                {paletteStatus}
              </span>
            )}
          </div>

          {/* Media Type Toggle */}
          <div className="flex items-center gap-4">
            <label className="text-xs uppercase tracking-wider text-zinc-400 font-medium">
              Hero Media Type:
            </label>
            <div className="inline-flex rounded-lg bg-white/5 p-1 border border-white/10">
              <button
                type="button"
                onClick={() => setFormData(p => ({ ...p, mediaType: 'photo' }))}
                className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
                  formData.mediaType === 'photo' ? 'bg-[#A67C52] text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                High-Definition Photo
              </button>
              <button
                type="button"
                onClick={() => setFormData(p => ({ ...p, mediaType: 'video' }))}
                className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
                  formData.mediaType === 'video' ? 'bg-[#A67C52] text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Looping Video (5–10s)
              </button>
            </div>
          </div>

          {/* Photo Uploader */}
          <div className="space-y-4">
            <label className="text-xs uppercase tracking-wider text-zinc-400 block font-medium">
              Upload Main Wedding Photo
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-6 p-6 border-2 border-dashed border-white/10 rounded-2xl bg-white/[0.02] hover:border-[#D4A574]/40 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleHeroUpload}
                id="hero-file-input"
                className="hidden"
              />
              <label
                htmlFor="hero-file-input"
                className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs uppercase tracking-wider font-medium flex items-center gap-2 cursor-pointer transition-all border border-white/10"
              >
                <Upload size={16} />
                <span>Choose Photo</span>
              </label>

              {heroUploadState.uploading && (
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <Loader2 size={16} className="animate-spin text-[#D4A574]" />
                  <span>Optimizing & uploading your photo...</span>
                </div>
              )}

              {heroUploadState.uploaded && (
                <div className="flex items-center gap-2 text-xs text-emerald-400">
                  <CheckCircle2 size={16} />
                  <span>Photo uploaded successfully!</span>
                </div>
              )}

              {heroUploadState.previewUrl && (
                <div className="flex items-center gap-4 ml-auto">
                  <div className="w-24 h-16 rounded-lg overflow-hidden border border-white/20 relative shadow-md">
                    <img
                      src={heroUploadState.previewUrl}
                      alt="Hero preview"
                      style={{ objectPosition: formData.heroImagePosition }}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Focal Point Alignment & Interactive Live Preview */}
          {heroUploadState.previewUrl && (
            <div className="pt-2">
              <FocalPointPicker
                value={formData.heroImagePosition || '50% 50%'}
                onChange={(newPos) => setFormData(p => ({ ...p, heroImagePosition: newPos }))}
                imageUrl={heroUploadState.previewUrl}
                isVideo={formData.mediaType === 'video'}
                videoUrl={formData.heroVideoUrl}
                fileName={heroUploadState.fileName}
                aspectRatio="aspect-[16/10]"
              />
            </div>
          )}

          {/* Video Uploader if selected */}
          {formData.mediaType === 'video' && (
            <div className="space-y-4 pt-4 border-t border-white/5">
              <label className="text-xs uppercase tracking-wider text-zinc-400 block font-medium">
                Upload Looping Background Video (MP4 / WebM, ≤ 20MB)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept="video/mp4,video/webm"
                  onChange={handleHeroVideoUpload}
                  id="hero-video-input"
                  className="hidden"
                />
                <label
                  htmlFor="hero-video-input"
                  className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs uppercase tracking-wider font-medium flex items-center gap-2 cursor-pointer transition-all border border-white/10"
                >
                  <Video size={16} />
                  <span>Choose Video File</span>
                </label>
                {formData.heroVideoUrl && (
                  <span className="text-xs text-emerald-400">✓ Video ready for background preview</span>
                )}
              </div>
            </div>
          )}

          {/* Wedding Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
            <div>
              <label className="text-xs uppercase tracking-wider text-zinc-400 block mb-2 font-medium">
                Wedding Date (English)
              </label>
              <input
                type="text"
                value={formData.dateEn}
                onChange={(e) => setFormData(p => ({ ...p, dateEn: e.target.value }))}
                placeholder="e.g. 18 December 2024"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4A574]"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-zinc-400 block mb-2 font-medium">
                Wedding Date (Bangla / বাংলা)
              </label>
              <input
                type="text"
                value={formData.dateBn}
                onChange={(e) => setFormData(p => ({ ...p, dateBn: e.target.value }))}
                placeholder="যেমন: ১৮ ডিসেম্বর ২০২৪"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-bangla placeholder-zinc-500 focus:outline-none focus:border-[#D4A574]"
              />
            </div>
          </div>
        </div>

        {/* ========================================================
            SECTION C: COUPLE SPOTLIGHT ("Our Families Said Yes")
            ======================================================== */}
        {sectionToggles.spotlight && (
          <div className="p-8 rounded-2xl bg-[#141418] border border-white/5 space-y-6">
            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
              <div className="w-8 h-8 rounded-lg bg-[#A67C52]/20 flex items-center justify-center text-[#D4A574]">
                <HeartHandshake size={18} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Section C: Couple Spotlight ("Our Families Said Yes")</h2>
                <p className="text-xs text-zinc-400 font-light">Cinematic portrait reveal celebrating the engagement or milestone moment</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs uppercase tracking-wider text-zinc-400 block mb-2 font-medium">
                  Spotlight Title (English)
                </label>
                <input
                  type="text"
                  value={formData.spotlightTitleEn}
                  onChange={(e) => setFormData(p => ({ ...p, spotlightTitleEn: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#D4A574]"
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
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-bangla focus:outline-none focus:border-[#D4A574]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs uppercase tracking-wider text-zinc-400 block mb-2 font-medium">
                  Description (English)
                </label>
                <textarea
                  rows={3}
                  value={formData.spotlightDescEn}
                  onChange={(e) => setFormData(p => ({ ...p, spotlightDescEn: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#D4A574]"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-zinc-400 block mb-2 font-medium">
                  Description (Bangla / বাংলা)
                </label>
                <textarea
                  rows={3}
                  value={formData.spotlightDescBn}
                  onChange={(e) => setFormData(p => ({ ...p, spotlightDescBn: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-bangla focus:outline-none focus:border-[#D4A574]"
                />
              </div>
            </div>

            {/* Spotlight Image upload */}
            <div className="space-y-4">
              <label className="text-xs uppercase tracking-wider text-zinc-400 block font-medium">
                Spotlight Photograph
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    try {
                      const url = await handleGenericUpload(file, 'spotlight')
                      setFormData(p => ({ ...p, spotlightImageUrl: url }))
                    } catch (err) {
                      console.error('Spotlight image upload failed:', err)
                    }
                  }}
                  id="spotlight-photo-input"
                  className="hidden"
                />
                <label
                  htmlFor="spotlight-photo-input"
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs uppercase tracking-wider font-medium flex items-center gap-2 cursor-pointer transition-all border border-white/10"
                >
                  <Upload size={14} />
                  <span>{formData.spotlightImageUrl ? 'Change Spotlight Photo' : 'Upload Dedicated Photo'}</span>
                </label>
                {formData.spotlightImageUrl && (
                  <span className="text-xs text-emerald-400">✓ Dedicated spotlight photo uploaded</span>
                )}
              </div>

              {formData.spotlightImageUrl && (
                <div className="pt-2">
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
                  <p className="text-xs text-zinc-400 font-light">Tell your couple's unique story through memorable years and photographs</p>
                </div>
              </div>
              <button
                type="button"
                onClick={addMilestone}
                className="px-4 py-2 bg-[#D4A574]/20 hover:bg-[#D4A574]/30 text-[#D4A574] text-xs font-semibold rounded-lg flex items-center gap-2 transition-all cursor-pointer"
              >
                <Plus size={15} />
                <span>Add Milestone</span>
              </button>
            </div>

            {milestones.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
                <p className="text-sm text-zinc-400">No story milestones added yet.</p>
                <button
                  type="button"
                  onClick={addMilestone}
                  className="px-4 py-2 bg-[#A67C52] hover:bg-[#B88B5E] text-white text-xs uppercase tracking-wider font-medium rounded-lg inline-flex items-center gap-2"
                >
                  <Plus size={14} />
                  <span>Add First Milestone</span>
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {milestones.map((m, idx) => (
                  <div key={idx} className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                      <span className="text-xs font-semibold text-[#D4A574] uppercase tracking-wider">
                        Milestone #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeMilestone(idx)}
                        className="text-zinc-500 hover:text-rose-400 transition-colors p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="text-xs text-zinc-400 block mb-1">Year</label>
                        <input
                          type="text"
                          value={m.year}
                          onChange={(e) => updateMilestone(idx, 'year', e.target.value)}
                          placeholder="e.g. 2022"
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-zinc-400 block mb-1">Title (English)</label>
                        <input
                          type="text"
                          value={m.title?.en || ''}
                          onChange={(e) => updateMilestone(idx, 'title.en', e.target.value)}
                          placeholder="First Meeting"
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-zinc-400 block mb-1">Title (Bangla)</label>
                        <input
                          type="text"
                          value={m.title?.bn || ''}
                          onChange={(e) => updateMilestone(idx, 'title.bn', e.target.value)}
                          placeholder="প্রথম দেখা"
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-bangla text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-zinc-400 block mb-1">Story (English)</label>
                        <textarea
                          rows={3}
                          value={m.story?.en || ''}
                          onChange={(e) => updateMilestone(idx, 'story.en', e.target.value)}
                          placeholder="Tell this part of the journey..."
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-zinc-400 block mb-1">Story (Bangla)</label>
                        <textarea
                          rows={3}
                          value={m.story?.bn || ''}
                          onChange={(e) => updateMilestone(idx, 'story.bn', e.target.value)}
                          placeholder="স্মৃতিমধুর বর্ণনা লিখুন..."
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-bangla text-sm"
                        />
                      </div>
                    </div>

                    {/* Milestone Image */}
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center gap-4">
                        <input
                          type="file"
                          accept="image/*"
                          id={`milestone-img-${idx}`}
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0]
                            if (!file) return
                            try {
                              const url = await handleGenericUpload(file, 'story')
                              updateMilestone(idx, 'imagePath', url)
                            } catch (err) {
                              console.error('Milestone photo upload failed:', err)
                            }
                          }}
                        />
                        <label
                          htmlFor={`milestone-img-${idx}`}
                          className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-medium flex items-center gap-2 cursor-pointer transition-all"
                        >
                          <Upload size={14} />
                          <span>{m.imagePath ? 'Change Milestone Photo' : 'Upload Milestone Photo'}</span>
                        </label>
                        {m.imagePath && (
                          <span className="text-xs text-emerald-400">✓ Photo attached</span>
                        )}
                      </div>

                      {m.imagePath && (
                        <div className="pt-1">
                          <FocalPointPicker
                            value={m.imagePosition || '50% 50%'}
                            onChange={(newPos) => updateMilestone(idx, 'imagePosition', newPos)}
                            imageUrl={m.imagePath}
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
            SECTION E: CEREMONIES & PROGRAMS (MULTI-PROGRAM BUILDER)
            ======================================================== */}
        {sectionToggles.ceremonies && (
          <div className="p-8 rounded-2xl bg-[#141418] border border-white/5 space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#A67C52]/20 flex items-center justify-center text-[#D4A574]">
                  <Calendar size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Section E: Ceremonies &amp; Programs Builder</h2>
                  <p className="text-xs text-zinc-400 font-light">Customizable multi-program events tailored to {tradition.label.en}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={addCustomCeremony}
                  className="px-3.5 py-2 bg-[#D4A574]/20 hover:bg-[#D4A574]/30 text-[#D4A574] text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
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
                  <span>{traditionId === 'hindu' ? '🪔 সনাতন বৈদিক মাঙ্গলিক পর্বসমূহ' : '🌙 ঐতিহ্যবাহী বিয়ের প্রধান পর্বসমূহ'}</span>
                  <span className="text-[11px] text-zinc-500 font-normal">(Quick Selection Toggles)</span>
                </span>
                <span className="text-[11px] text-zinc-400">Click to toggle inclusion in this wedding site</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5">
                {getProgramTogglePresets(traditionId).map(preset => {
                  const isIncluded = ceremonies.some(c => (c.id === preset.id || c.slug === preset.id) && c.enabled !== false)
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => toggleProgramPreset(preset.id)}
                      className={`px-3 py-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                        isIncluded
                          ? 'bg-[#A67C52]/20 border-[#D4A574] text-white shadow-sm'
                          : 'bg-white/[0.02] border-white/10 text-zinc-400 hover:text-white hover:border-white/20'
                      }`}
                    >
                      <span className="text-lg shrink-0">{preset.icon}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold truncate leading-tight text-white">{preset.labelEn}</p>
                        <p className="text-[11px] text-[#D4A574] font-bangla truncate leading-tight">{preset.labelBn}</p>
                      </div>
                      <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 text-[10px] border transition-colors ${
                        isIncluded ? 'bg-[#D4A574] border-[#D4A574] text-black font-bold' : 'border-white/20'
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

              {ceremonies.map((ceremony, idx) => {
                const isExpanded = Boolean(expandedCeremonies[idx])
                const isMandatory = isWeddingAnchorCeremony(ceremony)
                return (
                  <div
                    key={ceremony.id || idx}
                    className={`rounded-2xl border transition-all ${
                      ceremony.enabled
                        ? 'bg-white/[0.03] border-white/10'
                        : 'bg-black/30 border-white/5 opacity-60'
                    }`}
                  >
                    {/* Ceremony Card Header */}
                    <div className="p-5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 rounded-lg bg-black/60 border border-white/10 text-[#D4A574] font-mono text-xs font-bold shrink-0">
                          #{idx + 1}
                        </span>

                        {isMandatory ? (
                          <div
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold shrink-0"
                            title="The Wedding is the mandatory main event and cannot be removed"
                          >
                            <CheckCircle2 size={13} />
                            <span>Mandatory Event</span>
                          </div>
                        ) : (
                          <input
                            type="checkbox"
                            checked={ceremony.enabled !== false}
                            onChange={() => toggleCeremonyEnabled(idx)}
                            className="w-4 h-4 rounded accent-[#D4A574] cursor-pointer shrink-0"
                            title={ceremony.enabled ? 'Enabled for site' : 'Disabled (Hidden from site)'}
                          />
                        )}

                        <div>
                          <div className="font-semibold text-sm text-white flex items-center gap-2">
                            <span>{ceremony.title?.en}</span>
                            <span className="text-xs text-zinc-500 font-normal">/</span>
                            <span className="font-bangla text-sm text-[#D4A574]">{ceremony.title?.bn}</span>
                          </div>
                          <span className="text-xs text-zinc-400 font-light">
                            {ceremony.subtitle?.en} • {ceremony.subtitle?.bn}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Serial Ordering: Move Up and Move Down */}
                        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/10">
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

                        <button
                          type="button"
                          onClick={() => setExpandedCeremonies(p => ({ ...p, [idx]: !p[idx] }))}
                          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <span>{isExpanded ? 'Collapse' : 'Configure'}</span>
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                        
                        {!isMandatory && (
                          <button
                            type="button"
                            onClick={() => removeCeremony(idx)}
                            className="text-zinc-500 hover:text-rose-400 transition-colors p-1.5 cursor-pointer"
                            title="Delete ceremony"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Ceremony Card Expanded Body */}
                    {isExpanded && (
                      <div className="p-6 pt-0 border-t border-white/5 space-y-6 mt-2">
                        {/* Titles */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-zinc-400 block mb-1">Title (English)</label>
                            <input
                              type="text"
                              value={ceremony.title?.en || ''}
                              onChange={(e) => updateCeremonyField(idx, 'title.en', e.target.value)}
                              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-zinc-400 block mb-1">Title (Bangla)</label>
                            <input
                              type="text"
                              value={ceremony.title?.bn || ''}
                              onChange={(e) => updateCeremonyField(idx, 'title.bn', e.target.value)}
                              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-bangla text-sm"
                            />
                          </div>
                        </div>

                        {/* Subtitles */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-zinc-400 block mb-1">Subtitle (English)</label>
                            <input
                              type="text"
                              value={ceremony.subtitle?.en || ''}
                              onChange={(e) => updateCeremonyField(idx, 'subtitle.en', e.target.value)}
                              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-zinc-400 block mb-1">Subtitle (Bangla)</label>
                            <input
                              type="text"
                              value={ceremony.subtitle?.bn || ''}
                              onChange={(e) => updateCeremonyField(idx, 'subtitle.bn', e.target.value)}
                              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-bangla text-sm"
                            />
                          </div>
                        </div>

                        {/* Date & Venue */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-zinc-400 block mb-1">Date & Time (English)</label>
                            <input
                              type="text"
                              value={ceremony.date?.en || ''}
                              onChange={(e) => updateCeremonyField(idx, 'date.en', e.target.value)}
                              placeholder="e.g. 17 December 2024, 7:00 PM"
                              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-zinc-400 block mb-1">Date & Time (Bangla)</label>
                            <input
                              type="text"
                              value={ceremony.date?.bn || ''}
                              onChange={(e) => updateCeremonyField(idx, 'date.bn', e.target.value)}
                              placeholder="যেমন: ১৭ ডিসেম্বর ২০২৪, সন্ধ্যা ৭টা"
                              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-bangla text-sm"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-zinc-400 block mb-1">Venue & Location (English)</label>
                            <input
                              type="text"
                              value={ceremony.venue?.en || ''}
                              onChange={(e) => updateCeremonyField(idx, 'venue.en', e.target.value)}
                              placeholder="Grand Convention Center, Dhaka"
                              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-zinc-400 block mb-1">Venue & Location (Bangla)</label>
                            <input
                              type="text"
                              value={ceremony.venue?.bn || ''}
                              onChange={(e) => updateCeremonyField(idx, 'venue.bn', e.target.value)}
                              placeholder="গ্র্যান্ড কনভেনশন সেন্টার, ঢাকা"
                              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-bangla text-sm"
                            />
                          </div>
                        </div>

                        {/* Description */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-zinc-400 block mb-1">Description (English)</label>
                            <textarea
                              rows={3}
                              value={ceremony.description?.en || ''}
                              onChange={(e) => updateCeremonyField(idx, 'description.en', e.target.value)}
                              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-zinc-400 block mb-1">Description (Bangla)</label>
                            <textarea
                              rows={3}
                              value={ceremony.description?.bn || ''}
                              onChange={(e) => updateCeremonyField(idx, 'description.bn', e.target.value)}
                              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-bangla text-sm"
                            />
                          </div>
                        </div>

                        {/* Banner Photo Upload */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-4">
                            <input
                              type="file"
                              accept="image/*"
                              id={`ceremony-banner-${idx}`}
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0]
                                if (!file) return
                                try {
                                  const url = await handleGenericUpload(file, `ceremony-${idx}`)
                                  updateCeremonyField(idx, 'heroImage', url)
                                } catch (err) {
                                  console.error('Ceremony banner upload failed:', err)
                                }
                              }}
                            />
                            <label
                              htmlFor={`ceremony-banner-${idx}`}
                              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs uppercase tracking-wider font-medium flex items-center gap-2 cursor-pointer transition-all border border-white/10"
                            >
                              <Upload size={14} />
                              <span>{ceremony.heroImage ? 'Change Ceremony Banner...' : 'Upload Ceremony Banner Photo'}</span>
                            </label>
                            {ceremony.heroImage && (
                              <span className="text-xs text-emerald-400">✓ Banner attached</span>
                            )}
                          </div>

                          {ceremony.heroImage && (
                            <div className="pt-2">
                              <FocalPointPicker
                                value={ceremony.heroImagePosition || '50% 50%'}
                                onChange={(newPos) => updateCeremonyField(idx, 'heroImagePosition', newPos)}
                                imageUrl={ceremony.heroImage}
                                aspectRatio="aspect-[16/9]"
                                targetRatioNumber={1.77}
                                label={`${ceremony.title?.en || 'Ceremony'} Banner Preview`}
                                aspectLabel="16:9 Banner Frame"
                              />
                            </div>
                          )}
                        </div>

                        {/* Program Carousel Photos (Up to 5 images with crop) */}
                        <div className="pt-4 border-t border-white/5">
                          <CeremonyCarouselPicker
                            images={ceremony.carouselImages || ceremony.galleryImages || []}
                            onChange={(newImages) => {
                              updateCeremonyField(idx, 'carouselImages', newImages)
                              // Also sync galleryImages as URL strings for backward compatibility
                              updateCeremonyField(idx, 'galleryImages', newImages.map(img => img.url || img))
                            }}
                            onUpload={async (file) => {
                              return await handleGenericUpload(file, `ceremony-${idx}-carousel`)
                            }}
                            label={`${ceremony.title?.en || 'Ceremony'} Moments Carousel (Up to 5)`}
                          />
                        </div>

                        {/* Flow Beats Builder */}
                        <div className="pt-4 border-t border-white/5 space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-xs uppercase tracking-wider text-zinc-300 font-semibold">
                              Emotional Flow Beats (e.g. Arrival, Ritual, Celebration)
                            </span>
                            <button
                              type="button"
                              onClick={() => addBeatToCeremony(idx)}
                              className="text-xs text-[#D4A574] hover:underline flex items-center gap-1"
                            >
                              <Plus size={13} />
                              <span>Add Flow Beat</span>
                            </button>
                          </div>

                          {(ceremony.beats || []).map((beat, bIdx) => (
                            <div key={bIdx} className="p-4 rounded-xl bg-black/20 border border-white/5 space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-zinc-400">
                                  Beat #{bIdx + 1}: {beat.label}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => removeBeatFromCeremony(idx, bIdx)}
                                  className="text-zinc-500 hover:text-rose-400"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                  <label className="text-[11px] text-zinc-500 block">Marker</label>
                                  <input
                                    type="text"
                                    value={beat.label}
                                    onChange={(e) => updateBeatField(idx, bIdx, 'label', e.target.value)}
                                    className="w-full px-2.5 py-1.5 bg-white/5 border border-white/10 rounded text-white text-xs"
                                  />
                                </div>
                                <div>
                                  <label className="text-[11px] text-zinc-500 block">Title (English)</label>
                                  <input
                                    type="text"
                                    value={beat.title?.en || ''}
                                    onChange={(e) => updateBeatField(idx, bIdx, 'title.en', e.target.value)}
                                    className="w-full px-2.5 py-1.5 bg-white/5 border border-white/10 rounded text-white text-xs"
                                  />
                                </div>
                                <div>
                                  <label className="text-[11px] text-zinc-500 block">Title (Bangla)</label>
                                  <input
                                    type="text"
                                    value={beat.title?.bn || ''}
                                    onChange={(e) => updateBeatField(idx, bIdx, 'title.bn', e.target.value)}
                                    className="w-full px-2.5 py-1.5 bg-white/5 border border-white/10 rounded text-white font-bangla text-xs"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
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
                <Heart size={18} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Section F: Spiritual Blessings & Parent Prayers</h2>
                <p className="text-xs text-zinc-400 font-light">
                  {traditionId === 'hindu' ? 'Vedic Sanskrit Shlokas & Blessings' : 'Islamic Quranic Verses & Duas'}
                </p>
              </div>
            </div>

            {/* Main Blessing */}
            <div className="space-y-4">
              <div>
                <label className="text-xs uppercase tracking-wider text-zinc-400 block mb-2 font-medium">
                  {traditionId === 'hindu' ? 'Sacred Shloka (Sanskrit)' : 'Sacred Ayat (Arabic)'}
                </label>
                <textarea
                  rows={2}
                  value={formData.blessingText}
                  onChange={(e) => setFormData(p => ({ ...p, blessingText: e.target.value }))}
                  className={`w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-lg ${
                    traditionId === 'hindu' ? 'font-serif' : 'font-arabic direction-rtl'
                  } focus:outline-none focus:border-[#D4A574]`}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs uppercase tracking-wider text-zinc-400 block mb-2 font-medium">
                    Translation (English)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.blessingEn}
                    onChange={(e) => setFormData(p => ({ ...p, blessingEn: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#D4A574]"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider text-zinc-400 block mb-2 font-medium">
                    Translation (Bangla)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.blessingBn}
                    onChange={(e) => setFormData(p => ({ ...p, blessingBn: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-bangla text-sm focus:outline-none focus:border-[#D4A574]"
                  />
                </div>
              </div>
            </div>

            {/* Parent Blessings */}
            <div className="pt-4 border-t border-white/5 space-y-4">
              <span className="text-xs uppercase tracking-wider text-[#D4A574] font-semibold block">
                Parent Blessings Message
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Message (English)</label>
                  <textarea
                    rows={3}
                    value={formData.parentMessageEn}
                    onChange={(e) => setFormData(p => ({ ...p, parentMessageEn: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Message (Bangla)</label>
                  <textarea
                    rows={3}
                    value={formData.parentMessageBn}
                    onChange={(e) => setFormData(p => ({ ...p, parentMessageBn: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white font-bangla text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            SECTION G: MONOGRAM PREVIEW & GALLERY
            ======================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Monogram Live Preview */}
          {sectionToggles.monogram && (
            <div className="p-8 rounded-2xl bg-[#141418] border border-white/5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#A67C52]/20 flex items-center justify-center text-[#D4A574]">
                    <Sparkle size={18} />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-white">Dynamic Wedding Monogram</h2>
                    <p className="text-xs text-zinc-400 font-light">Auto-rendered with couple names & tradition frame</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateMonogramPreview}
                  disabled={generatingMonogram || !formData.coupleNamesEn}
                  className="px-3 py-1.5 bg-[#A67C52]/20 hover:bg-[#A67C52]/30 text-[#D4A574] text-xs rounded-lg font-medium transition-all"
                >
                  {generatingMonogram ? 'Generating...' : 'Preview Monogram'}
                </button>
              </div>

              <div className="aspect-square w-full max-w-[280px] mx-auto rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-center p-4 relative overflow-hidden">
                {monogramUrl ? (
                  <img src={monogramUrl} alt="Monogram Preview" className="w-full h-full object-contain" />
                ) : (
                  <div className="text-center space-y-2 text-zinc-500">
                    <Sparkles size={28} className="mx-auto text-zinc-600" />
                    <p className="text-xs">Click "Preview Monogram" to generate dynamic emblem</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Color Palette Selector */}
          {sectionToggles.palette && (
            <div className="p-8 rounded-2xl bg-[#141418] border border-white/5 space-y-4">
              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <div className="w-8 h-8 rounded-lg bg-[#A67C52]/20 flex items-center justify-center text-[#D4A574]">
                  <Palette size={18} />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-white">Curated Color Theme</h2>
                  <p className="text-xs text-zinc-400 font-light">Custom extracted with Gemini Vision AI</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[280px] overflow-y-auto pr-2">
                {paletteOptions.map((pal, idx) => (
                  <button
                    key={pal.name || idx}
                    type="button"
                    onClick={() => setSelectedPaletteIndex(idx)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedPaletteIndex === idx
                        ? 'bg-[#A67C52]/20 border-[#D4A574] ring-1 ring-[#D4A574]'
                        : 'bg-white/5 border-white/5 hover:bg-white/10'
                    }`}
                  >
                    <span className="text-xs font-semibold text-white block mb-1.5">{pal.name}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: pal.accent }} />
                      <span className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: pal.deepAccent }} />
                      <span className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: pal.warmAccent }} />
                      <span className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: pal.graphite }} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Batch Photo Gallery Upload */}
        {sectionToggles.gallery && (
          <div className="p-8 rounded-2xl bg-[#141418] border border-white/5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#A67C52]/20 flex items-center justify-center text-[#D4A574]">
                  <ImageIcon size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Batch Photo Gallery</h2>
                  <p className="text-xs text-zinc-400 font-light">Upload high-resolution event moments for the cinematic grid</p>
                </div>
              </div>
              <input
                type="file"
                multiple
                accept="image/*"
                id="batch-gallery-input"
                className="hidden"
                onChange={handleBatchGalleryUpload}
              />
              <label
                htmlFor="batch-gallery-input"
                className="px-4 py-2 bg-[#D4A574]/20 hover:bg-[#D4A574]/30 text-[#D4A574] text-xs font-semibold rounded-lg flex items-center gap-2 cursor-pointer transition-all"
              >
                <Upload size={14} />
                <span>Upload Photos</span>
              </label>
            </div>

            {batchUploading && (
              <div className="flex items-center gap-2 text-xs text-[#D4A574] py-2">
                <Loader2 size={16} className="animate-spin" />
                <span>{batchProgress}</span>
              </div>
            )}

            {galleryImages.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
                {galleryImages.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group border border-white/10">
                    <img src={img.publicUrl} alt={img.name} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setGalleryImages(p => p.filter((_, i) => i !== idx))}
                      className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-black text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            SECTION H: CLIENT CONTACT & SUBMIT
            ======================================================== */}
        <div className="p-8 rounded-2xl bg-[#141418] border border-white/5 space-y-6">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <div className="w-8 h-8 rounded-lg bg-[#A67C52]/20 flex items-center justify-center text-[#D4A574]">
              <User size={18} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Section H: Client Contact & Owner Details</h2>
              <p className="text-xs text-zinc-400 font-light">Contact credentials for the wedding couple or family coordinator</p>
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
                placeholder="info@shubhobiye.com"
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
              Your site will be generated instantly and redirected to your live URL slug upon creation.
            </p>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !formData.coupleNamesEn}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#A67C52] to-[#8C643E] hover:from-[#B88B5E] hover:to-[#9C7046] disabled:opacity-50 text-white text-xs uppercase tracking-widest font-semibold rounded-xl shadow-xl shadow-[#A67C52]/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Generating Website...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Create Wedding Site</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
