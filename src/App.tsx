import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { SiteFooter } from './components/SiteFooter'
import { SiteHeader } from './components/SiteHeader'
import { ActivitiesPage } from './pages/ActivitiesPage'
import { EventDetailPage } from './pages/EventDetailPage'
import { HomePage } from './pages/HomePage'
import { StructurePage } from './pages/StructurePage'

const AdminLoginPage = lazy(() =>
  import('./pages/admin/AdminLoginPage').then((m) => ({ default: m.AdminLoginPage })),
)
const AdminGuard = lazy(() =>
  import('./components/admin/AdminGuard').then((m) => ({ default: m.AdminGuard })),
)
const AdminLayout = lazy(() =>
  import('./components/admin/AdminLayout').then((m) => ({ default: m.AdminLayout })),
)
const AdminDashboardPage = lazy(() =>
  import('./pages/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })),
)
const BannerAdminPage = lazy(() =>
  import('./pages/admin/BannerAdminPage').then((m) => ({ default: m.BannerAdminPage })),
)
const EventAdminPage = lazy(() =>
  import('./pages/admin/EventAdminPage').then((m) => ({ default: m.EventAdminPage })),
)
const DepartmentAdminPage = lazy(() =>
  import('./pages/admin/DepartmentAdminPage').then((m) => ({ default: m.DepartmentAdminPage })),
)
const LeaderAdminPage = lazy(() =>
  import('./pages/admin/LeaderAdminPage').then((m) => ({ default: m.LeaderAdminPage })),
)

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <SiteHeader />
      {children}
      <SiteFooter />
    </div>
  )
}

function AdminSuspense({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
          Đang tải trang quản trị...
        </div>
      }
    >
      {children}
    </Suspense>
  )
}

export default function App() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route
        path="/"
        element={
          <PublicLayout>
            <HomePage />
          </PublicLayout>
        }
      />
      <Route
        path="/co-cau"
        element={
          <PublicLayout>
            <StructurePage />
          </PublicLayout>
        }
      />
      <Route
        path="/hoat-dong"
        element={
          <PublicLayout>
            <ActivitiesPage />
          </PublicLayout>
        }
      />
      <Route
        path="/hoat-dong/:slug"
        element={
          <PublicLayout>
            <EventDetailPage />
          </PublicLayout>
        }
      />

      {/* Admin Auth (No Registration) */}
      <Route
        path="/admin/login"
        element={
          <AdminSuspense>
            <AdminLoginPage />
          </AdminSuspense>
        }
      />

      {/* Protected Admin Portal */}
      <Route
        path="/admin"
        element={
          <AdminSuspense>
            <AdminGuard>
              <AdminLayout />
            </AdminGuard>
          </AdminSuspense>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="banners" element={<BannerAdminPage />} />
        <Route path="events" element={<EventAdminPage />} />
        <Route path="departments" element={<DepartmentAdminPage />} />
        <Route path="leaders" element={<LeaderAdminPage />} />
      </Route>
    </Routes>
  )
}
