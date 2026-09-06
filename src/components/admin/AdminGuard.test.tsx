import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AdminGuard } from './AdminGuard'
import * as envModule from '../../lib/supabase/env'
import * as authModule from '../../lib/auth/adminAuth'
import * as clientModule from '../../lib/supabase/client'

describe('AdminGuard', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('renders unconfigured warning when Supabase is not configured', async () => {
    vi.spyOn(envModule, 'isSupabaseConfigured').mockReturnValue(false)

    render(
      <MemoryRouter>
        <AdminGuard>
          <div>Protected Content</div>
        </AdminGuard>
      </MemoryRouter>,
    )

    expect(await screen.findByText(/Chưa cấu hình Supabase/i)).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('redirects to /admin/login when user is not logged in', async () => {
    vi.spyOn(envModule, 'isSupabaseConfigured').mockReturnValue(true)
    vi.spyOn(clientModule, 'getSupabaseClient').mockReturnValue({
      auth: {
        onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
      },
    } as any)
    vi.spyOn(authModule, 'getCurrentAdmin').mockResolvedValue(null)

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route
            path="/admin"
            element={
              <AdminGuard>
                <div>Protected Content</div>
              </AdminGuard>
            }
          />
          <Route path="/admin/login" element={<div>Admin Login Page</div>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByText('Admin Login Page')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('renders protected content when user is logged in as admin', async () => {
    vi.spyOn(envModule, 'isSupabaseConfigured').mockReturnValue(true)
    vi.spyOn(clientModule, 'getSupabaseClient').mockReturnValue({
      auth: {
        onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
      },
    } as any)
    vi.spyOn(authModule, 'getCurrentAdmin').mockResolvedValue({
      user: { id: 'u1' } as any,
      profile: { id: 'u1', full_name: 'Super Admin', email: 'admin@afc.vn', role: 'admin', is_active: true } as any,
    })

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route
            path="/admin"
            element={
              <AdminGuard>
                <div>Protected Content</div>
              </AdminGuard>
            }
          />
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByText('Protected Content')).toBeInTheDocument()
  })
})
