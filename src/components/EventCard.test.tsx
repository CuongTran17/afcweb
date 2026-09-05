import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EventCard } from './EventCard'
import type { EventItem } from '../data/events'

const eventWithHorizontalGallery: EventItem = {
  id: 'sample-event',
  title: 'Sự kiện mẫu',
  year: '2026',
  category: 'academic',
  label: 'Học thuật',
  summary: 'Nội dung sự kiện mẫu.',
  images: ['/images/events/sample-1.jpg', '/images/events/sample-2.jpg'],
}

describe('event card photography', () => {
  it('shows one full-width cover image and preserves the gallery count', () => {
    render(<EventCard event={eventWithHorizontalGallery} />)

    expect(screen.getAllByRole('img')).toHaveLength(1)
    expect(screen.getByRole('img')).toHaveAttribute('src', '/images/events/sample-1.jpg')
    expect(screen.getByLabelText('2 ảnh')).toBeInTheDocument()
  })

  it('lets visitors move through every photo in the event gallery', async () => {
    const user = userEvent.setup()
    render(<EventCard event={eventWithHorizontalGallery} />)

    await user.click(screen.getByRole('button', { name: 'Ảnh tiếp theo của Sự kiện mẫu' }))
    expect(screen.getByRole('img')).toHaveAttribute('src', '/images/events/sample-2.jpg')
    expect(screen.getByLabelText('Ảnh 2 trên 2')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Ảnh trước của Sự kiện mẫu' }))
    expect(screen.getByRole('img')).toHaveAttribute('src', '/images/events/sample-1.jpg')
  })
})
