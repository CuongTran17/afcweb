import type { LucideIcon } from 'lucide-react'
import { BookOpenCheck, CalendarCheck2, Handshake, Megaphone } from 'lucide-react'
import type { Department } from '../../data/departments'
import type { EventItem } from '../../data/events'
import type { Leader } from '../../data/leadership'
import type {
  SupabaseDepartmentWithResponsibilities,
  SupabaseEventWithImages,
  SupabaseLeaderRow,
} from '../supabase/types'

const iconMap: Record<string, LucideIcon> = {
  BookOpenCheck,
  Megaphone,
  CalendarCheck2,
  Handshake,
}

export function getDepartmentIcon(key: string): LucideIcon {
  return iconMap[key] || BookOpenCheck
}

export function mapEventRowsToEventItems(rows: SupabaseEventWithImages[]): EventItem[] {
  return rows
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((event) => ({
      id: event.slug,
      title: event.title,
      month: event.month || '',
      year: event.year,
      category: event.category,
      label: event.label,
      summary: event.summary,
      content: event.content || '',
      images: (event.event_images || [])
        .filter((image) => image.status === 'published')
        .slice()
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((image) => image.image_url),
      featured: event.featured_home,
    }))
}

export function mapDepartmentRowsToDepartments(
  rows: SupabaseDepartmentWithResponsibilities[],
): Department[] {
  return rows
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((dept, index) => ({
      id: dept.slug,
      name: dept.name,
      number: `0${index + 1}`.slice(-2),
      description: dept.description,
      responsibilities: (dept.department_responsibilities || [])
        .filter((r) => r.status === 'published')
        .slice()
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((r) => r.content),
      icon: getDepartmentIcon(dept.icon_key),
    }))
}

export function mapLeaderRowsToLeadership(rows: SupabaseLeaderRow[]): Leader[] {
  return rows
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((leader) => ({
      name: leader.name,
      role: leader.role,
      department: leader.department_name as Leader['department'],
      cohort: leader.generation || undefined,
      image: leader.photo_url || undefined,
    }))
}
