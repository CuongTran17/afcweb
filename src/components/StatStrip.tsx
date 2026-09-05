import { siteInfo } from '../data/siteInfo'

export function StatStrip() {
  return (
    <section className="stat-strip" aria-label="Số liệu nổi bật">
      <div className="stat-strip__inner">
        {siteInfo.stats.map((stat) => (
          <div className="stat" key={stat.label}>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </div>
        ))}
        <p className="stat-strip__founded">
          Thành lập
          <strong>{siteInfo.foundedDate}</strong>
        </p>
      </div>
    </section>
  )
}
