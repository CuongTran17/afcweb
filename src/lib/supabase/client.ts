import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { getSupabaseConfig } from './env'

let client: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient | null {
  const config = getSupabaseConfig()
  if (!config) return null
  if (!client) {
    client = createClient(config.url, config.publishableKey)
  }
  return client
}

export function resetSupabaseClientForTesting(): void {
  client = null
}
