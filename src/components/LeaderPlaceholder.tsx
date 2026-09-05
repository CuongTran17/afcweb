import { UserRound } from 'lucide-react'
import type { Leader } from '../data/leadership'

type LeaderPlaceholderProps = {
  leader: Leader
  prominent?: boolean
}

export function LeaderPlaceholder({ leader, prominent = false }: LeaderPlaceholderProps) {
  return (
    <article className={`leader-card${prominent ? ' leader-card--prominent' : ''}`}>
      <div className="leader-card__portrait">
        {leader.image ? (
          <img src={leader.image} alt={leader.name} />
        ) : (
          <div aria-label={`Ảnh thành viên sẽ được cập nhật: ${leader.name}`}>
            <UserRound aria-hidden="true" />
            <span>AFC · GEN 9</span>
          </div>
        )}
      </div>
      <div className="leader-card__info">
        <p>{leader.department}</p>
        <h3>{leader.name}</h3>
        <span>{leader.role}{leader.cohort ? ` · ${leader.cohort}` : ''}</span>
      </div>
    </article>
  )
}
