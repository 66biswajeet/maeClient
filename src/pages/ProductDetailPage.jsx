import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { X, MapPin, Package, Heart, Share2 } from "lucide-react";
import axios from "axios";
import "./ProductDetailPage.css";

const ProductDetailPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cities, setCities] = useState([]);
  const [plans, setPlans] = useState([]);

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

  // Extract filter parameters from URL
  const cityId = searchParams.get("city");
  const planId = searchParams.get("plan");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch product
        const productRes = await axios.get(`${API_BASE}/products/${id}`);
        setProduct(productRes.data);

        // Fetch cities and plans for reference
        const [citiesRes, plansRes] = await Promise.all([
          axios.get(`${API_BASE}/cities`),
          axios.get(`${API_BASE}/plans`),
        ]);

        setCities(citiesRes.data.cities || citiesRes.data || []);
        setPlans(plansRes.data.plans || plansRes.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="product-detail__loading">
        <div className="spinner"></div>
        <p>Loading product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail__error">
        <p>Error loading product: {error || "Product not found"}</p>
        <button
          onClick={() => navigate(-1)}
          className="product-detail__back-btn"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Find selected variant if filters are applied
  const selectedVariant =
    cityId && planId
      ? product.variants?.find(
          (v) =>
            v.city?._id?.toString() === cityId &&
            v.plan?._id?.toString() === planId,
        )
      : null;

  // Get city and plan names
  const selectedCity = cities.find((c) => c._id === cityId);
  const selectedPlan = plans.find((p) => p._id === planId);

  // Determine price to display
  const displayPrice =
    selectedVariant?.salePrice ||
    selectedVariant?.price ||
    product.displayPrice ||
    product.basePrice ||
    0;

  return (
    <div className="product-detail">
      <div className="product-detail__breadcrumb">
        <button onClick={() => navigate(-1)} className="product-detail__back">
          ← Back
        </button>
      </div>

      <div className="product-detail__container">
        {/* Category Breadcrumb Tracker */}
        <div className="product-detail__breadcrumb-path">
          {product.categories && product.categories.length > 0 ? (
            <div className="product-detail__path-items">
              {product.categories.map((cat, idx) => (
                <div key={cat._id || idx} className="product-detail__path-item">
                  <span className="product-detail__path-name">
                    {cat.name || cat}
                  </span>
                  {idx < product.categories.length - 1 && (
                    <span className="product-detail__path-separator">→</span>
                  )}
                </div>
              ))}
              <span className="product-detail__path-separator">→</span>
              <span className="product-detail__product-path-name">
                {product.title}
              </span>
            </div>
          ) : (
            <span className="product-detail__product-path-name">
              {product.title}
            </span>
          )}
        </div>

        {/* Top Info Section - Filters & Vendor */}
        <div className="product-detail__top-info">
          {/* Left: Applied Filters */}
          <div className="product-detail__top-left">
            {(cityId || planId) && (
              <div className="product-detail__filter-info">
                <span className="product-detail__filter-label">
                  Applied Filters:
                </span>
                <div className="product-detail__filter-tags">
                  {selectedPlan && (
                    <span className="product-detail__filter-tag">
                      {selectedPlan.name}
                    </span>
                  )}
                  {selectedCity && (
                    <span className="product-detail__filter-tag">
                      {selectedCity.name}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right: Vendor Info */}
          <div className="product-detail__top-right">
            {product.vendor && (
              <div className="product-detail__vendor-info">
                <span className="product-detail__vendor-label">
                  Provided by
                </span>
                <span className="product-detail__vendor-name">
                  {typeof product.vendor === "object"
                    ? product.vendor.name
                    : product.vendor}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Top Section - Image & Details */}
        <div className="product-detail__hero">
          {/* Left: Image */}
          <div className="product-detail__image-section">
            <div className="product-detail__image-container">
              {product.images && product.images.length > 0 && (
                <img
                  src={product.images[0].url}
                  alt={product.title}
                  className="product-detail__main-image"
                />
              )}
            </div>

            {/* Deliverables Preview */}
            {product.deliverables && product.deliverables.length > 0 && (
              <div className="product-detail__deliverables-preview">
                {product.deliverables.slice(0, 3).map((item, idx) => (
                  <div key={idx} className="product-detail__deliverable-check">
                    <span className="check-icon">✓</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Info & Options */}
          <div className="product-detail__info-section">
            {/* Product Title & Category */}
            <div className="product-detail__header">
              {product.categories && product.categories.length > 0 && (
                <span className="product-detail__category-badge">
                  {product.categories[0].name || product.categories[0]}
                </span>
              )}
              <h1 className="product-detail__title">{product.title}</h1>
              {product.shortDesc && (
                <p className="product-detail__subtitle">{product.shortDesc}</p>
              )}
            </div>

            {/* Price Display */}
            <div className="product-detail__price-display">
              <div className="product-detail__price-box">
                <span className="product-detail__price-label">
                  {selectedVariant ? "Your Price" : "Price"}
                </span>
                <div className="product-detail__price-values">
                  <span className="product-detail__current-price">
                    ₹{displayPrice.toLocaleString("en-IN")}
                  </span>
                  {selectedVariant?.salePrice && (
                    <span className="product-detail__original-price">
                      ₹{selectedVariant.price.toLocaleString("en-IN")}
                    </span>
                  )}
                </div>
                {selectedVariant?.salePrice && (
                  <span className="product-detail__discount-badge">
                    -
                    {Math.round(
                      ((selectedVariant.price - selectedVariant.salePrice) /
                        selectedVariant.price) *
                        100,
                    )}
                    %
                  </span>
                )}
              </div>
            </div>

            {/* Rating & Reviews */}
            <div className="product-detail__rating">
              <div className="product-detail__stars">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={`star ${i < Math.round(product.avgRating || 0) ? "filled" : ""}`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="product-detail__reviews">
                {product.reviewCount || 0} customer reviews
              </span>
            </div>

            {/* Quantity & Action Buttons */}
            <div className="product-detail__purchase">
              <div className="product-detail__quantity">
                <button className="qty-btn">−</button>
                <input type="number" value="1" readOnly />
                <button className="qty-btn">+</button>
              </div>
              <button className="product-detail__btn-add-to-cart">
                Add to Cart
              </button>
            </div>

            {/* Secondary Actions */}
            <div className="product-detail__secondary-actions">
              <button className="product-detail__action-btn">
                <Heart size={18} /> Add to Wishlist
              </button>
              <button className="product-detail__action-btn">
                <Share2 size={18} /> Share
              </button>
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="product-detail__description-full">
          {product.description && (
            <div className="product-detail__desc-content">
              <h2 className="product-detail__section-title">
                Full Service Description
              </h2>
              <div
                className="product-detail__desc-text"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </div>
          )}

          {/* All Deliverables */}
          {product.deliverables && product.deliverables.length > 0 && (
            <div className="product-detail__deliverables-full">
              <h2 className="product-detail__section-title">
                Key Deliverables
              </h2>
              <ul className="product-detail__deliverables-list">
                {product.deliverables.map((item, idx) => (
                  <li key={idx} className="product-detail__deliverable-item">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
