export type SupabaseConfig = {
  url: string
  publishableKey: string
}

type EnvShape = Record<string, string | undefined>

export function getSupabaseConfig(env: EnvShape = import.meta.env): SupabaseConfig | null {
  const url = env.VITE_SUPABASE_URL?.trim()
  const publishableKey = env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()

  if (!url || !publishableKey) return null

  return { url, publishableKey }
}

export function isSupabaseConfigured(env: EnvShape = import.meta.env): boolean {
  return getSupabaseConfig(env) !== null
}
