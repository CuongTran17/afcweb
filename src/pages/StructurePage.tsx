import { LeaderPlaceholder } from '../components/LeaderPlaceholder'
import { SectionHeading } from '../components/SectionHeading'
import { departments } from '../data/departments'
import { leadership } from '../data/leadership'

export function StructurePage() {
  const chairpersons = leadership.filter((leader) => leader.department === 'Ban Chủ nhiệm')
  const departmentLeaders = leadership.filter((leader) => leader.department !== 'Ban Chủ nhiệm')

  return (
    <main id="main-content">
      <section className="page-hero page-hero--structure">
        <div className="page-hero__index">02</div>
        <div className="page-hero__content">
          <p className="page-hero__eyebrow">Con người &amp; vận hành</p>
          <h1>Cơ cấu CLB</h1>
          <p className="page-hero__desc">
            AFC Gen 9 được vận hành bởi Ban Chủ nhiệm và bốn ban chuyên môn hóa,
            cùng hướng tới một môi trường học thuật chủ động và trách nhiệm.
          </p>
        </div>
      </section>

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

      <section className="section section--department-detail">
        <SectionHeading
          eyebrow="Bốn ban chuyên trách"
          title="Rõ vai trò, chung mục tiêu"
          description="Từng ban có nhiệm vụ riêng nhưng luôn phối hợp xuyên suốt từ nội dung, hình ảnh đến tổ chức và đối tác."
          inverse
        />
        <div className="department-detail-list">
          {departments.map((department) => {
            const Icon = department.icon
            return (
              <article className="department-detail" key={department.id}>
                <div className="department-detail__title">
                  <span>{department.number}</span>
                  <Icon aria-hidden="true" />
                  <h2>{department.name}</h2>
                </div>
                <ul>
                  {department.responsibilities.map((responsibility) => (
                    <li key={responsibility}>{responsibility}</li>
                  ))}
                </ul>
              </article>
            )
          })}
        </div>
      </section>

      <section className="section section--directory">
        <SectionHeading
          eyebrow="Ban điều hành Gen 9"
          title="Những người phụ trách từng mảng"
          description="Hồ sơ ảnh sẽ được cập nhật sau; thông tin chức danh hiện đã sẵn sàng để công bố."
        />
        <div className="leader-directory">
          {departmentLeaders.map((leader) => (
            <LeaderPlaceholder leader={leader} key={`${leader.department}-${leader.name}`} />
          ))}
        </div>
      </section>
    </main>
  )
}
