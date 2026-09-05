import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from './App'

describe('application shell', () => {
  it('shows the full AFC identity in the menu brand link', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('link', { name: 'AFC - CLB Tài chính Kế Toán PTIT' }),
    ).toHaveAttribute('href', '/')
  })

  it('offers exactly the three primary destinations', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )

    const navigation = screen.getByRole('navigation', { name: 'Điều hướng chính' })
    expect(navigation).toHaveTextContent('Trang chủ')
    expect(navigation).toHaveTextContent('Cơ cấu CLB')
    expect(navigation).toHaveTextContent('Hoạt động')
  })

  it('keeps contact details in the shared footer', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByRole('contentinfo')).toHaveTextContent('clbafcptit@gmail.com')
    expect(screen.getByRole('contentinfo')).toHaveTextContent('0366168882')
    expect(screen.getByRole('contentinfo')).toHaveTextContent('0964555129')
  })

  it('locks the page and closes the mobile menu from its backdrop', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: 'Mở menu' }))

    expect(document.body).toHaveClass('menu-open')
    expect(
      screen.getByRole('button', { name: 'Đóng menu ngoài vùng điều hướng' }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Đóng menu ngoài vùng điều hướng' }))

    expect(document.body).not.toHaveClass('menu-open')
    expect(
      screen.queryByRole('button', { name: 'Đóng menu ngoài vùng điều hướng' }),
    ).not.toBeInTheDocument()
  })
})
