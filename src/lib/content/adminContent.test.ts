import { describe, expect, it, vi } from 'vitest'
import {
  listAdminBanners,
  createBanner,
  updateBanner,
  setBannerStatus,
  toggleEventFeaturedHome,
  createEvent,
  createDefaultDepartments,
  getAdminEventBySlug,
  updateEvent,
  updateDepartment,
} from './adminContent'
import type { SupabaseClient } from '@supabase/supabase-js'

describe('adminContent repository', () => {
  it('listAdminBanners queries non-archived banners ordered by sort_order', async () => {
    const mockData = [{ id: 'b1', title: 'Banner 1', sort_order: 1 }]
    const mockClient = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          neq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockData, error: null }),
          }),
        }),
      }),
    } as unknown as SupabaseClient

    const result = await listAdminBanners(mockClient)
    expect(result).toEqual(mockData)
  })

  it('createBanner inserts and returns record', async () => {
    const mockCreated = { id: 'b2', title: 'Banner 2' }
    const mockClient = {
      from: vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockCreated, error: null }),
          }),
        }),
      }),
    } as unknown as SupabaseClient

    const result = await createBanner(mockClient, { title: 'Banner 2' } as any)
    expect(result).toEqual(mockCreated)
  })

  it('toggleEventFeaturedHome updates event featured_home field', async () => {
    const mockUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    })
    const mockClient = {
      from: vi.fn().mockReturnValue({
        update: mockUpdate,
      }),
    } as unknown as SupabaseClient

    await toggleEventFeaturedHome(mockClient, 'evt-1', true)
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ featured_home: true }))
  })

  it('createEvent inserts event and multiple images with metadata', async () => {
    const mockEvent = { id: 'evt-1', title: 'Test Event' }
    const insertEventMock = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: mockEvent, error: null }),
      }),
    })
    const insertImageMock = vi.fn().mockResolvedValue({ error: null })
    const mockClient = {
      from: vi.fn((table: string) => {
        if (table === 'events') {
          return {
            insert: insertEventMock,
          }
        }
        if (table === 'event_images') {
          return {
            insert: insertImageMock,
          }
        }
        return {}
      }),
    } as unknown as SupabaseClient

    const images = [
      { image_url: 'https://example.com/img1.jpg', storage_path: 'events/img1.jpg', alt: 'Test 1', file_size: 100000, mime_type: 'image/jpeg' },
      { image_url: 'https://example.com/img2.jpg', storage_path: 'events/img2.jpg', alt: 'Test 2', file_size: 120000, mime_type: 'image/jpeg' },
    ]

    const result = await createEvent(
      mockClient,
      {
        title: 'Test Event',
        month: '8',
        content: 'Noi dung chi tiet cua su kien.',
      } as any,
      images,
    )
    expect(result).toEqual(mockEvent)
    expect(insertEventMock).toHaveBeenCalledWith([
      expect.objectContaining({
        month: '8',
        content: 'Noi dung chi tiet cua su kien.',
      }),
    ])
    expect(insertImageMock).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ event_id: 'evt-1', image_url: 'https://example.com/img1.jpg', sort_order: 1 }),
        expect.objectContaining({ event_id: 'evt-1', image_url: 'https://example.com/img2.jpg', sort_order: 2 }),
      ]),
    )
  })

  it('updateEvent soft-archives existing images instead of hard-deleting them', async () => {
    const mockUpdatedEvent = { id: 'evt-1', title: 'Updated Event' }
    const updateEventMock = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockUpdatedEvent, error: null }),
        }),
      }),
    })
    const softArchiveMock = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        neq: vi.fn().mockResolvedValue({ error: null }),
      }),
    })
    const insertImageMock = vi.fn().mockResolvedValue({ error: null })
    const deleteMock = vi.fn()

    const mockClient = {
      from: vi.fn((table: string) => {
        if (table === 'events') {
          return {
            update: updateEventMock,
          }
        }
        if (table === 'event_images') {
          return {
            update: softArchiveMock,
            insert: insertImageMock,
            delete: deleteMock,
          }
        }
        return {}
      }),
    } as unknown as SupabaseClient

    await updateEvent(
      mockClient,
      'evt-1',
      {
        title: 'Updated Event',
        month: '8',
        content: 'Noi dung chi tiet cua su kien.',
      } as any,
      [
        {
          image_url: 'https://example.com/new.jpg',
          storage_path: 'events/new.jpg',
          alt: 'Updated Image',
          file_size: 100000,
          mime_type: 'image/jpeg',
        },
      ],
    )

    expect(updateEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        month: '8',
        content: 'Noi dung chi tiet cua su kien.',
      }),
    )
    expect(softArchiveMock).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'archived' }),
    )
    expect(deleteMock).not.toHaveBeenCalled()
  })

  it('does not insert replacement event images when archiving existing images fails', async () => {
    const mockUpdatedEvent = { id: 'evt-1', title: 'Updated Event' }
    const archiveError = new Error('Archive failed')
    const insertImageMock = vi.fn().mockResolvedValue({ error: null })

    const mockClient = {
      from: vi.fn((table: string) => {
        if (table === 'events') {
          return {
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ data: mockUpdatedEvent, error: null }),
                }),
              }),
            }),
          }
        }
        if (table === 'event_images') {
          return {
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                neq: vi.fn().mockResolvedValue({ error: archiveError }),
              }),
            }),
            insert: insertImageMock,
          }
        }
        return {}
      }),
    } as unknown as SupabaseClient

    await expect(
      updateEvent(mockClient, 'evt-1', { title: 'Updated Event' } as any, [
        {
          image_url: 'https://example.com/new.jpg',
          storage_path: 'events/new.jpg',
          alt: 'Updated Image',
          file_size: 100000,
          mime_type: 'image/jpeg',
        },
      ]),
    ).rejects.toThrow('Archive failed')
    expect(insertImageMock).not.toHaveBeenCalled()
  })

  it('loads an admin event by slug regardless of draft status', async () => {
    const mockEvent = {
      id: 'event-id',
      slug: 'draft-event',
      title: 'Draft Event',
      month: '8',
      year: '2026',
      category: 'academic',
      label: 'Học thuật',
      summary: 'Summary',
      content: 'Draft content',
      featured_home: false,
      sort_order: 1,
      status: 'draft',
      published_at: null,
      created_at: '',
      updated_at: '',
      event_images: [
        { id: 'img-1', status: 'published' },
        { id: 'img-2', status: 'archived' },
      ],
    }
    const mockClient = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            neq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: mockEvent, error: null }),
            }),
          }),
        }),
      }),
    } as unknown as SupabaseClient

    const event = await getAdminEventBySlug(mockClient, 'draft-event')

    expect(event?.status).toBe('draft')
    expect(event?.event_images).toEqual([expect.objectContaining({ id: 'img-1' })])
  })

  it('updateDepartment soft-archives previous responsibilities instead of hard-deleting them', async () => {
    const softArchiveMock = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        neq: vi.fn().mockResolvedValue({ error: null }),
      }),
    })
    const insertRespMock = vi.fn().mockResolvedValue({ error: null })
    const deleteMock = vi.fn()

    const mockClient = {
      from: vi.fn((table: string) => {
        if (table === 'departments') {
          return {
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ error: null }),
            }),
          }
        }
        if (table === 'department_responsibilities') {
          return {
            update: softArchiveMock,
            insert: insertRespMock,
            delete: deleteMock,
          }
        }
        return {}
      }),
    } as unknown as SupabaseClient

    await updateDepartment(mockClient, 'dept-1', { description: 'Updated desc' }, ['Nhiệm vụ mới'])

    expect(softArchiveMock).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'archived' }),
    )
    expect(deleteMock).not.toHaveBeenCalled()
    expect(insertRespMock).toHaveBeenCalledWith([
      expect.objectContaining({ department_id: 'dept-1', content: 'Nhiệm vụ mới', status: 'published' }),
    ])
  })

  it('createDefaultDepartments upserts the four default departments and missing responsibilities', async () => {
    const upsertMock = vi.fn().mockReturnValue({
      select: vi.fn().mockResolvedValue({
        data: [
          { id: 'dept-1', slug: 'chuyen-mon', sort_order: 1 },
          { id: 'dept-2', slug: 'truyen-thong', sort_order: 2 },
          { id: 'dept-3', slug: 'su-kien', sort_order: 3 },
          { id: 'dept-4', slug: 'doi-ngoai', sort_order: 4 },
        ],
        error: null,
      }),
    })
    const insertRespMock = vi.fn().mockResolvedValue({ error: null })
    const listOrderMock = vi.fn().mockResolvedValue({ data: [], error: null })

    const mockClient = {
      from: vi.fn((table: string) => {
        if (table === 'departments') {
          return {
            upsert: upsertMock,
            select: vi.fn().mockReturnValue({
              order: listOrderMock,
            }),
          }
        }
        if (table === 'department_responsibilities') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                neq: vi.fn().mockResolvedValue({ data: [], error: null }),
              }),
            }),
            insert: insertRespMock,
          }
        }
        return {}
      }),
    } as unknown as SupabaseClient

    await createDefaultDepartments(mockClient)

    expect(upsertMock).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ slug: 'chuyen-mon', name: 'Ban Chuyên môn' }),
        expect.objectContaining({ slug: 'truyen-thong', name: 'Ban Truyền thông' }),
        expect.objectContaining({ slug: 'su-kien', name: 'Ban Sự kiện' }),
        expect.objectContaining({ slug: 'doi-ngoai', name: 'Ban Đối ngoại' }),
      ]),
      { onConflict: 'slug' },
    )
    expect(insertRespMock).toHaveBeenCalledTimes(4)
  })
})
