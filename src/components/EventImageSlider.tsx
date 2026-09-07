import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type EventImageSliderProps = {
  images: string[]
  title: string
  showThumbnails?: boolean
}

export function EventImageSlider({ images, title, showThumbnails = true }: EventImageSliderProps) {
  const safeImages = images.length > 0 ? images : ['/images/events/biggame-2026-2.jpg']
  const [activeIndex, setActiveIndex] = useState(0)
  const hasGallery = safeImages.length > 1

  const showPreviousImage = () => {
    setActiveIndex((current) => (current - 1 + safeImages.length) % safeImages.length)
  }

  const showNextImage = () => {
    setActiveIndex((current) => (current + 1) % safeImages.length)
  }

  return (
    <div className="event-slider">
      <div className="event-slider__stage">
        <img src={safeImages[activeIndex]} alt={`${title} - ảnh ${activeIndex + 1}`} />
        {hasGallery ? (
          <div className="event-slider__controls" role="group" aria-label={`Điều khiển ảnh ${title}`}>
            <button type="button" aria-label={`Ảnh trước của ${title}`} onClick={showPreviousImage}>
              <ChevronLeft aria-hidden="true" />
            </button>
            <span aria-live="polite">
              {activeIndex + 1} / {safeImages.length}
            </span>
            <button type="button" aria-label={`Ảnh tiếp theo của ${title}`} onClick={showNextImage}>
              <ChevronRight aria-hidden="true" />
            </button>
          </div>
        ) : null}
      </div>
      {showThumbnails && hasGallery ? (
        <div className="event-slider__thumbs" aria-label={`Chọn ảnh của ${title}`}>
          {safeImages.map((image, index) => (
            <button
              type="button"
              key={`${image}-${index}`}
              className={
                index === activeIndex ? 'event-slider__thumb event-slider__thumb--active' : 'event-slider__thumb'
              }
              aria-label={`Xem ảnh ${index + 1} của ${title}`}
              aria-pressed={index === activeIndex}
              onClick={() => setActiveIndex(index)}
            >
              <img src={image} alt="" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
