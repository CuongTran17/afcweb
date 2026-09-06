import { describe, expect, it, vi } from 'vitest'
import {
  listAdminBanners,
  createBanner,
  updateBanner,
  setBannerStatus,
  toggleEventFeaturedHome,
  createEvent,
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
    const insertImageMock = vi.fn().mockResolvedValue({ error: null })
    const mockClient = {
      from: vi.fn((table: string) => {
        if (table === 'events') {
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: mockEvent, error: null }),
              }),
            }),
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

    const result = await createEvent(mockClient, { title: 'Test Event' } as any, images)
    expect(result).toEqual(mockEvent)
    expect(insertImageMock).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ event_id: 'evt-1', image_url: 'https://example.com/img1.jpg', sort_order: 1 }),
        expect.objectContaining({ event_id: 'evt-1', image_url: 'https://example.com/img2.jpg', sort_order: 2 }),
      ]),
    )
  })

  it('updateEvent soft-archives existing images instead of hard-deleting them', async () => {
    const mockUpdatedEvent = { id: 'evt-1', title: 'Updated Event' }
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
            update: softArchiveMock,
            insert: insertImageMock,
            delete: deleteMock,
          }
        }
        return {}
      }),
    } as unknown as SupabaseClient

    await updateEvent(mockClient, 'evt-1', { title: 'Updated Event' } as any, [
      {
        image_url: 'https://example.com/new.jpg',
        storage_path: 'events/new.jpg',
        alt: 'Updated Image',
        file_size: 100000,
        mime_type: 'image/jpeg',
      },
    ])

    expect(softArchiveMock).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'archived' }),
    )
    expect(deleteMock).not.toHaveBeenCalled()
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
})
