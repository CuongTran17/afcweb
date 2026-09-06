import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Image, Calendar, Layers, Users, ArrowUpRight, CheckCircle2, ShieldCheck } from 'lucide-react'
import { getSupabaseClient } from '../../lib/supabase/client'

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
      <div className="admin-card" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#ffffff' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <ShieldCheck size={20} color="#4ade80" />
              <span style={{ fontSize: '0.875rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Hệ thống Quản trị Nội dung AFC
              </span>
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.5rem', color: '#ffffff' }}>
              Bảng điều khiển Trung tâm
            </h1>
            <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.95rem' }}>
              Cập nhật bài viết, sự kiện, hình ảnh trang chủ, cơ cấu ban chuyên trách và danh sách ban điều hành theo nhiệm kỳ.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255, 255, 255, 0.1)', padding: '0.5rem 1rem', borderRadius: '0.5rem' }}>
            <CheckCircle2 size={16} color="#4ade80" />
            <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Supabase: Đã kết nối</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="admin-card" style={{ margin: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#64748b', marginBottom: '1rem' }}>
              <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Banner Hero</span>
              <Image size={20} color="#c92a2a" />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>
              {isLoading ? '...' : stats.banners}
            </div>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>
              Banner hiển thị trang đầu
            </p>
          </div>
          <Link
            to="/admin/banners"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              marginTop: '1.25rem',
              color: '#c92a2a',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '0.875rem',
            }}
          >
            Quản lý Banner <ArrowUpRight size={16} />
          </Link>
        </div>

        <div className="admin-card" style={{ margin: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#64748b', marginBottom: '1rem' }}>
              <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Sự kiện & Hoạt động</span>
              <Calendar size={20} color="#c92a2a" />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>
              {isLoading ? '...' : stats.events}
            </div>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>
              Bài viết, dấu ấn nổi bật
            </p>
          </div>
          <Link
            to="/admin/events"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              marginTop: '1.25rem',
              color: '#c92a2a',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '0.875rem',
            }}
          >
            Quản lý Sự kiện <ArrowUpRight size={16} />
          </Link>
        </div>

        <div className="admin-card" style={{ margin: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#64748b', marginBottom: '1rem' }}>
              <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Ban Chuyên trách</span>
              <Layers size={20} color="#c92a2a" />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>
              4
            </div>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>
              Mô tả và danh mục nhiệm vụ
            </p>
          </div>
          <Link
            to="/admin/departments"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              marginTop: '1.25rem',
              color: '#c92a2a',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '0.875rem',
            }}
          >
            Cập nhật Nhiệm vụ <ArrowUpRight size={16} />
          </Link>
        </div>

        <div className="admin-card" style={{ margin: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#64748b', marginBottom: '1rem' }}>
              <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Ban Điều hành</span>
              <Users size={20} color="#c92a2a" />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>
              {isLoading ? '...' : stats.leaders}
            </div>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>
              Thành viên theo nhiệm kỳ
            </p>
          </div>
          <Link
            to="/admin/leaders"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              marginTop: '1.25rem',
              color: '#c92a2a',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '0.875rem',
            }}
          >
            Quản lý Nhân sự <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  )
}
