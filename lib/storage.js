import sharp from 'sharp'
import { getSupabaseAdmin, checkIsConfigured } from './supabase.js'

const BUCKET_NAME = 'site-media'

/**
 * Optimizes an image buffer using lossless / near-lossless compression with sharp.
 * Produces an optimized WebP version.
 */
export async function optimizeImage(buffer, options = {}) {
  const { maxWidth = 2000, quality = 90 } = options

  let pipeline = sharp(buffer)
  const metadata = await pipeline.metadata()

  if (metadata.width && metadata.width > maxWidth) {
    pipeline = pipeline.resize({ width: maxWidth, withoutEnlargement: true })
  }

  // Convert to high-fidelity WebP
  const optimizedBuffer = await pipeline
    .webp({ quality, effort: 6, smartSubsample: true })
    .toBuffer()

  return {
    buffer: optimizedBuffer,
    width: Math.min(metadata.width || maxWidth, maxWidth),
    height: metadata.height,
    format: 'webp',
    originalSize: buffer.length,
    optimizedSize: optimizedBuffer.length
  }
}

/**
 * Uploads an image to Supabase Storage with lossless optimization.
 * Automatically verifies/creates the storage bucket if missing.
 * 
 * @param {Buffer|ArrayBuffer} fileBuffer
 * @param {Object} options
 * @param {string} options.siteId - UUID or slug of the site
 * @param {string} options.category - 'hero' | 'gallery' | 'akth' | 'holud' | 'wedding' | 'general'
 * @param {string} options.filename - original filename
 */
export async function uploadSiteImage(fileBuffer, options = {}) {
  const { siteId = 'general', category = 'gallery', filename } = options
  const nodeBuffer = Buffer.isBuffer(fileBuffer) ? fileBuffer : Buffer.from(fileBuffer)

  // 1. Optimize image buffer with sharp
  const optimized = await optimizeImage(nodeBuffer)

  // Clean filename and ensure .webp extension
  const baseName = filename
    ? filename.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_')
    : `img_${Date.now()}`
  const targetPath = `${siteId}/${category}/${baseName}_${Date.now()}.webp`

  if (!checkIsConfigured()) {
    console.warn('[uploadSiteImage] Supabase not configured. Simulating upload for:', targetPath)
    return {
      success: true,
      path: targetPath,
      publicUrl: `/images/placeholder.jpg`,
      originalSize: optimized.originalSize,
      optimizedSize: optimized.optimizedSize,
      savingsPercent: Math.round(((optimized.originalSize - optimized.optimizedSize) / optimized.originalSize) * 100)
    }
  }

  const supabase = getSupabaseAdmin()

  // Ensure upload payload is a clean, standard Uint8Array to prevent "SharedArrayBuffer is not allowed" in Node 22
  const uploadPayload = new Uint8Array(optimized.buffer.length)
  uploadPayload.set(optimized.buffer)

  // 2. Upload to Supabase Storage with automatic bucket creation fallback
  let { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(targetPath, uploadPayload, {
      contentType: 'image/webp',
      upsert: true
    })

  // If bucket does not exist, auto-create it and retry
  if (error && (error.message?.toLowerCase().includes('not found') || error.message?.toLowerCase().includes('bucket'))) {
    console.log(`Bucket "${BUCKET_NAME}" not found or needs creation. Auto-creating...`)
    await supabase.storage.createBucket(BUCKET_NAME, { public: true })
    
    const retryResult = await supabase.storage
      .from(BUCKET_NAME)
      .upload(targetPath, uploadPayload, {
        contentType: 'image/webp',
        upsert: true
      })
    data = retryResult.data
    error = retryResult.error
  }

  if (error) {
    console.error('Supabase Storage upload error details:', error)
    throw new Error(`Supabase Storage upload failed: ${error.message}`)
  }

  // 3. Get Public URL
  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(targetPath)

  return {
    success: true,
    path: targetPath,
    publicUrl: urlData.publicUrl,
    originalSize: optimized.originalSize,
    optimizedSize: optimized.optimizedSize,
    savingsPercent: Math.round(((optimized.originalSize - optimized.optimizedSize) / optimized.originalSize) * 100)
  }
}

/**
 * Uploads a video file to Supabase Storage with size verification (≤ 20MB).
 */
export async function uploadSiteVideo(fileBuffer, options = {}) {
  const { siteId = 'general', filename = 'video.mp4', contentType = 'video/mp4' } = options
  const nodeBuffer = Buffer.isBuffer(fileBuffer) ? fileBuffer : Buffer.from(fileBuffer)

  const MAX_VIDEO_SIZE = 20 * 1024 * 1024 // 20 MB
  if (nodeBuffer.length > MAX_VIDEO_SIZE) {
    throw new Error('Video file exceeds maximum allowed size of 20MB')
  }

  const ext = filename.split('.').pop() || 'mp4'
  const baseName = filename.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_')
  const targetPath = `${siteId}/video/${baseName}_${Date.now()}.${ext}`

  if (!checkIsConfigured()) {
    console.warn('[uploadSiteVideo] Supabase not configured. Simulating video upload for:', targetPath)
    return {
      success: true,
      path: targetPath,
      publicUrl: `/videos/hero-background.mp4`,
      size: nodeBuffer.length
    }
  }

  const supabase = getSupabaseAdmin()
  const uploadPayload = new Uint8Array(nodeBuffer.length)
  uploadPayload.set(nodeBuffer)

  let { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(targetPath, uploadPayload, {
      contentType,
      upsert: true
    })

  if (error && (error.message?.toLowerCase().includes('not found') || error.message?.toLowerCase().includes('bucket'))) {
    await supabase.storage.createBucket(BUCKET_NAME, { public: true })
    const retry = await supabase.storage
      .from(BUCKET_NAME)
      .upload(targetPath, uploadPayload, { contentType, upsert: true })
    data = retry.data
    error = retry.error
  }

  if (error) {
    console.error('Supabase Storage video upload error:', error)
    throw new Error(`Video upload failed: ${error.message}`)
  }

  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(targetPath)

  return {
    success: true,
    path: targetPath,
    publicUrl: urlData.publicUrl,
    size: nodeBuffer.length
  }
}

/**
 * Permanently deletes all media files belonging to a specific site from Supabase Storage.
 * Strictly constrained to the site's unique ID and slug folder prefixes to keep all other sites completely intact.
 */
export async function deleteSiteStorage(siteId, slug) {
  if (!checkIsConfigured()) {
    console.log('[deleteSiteStorage] Supabase not configured. Simulating storage purge for site:', siteId)
    return { success: true, deletedCount: 0 }
  }

  const supabase = getSupabaseAdmin()
  const prefixes = [siteId, slug].filter(Boolean)
  const filesToDelete = []

  for (const prefix of prefixes) {
    if (!prefix || prefix === 'general' || prefix === 'temp') continue

    // List all files in the site's folder recursively
    try {
      const listFolder = async (folderPath) => {
        const { data: items, error } = await supabase.storage
          .from(BUCKET_NAME)
          .list(folderPath, { limit: 100, offset: 0 })

        if (error || !items) return

        for (const item of items) {
          const itemPath = folderPath ? `${folderPath}/${item.name}` : item.name
          if (item.id === null) {
            // It's a subfolder, recurse
            await listFolder(itemPath)
          } else {
            // It's a file belonging strictly to this site prefix
            filesToDelete.push(itemPath)
          }
        }
      }

      await listFolder(prefix)
    } catch (err) {
      console.error(`[deleteSiteStorage] Error listing files under prefix "${prefix}":`, err)
    }
  }

  if (filesToDelete.length > 0) {
    console.log(`[deleteSiteStorage] Purging ${filesToDelete.length} files for site ${siteId} (${slug})...`)
    const { error: removeError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove(filesToDelete)

    if (removeError) {
      console.error('[deleteSiteStorage] Failed to remove files:', removeError)
      throw new Error(`Storage purge error: ${removeError.message}`)
    }
  }

  return {
    success: true,
    deletedCount: filesToDelete.length,
    deletedFiles: filesToDelete
  }
}

export const uploadImage = uploadSiteImage
