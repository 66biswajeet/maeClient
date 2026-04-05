import React from 'react'
import { Phone, Mail, Clock } from 'lucide-react'
import './Footer.css'

const DEFAULT_COLUMNS = [
  {
    _id: '1', columnTitle: 'Categories',
    links: [
      { label: 'ISO 27001 ISMS', url: '#' },
      { label: 'ISO 22301 BCMS', url: '#' },
      { label: 'ISO 42001 AI', url: '#' },
      { label: 'ISO 27017 Cloud Computing', url: '#' },
      { label: 'DPDP', url: '#' },
      { label: 'GDPR', url: '#' },
      { label: 'HIPPA', url: '#' },
    ]
  },
  {
    _id: '2', columnTitle: 'Categories',
    links: [
      { label: 'RBI IT Compliance', url: '#' },
      { label: 'SEBI IT Compliance', url: '#' },
      { label: 'IRDA IT Compliance', url: '#' },
      { label: 'SOC 2 Type 2', url: '#' },
      { label: 'PCI DSS', url: '#' },
      { label: 'IT /OT System Audit', url: '#' },
      { label: 'Others', url: '#' },
    ]
  },
  {
    _id: '3', columnTitle: 'Information',
    links: [
      { label: 'My Account', url: '#' },
      { label: 'Compare', url: '#' },
      { label: 'Wishlist', url: '#' },
      { label: 'My Orders', url: '#' },
      { label: 'Terms & Conditions', url: '#' },
      { label: 'Privacy Policy', url: '#' },
    ]
  },
  {
    _id: '4', columnTitle: 'Customer Service',
    links: [
      { label: 'Help Center', url: '#' },
      { label: 'Customer Journey', url: '#' },
      { label: 'Cancellation Policy', url: '#' },
      { label: 'Feedback', url: '#' },
    ]
  },
]

const Footer = ({ footer, header }) => {
  const columns = footer?.columns?.length ? footer.columns : DEFAULT_COLUMNS
  const copyright = footer?.copyrightText || 'Copyright@2026 Make Audit Easy'

  const phone = header?.topNavbarPhone || '+91 -80087 03648'
  const email = header?.primarySupportEmail || 'info@makeauditeasy.com'

  return (
    <footer className="footer">
      <div className="footer__main">
        <div className="footer__inner">
          {/* Brand col */}
          <div className="footer__brand">
            <a href="/" className="footer__logo">
              <span className="footer-logo-make">MAKE AUDIT </span>
              <span className="footer-logo-easy">EASY</span>
            </a>
            <div className="footer__contact">
              <div className="footer__contact-row">
                <div className="footer__phone-icon">
                  <Phone size={18} color="white" />
                </div>
                <div>
                  <p className="footer__call-label">Call Us</p>
                  <p className="footer__phone">{phone}</p>
                </div>
              </div>
              <p className="footer__email">Email ID: {email}</p>
              <p className="footer__hours">Monday - Friday: 9:00-20:00</p>
              <p className="footer__hours">Saturday: 11:00 - 15:00</p>
            </div>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col._id} className="footer__col">
              <h4 className="footer__col-title">{col.columnTitle}</h4>
              <div className="footer__col-underline" />
              <ul className="footer__links">
                {col.links?.map((link, i) => (
                  <li key={link._id || i}>
                    <a href={link.url}>{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer__bottom">
        <div className="footer__bottom-inner">
          <p className="footer__copyright">{copyright}</p>
        </div>
      </div>

      {/* Very bottom - payments + social */}
      <div className="footer__payments-bar">
        <div className="footer__payments-inner">
          <a href="#" className="footer__chat-btn">
            <span className="footer__chat-icon">💬</span>
            <span>Contact us</span>
          </a>
          <div className="footer__payment-icons">
            <span className="pay-icon">MasterCard</span>
            <span className="pay-icon">P PayPal</span>
            <span className="pay-icon">VISA</span>
            <span className="pay-icon">⊕bitcoin</span>
            <span className="pay-icon">Razorpay</span>
          </div>
          <div className="footer__social">
            <span>Follow Us On</span>
            <a href="#" className="social-icon">𝕏</a>
            <a href="#" className="social-icon">in</a>
            <a href="#" className="social-icon">▶</a>
            <a href="#" className="social-icon">🎵</a>
          </div>
        </div>
      </div>

      {/* Scroll to top */}
      <button
        className="scroll-top"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        title="Scroll to top"
      >
        ↑
      </button>
    </footer>
  )
}

export default Footer
