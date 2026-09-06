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
    <div className="admin-login">
      <div className="admin-login__card">
        <div className="admin-login__header">
          <div className="admin-login__icon">
            <Lock size={28} aria-hidden="true" />
          </div>
          <h1>
            Quản trị viên AFC
          </h1>
          <p>
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

        <div className="admin-login__footer">
          <Link to="/">
            <ArrowLeft size={16} aria-hidden="true" />
            Quay lại trang chủ AFC
          </Link>
        </div>
      </div>
    </div>
  )
}
