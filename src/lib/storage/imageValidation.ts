export const MIN_ADMIN_IMAGE_BYTES = 50 * 1024
export const MAX_ADMIN_IMAGE_BYTES = 500 * 1024
export const ALLOWED_ADMIN_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const

export type ImageValidationResult = { valid: true } | { valid: false; reason: string }

export function validateAdminImageFile(file: Pick<File, 'size' | 'type'>): ImageValidationResult {
  if (file.size < MIN_ADMIN_IMAGE_BYTES) {
    return { valid: false, reason: 'Ảnh quá nhẹ. Vui lòng dùng ảnh từ 50KB đến 500KB.' }
  }

  if (file.size > MAX_ADMIN_IMAGE_BYTES) {
    return { valid: false, reason: 'Ảnh quá nặng. Vui lòng nén ảnh xuống dưới 500KB.' }
  }

  if (!ALLOWED_ADMIN_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_ADMIN_IMAGE_TYPES)[number])) {
    return { valid: false, reason: 'Định dạng ảnh chưa được hỗ trợ. Vui lòng dùng JPG, PNG hoặc WEBP.' }
  }

  return { valid: true }
}
