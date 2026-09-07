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

export const defaultDepartmentSeeds = [
  {
    slug: 'chuyen-mon',
    name: 'Ban Chuyên môn',
    description: 'Phụ trách nội dung học thuật và chuyên môn của CLB.',
    icon_key: 'BookOpenCheck',
    sort_order: 1,
    responsibilities: [
      'Xây dựng nội dung học thuật, tài liệu và các chủ đề chuyên môn cho CLB.',
      'Phối hợp phát triển nội dung cho các chương trình, cuộc thi và hoạt động của Khoa.',
      'Hỗ trợ thành viên nâng cao kiến thức và kỹ năng chuyên môn.',
    ],
  },
  {
    slug: 'truyen-thong',
    name: 'Ban Truyền thông',
    description: 'Xây dựng hình ảnh và truyền tải các hoạt động của AFC.',
    icon_key: 'Megaphone',
    sort_order: 2,
    responsibilities: [
      'Xây dựng nội dung và hình ảnh truyền thông cho các hoạt động của AFC.',
      'Quản lý các kênh truyền thông và duy trì hình ảnh của CLB.',
      'Phụ trách thiết kế, chụp ảnh, quay phim và sản xuất nội dung truyền thông.',
    ],
  },
  {
    slug: 'su-kien',
    name: 'Ban Sự kiện',
    description: 'Lên kế hoạch và triển khai các chương trình, sự kiện của CLB.',
    icon_key: 'CalendarCheck2',
    sort_order: 3,
    responsibilities: [
      'Lập kế hoạch và triển khai các chương trình, sự kiện của CLB.',
      'Xây dựng kịch bản, timeline và phương án vận hành chương trình.',
      'Phụ trách hậu cần, nhân sự và phối hợp các bộ phận trong quá trình tổ chức.',
    ],
  },
  {
    slug: 'doi-ngoai',
    name: 'Ban Đối ngoại',
    description: 'Kết nối đối tác và mở rộng nguồn lực cho các hoạt động của AFC.',
    icon_key: 'Handshake',
    sort_order: 4,
    responsibilities: [
      'Tìm kiếm và kết nối với đối tác, diễn giả và các đơn vị bên ngoài.',
      'Phối hợp xây dựng quyền lợi và duy trì mối quan hệ với các đối tác.',
      'Hỗ trợ huy động nguồn lực cho các chương trình và hoạt động của AFC.',
    ],
  },
] as const

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

export async function getAdminEventBySlug(
  client: SupabaseClient,
  slug: string,
): Promise<SupabaseEventWithImages | null> {
  const { data, error } = await client
    .from('events')
    .select('*, event_images(*)')
    .eq('slug', slug)
    .neq('status', 'archived')
    .single()

  if (error) throw error
  if (!data) return null

  const event = data as SupabaseEventWithImages
  return {
    ...event,
    event_images: (event.event_images || []).filter((img) => img.status !== 'archived'),
  }
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

export async function createDefaultDepartments(
  client: SupabaseClient,
): Promise<SupabaseDepartmentWithResponsibilities[]> {
  const departmentPayloads = defaultDepartmentSeeds.map((dept) => ({
    slug: dept.slug,
    name: dept.name,
    description: dept.description,
    icon_key: dept.icon_key,
    sort_order: dept.sort_order,
    status: 'published' as const,
  }))

  const { data: upsertedDepartments, error } = await client
    .from('departments')
    .upsert(departmentPayloads, { onConflict: 'slug' })
    .select('*')

  if (error) throw error

  const departments = (upsertedDepartments as SupabaseDepartmentRow[]) || []

  for (const dept of departments) {
    const seed = defaultDepartmentSeeds.find((item) => item.slug === dept.slug)
    if (!seed) continue

    const { data: existingResponsibilities, error: existingError } = await client
      .from('department_responsibilities')
      .select('content')
      .eq('department_id', dept.id)
      .neq('status', 'archived')

    if (existingError) throw existingError

    const existingContent = new Set(
      ((existingResponsibilities as Array<{ content: string }> | null) || []).map((item) =>
        item.content.trim(),
      ),
    )

    const missingResponsibilities = seed.responsibilities
      .filter((content) => !existingContent.has(content))
      .map((content, index) => ({
        department_id: dept.id,
        content,
        sort_order: index + 1,
        status: 'published' as const,
      }))

    if (missingResponsibilities.length > 0) {
      const { error: insertError } = await client
        .from('department_responsibilities')
        .insert(missingResponsibilities)

      if (insertError) throw insertError
    }
  }

  return listAdminDepartments(client)
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
