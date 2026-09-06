import type { EventCategory } from '../../data/events'

export type ContentStatus = 'draft' | 'published' | 'hidden' | 'archived'

export type SupabaseAdminProfileRow = {
  id: string
  display_name: string
  role: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export type SupabaseBannerRow = {
  id: string
  title: string
  subtitle: string | null
  link_url: string | null
  image_url: string
  storage_path: string
  alt: string
  object_position: string
  file_size: number
  mime_type: string
  sort_order: number
  status: ContentStatus
  created_at: string
  updated_at: string
}

export type SupabaseBannerInsert = {
  id?: string
  title: string
  subtitle?: string | null
  link_url?: string | null
  image_url: string
  storage_path: string
  alt: string
  object_position?: string
  file_size: number
  mime_type: string
  sort_order?: number
  status?: ContentStatus
  created_at?: string
  updated_at?: string
}

export type SupabaseEventImageRow = {
  id: string
  event_id: string
  image_url: string
  storage_path: string
  alt: string
  file_size: number
  mime_type: string
  sort_order: number
  status: ContentStatus
  created_at: string
  updated_at: string
}

export type SupabaseEventImageInsert = {
  id?: string
  event_id: string
  image_url: string
  storage_path: string
  alt: string
  file_size: number
  mime_type: string
  sort_order?: number
  status?: ContentStatus
  created_at?: string
  updated_at?: string
}

export type SupabaseEventRow = {
  id: string
  slug: string
  title: string
  year: string
  category: EventCategory
  label: string
  summary: string
  content: string
  featured_home: boolean
  sort_order: number
  status: ContentStatus
  published_at: string | null
  created_at: string
  updated_at: string
}

export type SupabaseEventInsert = {
  id?: string
  slug: string
  title: string
  year: string
  category: EventCategory
  label: string
  summary: string
  content?: string
  featured_home?: boolean
  sort_order?: number
  status?: ContentStatus
  published_at?: string | null
  created_at?: string
  updated_at?: string
}

export type SupabaseEventWithImages = SupabaseEventRow & {
  event_images: SupabaseEventImageRow[]
}

export type SupabaseDepartmentResponsibilityRow = {
  id: string
  department_id: string
  content: string
  sort_order: number
  status: ContentStatus
  created_at: string
  updated_at: string
}

export type SupabaseDepartmentResponsibilityInsert = {
  id?: string
  department_id: string
  content: string
  sort_order?: number
  status?: ContentStatus
  created_at?: string
  updated_at?: string
}

export type SupabaseDepartmentRow = {
  id: string
  slug: string
  name: string
  description: string
  icon_key: string
  sort_order: number
  status: ContentStatus
  created_at: string
  updated_at: string
}

export type SupabaseDepartmentInsert = {
  id?: string
  slug: string
  name: string
  description: string
  icon_key: string
  sort_order?: number
  status?: ContentStatus
  created_at?: string
  updated_at?: string
}

export type SupabaseDepartmentWithResponsibilities = SupabaseDepartmentRow & {
  department_responsibilities: SupabaseDepartmentResponsibilityRow[]
}

export type SupabaseLeaderRow = {
  id: string
  name: string
  role: string
  department_id: string | null
  department_name: string
  generation: string
  photo_url: string | null
  storage_path: string | null
  file_size: number | null
  mime_type: string | null
  term_start: string | null
  term_end: string | null
  is_active: boolean
  sort_order: number
  status: ContentStatus
  created_at: string
  updated_at: string
}

export type SupabaseLeaderInsert = {
  id?: string
  name: string
  role: string
  department_id?: string | null
  department_name: string
  generation: string
  photo_url?: string | null
  storage_path?: string | null
  file_size?: number | null
  mime_type?: string | null
  term_start?: string | null
  term_end?: string | null
  is_active?: boolean
  sort_order?: number
  status?: ContentStatus
  created_at?: string
  updated_at?: string
}
