import { useState, type FormEvent } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Lock, Mail, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react'
import { signInAdmin } from '../../lib/auth/adminAuth'
import { getSupabaseClient } from '../../lib/supabase/client'
import { isSupabaseConfigured } from '../../lib/supabase/env'
import '../../styles/admin.css'

export function AdminLoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const from = (location.state as any)?.from?.pathname || '/admin'
  const isConfigured = isSupabaseConfigured()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!isConfigured) {
      setError('Hệ thống chưa được cấu hình biến môi trường Supabase.')
      return
    }

    const supabase = getSupabaseClient()
    if (!supabase) {
      setError('Không thể kết nối Supabase.')
      return
    }

    try {
      setIsLoading(true)
      await signInAdmin(supabase, email, password)
      navigate(from, { replace: true })
    } catch (err: any) {
      setError(err?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '0.75rem',
          maxWidth: '420px',
          width: '100%',
          padding: '2.5rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              display: 'inline-flex',
              padding: '0.75rem',
              backgroundColor: '#fee2e2',
              borderRadius: '9999px',
              color: '#c92a2a',
              marginBottom: '1rem',
            }}
          >
            <Lock size={28} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Quản trị viên AFC
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.5rem' }}>
            Đăng nhập hệ thống quản lý nội dung CLB
          </p>
        </div>

        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: '#fee2e2',
              color: '#991b1b',
              padding: '0.75rem',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              marginBottom: '1.25rem',
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="admin-form-group">
            <label className="admin-label" htmlFor="admin-email">
              Email quản trị
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="admin-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@afc.ptit.edu.vn"
                className="admin-input"
                style={{ paddingLeft: '2.5rem' }}
              />
              <Mail
                size={16}
                style={{
                  position: 'absolute',
                  left: '0.875rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8',
                }}
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label className="admin-label" htmlFor="admin-password">
              Mật khẩu
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="admin-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="admin-input"
                style={{ paddingLeft: '2.5rem' }}
              />
              <Lock
                size={16}
                style={{
                  position: 'absolute',
                  left: '0.875rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8',
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="admin-btn admin-btn--primary"
            style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', marginTop: '0.5rem' }}
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Đang xác thực...</span>
              </>
            ) : (
              <span>Đăng nhập</span>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.875rem',
              color: '#64748b',
              textDecoration: 'none',
            }}
          >
            <ArrowLeft size={16} />
            Quay lại trang chủ AFC
          </Link>
        </div>
      </div>
    </div>
  )
}
