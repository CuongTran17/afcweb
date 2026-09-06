import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  SupabaseBannerInsert,
  SupabaseBannerRow,
  SupabaseDepartmentInsert,
  SupabaseDepartmentRow,
  SupabaseDepartmentWithResponsibilities,
  SupabaseEventImageInsert,
  SupabaseEventInsert,
  SupabaseEventRow,
  SupabaseEventWithImages,
  SupabaseLeaderInsert,
  SupabaseLeaderRow,
} from '../supabase/types'

// Banners
export async function listAdminBanners(client: SupabaseClient): Promise<SupabaseBannerRow[]> {
  const { data, error } = await client
    .from('banners')
    .select('*')
    .neq('status', 'archived')
    .order('sort_order', { ascending: true })

  if (error) throw error
  return (data as SupabaseBannerRow[]) || []
}

export async function createBanner(
  client: SupabaseClient,
  payload: SupabaseBannerInsert,
): Promise<SupabaseBannerRow> {
  const { data, error } = await client
    .from('banners')
    .insert([payload])
    .select()
    .single()

  if (error) throw error
  return data as SupabaseBannerRow
}

export async function updateBanner(
  client: SupabaseClient,
  id: string,
  payload: Partial<SupabaseBannerInsert>,
): Promise<SupabaseBannerRow> {
  const { data, error } = await client
    .from('banners')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as SupabaseBannerRow
}

export async function setBannerStatus(
  client: SupabaseClient,
  id: string,
  status: 'published' | 'hidden' | 'archived',
): Promise<void> {
  const { error } = await client
    .from('banners')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error
}

export type EventImageInput = {
  image_url: string
  storage_path: string
  alt: string
  file_size: number
  mime_type: string
}

function toImagePayload(
  img: EventImageInput,
  eventId: string,
  idx: number,
): SupabaseEventImageInsert {
  return {
    event_id: eventId,
    image_url: img.image_url,
    storage_path: img.storage_path,
    alt: img.alt,
    file_size: img.file_size,
    mime_type: img.mime_type,
    sort_order: idx + 1,
    status: 'published',
  }
}

// Events
export async function listAdminEvents(client: SupabaseClient): Promise<SupabaseEventWithImages[]> {
  const { data, error } = await client
    .from('events')
    .select('*, event_images(*)')
    .neq('status', 'archived')
    .order('sort_order', { ascending: true })

  if (error) throw error
  return ((data as SupabaseEventWithImages[]) || []).map((evt) => ({
    ...evt,
    event_images: (evt.event_images || []).filter((img) => img.status !== 'archived'),
  }))
}

export async function createEvent(
  client: SupabaseClient,
  payload: SupabaseEventInsert,
  images?: EventImageInput[],
): Promise<SupabaseEventRow> {
  const { data, error } = await client
    .from('events')
    .insert([payload])
    .select()
    .single()

  if (error) throw error

  if (images && images.length > 0) {
    const imagePayloads = images.map((img, idx) => toImagePayload(img, data.id, idx))
    const { error: imgError } = await client.from('event_images').insert(imagePayloads)
    if (imgError) throw imgError
  }

  return data as SupabaseEventRow
}

export async function updateEvent(
  client: SupabaseClient,
  id: string,
  payload: Partial<SupabaseEventInsert>,
  images?: EventImageInput[],
): Promise<SupabaseEventRow> {
  const { data, error } = await client
    .from('events')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  if (images !== undefined) {
    // Soft archive previous images (no hard delete)
    await client
      .from('event_images')
      .update({ status: 'archived', updated_at: new Date().toISOString() })
      .eq('event_id', id)
      .neq('status', 'archived')

    if (images.length > 0) {
      const imagePayloads = images.map((img, idx) => toImagePayload(img, id, idx))
      const { error: imgError } = await client.from('event_images').insert(imagePayloads)
      if (imgError) throw imgError
    }
  }

  return data as SupabaseEventRow
}

export async function setEventStatus(
  client: SupabaseClient,
  id: string,
  status: 'draft' | 'published' | 'hidden' | 'archived',
): Promise<void> {
  const { error } = await client
    .from('events')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error
}

export async function toggleEventFeaturedHome(
  client: SupabaseClient,
  id: string,
  featured_home: boolean,
): Promise<void> {
  const { error } = await client
    .from('events')
    .update({ featured_home, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error
}

// Departments
export async function listAdminDepartments(
  client: SupabaseClient,
): Promise<SupabaseDepartmentWithResponsibilities[]> {
  const { data, error } = await client
    .from('departments')
    .select('*, department_responsibilities(*)')
    .order('sort_order', { ascending: true })

  if (error) throw error
  return ((data as SupabaseDepartmentWithResponsibilities[]) || []).map((dept) => ({
    ...dept,
    department_responsibilities: (dept.department_responsibilities || []).filter(
      (r) => r.status !== 'archived',
    ),
  }))
}

export async function updateDepartment(
  client: SupabaseClient,
  id: string,
  payload: Partial<SupabaseDepartmentInsert>,
  responsibilities?: string[],
): Promise<void> {
  const { error } = await client
    .from('departments')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error

  if (responsibilities !== undefined) {
    // Soft archive previous responsibilities (no hard delete)
    await client
      .from('department_responsibilities')
      .update({ status: 'archived', updated_at: new Date().toISOString() })
      .eq('department_id', id)
      .neq('status', 'archived')

    if (responsibilities.length > 0) {
      const respPayloads = responsibilities.map((content, idx) => ({
        department_id: id,
        content,
        sort_order: idx + 1,
        status: 'published',
      }))
      const { error: respError } = await client
        .from('department_responsibilities')
        .insert(respPayloads)
      if (respError) throw respError
    }
  }
}

// Leaders
export async function listAdminLeaders(
  client: SupabaseClient,
  generation?: string,
): Promise<SupabaseLeaderRow[]> {
  let query = client
    .from('leaders')
    .select('*')
    .neq('status', 'archived')
    .order('sort_order', { ascending: true })

  if (generation) {
    query = query.eq('generation', generation)
  }

  const { data, error } = await query
  if (error) throw error
  return (data as SupabaseLeaderRow[]) || []
}

export async function createLeader(
  client: SupabaseClient,
  payload: SupabaseLeaderInsert,
): Promise<SupabaseLeaderRow> {
  const { data, error } = await client
    .from('leaders')
    .insert([payload])
    .select()
    .single()

  if (error) throw error
  return data as SupabaseLeaderRow
}

export async function updateLeader(
  client: SupabaseClient,
  id: string,
  payload: Partial<SupabaseLeaderInsert>,
): Promise<SupabaseLeaderRow> {
  const { data, error } = await client
    .from('leaders')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as SupabaseLeaderRow
}

export async function setLeaderStatus(
  client: SupabaseClient,
  id: string,
  status: 'published' | 'hidden' | 'archived',
): Promise<void> {
  const { error } = await client
    .from('leaders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error
}
