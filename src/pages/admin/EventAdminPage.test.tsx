import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

describe('EventAdminPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getSupabaseClient.mockReturnValue({ from: vi.fn() })
    mocks.listAdminEvents.mockResolvedValue([])
    mocks.createEvent.mockResolvedValue({ id: 'evt-1', title: 'Sự kiện mới' })
  })

  it('saves month and detailed content from the create form', async () => {
    const user = userEvent.setup()
    render(<EventAdminPage />)

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
})
