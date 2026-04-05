import React, { useState, useEffect } from 'react'
import ProductCard from './ProductCard'
import { getProducts } from '../services/api'
import './ProductSection.css'

const FeaturedProducts = ({ featuredGrid }) => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProducts({ featured: true, limit: 5 })
      .then(res => {
        const data = res.data?.products || res.data || []
        setProducts(Array.isArray(data) ? data.slice(0, 5) : [])
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [])

  const skeletons = Array(5).fill(null)

  return (
    <section className="product-section">
      <div className="product-section__inner">
        <div className="product-section__header">
          <div>
            <h2 className="product-section__title">
              {featuredGrid?.sectionTitle || 'Featured Products'}
            </h2>
            <p className="product-section__sub">
              {featuredGrid?.sectionSubText || 'Handpicked compliance solutions from verified industry experts.'}
            </p>
          </div>
          <a href="/products" className="product-section__see-all">See All Services</a>
        </div>

        <div className="product-section__grid">
          {loading
            ? skeletons.map((_, i) => <ProductCard key={i} loading={true} />)
            : products.length > 0
              ? products.map(p => <ProductCard key={p._id} product={p} />)
              : skeletons.map((_, i) => <ProductCard key={i} loading={true} />)
          }
        </div>
      </div>
    </section>
  )
}

export default FeaturedProducts
