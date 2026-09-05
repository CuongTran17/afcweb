import type { ReactNode } from 'react'

type SectionHeadingProps = {
  eyebrow: string
  title: ReactNode
  titleLabel?: string
  description?: string
  inverse?: boolean
}

export function SectionHeading({ eyebrow, title, titleLabel, description, inverse = false }: SectionHeadingProps) {
  return (
    <header className={`section-heading${inverse ? ' section-heading--inverse' : ''}`}>
      <p className="section-heading__eyebrow">{eyebrow}</p>
      <div className="section-heading__content">
        <h2 aria-label={titleLabel}>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
    </header>
  )
}
