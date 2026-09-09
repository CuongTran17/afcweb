import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { EventItem } from '../data/events'

type EventCardProps = {
  event: EventItem
  featured?: boolean
}

export function EventCard({ event, featured = false }: EventCardProps) {
  const [activeImage, setActiveImage] = useState(0)
  const hasGallery = event.images.length > 1
  const eventDate = event.month
    ? `Tháng ${Number.parseInt(event.month, 10)}, ${event.year}`
    : event.year
  const showPreviousImage = () => {
    setActiveImage((current) => (current - 1 + event.images.length) % event.images.length)
  }
  const showNextImage = () => {
    setActiveImage((current) => (current + 1) % event.images.length)
  }

  return (
    <article className={`event-card${featured ? ' event-card--featured' : ''}`}>
      <div className="event-card__media">
        <img
          src={event.images[activeImage]}
          alt={`${event.title} - ảnh ${activeImage + 1}`}
          loading="lazy"
        />
        {hasGallery ? (
          <div className="event-card__gallery" role="group" aria-label={`${event.images.length} ảnh`}>
            <button
              type="button"
              aria-label={`Ảnh trước của ${event.title}`}
              onClick={showPreviousImage}
            >
              <ChevronLeft aria-hidden="true" />
            </button>
            <span aria-label={`Ảnh ${activeImage + 1} trên ${event.images.length}`} aria-live="polite">
              {activeImage + 1} / {event.images.length}
            </span>
            <button
              type="button"
              aria-label={`Ảnh tiếp theo của ${event.title}`}
              onClick={showNextImage}
            >
              <ChevronRight aria-hidden="true" />
            </button>
          </div>
        ) : null}
      </div>
      <div className="event-card__body">
        <div className="event-card__meta">
          <span>{event.label}</span>
          <time>{eventDate}</time>
        </div>
        <h3>
          <Link to={`/hoat-dong/${event.id}`} aria-label={`Xem chi tiết ${event.title}`}>
            {event.title}
          </Link>
        </h3>
        <p>{event.summary}</p>
      </div>
    </article>
  )
}
