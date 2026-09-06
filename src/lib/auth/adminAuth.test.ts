import { describe, expect, it, vi } from 'vitest'
import { getCurrentAdmin, signInAdmin, signOutAdmin } from './adminAuth'
import type { SupabaseClient } from '@supabase/supabase-js'

describe('adminAuth', () => {
  it('throws error when auth sign-in fails', async () => {
    const mockClient = {
      auth: {
        signInWithPassword: vi.fn().mockResolvedValue({
          data: { user: null },
          error: new Error('Invalid credentials'),
        }),
      },
    } as unknown as SupabaseClient

    await expect(signInAdmin(mockClient, 'test@afc.vn', 'password')).rejects.toThrow(
      'Email hoặc mật khẩu không chính xác.',
    )
  })

  it('signs out and throws if user has no active admin profile', async () => {
    const signOutMock = vi.fn().mockResolvedValue({})
    const mockClient = {
      auth: {
        signInWithPassword: vi.fn().mockResolvedValue({
          data: { user: { id: 'u123', email: 'test@afc.vn' } },
          error: null,
        }),
        signOut: signOutMock,
      },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: new Error('Not found') }),
          }),
        }),
      }),
    } as unknown as SupabaseClient

    await expect(signInAdmin(mockClient, 'test@afc.vn', 'password')).rejects.toThrow(
      'Tài khoản không có quyền quản trị hoặc đã bị vô hiệu hóa.',
    )
    expect(signOutMock).toHaveBeenCalled()
  })

  it('succeeds when user has active admin profile', async () => {
    const mockProfile = { id: 'u123', email: 'test@afc.vn', full_name: 'Admin User', role: 'admin', is_active: true }
    const mockClient = {
      auth: {
        signInWithPassword: vi.fn().mockResolvedValue({
          data: { user: { id: 'u123', email: 'test@afc.vn' } },
          error: null,
        }),
      },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockProfile, error: null }),
          }),
        }),
      }),
    } as unknown as SupabaseClient

    const result = await signInAdmin(mockClient, 'test@afc.vn', 'password')
    expect(result.profile.full_name).toBe('Admin User')
  })

  it('getCurrentAdmin returns null when no active session', async () => {
    const mockClient = {
      auth: {
        getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      },
    } as unknown as SupabaseClient

    const result = await getCurrentAdmin(mockClient)
    expect(result).toBeNull()
  })
})
