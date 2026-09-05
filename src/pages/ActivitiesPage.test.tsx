import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ActivitiesPage } from './ActivitiesPage'

describe('activities page', () => {
  it('filters the archive by activity category', async () => {
    const user = userEvent.setup()
    render(<ActivitiesPage />)

    expect(screen.getByText('Chung kết PTIT Trading Challenge')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Nội bộ' }))

    expect(screen.getByText('Biggame AFC 2026')).toBeInTheDocument()
    expect(screen.queryByText('Chung kết PTIT Trading Challenge')).not.toBeInTheDocument()
  })
})
