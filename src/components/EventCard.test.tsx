import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { EventCard } from './EventCard'
import type { EventItem } from '../data/events'

const eventWithHorizontalGallery: EventItem = {
  id: 'sample-event',
  title: 'Sự kiện mẫu',
  year: '2026',
  category: 'academic',
  label: 'Học thuật',
  month: '04',
  summary: 'Nội dung sự kiện mẫu.',
  content: 'Chi tiết sự kiện mẫu.',
  images: ['/images/events/sample-1.jpg', '/images/events/sample-2.jpg'],
}

function renderCard() {
  render(
    <MemoryRouter>
      <EventCard event={eventWithHorizontalGallery} />
    </MemoryRouter>,
  )
}

describe('event card photography', () => {
  it('shows one full-width cover image and preserves the gallery count', () => {
    renderCard()

    expect(screen.getAllByRole('img')).toHaveLength(1)
    expect(screen.getByRole('img')).toHaveAttribute('src', '/images/events/sample-1.jpg')
    expect(screen.getByLabelText('2 ảnh')).toBeInTheDocument()
  })

  it('links the event title to the detail page', () => {
    renderCard()

    expect(screen.getByRole('link', { name: 'Xem chi tiết Sự kiện mẫu' })).toHaveAttribute(
      'href',
      '/hoat-dong/sample-event',
    )
  })

  it('shows the event month together with its year', () => {
    renderCard()

    expect(screen.getByText('Tháng 4, 2026', { selector: 'time' })).toBeInTheDocument()
  })

  it('falls back to the year when the event month is unavailable', () => {
    render(
      <MemoryRouter>
        <EventCard event={{ ...eventWithHorizontalGallery, month: '' }} />
      </MemoryRouter>,
    )

    expect(screen.getByText('2026', { selector: 'time' })).toBeInTheDocument()
  })

  it('lets visitors move through every photo in the event gallery', async () => {
    const user = userEvent.setup()
    renderCard()

    await user.click(screen.getByRole('button', { name: 'Ảnh tiếp theo của Sự kiện mẫu' }))
    expect(screen.getByRole('img')).toHaveAttribute('src', '/images/events/sample-2.jpg')
    expect(screen.getByLabelText('Ảnh 2 trên 2')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Ảnh trước của Sự kiện mẫu' }))
    expect(screen.getByRole('img')).toHaveAttribute('src', '/images/events/sample-1.jpg')
  })
})
