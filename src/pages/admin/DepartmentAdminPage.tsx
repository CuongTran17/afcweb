import { useEffect, useState } from 'react'
import { Plus, Trash2, Save, Loader2, CheckCircle2, Layers } from 'lucide-react'
import {
  createDefaultDepartments,
  listAdminDepartments,
  updateDepartment,
} from '../../lib/content/adminContent'
import { getSupabaseClient } from '../../lib/supabase/client'
import type { SupabaseDepartmentWithResponsibilities } from '../../lib/supabase/types'

export function DepartmentAdminPage() {
  const [departments, setDepartments] = useState<SupabaseDepartmentWithResponsibilities[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [isSeeding, setIsSeeding] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Local editing states per department
  const [formData, setFormData] = useState<
    Record<string, { description: string; responsibilities: string[] }>
  >({})

  const hydrateDepartmentForms = (data: SupabaseDepartmentWithResponsibilities[]) => {
    const initialForm: Record<string, { description: string; responsibilities: string[] }> = {}
    data.forEach((dept) => {
      initialForm[dept.id] = {
        description: dept.description,
        responsibilities: (dept.department_responsibilities || [])
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((r) => r.content),
      }
    })
    setFormData(initialForm)
  }

  const loadDepartments = async () => {
    const supabase = getSupabaseClient()
    if (!supabase) return
    try {
      setIsLoading(true)
      const data = await listAdminDepartments(supabase)
      setDepartments(data)
      hydrateDepartmentForms(data)
    } catch (err: any) {
      setErrorMessage(err?.message || 'Không thể tải danh sách ban chuyên trách.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadDepartments()
  }, [])

  const handleSeedDepartments = async () => {
    const supabase = getSupabaseClient()
    if (!supabase) return

    try {
      setIsSeeding(true)
      setSuccessMessage(null)
      setErrorMessage(null)
      const data = await createDefaultDepartments(supabase)
      setDepartments(data)
      hydrateDepartmentForms(data)
      setSuccessMessage('Đã khởi tạo dữ liệu 4 ban chuyên trách.')
    } catch (err: any) {
      setErrorMessage(err?.message || 'Khởi tạo dữ liệu 4 ban thất bại.')
    } finally {
      setIsSeeding(false)
    }
  }

  const handleDescriptionChange = (deptId: string, desc: string) => {
    setFormData((prev) => ({
      ...prev,
      [deptId]: {
        ...prev[deptId],
        description: desc,
      },
    }))
  }

  const handleAddResponsibility = (deptId: string) => {
    setFormData((prev) => ({
      ...prev,
      [deptId]: {
        ...prev[deptId],
        responsibilities: [...(prev[deptId]?.responsibilities || []), ''],
      },
    }))
  }

  const handleUpdateResponsibility = (deptId: string, index: number, value: string) => {
    setFormData((prev) => {
      const updated = [...(prev[deptId]?.responsibilities || [])]
      updated[index] = value
      return {
        ...prev,
        [deptId]: {
          ...prev[deptId],
          responsibilities: updated,
        },
      }
    })
  }

  const handleRemoveResponsibility = (deptId: string, index: number) => {
    setFormData((prev) => {
      const updated = [...(prev[deptId]?.responsibilities || [])]
      updated.splice(index, 1)
      return {
        ...prev,
        [deptId]: {
          ...prev[deptId],
          responsibilities: updated,
        },
      }
    })
  }

  const handleSaveDepartment = async (dept: SupabaseDepartmentWithResponsibilities) => {
    const supabase = getSupabaseClient()
    if (!supabase) return

    const data = formData[dept.id]
    if (!data) return

    try {
      setSavingId(dept.id)
      setSuccessMessage(null)
      setErrorMessage(null)

      const cleanedResponsibilities = data.responsibilities
        .map((r) => r.trim())
        .filter((r) => r.length > 0)

      await updateDepartment(
        supabase,
        dept.id,
        {
          description: data.description,
        },
        cleanedResponsibilities,
      )

      setSuccessMessage(`Đã lưu thay đổi cho ${dept.name} thành công!`)
      await loadDepartments()
    } catch (err: any) {
      setErrorMessage(err?.message || 'Lưu thông tin ban thất bại.')
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div>
      <div className="admin-card">
        <div className="admin-card__header">
          <div>
            <h2 className="admin-card__title">Quản lý 4 Ban Chuyên trách & Nhiệm vụ</h2>
            <p className="admin-card__desc">
              Chỉnh sửa mô tả ngắn trên thẻ giới thiệu và danh sách nhiệm vụ chi tiết hiển thị trong popup.
            </p>
          </div>
        </div>

        {successMessage && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: '#dcfce7',
              color: '#166534',
              padding: '0.75rem 1rem',
              borderRadius: '0.375rem',
              marginBottom: '1rem',
              fontSize: '0.875rem',
            }}
          >
            <CheckCircle2 size={16} />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div
            style={{
              backgroundColor: '#fee2e2',
              color: '#991b1b',
              padding: '0.75rem 1rem',
              borderRadius: '0.375rem',
              marginBottom: '1rem',
              fontSize: '0.875rem',
            }}
          >
            {errorMessage}
          </div>
        )}

        {isLoading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
            <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto' }} />
            <p style={{ marginTop: '0.5rem' }}>Đang tải thông tin ban chuyên trách...</p>
          </div>
        ) : departments.length === 0 ? (
          <div
            style={{
              padding: '2rem',
              border: '1px dashed #cbd5e1',
              borderRadius: '0.5rem',
              backgroundColor: '#f8fafc',
              textAlign: 'center',
            }}
          >
            <Layers size={28} color="#c92a2a" style={{ margin: '0 auto 0.75rem' }} />
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.125rem', color: '#0f172a' }}>
              Chưa có dữ liệu 4 ban chuyên trách
            </h3>
            <p style={{ margin: '0 auto 1rem', maxWidth: '520px', color: '#64748b', fontSize: '0.875rem' }}>
              Bảng departments trong Supabase đang trống. Khởi tạo dữ liệu mặc định để chỉnh sửa Ban Chuyên môn, Ban Truyền thông, Ban Sự kiện và Ban Đối ngoại.
            </p>
            <button
              type="button"
              className="admin-btn admin-btn--primary"
              onClick={handleSeedDepartments}
              disabled={isSeeding}
              style={{ margin: '0 auto' }}
            >
              {isSeeding ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Đang khởi tạo...</span>
                </>
              ) : (
                <>
                  <Plus size={16} />
                  <span>Khởi tạo dữ liệu 4 ban</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {departments.map((dept) => {
              const currentData = formData[dept.id] || {
                description: dept.description,
                responsibilities: [],
              }
              const isSaving = savingId === dept.id

              return (
                <div
                  key={dept.id}
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.5rem',
                    padding: '1.5rem',
                    backgroundColor: '#ffffff',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '1rem',
                      borderBottom: '1px solid #f1f5f9',
                      paddingBottom: '0.75rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Layers size={20} color="#c92a2a" />
                      <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>
                        {dept.name}
                      </h3>
                      <span className="admin-badge admin-badge--hidden">Mã: {dept.slug}</span>
                    </div>

                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={() => handleSaveDepartment(dept)}
                      className="admin-btn admin-btn--primary"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>Đang lưu...</span>
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          <span>Lưu thay đổi</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-label">
                      Mô tả ngắn (hiển thị trên thẻ trang chủ / cơ cấu)
                    </label>
                    <input
                      type="text"
                      value={currentData.description}
                      onChange={(e) => handleDescriptionChange(dept.id, e.target.value)}
                      className="admin-input"
                    />
                  </div>

                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '0.5rem',
                      }}
                    >
                      <label className="admin-label" style={{ margin: 0 }}>
                        Danh sách nhiệm vụ chi tiết (Popup &quot;Tìm hiểu nhiệm vụ&quot;)
                      </label>
                      <button
                        type="button"
                        onClick={() => handleAddResponsibility(dept.id)}
                        className="admin-btn admin-btn--secondary"
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                      >
                        <Plus size={14} /> Thêm nhiệm vụ
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {currentData.responsibilities.map((resp, index) => (
                        <div key={index} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.8rem', color: '#94a3b8', width: '20px' }}>
                            {index + 1}.
                          </span>
                          <input
                            type="text"
                            value={resp}
                            onChange={(e) =>
                              handleUpdateResponsibility(dept.id, index, e.target.value)
                            }
                            placeholder="Nhập nội dung nhiệm vụ..."
                            className="admin-input"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveResponsibility(dept.id, index)}
                            className="admin-btn admin-btn--secondary"
                            title="Xóa dòng"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                      {currentData.responsibilities.length === 0 && (
                        <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0.25rem 0' }}>
                          Chưa có nhiệm vụ nào. Nhấn &quot;Thêm nhiệm vụ&quot; để tạo.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
