import React from 'react'
import './ProductCard.css'

const ProductCard = ({ product, loading }) => {
  if (loading) {
    return (
      <div className="product-card product-card--skeleton">
        <div className="product-card__image skeleton" />
        <div className="product-card__body">
          <div className="skeleton" style={{ height: 12, width: 60, marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 16, width: '80%', marginBottom: 6 }} />
          <div className="skeleton" style={{ height: 16, width: '60%', marginBottom: 16 }} />
          <div className="skeleton" style={{ height: 12, width: 80, marginBottom: 6 }} />
          <div className="skeleton" style={{ height: 20, width: 100, marginBottom: 20 }} />
          <div className="skeleton" style={{ height: 40, width: '100%', borderRadius: 6 }} />
        </div>
      </div>
    )
  }

  const imgUrl = product?.images?.[0] || product?.imageUrl || ''

  return (
    <div className="product-card">
      <div className="product-card__image">
        {imgUrl ? (
          <img src={imgUrl.startsWith('http') ? imgUrl : `/uploads/${imgUrl}`} alt={product.title} />
        ) : (
          <div className="product-card__img-placeholder">
            <svg viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg" width="48">
              <rect width="80" height="60" rx="4" fill="#f0f0f0"/>
              <path d="M28 42L40 24L52 42H28Z" fill="#c0c0c0"/>
              <circle cx="54" cy="22" r="6" fill="#c0c0c0"/>
            </svg>
          </div>
        )}
      </div>
      <div className="product-card__body">
        <span className="product-card__category">{product?.category || product?.framework || 'COMPLIANCE'}</span>
        <h3 className="product-card__title">{product?.title || product?.productTitle}</h3>
        <p className="product-card__price-label">Starts from</p>
        <p className="product-card__price">
          ₹{Number(product?.price || product?.startingPrice || 0).toLocaleString('en-IN')}
        </p>
        <a href={`/product/${product?._id}`} className="product-card__btn">
          SELECT OPTIONS
        </a>
      </div>
    </div>
  )
}

export default ProductCard
