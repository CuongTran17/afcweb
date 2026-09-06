import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LogOut, Home, Image, Calendar, Layers, Users, LayoutDashboard } from 'lucide-react'
import { signOutAdmin } from '../../lib/auth/adminAuth'
import { getSupabaseClient } from '../../lib/supabase/client'
import '../../styles/admin.css'

export function AdminLayout() {
  const navigate = useNavigate()

  const handleSignOut = async () => {
    const supabase = getSupabaseClient()
    if (supabase) {
      await signOutAdmin(supabase)
    }
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <Link to="/admin" className="admin-brand">
            <span>AFC Admin</span>
            <span className="admin-brand__badge">Hệ thống</span>
          </Link>

          <nav className="admin-nav">
            <NavLink
              to="/admin"
              end
              className={({ isActive }) =>
                `admin-nav__link ${isActive ? 'admin-nav__link--active' : ''}`
              }
            >
              <LayoutDashboard size={16} style={{ display: 'inline', marginRight: '0.35rem', verticalAlign: 'middle' }} />
              Tổng quan
            </NavLink>
            <NavLink
              to="/admin/banners"
              className={({ isActive }) =>
                `admin-nav__link ${isActive ? 'admin-nav__link--active' : ''}`
              }
            >
              <Image size={16} style={{ display: 'inline', marginRight: '0.35rem', verticalAlign: 'middle' }} />
              Banner Hero
            </NavLink>
            <NavLink
              to="/admin/events"
              className={({ isActive }) =>
                `admin-nav__link ${isActive ? 'admin-nav__link--active' : ''}`
              }
            >
              <Calendar size={16} style={{ display: 'inline', marginRight: '0.35rem', verticalAlign: 'middle' }} />
              Sự kiện & Hoạt động
            </NavLink>
            <NavLink
              to="/admin/departments"
              className={({ isActive }) =>
                `admin-nav__link ${isActive ? 'admin-nav__link--active' : ''}`
              }
            >
              <Layers size={16} style={{ display: 'inline', marginRight: '0.35rem', verticalAlign: 'middle' }} />
              Ban Chuyên môn
            </NavLink>
            <NavLink
              to="/admin/leaders"
              className={({ isActive }) =>
                `admin-nav__link ${isActive ? 'admin-nav__link--active' : ''}`
              }
            >
              <Users size={16} style={{ display: 'inline', marginRight: '0.35rem', verticalAlign: 'middle' }} />
              Ban Điều hành
            </NavLink>
          </nav>
        </div>

        <div className="admin-header__actions">
          <Link to="/" target="_blank" rel="noopener noreferrer" className="admin-btn admin-btn--outline-light">
            <Home size={15} />
            Xem trang web
          </Link>
          <button type="button" onClick={handleSignOut} className="admin-btn admin-btn--danger">
            <LogOut size={15} />
            Đăng xuất
          </button>
        </div>
      </header>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  )
}
