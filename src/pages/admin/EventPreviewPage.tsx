import { useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { EventImageSlider } from '../../components/EventImageSlider'
import type { EventItem } from '../../data/events'
import { getAdminEventBySlug } from '../../lib/content/adminContent'
import { mapEventRowsToEventItems } from '../../lib/content/contentMapping'
import { getSupabaseClient } from '../../lib/supabase/client'

function formatEventDate(event: EventItem) {
  return event.month ? `Tháng ${event.month}, ${event.year}` : event.year
}

export function EventPreviewPage() {
  const { slug = '' } = useParams()
  const [event, setEvent] = useState<EventItem | null | undefined>(undefined)

  useEffect(() => {
    const supabase = getSupabaseClient()
    if (!supabase) {
      setEvent(null)
      return
    }

    getAdminEventBySlug(supabase, slug)
      .then((row) => setEvent(row ? mapEventRowsToEventItems([row])[0] : null))
      .catch(() => setEvent(null))
  }, [slug])

  if (event === undefined) {
    return <div className="admin-card">Đang tải bản xem trước...</div>
  }

  if (!event) {
    return (
      <div className="admin-card admin-preview">
        <Link to="/admin/events" className="admin-preview__back">
          <ArrowLeft size={16} aria-hidden="true" />
          Quay lại quản lý sự kiện
        </Link>
        <p>Không tìm thấy sự kiện để xem trước.</p>
      </div>
    )
  }

  const paragraphs = event.content.split('\n').filter(Boolean)

  return (
    <article className="admin-card admin-preview">
      <Link to="/admin/events" className="admin-preview__back">
        <ArrowLeft size={16} aria-hidden="true" />
        Quay lại quản lý sự kiện
      </Link>
      <p className="admin-badge admin-badge--draft">Bản xem trước</p>
      <h2>{event.title}</h2>
      <div className="admin-preview__meta">
        <span>{formatEventDate(event)}</span>
        <span>{event.label}</span>
      </div>
      <EventImageSlider title={event.title} images={event.images} />
      <p className="admin-preview__summary">{event.summary}</p>
      <div className="admin-preview__content">
        {paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </article>
  )
}
