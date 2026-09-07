import { useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { EventImageSlider } from '../components/EventImageSlider'
import type { EventItem } from '../data/events'
import { getPublicEventBySlug } from '../lib/content/publicContent'

const categoryLabels: Record<EventItem['category'], string> = {
  academic: 'Học thuật & chuyên môn',
  community: 'Cộng đồng',
  internal: 'Nội bộ',
}

function formatEventDate(event: EventItem) {
  return event.month ? `Tháng ${event.month}, ${event.year}` : event.year
}

export function EventDetailPage() {
  const { slug = '' } = useParams()
  const [event, setEvent] = useState<EventItem | null | undefined>(undefined)

  useEffect(() => {
    getPublicEventBySlug(slug).then(setEvent).catch(() => setEvent(null))
  }, [slug])

  if (event === undefined) {
    return (
      <main id="main-content" className="event-detail">
        <p>Đang tải sự kiện...</p>
      </main>
    )
  }

  if (!event) {
    return (
      <main id="main-content" className="event-detail event-detail--empty">
        <h1>Không tìm thấy sự kiện</h1>
        <Link to="/hoat-dong" className="event-detail__back">
          <ArrowLeft aria-hidden="true" />
          Quay lại Hoạt động
        </Link>
      </main>
    )
  }

  const paragraphs = event.content.split('\n').filter(Boolean)

  return (
    <main id="main-content" className="event-detail">
      <article>
        <header className="event-detail__header">
          <h1>{event.title}</h1>
          <div className="event-detail__meta">
            <time>{formatEventDate(event)}</time>
            <span>{categoryLabels[event.category]}</span>
            <span>{event.label}</span>
          </div>
          <EventImageSlider title={event.title} images={event.images} />
        </header>
        <section className="event-detail__body">
          <p className="event-detail__summary">{event.summary}</p>
          <div className="event-detail__content">
            {paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <Link to="/hoat-dong" className="event-detail__back">
            <ArrowLeft aria-hidden="true" />
            Quay lại Hoạt động
          </Link>
        </section>
      </article>
    </main>
  )
}
