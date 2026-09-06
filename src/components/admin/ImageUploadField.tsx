import { useState, type ChangeEvent } from 'react'
import { Upload, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { validateAdminImageFile } from '../../lib/storage/imageValidation'
import { uploadAdminImage, type UploadFolder } from '../../lib/storage/uploadImage'
import { getSupabaseClient } from '../../lib/supabase/client'

export type UploadedImageMeta = {
  storagePath: string
  fileSize: number
  mimeType: string
}

type ImageUploadFieldProps = {
  label: string
  value?: string
  onChange: (url: string, meta?: UploadedImageMeta) => void
  folder: UploadFolder
  slug?: string
}

export function ImageUploadField({
  label,
  value,
  onChange,
  folder,
  slug = 'general',
}: ImageUploadFieldProps) {
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)

    // Validate size and format
    const validation = validateAdminImageFile(file)
    if (!validation.valid) {
      setError(validation.reason || 'Ảnh không hợp lệ.')
      return
    }

    const supabase = getSupabaseClient()
    if (!supabase) {
      setError('Supabase chưa được cấu hình.')
      return
    }

    try {
      setIsUploading(true)
      const result = await uploadAdminImage({
        client: supabase,
        bucket: 'afc-media',
        file,
        folder,
        slug,
      })
      onChange(result.imageUrl, {
        storagePath: result.storagePath,
        fileSize: result.fileSize,
        mimeType: result.mimeType,
      })
    } catch (err: any) {
      setError(err?.message || 'Tải ảnh lên thất bại. Vui lòng thử lại.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="admin-form-group">
      <label className="admin-label">{label}</label>

      {value ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
          <img
            src={value}
            alt="Preview"
            style={{
              width: '90px',
              height: '60px',
              objectFit: 'cover',
              borderRadius: '0.375rem',
              border: '1px solid #cbd5e1',
            }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#166534', fontSize: '0.875rem' }}>
              <CheckCircle2 size={16} />
              <span>Đã có ảnh</span>
            </div>
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="admin-input"
              style={{ marginTop: '0.35rem', fontSize: '0.8rem' }}
              placeholder="URL hình ảnh"
            />
          </div>
          <button
            type="button"
            onClick={() => onChange('')}
            className="admin-btn admin-btn--secondary"
            title="Xóa ảnh"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div style={{ position: 'relative' }}>
          <label className="admin-upload-box" style={{ display: 'block' }}>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              disabled={isUploading}
              style={{ display: 'none' }}
            />
            {isUploading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#64748b' }}>
                <Loader2 size={20} className="animate-spin" />
                <span>Đang tải ảnh lên (Storage)...</span>
              </div>
            ) : (
              <div>
                <Upload size={24} style={{ margin: '0 auto 0.5rem', color: '#94a3b8' }} />
                <p style={{ margin: '0 0 0.25rem', fontSize: '0.875rem', fontWeight: 500 }}>
                  Nhấn để chọn ảnh tải lên
                </p>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>
                  Hỗ trợ JPG, PNG, WEBP. Kích thước từ 50KB đến 500KB.
                </p>
              </div>
            )}
          </label>
        </div>
      )}

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#dc2626', fontSize: '0.8rem', marginTop: '0.35rem' }}>
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
