import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { EventPreviewPage } from './EventPreviewPage'

const mocks = vi.hoisted(() => ({
  getAdminEventBySlug: vi.fn(),
  getSupabaseClient: vi.fn(),
}))

vi.mock('../../lib/content/adminContent', () => ({
  getAdminEventBySlug: mocks.getAdminEventBySlug,
}))

vi.mock('../../lib/supabase/client', () => ({
  getSupabaseClient: mocks.getSupabaseClient,
}))

function renderPreview(slug: string) {
  render(
    <MemoryRouter initialEntries={[`/admin/events/${slug}/preview`]}>
      <Routes>
        <Route path="/admin/events/:slug/preview" element={<EventPreviewPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('EventPreviewPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getSupabaseClient.mockReturnValue({ from: vi.fn() })
    mocks.getAdminEventBySlug.mockResolvedValue({
      id: 'evt-1',
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
        {
          id: 'img-1',
          event_id: 'evt-1',
          image_url: '/images/events/draft.jpg',
          storage_path: 'events/draft.jpg',
          alt: 'Draft image',
          file_size: 100000,
          mime_type: 'image/jpeg',
          sort_order: 1,
          status: 'published',
          created_at: '',
          updated_at: '',
        },
      ],
    })
  })

  it('renders a draft admin event preview with the shared slider', async () => {
    renderPreview('draft-event')

    expect(await screen.findByRole('heading', { level: 2, name: 'Draft Event' })).toBeInTheDocument()
    expect(screen.getByText('Bản xem trước')).toBeInTheDocument()
    expect(screen.getByText('Tháng 8, 2026')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Draft Event - ảnh 1' })).toHaveAttribute(
      'src',
      '/images/events/draft.jpg',
    )
    expect(screen.getByText('Draft content')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Quay lại quản lý sự kiện' })).toHaveAttribute(
      'href',
      '/admin/events',
    )
  })
})
