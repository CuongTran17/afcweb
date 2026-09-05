import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { departments } from '../data/departments'

export function DepartmentPreview() {
  return (
    <div className="department-preview">
      {departments.map((department) => {
        const Icon = department.icon

        return (
          <article className="department-preview__item" key={department.id}>
            <div className="department-preview__topline">
              <Icon aria-hidden="true" />
            </div>
            <h3>{department.name}</h3>
            <p>{department.description}</p>
            <Link to={`/co-cau?ban=${department.id}`}>
              Xem nhiệm vụ
              <ArrowRight aria-hidden="true" />
            </Link>
          </article>
        )
      })}
    </div>
  )
}
