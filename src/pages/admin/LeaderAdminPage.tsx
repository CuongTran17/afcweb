import { useEffect, useState, useId } from 'react'
import { Plus, Edit2, Eye, EyeOff, Trash2, X, Loader2, User } from 'lucide-react'
import { AdminConfirmModal } from '../../components/admin/AdminConfirmModal'
import { ImageUploadField } from '../../components/admin/ImageUploadField'
import {
  createLeader,
  listAdminLeaders,
  setLeaderStatus,
  updateLeader,
} from '../../lib/content/adminContent'
import { getSupabaseClient } from '../../lib/supabase/client'
import type { SupabaseLeaderRow } from '../../lib/supabase/types'

const departmentOptions = [
  'Ban Chủ nhiệm',
  'Ban Chuyên môn',
  'Ban Truyền thông',
  'Ban Sự kiện',
  'Ban Đối ngoại',
]

export function LeaderAdminPage() {
  const [leaders, setLeaders] = useState<SupabaseLeaderRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingLeader, setEditingLeader] = useState<SupabaseLeaderRow | null>(null)
  const [leaderToArchive, setLeaderToArchive] = useState<SupabaseLeaderRow | null>(null)
  const [isArchiving, setIsArchiving] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filterGen, setFilterGen] = useState<string>('all')

  const filterGenId = useId()
  const departmentId = useId()
  const statusId = useId()

  // Form state
  const [name, setName] = useState('')
  const [role, setRole] = useState('Trưởng ban')
  const [departmentName, setDepartmentName] = useState('Ban Chuyên môn')
  const [generation, setGeneration] = useState('Gen 10')
  const [photoUrl, setPhotoUrl] = useState('')
  const [photoMeta, setPhotoMeta] = useState<{ storagePath?: string; fileSize?: number; mimeType?: string }>({})
  const [sortOrder, setSortOrder] = useState(1)
  const [status, setStatus] = useState<'published' | 'hidden'>('published')

  const loadLeaders = async () => {
    const supabase = getSupabaseClient()
    if (!supabase) return
    try {
      setIsLoading(true)
      const data = await listAdminLeaders(supabase)
      setLeaders(data)
    } catch (err: any) {
      setError(err?.message || 'Không thể tải danh sách nhân sự ban điều hành.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadLeaders()
  }, [])

  const availableGenerations = Array.from(
    new Set(
      leaders
        .map((l) => l.generation)
        .filter((g): g is string => typeof g === 'string' && g.trim().length > 0),
    ),
  ).sort()

  const openCreateModal = () => {
    setEditingLeader(null)
    setName('')
    setRole('Trưởng ban')
    setDepartmentName('Ban Chuyên môn')
    setGeneration(filterGen !== 'all' ? filterGen : 'Gen 10')
    setPhotoUrl('')
    setPhotoMeta({})
    setSortOrder(leaders.length + 1)
    setStatus('published')
    setError(null)
    setIsModalOpen(true)
  }

  const openEditModal = (leader: SupabaseLeaderRow) => {
    setEditingLeader(leader)
    setName(leader.name)
    setRole(leader.role)
    setDepartmentName(leader.department_name)
    setGeneration(leader.generation || 'Gen 10')
    setPhotoUrl(leader.photo_url || '')
    setPhotoMeta({
      storagePath: leader.storage_path || undefined,
      fileSize: leader.file_size || undefined,
      mimeType: leader.mime_type || undefined,
    })
    setSortOrder(leader.sort_order)
    setStatus(leader.status as any)
    setError(null)
    setIsModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = getSupabaseClient()
    if (!supabase) return

    try {
      setIsSaving(true)
      setError(null)

      const photo = photoUrl.trim() ? photoUrl.trim() : null
      const storagePath = photo ? (photoMeta.storagePath || editingLeader?.storage_path || null) : null
      const fileSize = photo ? (photoMeta.fileSize ?? editingLeader?.file_size ?? null) : null
      const mimeType = photo ? (photoMeta.mimeType ?? editingLeader?.mime_type ?? null) : null

      if (editingLeader) {
        await updateLeader(supabase, editingLeader.id, {
          name,
          role,
          department_name: departmentName,
          generation: generation.trim(),
          photo_url: photo,
          storage_path: storagePath,
          file_size: fileSize,
          mime_type: mimeType,
          sort_order: sortOrder,
          status,
        })
      } else {
        await createLeader(supabase, {
          name,
          role,
          department_name: departmentName,
          generation: generation.trim(),
          photo_url: photo,
          storage_path: storagePath,
          file_size: fileSize,
          mime_type: mimeType,
          sort_order: sortOrder,
          status,
        })
      }

      setIsModalOpen(false)
      await loadLeaders()
    } catch (err: any) {
      setError(err?.message || 'Lưu nhân sự thất bại.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleStatus = async (leader: SupabaseLeaderRow) => {
    const supabase = getSupabaseClient()
    if (!supabase) return
    const nextStatus = leader.status === 'published' ? 'hidden' : 'published'
    try {
      await setLeaderStatus(supabase, leader.id, nextStatus)
      await loadLeaders()
    } catch (err: any) {
      setError(err?.message || 'Cập nhật trạng thái thất bại.')
    }
  }

  const handleConfirmArchive = async () => {
    if (!leaderToArchive) return
    const supabase = getSupabaseClient()
    if (!supabase) return
    try {
      setIsArchiving(true)
      await setLeaderStatus(supabase, leaderToArchive.id, 'archived')
      setLeaderToArchive(null)
      await loadLeaders()
    } catch (err: any) {
      setError(err?.message || 'Thao tác bỏ nhân sự thất bại.')
    } finally {
      setIsArchiving(false)
    }
  }

  const filteredLeaders = leaders.filter((l) =>
    filterGen === 'all' ? true : l.generation === filterGen,
  )

  return (
    <div>
      <div className="admin-card">
        <div className="admin-card__header">
          <div>
            <h2 className="admin-card__title">Quản lý Ban Điều hành theo Nhiệm kỳ</h2>
            <p className="admin-card__desc">
              Cập nhật nhân sự Ban Chủ nhiệm và Trưởng/Phó các ban chuyên trách khi kết thúc nhiệm kỳ hoặc chuyển giao thế hệ.
            </p>
          </div>
          <button type="button" onClick={openCreateModal} className="admin-btn admin-btn--primary">
            <Plus size={16} />
            Thêm Thành viên mới
          </button>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem' }}>
          <label htmlFor={filterGenId} style={{ fontSize: '0.875rem', fontWeight: 600, alignSelf: 'center' }}>
            Lọc theo Khóa / Nhiệm kỳ:
          </label>
          <select
            id={filterGenId}
            value={filterGen}
            onChange={(e) => setFilterGen(e.target.value)}
            className="admin-select"
            style={{ width: 'auto' }}
          >
            <option value="all">Tất cả các khóa</option>
            {availableGenerations.map((gen) => (
              <option key={gen} value={gen}>
                {gen}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div style={{ color: '#dc2626', marginBottom: '1rem', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        {isLoading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
            <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto' }} />
            <p style={{ marginTop: '0.5rem' }}>Đang tải danh sách nhân sự...</p>
          </div>
        ) : filteredLeaders.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
            Chưa có nhân sự nào trong danh sách.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>Ảnh</th>
                  <th>Họ và tên</th>
                  <th>Chức vụ</th>
                  <th>Bộ phận</th>
                  <th style={{ width: '100px' }}>Khóa</th>
                  <th style={{ width: '100px' }}>Trạng thái</th>
                  <th style={{ textAlign: 'right', width: '140px' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeaders.map((leader) => (
                  <tr key={leader.id}>
                    <td>
                      {leader.photo_url ? (
                        <img
                          src={leader.photo_url}
                          alt={leader.name}
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '9999px',
                            objectFit: 'cover',
                            border: '1px solid #e2e8f0',
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '9999px',
                            backgroundColor: '#f1f5f9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#94a3b8',
                          }}
                        >
                          <User size={20} />
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{leader.name}</div>
                    </td>
                    <td>
                      <span className="admin-badge admin-badge--hidden">{leader.role}</span>
                    </td>
                    <td>{leader.department_name}</td>
                    <td style={{ fontWeight: 600 }}>{leader.generation || '—'}</td>
                    <td>
                      <span
                        className={`admin-badge ${
                          leader.status === 'published'
                            ? 'admin-badge--published'
                            : 'admin-badge--hidden'
                        }`}
                      >
                        {leader.status === 'published' ? 'Đang hiển thị' : 'Đang ẩn'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(leader)}
                          className="admin-btn admin-btn--secondary"
                          title={leader.status === 'published' ? 'Ẩn khỏi web' : 'Hiển thị'}
                        >
                          {leader.status === 'published' ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(leader)}
                          className="admin-btn admin-btn--secondary"
                          title="Chỉnh sửa"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setLeaderToArchive(leader)}
                          className="admin-btn admin-btn--danger"
                          title="Bỏ khỏi danh sách"
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
                {editingLeader ? 'Chỉnh sửa Nhân sự' : 'Thêm Thành viên mới'}
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
                <label className="admin-label">Họ và tên thành viên</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="admin-input"
                  placeholder="VD: Hoàng Thu Hoài"
                />
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-label">Chức vụ</label>
                  <input
                    type="text"
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="admin-input"
                    placeholder="Chủ nhiệm, Phó ban, Trưởng ban..."
                  />
                </div>

                <div className="admin-form-group">
                  <label htmlFor={departmentId} className="admin-label">Bộ phận / Ban</label>
                  <select
                    id={departmentId}
                    value={departmentName}
                    onChange={(e) => setDepartmentName(e.target.value)}
                    className="admin-select"
                  >
                    {departmentOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-label">Khóa / Nhiệm kỳ (Generation)</label>
                  <input
                    type="text"
                    value={generation}
                    onChange={(e) => setGeneration(e.target.value)}
                    className="admin-input"
                    placeholder="Gen 8, Gen 9, Gen 10..."
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-label">Thứ tự hiển thị</label>
                  <input
                    type="number"
                    min={1}
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    className="admin-input"
                  />
                </div>
              </div>

              <ImageUploadField
                label="Ảnh đại diện (50KB - 500KB)"
                value={photoUrl}
                onChange={(url, meta) => {
                  setPhotoUrl(url)
                  if (meta) {
                    setPhotoMeta({
                      storagePath: meta.storagePath,
                      fileSize: meta.fileSize,
                      mimeType: meta.mimeType,
                    })
                  } else if (!url) {
                    setPhotoMeta({})
                  }
                }}
                folder="leaders"
                slug={name.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'leader'}
              />

              <div className="admin-form-group">
                <label htmlFor={statusId} className="admin-label">Trạng thái</label>
                <select
                  id={statusId}
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="admin-select"
                >
                  <option value="published">Đang hiển thị</option>
                  <option value="hidden">Đang ẩn</option>
                </select>
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
        isOpen={Boolean(leaderToArchive)}
        title="Bỏ nhân sự khỏi danh sách?"
        message={`Bạn có chắc chắn muốn bỏ nhân sự "${leaderToArchive?.name}" (${leaderToArchive?.role}) khỏi danh sách? Dữ liệu sẽ được lưu trữ an toàn thay vì xoá vĩnh viễn.`}
        confirmText="Bỏ khỏi danh sách"
        confirmVariant="danger"
        isLoading={isArchiving}
        onConfirm={handleConfirmArchive}
        onCancel={() => setLeaderToArchive(null)}
      />
    </div>
  )
}
