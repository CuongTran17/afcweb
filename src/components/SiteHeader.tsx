import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'

const links = [
  { to: '/', label: 'Trang chủ' },
  { to: '/co-cau', label: 'Cơ cấu CLB' },
  { to: '/hoat-dong', label: 'Hoạt động' },
]

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  useEffect(() => setOpen(false), [location.pathname])

  useEffect(() => {
    document.body.classList.toggle('menu-open', open)

    return () => document.body.classList.remove('menu-open')
  }, [open])

  return (
    <>
      <header className="site-header">
        <a className="skip-link" href="#main-content">Bỏ qua điều hướng</a>
        <div className="site-header__inner">
          <NavLink className="brand-mark" to="/" aria-label="AFC - CLB Tài chính Kế Toán PTIT">
            <img src="/images/brand/afc-logo-white.png" alt="" />
            <span className="brand-mark__name">AFC - CLB Tài chính Kế Toán PTIT</span>
          </NavLink>

          <button
            className="menu-toggle"
            type="button"
            aria-label={open ? 'Đóng menu' : 'Mở menu'}
            aria-expanded={open}
            aria-controls="primary-navigation"
            onClick={() => setOpen((current) => !current)}
          >
            {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>

          <nav
            id="primary-navigation"
            className={`primary-nav${open ? ' primary-nav--open' : ''}`}
            aria-label="Điều hướng chính"
          >
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) => (isActive ? 'active' : undefined)}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      {open && (
        <button
          className="site-header__backdrop"
          type="button"
          aria-label="Đóng menu ngoài vùng điều hướng"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  )
}
