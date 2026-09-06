import { describe, expect, it } from 'vitest'
import { validateAdminImageFile } from './imageValidation'

const file = (size: number, type: string) => ({ size, type })

describe('validateAdminImageFile', () => {
  it('rejects images below 50KB', () => {
    expect(validateAdminImageFile(file(49 * 1024, 'image/jpeg'))).toEqual({
      valid: false,
      reason: 'Ảnh quá nhẹ. Vui lòng dùng ảnh từ 50KB đến 500KB.',
    })
  })

  it('rejects images above 500KB', () => {
    expect(validateAdminImageFile(file(501 * 1024, 'image/webp'))).toEqual({
      valid: false,
      reason: 'Ảnh quá nặng. Vui lòng nén ảnh xuống dưới 500KB.',
    })
  })

  it('rejects unsupported MIME types', () => {
    expect(validateAdminImageFile(file(120 * 1024, 'image/gif'))).toEqual({
      valid: false,
      reason: 'Định dạng ảnh chưa được hỗ trợ. Vui lòng dùng JPG, PNG hoặc WEBP.',
    })
  })

  it('accepts JPG, PNG, and WEBP images between 50KB and 500KB', () => {
    expect(validateAdminImageFile(file(120 * 1024, 'image/jpeg'))).toEqual({ valid: true })
    expect(validateAdminImageFile(file(120 * 1024, 'image/png'))).toEqual({ valid: true })
    expect(validateAdminImageFile(file(120 * 1024, 'image/webp'))).toEqual({ valid: true })
  })
})
