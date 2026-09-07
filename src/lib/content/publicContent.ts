import type { SupabaseClient } from '@supabase/supabase-js'
import { departments as staticDepartments, type Department } from '../../data/departments'
import { events as staticEvents, type EventItem } from '../../data/events'
import { leadership as staticLeadership, type Leader } from '../../data/leadership'
import { getSupabaseClient } from '../supabase/client'
import type {
  SupabaseBannerRow,
  SupabaseDepartmentWithResponsibilities,
  SupabaseEventWithImages,
  SupabaseLeaderRow,
} from '../supabase/types'
import {
  mapDepartmentRowsToDepartments,
  mapEventRowsToEventItems,
  mapLeaderRowsToLeadership,
} from './contentMapping'

export type BannerItem = {
  id: string
  title: string
  subtitle?: string
  imageUrl: string
  linkUrl?: string
  sortOrder: number
}

const defaultFeaturedIds = ['trading-challenge-2026', 'youth-camp-2026', 'biggame-2026']

export async function getPublicBanners(
  client?: SupabaseClient | null,
): Promise<BannerItem[]> {
  const supabase = client ?? getSupabaseClient()
  if (!supabase) return []

  try {
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .eq('status', 'published')
      .order('sort_order', { ascending: true })

    if (error || !data || data.length === 0) {
      return []
    }

    return (data as SupabaseBannerRow[]).map((row) => ({
      id: row.id,
      title: row.title,
      subtitle: row.subtitle || undefined,
      imageUrl: row.image_url,
      linkUrl: row.link_url || undefined,
      sortOrder: row.sort_order,
    }))
  } catch {
    return []
  }
}

export async function getPublicEvents(
  client?: SupabaseClient | null,
): Promise<EventItem[]> {
  const supabase = client ?? getSupabaseClient()
  if (!supabase) return staticEvents

  try {
    const { data, error } = await supabase
      .from('events')
      .select('*, event_images(*)')
      .eq('status', 'published')
      .order('sort_order', { ascending: true })

    if (error || !data || data.length === 0) {
      return staticEvents
    }

    return mapEventRowsToEventItems(data as SupabaseEventWithImages[])
  } catch {
    return staticEvents
  }
}

export async function getPublicEventBySlug(
  slug: string,
  client?: SupabaseClient | null,
): Promise<EventItem | null> {
  const supabase = client ?? getSupabaseClient()
  const staticEvent = staticEvents.find((event) => event.id === slug) || null
  if (!supabase) return staticEvent

  try {
    const { data, error } = await supabase
      .from('events')
      .select('*, event_images(*)')
      .eq('status', 'published')
      .eq('slug', slug)
      .single()

    if (error || !data) return staticEvent

    return mapEventRowsToEventItems([data as SupabaseEventWithImages])[0] || staticEvent
  } catch {
    return staticEvent
  }
}

export async function getFeaturedHomeEvents(
  client?: SupabaseClient | null,
): Promise<EventItem[]> {
  const supabase = client ?? getSupabaseClient()
  const staticFeatured = staticEvents.filter((e) =>
    defaultFeaturedIds.includes(e.id) || e.featured,
  )

  if (!supabase) return staticFeatured

  try {
    const { data, error } = await supabase
      .from('events')
      .select('*, event_images(*)')
      .eq('status', 'published')
      .eq('featured_home', true)
      .order('sort_order', { ascending: true })

    if (error || !data || data.length === 0) {
      return staticFeatured
    }

    return mapEventRowsToEventItems(data as SupabaseEventWithImages[])
  } catch {
    return staticFeatured
  }
}

export async function getPublicDepartments(
  client?: SupabaseClient | null,
): Promise<Department[]> {
  const supabase = client ?? getSupabaseClient()
  if (!supabase) return staticDepartments

  try {
    const { data, error } = await supabase
      .from('departments')
      .select('*, department_responsibilities(*)')
      .eq('status', 'published')
      .order('sort_order', { ascending: true })

    if (error || !data || data.length === 0) {
      return staticDepartments
    }

    return mapDepartmentRowsToDepartments(data as SupabaseDepartmentWithResponsibilities[])
  } catch {
    return staticDepartments
  }
}

export async function getPublicLeadership(
  client?: SupabaseClient | null,
  generation?: string,
): Promise<Leader[]> {
  const supabase = client ?? getSupabaseClient()
  if (!supabase) {
    if (generation) {
      return staticLeadership.filter((l) => l.cohort === generation)
    }
    return staticLeadership
  }

  try {
    let query = supabase
      .from('leaders')
      .select('*')
      .eq('status', 'published')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (generation) {
      query = query.eq('generation', generation)
    }

    const { data, error } = await query

    if (error || !data || data.length === 0) {
      if (generation) {
        return staticLeadership.filter((l) => l.cohort === generation)
      }
      return staticLeadership
    }

    return mapLeaderRowsToLeadership(data as SupabaseLeaderRow[])
  } catch {
    if (generation) {
      return staticLeadership.filter((l) => l.cohort === generation)
    }
    return staticLeadership
  }
}

export async function getAvailableGenerations(
  client?: SupabaseClient | null,
): Promise<string[]> {
  const supabase = client ?? getSupabaseClient()
  if (!supabase) return []

  try {
    const { data, error } = await supabase
      .from('leaders')
      .select('generation')
      .eq('status', 'published')
      .eq('is_active', true)

    if (error || !data) return []

    const gens = Array.from(
      new Set(
        data
          .map((d: { generation: string | null }) => d.generation)
          .filter((g): g is string => typeof g === 'string' && g.trim().length > 0),
      ),
    ).sort()

    return gens
  } catch {
    return []
  }
}
