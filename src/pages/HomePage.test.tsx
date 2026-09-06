import { act, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import { HomePage } from './HomePage'

describe('home page', () => {
  it('introduces AFC with approved statistics and onward journeys', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { level: 1, name: 'Câu lạc bộ Tài chính Kế toán PTIT' }),
    ).toBeInTheDocument()
    expect(screen.getAllByTestId('home-hero-title-line')).toHaveLength(2)
    expect(screen.getAllByTestId('home-hero-title-line')[1]).toHaveTextContent('Tài chính Kế toán PTIT')
    expect(screen.getByText('7+')).toBeInTheDocument()
    expect(screen.getByText('60+')).toBeInTheDocument()
    expect(screen.getByText('40+')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'Khởi đầu từ Kế toán, phát triển cùng Tài chính, Fintech và Phân tích dữ liệu',
      }),
    ).toBeInTheDocument()
    expect(screen.getAllByTestId('intro-heading-line')).toHaveLength(2)
    expect(screen.getAllByTestId('intro-heading-line')[0]).toHaveTextContent(
      'Khởi đầu từ Kế toán, phát triển cùng',
    )
    expect(screen.getAllByTestId('intro-heading-line')[1]).toHaveTextContent(
      'Tài chính, Fintech và Phân tích dữ liệu',
    )
    expect(
      screen.getByText(
        'Ngày 28/04/2019, AFC được thành lập với mong muốn xây dựng một cộng đồng nơi sinh viên có thể học hỏi, chia sẻ kiến thức và cùng nhau phát triển chuyên môn.',
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'Ngày 19/08/2023, CLB chính thức tái cơ cấu và mang tên Câu lạc bộ Tài chính Kế toán PTIT, trực thuộc Khoa Tài chính Kế toán 1, Học viện Công nghệ Bưu chính Viễn thông. Từ đó, AFC mở rộng định hướng hoạt động sang các lĩnh vực Tài chính, Kế toán, Fintech và Phân tích dữ liệu trong tài chính kinh doanh.',
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'Ngày nay, AFC đồng hành cùng Khoa trong việc tổ chức các hoạt động học thuật, chuyên môn và sự kiện dành cho sinh viên; đồng thời phối hợp cùng Đoàn Thanh niên và triển khai các hoạt động nội bộ nhằm tạo môi trường rèn luyện, kết nối và phát triển cho các thành viên.',
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'Mỗi ban đảm nhiệm một vai trò riêng, cùng phối hợp để tạo nên các hoạt động và chương trình của AFC.',
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'Từ các chương trình của Khoa, hoạt động Đoàn đến những sự kiện nội bộ, AFC luôn là nơi các thành viên cùng học hỏi, trải nghiệm và kết nối.',
      ),
    ).toBeInTheDocument()
    const featuredEventHeadings = screen.getAllByRole('heading', { level: 3 }).slice(4)
    expect(featuredEventHeadings).toHaveLength(3)
    expect(featuredEventHeadings.map((heading) => heading.textContent)).toEqual([
      'Chung kết PTIT Trading Challenge',
      'Hội trại kỷ niệm ngày thành lập Đoàn Thanh niên Cộng sản Hồ Chí Minh',
      'Biggame AFC 2026',
    ])
    expect(screen.getByRole('img', { name: 'Logo Câu lạc bộ Tài chính Kế toán PTIT' })).toHaveAttribute(
      'src',
      '/images/brand/afc-logo-background.png',
    )
    expect(screen.getByRole('link', { name: /Khám phá cơ cấu/i })).toHaveAttribute('href', '/co-cau')
    expect(screen.getByRole('link', { name: /Xem tất cả hoạt động/i })).toHaveAttribute('href', '/hoat-dong')
  })

  it('marks the hero, AFC intro, tagline, and departments as desktop full-screen snap panels', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )

    expect(screen.getByTestId('hero-section')).toHaveClass('home-snap-panel')
    expect(screen.getByTestId('afc-intro-section')).toHaveClass('home-snap-panel')
    expect(screen.getByTestId('tagline-section')).toHaveClass('home-snap-panel')
    expect(screen.getByTestId('departments-section')).toHaveClass('home-snap-panel')
    expect(screen.getByTestId('events-section')).not.toHaveClass('home-snap-panel')
  })

  it('adds a scroll reveal tagline between the intro and departments', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'Từ kiến thức trên giảng đường đến trải nghiệm trong thực tế.',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'AFC kết nối kiến thức chuyên môn, trải nghiệm thực tế và những con người cùng chung định hướng.',
      ),
    ).toBeInTheDocument()
    expect(screen.getAllByTestId('tagline-reveal-word').length).toBeGreaterThan(8)
  })

  it('turns the three key tagline words into event image popouts', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('button', { name: 'Xem hình ảnh minh họa cho kiến thức' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Xem hình ảnh minh họa cho giảng đường' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Xem hình ảnh minh họa cho thực tế' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Workshop PTIT Edu Exchange' })).toHaveAttribute(
      'src',
      '/images/events/edu-exchange-workshop-2.jpg',
    )
    expect(screen.getByRole('img', { name: 'Lớp đào tạo PTIT Edu Exchange' })).toHaveAttribute(
      'src',
      '/images/events/edu-exchange-training-2.jpg',
    )
    expect(screen.getByRole('img', { name: 'Chung kết PTIT Trading Challenge' })).toHaveAttribute(
      'src',
      '/images/events/trading-challenge-2.jpg',
    )
  })

  it('rotates through event images every ten seconds and updates the caption', () => {
    vi.useFakeTimers()
    const { unmount } = render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )

    try {
      expect(screen.getByText('Chung kết PTIT Trading Challenge', { selector: '.home-hero__caption' })).toBeInTheDocument()

      act(() => vi.advanceTimersByTime(9_999))
      expect(screen.getByText('Chung kết PTIT Trading Challenge', { selector: '.home-hero__caption' })).toBeInTheDocument()

      act(() => vi.advanceTimersByTime(1))
      expect(screen.getByText('The Moneyverse 2025', { selector: '.home-hero__caption' })).toBeInTheDocument()

      act(() => vi.advanceTimersByTime(10_000))
      expect(screen.getByText('Workshop PTIT Edu Exchange', { selector: '.home-hero__caption' })).toBeInTheDocument()
      expect(document.querySelector('.home-hero__media img')).toHaveAttribute(
        'src',
        '/images/events/edu-exchange-workshop-1.jpg',
      )

      act(() => vi.advanceTimersByTime(10_000))
      expect(screen.getByText('Lớp đào tạo PTIT Edu Exchange', { selector: '.home-hero__caption' })).toBeInTheDocument()
    } finally {
      unmount()
      vi.useRealTimers()
    }
  })

  it('lets visitors move and pause the hero slideshow manually', () => {
    vi.useFakeTimers()
    const { unmount } = render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )

    try {
      fireEvent.click(screen.getByRole('button', { name: 'Ảnh sự kiện tiếp theo' }))
      expect(screen.getByText('The Moneyverse 2025', { selector: '.home-hero__caption' })).toBeInTheDocument()

      fireEvent.click(screen.getByRole('button', { name: 'Tạm dừng trình chiếu' }))
      act(() => vi.advanceTimersByTime(20_000))
      expect(screen.getByText('The Moneyverse 2025', { selector: '.home-hero__caption' })).toBeInTheDocument()

      fireEvent.click(screen.getByRole('button', { name: 'Tiếp tục trình chiếu' }))
      act(() => vi.advanceTimersByTime(10_000))
      expect(screen.getByText('Workshop PTIT Edu Exchange', { selector: '.home-hero__caption' })).toBeInTheDocument()
    } finally {
      unmount()
      vi.useRealTimers()
    }
  })

  it('snaps from the hero to the AFC intro on the first downward wheel gesture', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )

    const intro = screen.getByTestId('afc-intro-section')
    const scrollIntoView = vi.fn()
    intro.scrollIntoView = scrollIntoView
    Object.defineProperty(intro, 'getBoundingClientRect', { configurable: true, value: () => ({ top: 480 }) })

    Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 })
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 900 })

    fireEvent.wheel(window, { deltaY: 18 })

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' })
  })

  it('snaps downward through the main homepage sections', () => {
    vi.useFakeTimers()
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )

    const contact = document.createElement('footer')
    contact.className = 'site-footer'
    document.body.append(contact)

    const intro = screen.getByTestId('afc-intro-section')
    const tagline = screen.getByTestId('tagline-section')
    const departments = screen.getByTestId('departments-section')
    const events = screen.getByTestId('events-section')

    const introScrollIntoView = vi.fn()
    const taglineScrollIntoView = vi.fn()
    const departmentsScrollIntoView = vi.fn()
    const eventsScrollIntoView = vi.fn()
    const contactScrollIntoView = vi.fn()
    intro.scrollIntoView = introScrollIntoView
    tagline.scrollIntoView = taglineScrollIntoView
    departments.scrollIntoView = departmentsScrollIntoView
    events.scrollIntoView = eventsScrollIntoView
    contact!.scrollIntoView = contactScrollIntoView

    Object.defineProperty(intro, 'getBoundingClientRect', { configurable: true, value: () => ({ top: -20 }) })
    Object.defineProperty(tagline, 'getBoundingClientRect', { configurable: true, value: () => ({ top: 320 }) })
    Object.defineProperty(departments, 'getBoundingClientRect', { configurable: true, value: () => ({ top: 900 }) })
    Object.defineProperty(events, 'getBoundingClientRect', { configurable: true, value: () => ({ top: 900 }) })
    Object.defineProperty(contact, 'getBoundingClientRect', { configurable: true, value: () => ({ top: 1400 }) })

    try {
      fireEvent.wheel(window, { deltaY: 18 })
      expect(taglineScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' })

      Object.defineProperty(tagline, 'getBoundingClientRect', { configurable: true, value: () => ({ top: -20 }) })
      Object.defineProperty(departments, 'getBoundingClientRect', { configurable: true, value: () => ({ top: 280 }) })
      Object.defineProperty(events, 'getBoundingClientRect', { configurable: true, value: () => ({ top: 900 }) })

      act(() => vi.advanceTimersByTime(900))
      fireEvent.wheel(window, { deltaY: 18 })
      expect(departmentsScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' })

      Object.defineProperty(departments, 'getBoundingClientRect', { configurable: true, value: () => ({ top: -20 }) })
      Object.defineProperty(events, 'getBoundingClientRect', { configurable: true, value: () => ({ top: 280 }) })

      act(() => vi.advanceTimersByTime(900))
      fireEvent.wheel(window, { deltaY: 18 })
      expect(eventsScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' })

      Object.defineProperty(events, 'getBoundingClientRect', { configurable: true, value: () => ({ top: -20 }) })
      Object.defineProperty(contact, 'getBoundingClientRect', { configurable: true, value: () => ({ top: 260 }) })

      act(() => vi.advanceTimersByTime(900))
      fireEvent.wheel(window, { deltaY: 18 })
      expect(contactScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' })
    } finally {
      contact.remove()
      vi.useRealTimers()
    }
  })

  it('does not force a snap during ordinary page scroll events', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )

    const intro = screen.getByTestId('afc-intro-section')
    const scrollIntoView = vi.fn()
    intro.scrollIntoView = scrollIntoView
    Object.defineProperty(intro, 'getBoundingClientRect', { configurable: true, value: () => ({ top: 480 }) })

    Object.defineProperty(window, 'scrollY', { configurable: true, value: 1 })
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 900 })

    fireEvent.scroll(window)

    expect(scrollIntoView).not.toHaveBeenCalled()
  })

  it('does not snap back to the AFC intro when visitors scroll upward toward the hero', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )

    const intro = screen.getByTestId('afc-intro-section')
    const scrollIntoView = vi.fn()
    intro.scrollIntoView = scrollIntoView

    Object.defineProperty(window, 'scrollY', { configurable: true, value: 1200 })
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 900 })
    fireEvent.scroll(window)

    Object.defineProperty(window, 'scrollY', { configurable: true, value: 1 })
    fireEvent.scroll(window)

    expect(scrollIntoView).not.toHaveBeenCalled()
  })
})
