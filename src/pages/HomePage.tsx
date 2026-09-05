import { useEffect } from 'react'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { DepartmentPreview } from '../components/DepartmentPreview'
import { EventCard } from '../components/EventCard'
import { HomeHero } from '../components/HomeHero'
import { SectionHeading } from '../components/SectionHeading'
import { StatStrip } from '../components/StatStrip'
import { events } from '../data/events'

const featuredEventIds = ['trading-challenge-2026', 'youth-camp-2026', 'biggame-2026']

export function HomePage() {
  const featuredEvents = featuredEventIds.map((id) => {
    const event = events.find((item) => item.id === id)

    if (!event) throw new Error(`Không tìm thấy sự kiện nổi bật: ${id}`)

    return event
  })

  useEffect(() => {
    let isSnapping = false
    let previousScrollY = window.scrollY

    const getNextSnapTarget = () => {
      const selectors = [
        '[data-testid="afc-intro-section"]',
        '[data-testid="departments-section"]',
        '[data-testid="events-section"]',
        '.site-footer',
      ]

      return selectors
        .map((selector) => document.querySelector<HTMLElement>(selector))
        .find((section) => section && section.getBoundingClientRect().top > 24)
    }

    const snapToNextSection = () => {
      const nextSection = getNextSnapTarget()
      if (!nextSection) return false

      isSnapping = true
      nextSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
      window.setTimeout(() => {
        isSnapping = false
      }, 900)

      return true
    }

    const handleHeroWheel = (event: WheelEvent) => {
      if (event.deltaY <= 0 || isSnapping) return

      if (snapToNextSection()) event.preventDefault()
    }

    const handleHeroScroll = () => {
      const currentScrollY = window.scrollY
      const movingDown = currentScrollY > previousScrollY
      previousScrollY = currentScrollY

      if (isSnapping || !movingDown || currentScrollY <= 0) return

      snapToNextSection()
    }

    window.addEventListener('wheel', handleHeroWheel, { passive: false })
    window.addEventListener('scroll', handleHeroScroll, { passive: true })

    return () => {
      window.removeEventListener('wheel', handleHeroWheel)
      window.removeEventListener('scroll', handleHeroScroll)
    }
  }, [])

  return (
    <main id="main-content">
      <HomeHero />

      <StatStrip />

      <section className="section section--intro" data-testid="afc-intro-section">
        <div className="intro-logo-panel">
          <img
            src="/images/brand/afc-logo-background.png"
            alt="Logo Câu lạc bộ Tài chính Kế toán PTIT"
          />
        </div>
        <div className="intro-copy">
          <SectionHeading
            eyebrow="Về AFC"
            titleLabel="Khởi đầu từ Kế toán, phát triển cùng Tài chính, Fintech và Phân tích dữ liệu"
            title={
              <>
                <span className="section-heading__title-line" data-testid="intro-heading-line">
                  Khởi đầu từ Kế toán, phát triển cùng
                </span>
                <span className="section-heading__title-line" data-testid="intro-heading-line">
                  Tài chính, Fintech và Phân tích dữ liệu
                </span>
              </>
            }
          />
          <div className="intro-story">
            <p className="intro-story__lead">
              Ngày 28/04/2019, AFC được thành lập với mong muốn xây dựng một cộng đồng nơi sinh viên có
              thể học hỏi, chia sẻ kiến thức và cùng nhau phát triển chuyên môn.
            </p>
            <div>
              <p>
                Ngày 19/08/2023, CLB chính thức tái cơ cấu và mang tên Câu lạc bộ Tài chính Kế toán
                PTIT, trực thuộc Khoa Tài chính Kế toán 1, Học viện Công nghệ Bưu chính Viễn thông. Từ
                đó, AFC mở rộng định hướng hoạt động sang các lĩnh vực Tài chính, Kế toán, Fintech và
                Phân tích dữ liệu trong tài chính kinh doanh.
              </p>
              <p>
                Ngày nay, AFC đồng hành cùng Khoa trong việc tổ chức các hoạt động học thuật, chuyên môn
                và sự kiện dành cho sinh viên; đồng thời phối hợp cùng Đoàn Thanh niên và triển khai các
                hoạt động nội bộ nhằm tạo môi trường rèn luyện, kết nối và phát triển cho các thành viên.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--departments" data-testid="departments-section">
        <SectionHeading
          eyebrow="Cơ cấu hoạt động"
          title="Bốn ban, một tập thể"
          description="Mỗi ban đảm nhiệm một vai trò riêng, cùng phối hợp để tạo nên các hoạt động và chương trình của AFC."
          inverse
        />
        <DepartmentPreview />
      </section>

      <section className="section section--events" data-testid="events-section">
        <SectionHeading
          eyebrow="Dấu ấn hoạt động"
          title="Học thật, làm thật, kết nối thật"
          description="Từ các chương trình của Khoa, hoạt động Đoàn đến những sự kiện nội bộ, AFC luôn là nơi các thành viên cùng học hỏi, trải nghiệm và kết nối."
        />
        <div className="featured-events">
          {featuredEvents.map((event, index) => (
            <EventCard event={event} featured={index === 0} key={event.id} />
          ))}
        </div>
        <div className="section-action">
          <Link className="button button--dark" to="/hoat-dong">
            Xem tất cả hoạt động
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  )
}
