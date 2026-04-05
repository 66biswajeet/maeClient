import React, { useState } from 'react'
import './NewsletterSection.css'

const NewsletterSection = ({ newsletter }) => {
  const [email, setEmail] = useState('')

  const headline = newsletter?.headline || 'Stay Regulatory Ready'
  const subText = newsletter?.subText || "Receive weekly summaries of DPDP amendments and compliance deadlines directly from our legal research desk."
  const placeholder = newsletter?.placeholderText || 'Corporate email address'
  const btnText = newsletter?.buttonText || 'Join Intel Desk'

  const handleSubmit = (e) => {
    e.preventDefault()
    if (email) {
      alert(`Subscribed: ${email}`)
      setEmail('')
    }
  }

  return (
    <section className="newsletter">
      <div className="newsletter__inner">
        <div className="newsletter__card">
          <div className="newsletter__bg-circle newsletter__bg-circle--1" />
          <div className="newsletter__bg-circle newsletter__bg-circle--2" />
          <div className="newsletter__content">
            <h2 className="newsletter__title">{headline}</h2>
            <p className="newsletter__sub">{subText}</p>
            <form className="newsletter__form" onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder={placeholder}
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="newsletter__input"
                required
              />
              <button type="submit" className="newsletter__btn">{btnText}</button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}

export default NewsletterSection
