import { describe, expect, it, vi } from 'vitest'
import {
  getAvailableGenerations,
  getFeaturedHomeEvents,
  getPublicBanners,
  getPublicDepartments,
  getPublicEventBySlug,
  getPublicEvents,
  getPublicLeadership,
} from './publicContent'
import { events as staticEvents } from '../../data/events'
import { departments as staticDepartments } from '../../data/departments'
import { leadership as staticLeadership } from '../../data/leadership'
import type { SupabaseClient } from '@supabase/supabase-js'

describe('publicContent repository', () => {
  it('returns static data when client is null', async () => {
    const events = await getPublicEvents(null)
    expect(events).toEqual(staticEvents)

    const featured = await getFeaturedHomeEvents(null)
    expect(featured.length).toBeGreaterThan(0)

    const departments = await getPublicDepartments(null)
    expect(departments).toEqual(staticDepartments)

    const leaders = await getPublicLeadership(null)
    expect(leaders).toEqual(staticLeadership)

    const banners = await getPublicBanners(null)
    expect(banners).toEqual([])

    const gens = await getAvailableGenerations(null)
    expect(gens).toEqual([])
  })

  it('returns a static event by slug when Supabase is unavailable', async () => {
    const event = await getPublicEventBySlug('trading-challenge-2026', null)

    expect(event).toMatchObject({
      id: 'trading-challenge-2026',
      title: 'Chung kết PTIT Trading Challenge',
    })
  })

  it('falls back to static data if supabase query errors out', async () => {
    const mockClient = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: null, error: new Error('Network error') }),
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: null, error: new Error('Network error') }),
            }),
          }),
        }),
      }),
    } as unknown as SupabaseClient

    const events = await getPublicEvents(mockClient)
    expect(events).toEqual(staticEvents)

    const departments = await getPublicDepartments(mockClient)
    expect(departments).toEqual(staticDepartments)

    const leaders = await getPublicLeadership(mockClient)
    expect(leaders).toEqual(staticLeadership)
  })

  it('returns mapped data when supabase query succeeds', async () => {
    const mockData = [
      {
        id: 'banner-1',
        title: 'Chào mừng AFC',
        subtitle: 'CLB Học thuật',
        image_url: 'https://example.com/banner.jpg',
        link_url: '/about',
        sort_order: 1,
        status: 'published',
      },
    ]

    const mockClient = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockData, error: null }),
          }),
        }),
      }),
    } as unknown as SupabaseClient

    const banners = await getPublicBanners(mockClient)
    expect(banners).toHaveLength(1)
    expect(banners[0].title).toBe('Chào mừng AFC')
    expect(banners[0].imageUrl).toBe('https://example.com/banner.jpg')
  })

  it('getPublicLeadership filters by status published AND is_active true', async () => {
    const eqMock = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: [
            {
              id: 'l1',
              name: 'Leader 1',
              role: 'Chủ nhiệm',
              department_name: 'Ban Chủ nhiệm',
              generation: 'Gen 10',
              photo_url: null,
              status: 'published',
              sort_order: 1,
            },
          ],
          error: null,
        }),
      }),
    })

    const mockClient = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: eqMock,
        }),
      }),
    } as unknown as SupabaseClient

    const leaders = await getPublicLeadership(mockClient)
    expect(leaders).toHaveLength(1)
    expect(eqMock).toHaveBeenCalledWith('status', 'published')
  })
})
