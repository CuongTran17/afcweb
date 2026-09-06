import type { SupabaseClient } from '@supabase/supabase-js'
import { validateAdminImageFile } from './imageValidation'

export type UploadFolder = 'banners' | 'events' | 'leaders'

export type UploadedImage = {
  imageUrl: string
  storagePath: string
  fileSize: number
  mimeType: string
}

export type UploadAdminImageArgs = {
  client: SupabaseClient
  bucket: 'afc-media'
  folder: UploadFolder
  slug: string
  file: File
}

export function buildStoragePath(folder: UploadFolder, slug: string, file: File): string {
  const extension = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
  const safeSlug = slug.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '-') || 'media'
  return `${folder}/${safeSlug}/${Date.now()}-${safeSlug}.${extension}`
}

export async function uploadAdminImage({ client, bucket, folder, slug, file }: UploadAdminImageArgs): Promise<UploadedImage> {
  const validation = validateAdminImageFile(file)
  if (!validation.valid) throw new Error(validation.reason)

  const storagePath = buildStoragePath(folder, slug, file)
  const { error } = await client.storage.from(bucket).upload(storagePath, file, { upsert: false, contentType: file.type })
  if (error) throw error

  const { data } = client.storage.from(bucket).getPublicUrl(storagePath)
  return { imageUrl: data.publicUrl, storagePath, fileSize: file.size, mimeType: file.type }
}
