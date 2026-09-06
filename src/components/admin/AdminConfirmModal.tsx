import { AlertTriangle, X } from 'lucide-react'

type AdminConfirmModalProps = {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  confirmVariant?: 'danger' | 'primary'
  onConfirm: () => void | Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function AdminConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  confirmVariant = 'danger',
  onConfirm,
  onCancel,
  isLoading = false,
}: AdminConfirmModalProps) {
  if (!isOpen) return null

  return (
    <div className="admin-modal-backdrop" onClick={onCancel}>
      <div
        className="admin-modal"
        style={{ maxWidth: '440px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: confirmVariant === 'danger' ? '#c92a2a' : '#0f172a',
            }}
          >
            <AlertTriangle size={20} />
            <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700 }}>{title}</h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="admin-btn admin-btn--secondary"
            style={{ padding: '0.25rem' }}
          >
            <X size={16} />
          </button>
        </div>

        <p
          style={{
            color: '#4a5568',
            fontSize: '0.9rem',
            lineHeight: 1.5,
            margin: '0 0 1.5rem',
          }}
        >
          {message}
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="admin-btn admin-btn--secondary"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`admin-btn ${
              confirmVariant === 'danger' ? 'admin-btn--danger' : 'admin-btn--primary'
            }`}
          >
            {isLoading ? 'Đang thực hiện...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
