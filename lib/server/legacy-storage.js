import 'server-only'
import { isSupabaseConfigured, serviceClient } from './supabase.js'

const BUCKET_NAME = 'site-media'

/**
 * Legacy public bucket (site-media) used before the private media pipeline.
 * Only purge remains; nothing writes here any more. Deletes files under the
 * site's id and slug folders and nothing else.
 */
export async function deleteLegacySiteStorage(siteId, slug) {
  if (!isSupabaseConfigured()) {
    console.log('[deleteSiteStorage] Supabase not configured. Simulating storage purge for site:', siteId)
    return { success: true, deletedCount: 0 }
  }

  const supabase = serviceClient()
  const prefixes = [siteId, slug].filter(Boolean)
  const filesToDelete = []

  for (const prefix of prefixes) {
    if (!prefix || prefix === 'general' || prefix === 'temp') continue

    // List all files in the site's folder recursively
    try {
      const listFolder = async (folderPath) => {
        const items = []
        for (let offset = 0; ; offset += 100) {
          const { data: page, error } = await supabase.storage
            .from(BUCKET_NAME)
            .list(folderPath, { limit: 100, offset })
          if (error) throw error
          items.push(...(page || []))
          if (!page || page.length < 100) break
        }

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
      throw new Error(`Could not list stored files for "${prefix}"`)
    }
  }

  if (filesToDelete.length > 0) {
    console.log(`[deleteSiteStorage] Purging ${filesToDelete.length} files for site ${siteId} (${slug})...`)
    for (let i = 0; i < filesToDelete.length; i += 500) {
      const { error: removeError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove(filesToDelete.slice(i, i + 500))

      if (removeError) {
        console.error('[deleteSiteStorage] Failed to remove files:', removeError)
        throw new Error(`Storage purge error: ${removeError.message}`)
      }
    }
  }

  return {
    success: true,
    deletedCount: filesToDelete.length,
    deletedFiles: filesToDelete
  }
}

