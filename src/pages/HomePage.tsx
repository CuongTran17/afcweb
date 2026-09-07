import { useEffect, useRef, useState } from 'react'
import { ArrowRight, BookOpenCheck, CalendarCheck2, Handshake, type LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { DepartmentPreview } from '../components/DepartmentPreview'
import { EventCard } from '../components/EventCard'
import { HomeHero } from '../components/HomeHero'
import { SectionHeading } from '../components/SectionHeading'
import { StatStrip } from '../components/StatStrip'
import { events, type EventItem } from '../data/events'
import { getFeaturedHomeEvents } from '../lib/content/publicContent'

const featuredEventIds = ['trading-challenge-2026', 'youth-camp-2026', 'biggame-2026']
const taglineSegments = ['Từ', 'kiến thức', 'trên', 'giảng đường', 'đến', 'trải', 'nghiệm', 'trong', 'thực tế.']
const taglinePopouts: Record<string, { alt: string; icon: LucideIcon; image: string; label: string; placement: string }> = {
  'kiến thức': {
    alt: 'Workshop PTIT Edu Exchange',
    icon: BookOpenCheck,
    image: '/images/events/edu-exchange-workshop-2.jpg',
    label: 'Chuyên môn',
    placement: 'tagline-reveal__popout--callout-right',
  },
  'giảng đường': {
    alt: 'Lớp đào tạo PTIT Edu Exchange',
    icon: CalendarCheck2,
    image: '/images/events/edu-exchange-training-2.jpg',
    label: 'Sự kiện',
    placement: 'tagline-reveal__popout--top-left',
  },
  'thực tế.': {
    alt: 'Chung kết PTIT Trading Challenge',
    icon: Handshake,
    image: '/images/events/trading-challenge-2.jpg',
    label: 'Kết nối',
    placement: 'tagline-reveal__popout--bottom-right',
  },
}

function TaglineReveal() {
  const sectionRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!sectionRef.current) return undefined

    const words = Array.from(sectionRef.current.querySelectorAll<HTMLElement>('.tagline-reveal__word'))
    if (!('IntersectionObserver' in window)) {
      sectionRef.current.classList.add('tagline-reveal--visible')
      words.forEach((word) => word.classList.add('tagline-reveal__word--visible'))
      return undefined
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return

          sectionRef.current?.classList.add('tagline-reveal--visible')
          words.forEach((word, index) => {
            window.setTimeout(() => word.classList.add('tagline-reveal__word--visible'), index * 70)
          })
          observer.disconnect()
        })
      },
      { threshold: 0.45 },
    )

    observer.observe(sectionRef.current)

    return () => observer.disconnect()
  }, [])

  return (
    <section
      className="section tagline-reveal home-snap-panel"
      ref={sectionRef}
      aria-labelledby="tagline-title"
      data-testid="tagline-section"
    >
      <div className="tagline-reveal__inner">
        <h2 id="tagline-title" aria-label="Từ kiến thức trên giảng đường đến trải nghiệm trong thực tế.">
          {taglineSegments.map((segment, index) => (
            <span className="tagline-reveal__word-wrap" key={`${segment}-${index}`}>
              {taglinePopouts[segment] ? (
                (() => {
                  const PopoutIcon = taglinePopouts[segment].icon
                  return (
                    <button
                      className="tagline-reveal__word tagline-reveal__hotspot"
                      data-testid="tagline-reveal-word"
                      type="button"
                      aria-label={`Xem hình ảnh minh họa cho ${segment.replace('.', '')}`}
                      style={{ transitionDelay: `${index * 45}ms` }}
                    >
                      <span>{segment}</span>
                      <span
                        className={`tagline-reveal__popout ${taglinePopouts[segment].placement}`}
                      >
                        <img src={taglinePopouts[segment].image} alt={taglinePopouts[segment].alt} />
                        <span className="tagline-reveal__popout-chip">
                          <PopoutIcon aria-hidden="true" />
                          {taglinePopouts[segment].label}
                        </span>
                      </span>
                    </button>
                  )
                })()
              ) : (
                <span
                  className="tagline-reveal__word"
                  data-testid="tagline-reveal-word"
                  style={{ transitionDelay: `${index * 45}ms` }}
                >
                  {segment}
                </span>
              )}{' '}
            </span>
          ))}
        </h2>
        <p>
          AFC kết nối kiến thức chuyên môn, trải nghiệm thực tế và những con người cùng chung định hướng.
        </p>
      </div>
    </section>
  )
}

export function HomePage() {
  const [featuredEvents, setFeaturedEvents] = useState<EventItem[]>(() =>
    featuredEventIds
      .map((id) => events.find((item) => item.id === id))
      .filter((item): item is EventItem => Boolean(item)),
  )

  useEffect(() => {
    getFeaturedHomeEvents()
      .then((items) => {
        if (items && items.length > 0) {
          setFeaturedEvents(items)
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    let isSnapping = false

    const getNextSnapTarget = () => {
      const selectors = [
        '[data-testid="afc-intro-section"]',
        '[data-testid="tagline-section"]',
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

    window.addEventListener('wheel', handleHeroWheel, { passive: false })

    return () => {
      window.removeEventListener('wheel', handleHeroWheel)
    }
  }, [])

  return (
    <main id="main-content">
      <HomeHero />

      <StatStrip />

      <section className="section section--intro home-snap-panel" data-testid="afc-intro-section">
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

      <TaglineReveal />

      <section className="section section--departments home-snap-panel" data-testid="departments-section">
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
