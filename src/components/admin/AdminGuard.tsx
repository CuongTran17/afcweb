import { useEffect, useState, type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { getCurrentAdmin, type AdminSession } from '../../lib/auth/adminAuth'
import { getSupabaseClient } from '../../lib/supabase/client'
import { isSupabaseConfigured } from '../../lib/supabase/env'

type AdminGuardProps = {
  children?: ReactNode
}

export function AdminGuard({ children }: AdminGuardProps) {
  const location = useLocation()
  const [session, setSession] = useState<AdminSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [configured, setConfigured] = useState(true)

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setConfigured(false)
      setIsLoading(false)
      return
    }

    const supabase = getSupabaseClient()
    if (!supabase) {
      setConfigured(false)
      setIsLoading(false)
      return
    }

    let isMounted = true

    getCurrentAdmin(supabase)
      .then((admin) => {
        if (isMounted) {
          setSession(admin)
          setIsLoading(false)
        }
      })
      .catch(() => {
        if (isMounted) {
          setSession(null)
          setIsLoading(false)
        }
      })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (!isMounted) return
      if (!newSession?.user) {
        setSession(null)
        return
      }
      const admin = await getCurrentAdmin(supabase)
      if (isMounted) {
        setSession(admin)
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  if (!configured) {
    return (
      <div className="admin-unconfigured-container" style={{ padding: '2rem', maxWidth: '600px', margin: '4rem auto', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#c53030' }}>Chưa cấu hình Supabase</h2>
        <p style={{ color: '#4a5568', lineHeight: 1.6 }}>
          Để sử dụng bảng quản trị AFC Admin, bạn cần cấu hình các biến môi trường <code>VITE_SUPABASE_URL</code> và <code>VITE_SUPABASE_PUBLISHABLE_KEY</code> trong tệp <code>.env</code>.
        </p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#718096' }}>
        <p>Đang kiểm tra quyền truy cập hệ thống...</p>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
