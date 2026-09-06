import type { SupabaseClient, User } from '@supabase/supabase-js'
import type { SupabaseAdminProfileRow } from '../supabase/types'

export type AdminSession = {
  user: User
  profile: SupabaseAdminProfileRow
}

export async function signInAdmin(
  client: SupabaseClient,
  email: string,
  password: string,
): Promise<AdminSession> {
  const { data: authData, error: authError } = await client.auth.signInWithPassword({
    email: email.trim(),
    password,
  })

  if (authError || !authData.user) {
    throw new Error('Email hoặc mật khẩu không chính xác.')
  }

  // Verify authorization in admin_profiles
  const { data: profile, error: profileError } = await client
    .from('admin_profiles')
    .select('*')
    .eq('id', authData.user.id)
    .single()

  if (profileError || !profile || !profile.is_active) {
    await client.auth.signOut()
    throw new Error('Tài khoản không có quyền quản trị hoặc đã bị vô hiệu hóa.')
  }

  return {
    user: authData.user,
    profile: profile as SupabaseAdminProfileRow,
  }
}

export async function getCurrentAdmin(client: SupabaseClient): Promise<AdminSession | null> {
  const {
    data: { session },
  } = await client.auth.getSession()

  if (!session?.user) return null

  const { data: profile, error } = await client
    .from('admin_profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  if (error || !profile || !profile.is_active) {
    return null
  }

  return {
    user: session.user,
    profile: profile as SupabaseAdminProfileRow,
  }
}

export async function signOutAdmin(client: SupabaseClient): Promise<void> {
  await client.auth.signOut()
}
