import { useEffect, useState } from 'react'
import { Plus, Edit2, Eye, EyeOff, Trash2, X, Loader2 } from 'lucide-react'
import { AdminConfirmModal } from '../../components/admin/AdminConfirmModal'
import { ImageUploadField } from '../../components/admin/ImageUploadField'
import {
  createBanner,
  listAdminBanners,
  setBannerStatus,
  updateBanner,
} from '../../lib/content/adminContent'
import { getSupabaseClient } from '../../lib/supabase/client'
import type { SupabaseBannerRow } from '../../lib/supabase/types'

export function BannerAdminPage() {
  const [banners, setBanners] = useState<SupabaseBannerRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBanner, setEditingBanner] = useState<SupabaseBannerRow | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [imageMeta, setImageMeta] = useState<{ storagePath?: string; fileSize?: number; mimeType?: string }>({})
  const [linkUrl, setLinkUrl] = useState('')
  const [sortOrder, setSortOrder] = useState(1)

  const loadBanners = async () => {
    const supabase = getSupabaseClient()
    if (!supabase) return
    try {
      setIsLoading(true)
      const data = await listAdminBanners(supabase)
      setBanners(data)
    } catch (err: any) {
      setError(err?.message || 'Không thể tải danh sách banner.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadBanners()
  }, [])

  const openCreateModal = () => {
    setEditingBanner(null)
    setTitle('')
    setSubtitle('')
    setImageUrl('')
    setImageMeta({})
    setLinkUrl('')
    setSortOrder(banners.length + 1)
    setError(null)
    setIsModalOpen(true)
  }

  const openEditModal = (b: SupabaseBannerRow) => {
    setEditingBanner(b)
    setTitle(b.title)
    setSubtitle(b.subtitle || '')
    setImageUrl(b.image_url)
    setImageMeta({
      storagePath: b.storage_path,
      fileSize: b.file_size || undefined,
      mimeType: b.mime_type || undefined,
    })
    setLinkUrl(b.link_url || '')
    setSortOrder(b.sort_order)
    setError(null)
    setIsModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!imageUrl) {
      setError('Vui lòng chọn hoặc nhập hình ảnh banner.')
      return
    }

    const supabase = getSupabaseClient()
    if (!supabase) return

    try {
      setIsSaving(true)
      setError(null)

      const finalStoragePath = imageMeta.storagePath || editingBanner?.storage_path || 'banners/manual_upload.jpg'
      const finalFileSize = imageMeta.fileSize ?? editingBanner?.file_size ?? 102400
      const finalMimeType = imageMeta.mimeType ?? editingBanner?.mime_type ?? 'image/jpeg'

      if (editingBanner) {
        await updateBanner(supabase, editingBanner.id, {
          title,
          subtitle: subtitle || null,
          image_url: imageUrl,
          storage_path: finalStoragePath,
          alt: title,
          file_size: finalFileSize,
          mime_type: finalMimeType,
          link_url: linkUrl || null,
          sort_order: sortOrder,
        })
      } else {
        await createBanner(supabase, {
          title,
          subtitle: subtitle || null,
          image_url: imageUrl,
          storage_path: finalStoragePath,
          alt: title,
          object_position: 'center center',
          file_size: finalFileSize,
          mime_type: finalMimeType,
          link_url: linkUrl || null,
          sort_order: sortOrder,
          status: 'published',
        })
      }

      setIsModalOpen(false)
      await loadBanners()
    } catch (err: any) {
      setError(err?.message || 'Lưu banner thất bại.')
    } finally {
      setIsSaving(false)
    }
  }

  const [bannerToArchive, setBannerToArchive] = useState<SupabaseBannerRow | null>(null)
  const [isArchiving, setIsArchiving] = useState(false)

  const handleToggleStatus = async (banner: SupabaseBannerRow) => {
    const supabase = getSupabaseClient()
    if (!supabase) return
    const nextStatus = banner.status === 'published' ? 'hidden' : 'published'
    try {
      await setBannerStatus(supabase, banner.id, nextStatus)
      await loadBanners()
    } catch (err: any) {
      setError(err?.message || 'Cập nhật trạng thái thất bại.')
    }
  }

  const handleConfirmArchive = async () => {
    if (!bannerToArchive) return
    const supabase = getSupabaseClient()
    if (!supabase) return
    try {
      setIsArchiving(true)
      await setBannerStatus(supabase, bannerToArchive.id, 'archived')
      setBannerToArchive(null)
      await loadBanners()
    } catch (err: any) {
      setError(err?.message || 'Thao tác bỏ banner thất bại.')
    } finally {
      setIsArchiving(false)
    }
  }

  return (
    <div>
      <div className="admin-card">
        <div className="admin-card__header">
          <div>
            <h2 className="admin-card__title">Quản lý Banner Hero Trang chủ</h2>
            <p className="admin-card__desc">
              Thay đổi hình ảnh, tiêu đề và thứ tự hiển thị của slider banner trang chủ.
            </p>
          </div>
          <button type="button" onClick={openCreateModal} className="admin-btn admin-btn--primary">
            <Plus size={16} />
            Thêm Banner mới
          </button>
        </div>

        {error && (
          <div style={{ color: '#dc2626', marginBottom: '1rem', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        {isLoading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
            <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto' }} />
            <p style={{ marginTop: '0.5rem' }}>Đang tải danh sách banner...</p>
          </div>
        ) : banners.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
            Chưa có banner nào. Nhấn &quot;Thêm Banner mới&quot; để tạo.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>Thứ tự</th>
                  <th style={{ width: '120px' }}>Hình ảnh</th>
                  <th>Tiêu đề & Phụ đề</th>
                  <th>Liên kết</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {banners.map((banner) => (
                  <tr key={banner.id}>
                    <td style={{ fontWeight: 600 }}>#{banner.sort_order}</td>
                    <td>
                      <img
                        src={banner.image_url}
                        alt={banner.title}
                        style={{
                          width: '90px',
                          height: '50px',
                          objectFit: 'cover',
                          borderRadius: '0.25rem',
                          border: '1px solid #e2e8f0',
                        }}
                      />
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{banner.title}</div>
                      {banner.subtitle && (
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                          {banner.subtitle}
                        </div>
                      )}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      {banner.link_url || '—'}
                    </td>
                    <td>
                      <span
                        className={`admin-badge ${
                          banner.status === 'published'
                            ? 'admin-badge--published'
                            : 'admin-badge--hidden'
                        }`}
                      >
                        {banner.status === 'published' ? 'Đang hiển thị' : 'Đang ẩn'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(banner)}
                          className="admin-btn admin-btn--secondary"
                          title={banner.status === 'published' ? 'Ẩn khỏi web' : 'Hiển thị'}
                        >
                          {banner.status === 'published' ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(banner)}
                          className="admin-btn admin-btn--secondary"
                          title="Chỉnh sửa"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setBannerToArchive(banner)}
                          className="admin-btn admin-btn--danger"
                          title="Bỏ khỏi web"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.25rem',
              }}
            >
              <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700 }}>
                {editingBanner ? 'Chỉnh sửa Banner' : 'Thêm Banner mới'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="admin-btn admin-btn--secondary"
              >
                <X size={16} />
              </button>
            </div>

            {error && (
              <div style={{ color: '#dc2626', marginBottom: '1rem', fontSize: '0.875rem' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSave}>
              <div className="admin-form-group">
                <label className="admin-label">Tiêu đề Banner</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="admin-input"
                  placeholder="VD: Chào mừng tới CLB Tài chính AFC"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Phụ đề (tùy chọn)</label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="admin-input"
                  placeholder="VD: Nơi hội tụ đam mê tài chính & học thuật thực chiến"
                />
              </div>

              <ImageUploadField
                label="Hình ảnh Banner (50KB - 500KB)"
                value={imageUrl}
                onChange={(url, meta) => {
                  setImageUrl(url)
                  if (meta) {
                    setImageMeta({
                      storagePath: meta.storagePath,
                      fileSize: meta.fileSize,
                      mimeType: meta.mimeType,
                    })
                  }
                }}
                folder="banners"
                slug={title.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'banner'}
              />

              <div className="admin-form-row admin-form-row--link-order">
                <div className="admin-form-group">
                  <label className="admin-label">Đường dẫn liên kết (tùy chọn)</label>
                  <input
                    type="text"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    className="admin-input"
                    placeholder="/hoat-dong hoặc https://..."
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-label">Thứ tự</label>
                  <input
                    type="number"
                    min={1}
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    className="admin-input"
                  />
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.75rem',
                  marginTop: '1.5rem',
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="admin-btn admin-btn--secondary"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="admin-btn admin-btn--primary"
                >
                  {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AdminConfirmModal
        isOpen={Boolean(bannerToArchive)}
        title="Bỏ banner khỏi website?"
        message={`Bạn có chắc chắn muốn bỏ banner "${bannerToArchive?.title}" khỏi website? Banner sẽ được chuyển vào lưu trữ an toàn thay vì xoá vĩnh viễn.`}
        confirmText="Bỏ khỏi website"
        confirmVariant="danger"
        isLoading={isArchiving}
        onConfirm={handleConfirmArchive}
        onCancel={() => setBannerToArchive(null)}
      />
    </div>
  )
}
