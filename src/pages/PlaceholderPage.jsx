import React from 'react'
import './PlaceholderPage.css'

const PlaceholderPage = ({ title = 'Coming Soon' }) => {
  return (
    <div className="placeholder-page">
      <div className="placeholder-page__inner">
        <h1 className="placeholder-page__title">{title}</h1>
        <p className="placeholder-page__sub">This page is under construction. Check back soon.</p>
        <a href="/" className="placeholder-page__back">← Back to Home</a>
      </div>
    </div>
  )
}

export default PlaceholderPage
