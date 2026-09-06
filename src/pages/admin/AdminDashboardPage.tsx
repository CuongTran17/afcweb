import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Image, Calendar, Layers, Users, ArrowUpRight, CheckCircle2, ShieldCheck } from 'lucide-react'
import { getSupabaseClient } from '../../lib/supabase/client'

const dashboardCards = [
  {
    key: 'banners',
    label: 'Banner Hero',
    description: 'Banner hiển thị trang đầu',
    to: '/admin/banners',
    action: 'Quản lý Banner',
    icon: Image,
  },
  {
    key: 'events',
    label: 'Sự kiện & Hoạt động',
    description: 'Bài viết, dấu ấn nổi bật',
    to: '/admin/events',
    action: 'Quản lý Sự kiện',
    icon: Calendar,
  },
  {
    key: 'departments',
    label: 'Ban Chuyên trách',
    description: 'Mô tả và danh mục nhiệm vụ',
    to: '/admin/departments',
    action: 'Cập nhật Nhiệm vụ',
    icon: Layers,
  },
  {
    key: 'leaders',
    label: 'Ban Điều hành',
    description: 'Thành viên theo nhiệm kỳ',
    to: '/admin/leaders',
    action: 'Quản lý Nhân sự',
    icon: Users,
  },
] as const

export function AdminDashboardPage() {
  const [stats, setStats] = useState({
    banners: 0,
    events: 0,
    departments: 4,
    leaders: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const supabase = getSupabaseClient()
    if (!supabase) {
      setIsLoading(false)
      return
    }

    Promise.all([
      supabase.from('banners').select('id', { count: 'exact', head: true }).neq('status', 'archived'),
      supabase.from('events').select('id', { count: 'exact', head: true }).neq('status', 'archived'),
      supabase.from('leaders').select('id', { count: 'exact', head: true }).neq('status', 'archived'),
    ])
      .then(([bannersRes, eventsRes, leadersRes]) => {
        setStats({
          banners: bannersRes.count || 0,
          events: eventsRes.count || 0,
          departments: 4,
          leaders: leadersRes.count || 0,
        })
        setIsLoading(false)
      })
      .catch(() => setIsLoading(false))
  }, [])

  return (
    <div>
      <div className="admin-card admin-dashboard-hero">
        <div className="admin-dashboard-hero__inner">
          <div>
            <div className="admin-dashboard-hero__badge">
              <ShieldCheck size={20} aria-hidden="true" />
              <span>
                Hệ thống Quản trị Nội dung AFC
              </span>
            </div>
            <h2>
              Bảng điều khiển Trung tâm
            </h2>
            <p>
              Cập nhật bài viết, sự kiện, hình ảnh trang chủ, cơ cấu ban chuyên trách và danh sách ban điều hành theo nhiệm kỳ.
            </p>
          </div>
          <div className="admin-connection-pill">
            <CheckCircle2 size={16} aria-hidden="true" />
            <span>Supabase: Đã kết nối</span>
          </div>
        </div>
      </div>

      <div className="admin-stat-grid">
        {dashboardCards.map(({ key, label, description, to, action, icon: Icon }) => (
          <div className="admin-card admin-stat-card" key={key}>
            <div>
              <div className="admin-stat-card__top">
                <span className="admin-stat-card__label">{label}</span>
                <span className="admin-stat-card__icon">
                  <Icon size={20} aria-hidden="true" />
                </span>
              </div>
              <div className="admin-stat-card__value">
                {isLoading ? '...' : stats[key]}
              </div>
              <p className="admin-stat-card__desc">{description}</p>
            </div>
            <Link to={to} className="admin-stat-card__link">
              {action} <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
