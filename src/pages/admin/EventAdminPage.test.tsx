import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { EventAdminPage } from './EventAdminPage'

const mocks = vi.hoisted(() => ({
  createEvent: vi.fn(),
  listAdminEvents: vi.fn(),
  setEventStatus: vi.fn(),
  toggleEventFeaturedHome: vi.fn(),
  updateEvent: vi.fn(),
  getSupabaseClient: vi.fn(),
}))

vi.mock('../../lib/content/adminContent', () => ({
  createEvent: mocks.createEvent,
  listAdminEvents: mocks.listAdminEvents,
  setEventStatus: mocks.setEventStatus,
  toggleEventFeaturedHome: mocks.toggleEventFeaturedHome,
  updateEvent: mocks.updateEvent,
}))

vi.mock('../../lib/supabase/client', () => ({
  getSupabaseClient: mocks.getSupabaseClient,
}))

function renderEventAdminPage() {
  render(
    <MemoryRouter>
      <EventAdminPage />
    </MemoryRouter>,
  )
}

describe('EventAdminPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getSupabaseClient.mockReturnValue({ from: vi.fn() })
    mocks.listAdminEvents.mockResolvedValue([])
    mocks.createEvent.mockResolvedValue({ id: 'evt-1', title: 'Sự kiện mới' })
  })

  it('saves month and detailed content from the create form', async () => {
    const user = userEvent.setup()
    renderEventAdminPage()

    await user.click(await screen.findByRole('button', { name: 'Thêm Sự kiện mới' }))

    const monthSelect = screen.getByLabelText('Tháng tổ chức')
    expect(monthSelect).toBeInTheDocument()
    expect(screen.getByLabelText('Nội dung chi tiết')).toBeInTheDocument()

    await user.type(screen.getByPlaceholderText('VD: Chung kết PTIT Trading Challenge'), 'Sự kiện mới')
    await user.clear(screen.getByPlaceholderText('2026'))
    await user.type(screen.getByPlaceholderText('2026'), '2026')
    await user.selectOptions(monthSelect, '8')
    await user.type(
      screen.getByPlaceholderText('Mô tả ngắn gọn về chương trình, dấu mốc đạt được...'),
      'Tom tat su kien.',
    )
    await user.type(
      screen.getByLabelText('Nội dung chi tiết'),
      'Noi dung chi tiet cua su kien.',
    )
    await user.click(screen.getByRole('button', { name: 'Lưu thay đổi' }))

    await waitFor(() => expect(mocks.createEvent).toHaveBeenCalled())
    expect(mocks.createEvent).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        month: '8',
        content: 'Noi dung chi tiet cua su kien.',
      }),
      [],
    )
  })

  it('shows image count and lets admins manage cover, order, and alt text', async () => {
    const user = userEvent.setup()
    mocks.listAdminEvents.mockResolvedValue([
      {
        id: 'evt-1',
        title: 'Sự kiện có nhiều ảnh',
        slug: 'su-kien-co-nhieu-anh',
        year: '2026',
        month: '8',
        category: 'academic',
        label: 'Học thuật',
        summary: 'Tom tat.',
        content: 'Noi dung.',
        featured_home: false,
        sort_order: 1,
        status: 'published',
        event_images: [
          {
            id: 'img-1',
            event_id: 'evt-1',
            image_url: '/images/events/one.jpg',
            storage_path: 'events/one.jpg',
            alt: 'Anh dau',
            file_size: 100000,
            mime_type: 'image/jpeg',
            sort_order: 1,
            status: 'published',
          },
          {
            id: 'img-2',
            event_id: 'evt-1',
            image_url: '/images/events/two.jpg',
            storage_path: 'events/two.jpg',
            alt: 'Anh hai',
            file_size: 120000,
            mime_type: 'image/jpeg',
            sort_order: 2,
            status: 'published',
          },
        ],
      },
    ])
    mocks.updateEvent.mockResolvedValue({ id: 'evt-1', title: 'Sự kiện có nhiều ảnh' })

    renderEventAdminPage()

    expect(await screen.findByText('2 ảnh')).toBeInTheDocument()
    await user.click(screen.getByTitle('Chỉnh sửa'))

    expect(screen.getByRole('textbox', { name: 'Alt ảnh 1' })).toHaveValue('Anh dau')
    expect(screen.getByRole('button', { name: 'Đặt ảnh 2 làm ảnh bìa' })).toBeInTheDocument()

    await user.clear(screen.getByRole('textbox', { name: 'Alt ảnh 1' }))
    await user.type(screen.getByRole('textbox', { name: 'Alt ảnh 1' }), 'Anh bia moi')
    await user.click(screen.getByRole('button', { name: 'Đặt ảnh 2 làm ảnh bìa' }))
    await user.click(screen.getByRole('button', { name: 'Lưu thay đổi' }))

    await waitFor(() => expect(mocks.updateEvent).toHaveBeenCalled())
    expect(mocks.updateEvent).toHaveBeenCalledWith(
      expect.anything(),
      'evt-1',
      expect.anything(),
      [
        expect.objectContaining({ image_url: '/images/events/two.jpg', alt: 'Anh hai' }),
        expect.objectContaining({ image_url: '/images/events/one.jpg', alt: 'Anh bia moi' }),
      ],
    )
  })
})
