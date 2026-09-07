import { describe, expect, it } from 'vitest'
import {
  getDepartmentIcon,
  mapDepartmentRowsToDepartments,
  mapEventRowsToEventItems,
  mapLeaderRowsToLeadership,
} from './contentMapping'
import { BookOpenCheck, Megaphone } from 'lucide-react'

describe('contentMapping', () => {
  it('maps icon names to Lucide icons with fallback', () => {
    expect(getDepartmentIcon('Megaphone')).toBe(Megaphone)
    expect(getDepartmentIcon('UnknownIcon')).toBe(BookOpenCheck)
  })

  it('maps Supabase events to EventItems ordered by sort_order and filters unpublished images', () => {
    const rawEvents = [
      {
        id: '2',
        title: 'Event 2',
        slug: 'event-2',
        year: '2026',
        month: '8',
        category: 'Chuyên môn',
        label: 'Workshop',
        summary: 'Summary 2',
        content: 'Event 2 content',
        featured_home: false,
        status: 'published' as const,
        sort_order: 2,
        created_at: '',
        updated_at: '',
        event_images: [
          { id: 'img-2', event_id: '2', image_url: '/img-2.jpg', sort_order: 2, status: 'published' as const, created_at: '', updated_at: '' },
          { id: 'img-1', event_id: '2', image_url: '/img-1.jpg', sort_order: 1, status: 'published' as const, created_at: '', updated_at: '' },
          { id: 'img-hidden', event_id: '2', image_url: '/hidden.jpg', sort_order: 0, status: 'hidden' as const, created_at: '', updated_at: '' },
        ],
      },
      {
        id: '1',
        title: 'Event 1',
        slug: 'sample-event',
        year: '2026',
        month: '8',
        category: 'Sự kiện',
        label: 'Gala',
        summary: 'Summary 1',
        content: 'Noi dung chi tiet cua su kien.',
        featured_home: true,
        status: 'published' as const,
        sort_order: 1,
        created_at: '',
        updated_at: '',
        event_images: [],
      },
    ]

    const mapped = mapEventRowsToEventItems(rawEvents)
    expect(mapped).toHaveLength(2)
    expect(mapped[0]).toMatchObject({
      id: 'sample-event',
      month: '8',
      year: '2026',
      content: 'Noi dung chi tiet cua su kien.',
      featured: true,
    })
    expect(mapped[1].id).toBe('event-2')
    expect(mapped[1].images).toEqual(['/img-1.jpg', '/img-2.jpg'])
  })

  it('maps Supabase departments with responsibilities correctly', () => {
    const rawDepartments = [
      {
        id: 'dept-1',
        name: 'Ban Chuyên môn',
        slug: 'ban-chuyen-mon',
        description: 'Mô tả',
        icon_key: 'BookOpenCheck',
        status: 'published' as const,
        sort_order: 1,
        created_at: '',
        updated_at: '',
        department_responsibilities: [
          { id: 'r1', department_id: 'dept-1', content: 'Nhiệm vụ 1', sort_order: 1, status: 'published' as const, created_at: '', updated_at: '' },
          { id: 'r2', department_id: 'dept-1', content: 'Nhiệm vụ ẩn', sort_order: 2, status: 'hidden' as const, created_at: '', updated_at: '' },
        ],
      },
    ]

    const mapped = mapDepartmentRowsToDepartments(rawDepartments)
    expect(mapped).toHaveLength(1)
    expect(mapped[0].name).toBe('Ban Chuyên môn')
    expect(mapped[0].number).toBe('01')
    expect(mapped[0].responsibilities).toEqual(['Nhiệm vụ 1'])
  })

  it('maps Supabase leaders to Leadership array', () => {
    const rawLeaders = [
      {
        id: 'leader-1',
        name: 'Nguyễn Văn A',
        role: 'Chủ nhiệm',
        department_name: 'Ban Chủ nhiệm',
        generation: 'Gen 10',
        photo_url: '/avatar.jpg',
        status: 'published' as const,
        sort_order: 1,
        created_at: '',
        updated_at: '',
      },
    ]

    const mapped = mapLeaderRowsToLeadership(rawLeaders)
    expect(mapped).toHaveLength(1)
    expect(mapped[0].name).toBe('Nguyễn Văn A')
    expect(mapped[0].role).toBe('Chủ nhiệm')
    expect(mapped[0].cohort).toBe('Gen 10')
    expect(mapped[0].image).toBe('/avatar.jpg')
  })
})
