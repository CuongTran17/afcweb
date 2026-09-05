import { useState } from 'react'
import { EventCard } from '../components/EventCard'
import { SectionHeading } from '../components/SectionHeading'
import { events, type EventCategory } from '../data/events'

type FilterValue = 'all' | EventCategory

const filters: Array<{ value: FilterValue; label: string }> = [
  { value: 'all', label: 'Tất cả' },
  { value: 'academic', label: 'Học thuật & chuyên môn' },
  { value: 'community', label: 'Cộng đồng' },
  { value: 'internal', label: 'Nội bộ' },
]

export function ActivitiesPage() {
  const [activeFilter, setActiveFilter] = useState<FilterValue>('all')
  const visibleEvents = activeFilter === 'all'
    ? events
    : events.filter((event) => event.category === activeFilter)

  return (
    <main id="main-content">
      <section className="activity-hero">
        <img src="/images/events/biggame-2026-2.jpg" alt="Thành viên AFC tại Biggame 2026" />
        <div className="activity-hero__veil" />
        <div className="activity-hero__content">
          <p className="activity-hero__eyebrow">Học thuật · Cộng đồng · Nội bộ</p>
          <h1>Hoạt động</h1>
          <span className="activity-hero__desc">Những dấu mốc được tạo nên từ tinh thần chủ động, trách nhiệm và cùng nhau trưởng thành.</span>
        </div>
      </section>

      <section className="section section--archive">
        <SectionHeading
          eyebrow="Khoảnh khắc AFC"
          title="Một hành trình nhiều sắc màu"
          description="Từ hội thảo chuyên môn, sân chơi tài chính đến những hoạt động kết nối trong và ngoài CLB."
        />

        <div className="activity-filters" role="group" aria-label="Lọc hoạt động">
          {filters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              className={activeFilter === filter.value ? 'active' : undefined}
              aria-pressed={activeFilter === filter.value}
              onClick={() => setActiveFilter(filter.value)}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <p className="activity-count" aria-live="polite">{visibleEvents.length} hoạt động</p>
        <div className="event-archive">
          {visibleEvents.map((event, index) => (
            <EventCard event={event} featured={activeFilter === 'all' && index === 0} key={event.id} />
          ))}
        </div>
      </section>
    </main>
  )
}
