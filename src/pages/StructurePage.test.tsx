import { render, screen } from '@testing-library/react'
import { StructurePage } from './StructurePage'

describe('structure page', () => {
  it('uses the club hero photo behind the structure hero copy', () => {
    render(<StructurePage />)

    expect(document.querySelector('.page-hero--structure img')).toHaveAttribute(
      'src',
      '/images/pages/structure-hero.jpg',
    )
    expect(screen.getByRole('heading', { name: 'Cơ cấu CLB' })).toBeInTheDocument()
  })

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
