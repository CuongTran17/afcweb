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

  const navItems = [
    { to: '/admin', label: 'Tổng quan', icon: LayoutDashboard, end: true },
    { to: '/admin/banners', label: 'Banner Hero', icon: Image },
    { to: '/admin/events', label: 'Sự kiện & Hoạt động', icon: Calendar },
    { to: '/admin/departments', label: 'Ban Chuyên môn', icon: Layers },
    { to: '/admin/leaders', label: 'Ban Điều hành', icon: Users },
  ]

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar" aria-label="Điều hướng quản trị">
        <Link to="/admin" className="admin-brand">
          <span className="admin-brand__mark">A</span>
          <span>
            <span className="admin-brand__name">AFC Admin</span>
            <span className="admin-brand__caption">Hệ thống nội dung</span>
          </span>
        </Link>

        <nav className="admin-nav">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              to={to}
              end={end}
              key={to}
              className={({ isActive }) =>
                `admin-nav__link ${isActive ? 'admin-nav__link--active' : ''}`
              }
            >
              <Icon size={18} aria-hidden="true" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="admin-workspace">
        <header className="admin-header">
          <div>
            <p className="admin-header__eyebrow">Accounting & Finance Club</p>
            <h1 className="admin-header__title">Bảng quản trị AFC</h1>
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
    </div>
  )
}
