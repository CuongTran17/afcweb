import { useEffect, useState } from 'react'
import { ArrowDownRight, ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'
import { Link } from 'react-router-dom'
import { events } from '../data/events'
import { siteInfo } from '../data/siteInfo'

const AUTO_ADVANCE_MS = 10_000

const heroImage = (name: string) => `/images/events/${name}`

const heroSlideConfig = [
  { eventId: 'trading-challenge-2026', position: 'center 45%' },
  { eventId: 'moneyverse-2025', position: 'center 48%' },
  { eventId: 'edu-exchange-workshop', position: 'center 48%', image: heroImage('edu-exchange-workshop-1.jpg') },
  { eventId: 'edu-exchange-training', position: 'center 45%' },
  { eventId: 'tax-accounting-seminar', position: 'center 42%' },
  { eventId: 'acca-proud-community', position: 'center 45%' },
  { eventId: 'open-day-2026', position: 'center 45%' },
  { eventId: 'biggame-2026', position: 'center 48%' },
]

const heroSlides = heroSlideConfig.map(({ eventId, image, position }) => {
  const event = events.find(({ id }) => id === eventId)

  if (!event) throw new Error(`Không tìm thấy sự kiện hero: ${eventId}`)

  return { image: image ?? event.images[0], title: event.title, position }
})

export function HomeHero() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const currentSlide = heroSlides[currentIndex]

  useEffect(() => {
    if (paused) return undefined

    const timeout = window.setTimeout(() => {
      setCurrentIndex((index) => (index + 1) % heroSlides.length)
    }, AUTO_ADVANCE_MS)

    return () => window.clearTimeout(timeout)
  }, [currentIndex, paused])

  useEffect(() => {
    const nextImage = new Image()
    nextImage.src = heroSlides[(currentIndex + 1) % heroSlides.length].image
  }, [currentIndex])

  const showPrevious = () => {
    setCurrentIndex((index) => (index - 1 + heroSlides.length) % heroSlides.length)
  }

  const showNext = () => {
    setCurrentIndex((index) => (index + 1) % heroSlides.length)
  }

  return (
    <section className="home-hero" aria-labelledby="home-title">
      <div className="home-hero__media" aria-hidden="true">
        <img
          key={currentSlide.image}
          src={currentSlide.image}
          alt=""
          decoding="async"
          fetchPriority={currentIndex === 0 ? 'high' : 'auto'}
          style={{ objectPosition: currentSlide.position }}
        />
      </div>
      <div className="home-hero__veil" />
      <div className="home-hero__content">
        <p className="home-hero__kicker">AFC · Accounting &amp; Finance Club</p>
        <h1 id="home-title" aria-label={siteInfo.name}>
          <span className="home-hero__title-line" data-testid="home-hero-title-line">Câu lạc bộ</span>
          <span className="home-hero__title-line" data-testid="home-hero-title-line">Tài chính Kế toán PTIT</span>
        </h1>
        <p className="home-hero__lead">{siteInfo.summary}</p>
        <div className="home-hero__actions">
          <Link className="button button--light" to="/co-cau">
            Khám phá cơ cấu
            <ArrowRight aria-hidden="true" />
          </Link>
          <Link className="text-link text-link--light" to="/hoat-dong">
            Hoạt động nổi bật
            <ArrowDownRight aria-hidden="true" />
          </Link>
        </div>
      </div>

      <div className="home-hero__carousel">
        <div className="home-hero__controls" role="group" aria-label="Điều khiển ảnh sự kiện">
          <button type="button" aria-label="Ảnh sự kiện trước" title="Ảnh trước" onClick={showPrevious}>
            <ChevronLeft aria-hidden="true" />
          </button>
          <span aria-label={`Ảnh ${currentIndex + 1} trên ${heroSlides.length}`}>
            {currentIndex + 1} / {heroSlides.length}
          </span>
          <button type="button" aria-label="Ảnh sự kiện tiếp theo" title="Ảnh tiếp theo" onClick={showNext}>
            <ChevronRight aria-hidden="true" />
          </button>
          <button
            className="home-hero__playback"
            type="button"
            aria-label={paused ? 'Tiếp tục trình chiếu' : 'Tạm dừng trình chiếu'}
            title={paused ? 'Tiếp tục' : 'Tạm dừng'}
            onClick={() => setPaused((current) => !current)}
          >
            {paused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}
          </button>
        </div>
        <p className="home-hero__caption">{currentSlide.title}</p>
      </div>
    </section>
  )
}
