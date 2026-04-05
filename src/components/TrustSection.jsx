import React from 'react'
import { Scale, Grid, Lock, Shield, Users, Star } from 'lucide-react'
import './TrustSection.css'

const ICON_MAP = {
  scale: Scale,
  grid: Grid,
  lock: Lock,
  shield: Shield,
  users: Users,
  star: Star,
}

const DEFAULT_ITEMS = [
  {
    _id: '1',
    iconName: 'scale',
    title: 'Legal Rigor',
    description: "Our audits are conducted by legal experts specializing in Indian digital laws and supreme court rulings.",
  },
  {
    _id: '2',
    iconName: 'grid',
    title: 'Transparent Pricing',
    description: "No hidden fees. Every compliance roadmap is fixed-cost with tiered deliverables and milestone billing.",
  },
  {
    _id: '3',
    iconName: 'lock',
    title: 'Secured Escrow',
    description: "Your data and audit funds are protected via sovereign escrow accounts for total transparency.",
  },
]

const TrustSection = ({ trustSection }) => {
  const headline = trustSection?.headline || 'Trusted by 500+ India Corporations'
  const subHeadline = trustSection?.subHeadline || 'Delivering authority in compliance through rigorous standards and elite expert networks.'
  const items = trustSection?.items?.length ? trustSection.items : DEFAULT_ITEMS

  return (
    <section className="trust-section">
      <div className="trust-section__inner">
        <div className="trust-section__header">
          <h2 className="trust-section__title">{headline}</h2>
          <p className="trust-section__sub">{subHeadline}</p>
        </div>
        <div className="trust-section__grid">
          {items.map((item, i) => {
            const IconComp = ICON_MAP[item.iconName?.toLowerCase()] || Shield
            return (
              <div key={item._id || i} className="trust-card">
                <div className="trust-card__icon">
                  {item.iconUrl
                    ? <img src={item.iconUrl} alt={item.title} width={28} />
                    : <IconComp size={28} color="#6b7280" strokeWidth={1.5} />
                  }
                </div>
                <h3 className="trust-card__title">{item.title}</h3>
                <p className="trust-card__desc">{item.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default TrustSection
