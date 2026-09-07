import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EventImageSlider } from './EventImageSlider'

describe('EventImageSlider', () => {
  it('shows the first image, count, and lets visitors move through images', async () => {
    const user = userEvent.setup()
    render(<EventImageSlider title="Sự kiện mẫu" images={['/one.jpg', '/two.jpg']} />)

    expect(screen.getByRole('img', { name: 'Sự kiện mẫu - ảnh 1' })).toHaveAttribute('src', '/one.jpg')
    expect(screen.getByText('1 / 2')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Ảnh tiếp theo của Sự kiện mẫu' }))

    expect(screen.getByRole('img', { name: 'Sự kiện mẫu - ảnh 2' })).toHaveAttribute('src', '/two.jpg')
    expect(screen.getByText('2 / 2')).toBeInTheDocument()
  })

  it('hides controls when there is only one image', () => {
    render(<EventImageSlider title="Một ảnh" images={['/only.jpg']} />)

    expect(screen.getByRole('img', { name: 'Một ảnh - ảnh 1' })).toHaveAttribute('src', '/only.jpg')
    expect(screen.queryByRole('button', { name: 'Ảnh tiếp theo của Một ảnh' })).not.toBeInTheDocument()
  })
})
