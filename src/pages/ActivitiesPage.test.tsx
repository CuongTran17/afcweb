import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { ActivitiesPage } from './ActivitiesPage'

function renderActivitiesPage() {
  render(
    <MemoryRouter>
      <ActivitiesPage />
    </MemoryRouter>,
  )
}

describe('activities page', () => {
  it('filters the archive by activity category', async () => {
    const user = userEvent.setup()
    renderActivitiesPage()

    expect(screen.getByText('Chung kết PTIT Trading Challenge')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Xem chi tiết Chung kết PTIT Trading Challenge' }),
    ).toHaveAttribute('href', '/hoat-dong/trading-challenge-2026')
    await user.click(screen.getByRole('button', { name: 'Nội bộ' }))

    expect(screen.getByText('Biggame AFC 2026')).toBeInTheDocument()
    expect(screen.queryByText('Chung kết PTIT Trading Challenge')).not.toBeInTheDocument()
  })
})
