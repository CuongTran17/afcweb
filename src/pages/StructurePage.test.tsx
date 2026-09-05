import { render, screen } from '@testing-library/react'
import { StructurePage } from './StructurePage'

describe('structure page', () => {
  it('publishes the four departments and Gen 9 executive board', () => {
    render(<StructurePage />)

    expect(screen.getByRole('heading', { name: 'Ban Chuyên môn' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Ban Truyền thông' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Ban Sự kiện' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Ban Đối ngoại' })).toBeInTheDocument()
    expect(screen.getByText('Hoàng Thu Hoài')).toBeInTheDocument()
    expect(screen.getByText('Đặng Minh Trang')).toBeInTheDocument()
    expect(screen.getByText('Hoàng Vũ Long')).toBeInTheDocument()
    expect(screen.getAllByLabelText(/Ảnh thành viên sẽ được cập nhật/i).length).toBeGreaterThan(0)
  })
})
