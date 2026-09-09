import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { EventDetailPage } from './EventDetailPage'

function renderDetail(slug: string) {
  render(
    <MemoryRouter initialEntries={[`/hoat-dong/${slug}`]}>
      <Routes>
        <Route path="/hoat-dong/:slug" element={<EventDetailPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('EventDetailPage', () => {
  it('renders the event title first, metadata, and image slider', async () => {
    renderDetail('trading-challenge-2026')

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Chung kết PTIT Trading Challenge',
      }),
    ).toBeInTheDocument()
    expect(screen.getByText(/Tháng .*2026/)).toBeInTheDocument()
    expect(screen.getByText('Học thuật & chuyên môn')).toBeInTheDocument()
    expect(screen.queryByText('Học thuật')).not.toBeInTheDocument()
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Chung kết PTIT Trading Challenge',
      }).closest('.event-detail__heading-row'),
    ).toContainElement(screen.getByText(/Tháng .*2026/))
    expect(
      screen.getByRole('img', { name: /Chung kết PTIT Trading Challenge - ảnh 1/ }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Quay lại Hoạt động' })).toHaveAttribute(
      'href',
      '/hoat-dong',
    )
  })

  it('does not repeat slideshow images as thumbnail buttons below the stage', async () => {
    renderDetail('trading-challenge-2026')

    await screen.findByRole('heading', {
      level: 1,
      name: 'Chung kết PTIT Trading Challenge',
    })

    expect(
      screen.queryByRole('button', {
        name: 'Xem ảnh 1 của Chung kết PTIT Trading Challenge',
      }),
    ).not.toBeInTheDocument()
  })

  it('uses the Đoàn Thanh Niên label for community events', async () => {
    renderDetail('moneyverse-2025')

    await screen.findByRole('heading', { level: 1, name: 'The Moneyverse 2025' })

    expect(screen.getByText('Đoàn Thanh Niên')).toBeInTheDocument()
    expect(screen.queryByText('Cộng đồng')).not.toBeInTheDocument()
  })

  it('shows a not-found state for an unknown event', async () => {
    renderDetail('khong-co-su-kien')

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Không tìm thấy sự kiện' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Quay lại Hoạt động' })).toHaveAttribute(
      'href',
      '/hoat-dong',
    )
  })
})
