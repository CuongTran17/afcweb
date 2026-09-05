import { ExternalLink, Mail, MapPin, Phone } from 'lucide-react'
import { siteInfo } from '../data/siteInfo'

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <img src="/images/brand/afc-logo-white.png" alt="Logo AFC" />
          <div>
            <p className="eyebrow">Thông tin liên hệ</p>
            <h2>CLB Tài chính Kế toán AFC</h2>
            <p>{siteInfo.academy}</p>
          </div>
        </div>

        <div className="site-footer__contact">
          <a href={`mailto:${siteInfo.contact.email}`}>
            <Mail aria-hidden="true" />
            <span>{siteInfo.contact.email}</span>
          </a>
          <a href={siteInfo.contact.facebook} target="_blank" rel="noreferrer">
            <ExternalLink aria-hidden="true" />
            <span>{siteInfo.contact.facebookLabel}</span>
          </a>
          {siteInfo.contact.hotlines.map((hotline) => (
            <a key={hotline.phone} href={`tel:${hotline.phone}`}>
              <Phone aria-hidden="true" />
              <span>{hotline.phone} · {hotline.name} ({hotline.role})</span>
            </a>
          ))}
          <p>
            <MapPin aria-hidden="true" />
            <span>Khoa Tài chính Kế toán 1, PTIT</span>
          </p>
        </div>
      </div>
      <div className="site-footer__legal">
        <span>© 2026 AFC PTIT</span>
        <span>Accounting &amp; Finance Club</span>
      </div>
    </footer>
  )
}
