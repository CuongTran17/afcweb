import { useEffect, useState } from 'react'
import { ArrowRight, X } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { LeaderPlaceholder } from '../components/LeaderPlaceholder'
import { SectionHeading } from '../components/SectionHeading'
import { departments, type Department } from '../data/departments'
import { leadership } from '../data/leadership'

export function StructurePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(() => {
    const banParam = searchParams.get('ban')
    if (banParam) {
      return departments.find((d) => d.id === banParam) || null
    }
    return null
  })

  const chairpersons = leadership.filter((leader) => leader.department === 'Ban Chủ nhiệm')
  const departmentLeaders = leadership.filter((leader) => leader.department !== 'Ban Chủ nhiệm')

  useEffect(() => {
    const banParam = searchParams.get('ban')
    if (banParam) {
      const matched = departments.find((d) => d.id === banParam)
      if (matched) {
        setSelectedDepartment(matched)
      }
    }
  }, [searchParams])

  const handleOpenDepartment = (dept: Department) => {
    setSelectedDepartment(dept)
    setSearchParams({ ban: dept.id }, { replace: true })
  }

  const handleCloseDepartment = () => {
    setSelectedDepartment(null)
    if (searchParams.has('ban')) {
      const newParams = new URLSearchParams(searchParams)
      newParams.delete('ban')
      setSearchParams(newParams, { replace: true })
    }
  }

  useEffect(() => {
    if (!selectedDepartment) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleCloseDepartment()
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedDepartment, searchParams])

  return (
    <main id="main-content">
      <section className="page-hero page-hero--structure">
        <img
          src="/images/pages/structure-hero.jpg"
          alt="Thành viên Câu lạc bộ Tài chính Kế toán PTIT - AFC"
          decoding="async"
        />
        <div className="page-hero__veil" />
        <div className="page-hero__content">
          <p className="page-hero__eyebrow">Con người · Vận hành</p>
          <h1>Cơ cấu CLB</h1>
          <p className="page-hero__desc">
            AFC được tổ chức thành bốn ban chuyên trách, dưới sự điều phối của Ban Chủ nhiệm,
            cùng hướng tới một môi trường học thuật chủ động và trách nhiệm.
          </p>
        </div>
      </section>

      {/* 1. Bốn ban chuyên trách */}
      <section className="section section--departments-grid">
        <SectionHeading
          eyebrow="Cơ cấu tổ chức"
          title="Bốn ban chuyên trách"
          description="Mỗi ban đảm nhiệm một mảng chuyên biệt và phối hợp chặt chẽ để triển khai toàn diện các hoạt động của CLB."
        />
        <div className="department-cards">
          {departments.map((department) => {
            const Icon = department.icon
            return (
              <article className="department-card" key={department.id}>
                <div className="department-card__top">
                  <div className="department-card__icon">
                    <Icon aria-hidden="true" />
                  </div>
                </div>
                <h3>{department.name}</h3>
                <p>{department.description}</p>
                <button
                  type="button"
                  className="department-card__button"
                  onClick={() => handleOpenDepartment(department)}
                >
                  Xem nhiệm vụ
                  <ArrowRight aria-hidden="true" />
                </button>
              </article>
            )
          })}
        </div>
      </section>

      {/* 2. Ban Chủ nhiệm */}
      <section className="section section--leadership">
        <SectionHeading
          eyebrow="Ban Chủ nhiệm"
          title="Định hướng và kết nối"
          description="Ban Chủ nhiệm điều phối hoạt động chung, gìn giữ văn hóa và kết nối nguồn lực giữa các ban."
        />
        <div className="chairpersons">
          {chairpersons.map((leader, index) => (
            <LeaderPlaceholder leader={leader} prominent={index === 0} key={leader.name} />
          ))}
        </div>
      </section>

      {/* 3. Các trưởng ban & phó ban */}
      <section className="section section--directory">
        <SectionHeading
          eyebrow="Đội ngũ ban chuyên trách"
          title="Các trưởng ban &amp; phó ban"
          description="Những nhân tố trực tiếp điều phối, quản lý và triển khai công việc chuyên môn tại từng ban."
        />
        <div className="leader-directory">
          {departmentLeaders.map((leader) => (
            <LeaderPlaceholder leader={leader} key={`${leader.department}-${leader.name}`} />
          ))}
        </div>
      </section>

      {/* Popup nhiệm vụ ban */}
      {selectedDepartment && (
        <div
          className="department-modal-backdrop"
          onClick={handleCloseDepartment}
          role="presentation"
        >
          <div
            className="department-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-department-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="department-modal__header">
              <div className="department-modal__badge">
                <selectedDepartment.icon aria-hidden="true" />
              </div>
              <button
                type="button"
                className="department-modal__close"
                onClick={handleCloseDepartment}
                aria-label="Đóng popup"
              >
                <X aria-hidden="true" />
              </button>
            </div>

            <h2 id="modal-department-title">{selectedDepartment.name}</h2>
            <p className="department-modal__desc">{selectedDepartment.description}</p>

            <div className="department-modal__content">
              <h3 className="department-modal__subtitle">Nhiệm vụ trọng tâm</h3>
              <ul className="department-modal__list">
                {selectedDepartment.responsibilities.map((resp, idx) => (
                  <li key={idx}>
                    <span className="department-modal__bullet">0{idx + 1}</span>
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="department-modal__footer">
              <button
                type="button"
                className="button button--dark"
                onClick={handleCloseDepartment}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
