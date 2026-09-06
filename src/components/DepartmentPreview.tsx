import { useEffect, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { departments as staticDepartments, type Department } from '../data/departments'
import { getPublicDepartments } from '../lib/content/publicContent'

type DepartmentPreviewProps = {
  departments?: Department[]
}

export function DepartmentPreview({ departments: propDepartments }: DepartmentPreviewProps = {}) {
  const [departmentList, setDepartmentList] = useState<Department[]>(
    propDepartments || staticDepartments,
  )

  useEffect(() => {
    if (propDepartments) {
      setDepartmentList(propDepartments)
      return
    }

    getPublicDepartments()
      .then((data) => {
        if (data && data.length > 0) {
          setDepartmentList(data)
        }
      })
      .catch(() => {})
  }, [propDepartments])

  return (
    <div className="department-preview">
      {departmentList.map((department) => {
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
