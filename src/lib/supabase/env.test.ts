import { describe, expect, it } from 'vitest'
import { getSupabaseConfig } from './env'

describe('supabase env', () => {
  it('returns null when public Supabase env is missing', () => {
    expect(getSupabaseConfig({})).toBeNull()
  })

  it('returns browser-safe Supabase config from Vite env', () => {
    expect(
      getSupabaseConfig({
        VITE_SUPABASE_URL: 'https://example.supabase.co',
        VITE_SUPABASE_PUBLISHABLE_KEY: 'publishable-key',
      }),
    ).toEqual({
      url: 'https://example.supabase.co',
      publishableKey: 'publishable-key',
    })
  })

  it('trims whitespace and returns null if empty string provided', () => {
    expect(
      getSupabaseConfig({
        VITE_SUPABASE_URL: '   ',
        VITE_SUPABASE_PUBLISHABLE_KEY: 'publishable-key',
      }),
    ).toBeNull()
  })
})
