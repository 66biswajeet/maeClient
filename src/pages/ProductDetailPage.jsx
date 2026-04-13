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
  const [plans, setPlans] = useState([]);
  const [cities, setCities] = useState([]);

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

  // Extract filter parameters from URL
  const zoneParam = searchParams.get("zone");
  const planParam = searchParams.get("plan");

  // Parse zone and plan params (can be comma-separated for multiple)
  const selectedZones = zoneParam ? zoneParam.split(",").filter(Boolean) : [];
  const selectedPlanIds = planParam ? planParam.split(",").filter(Boolean) : [];

  // Zone options for display
  const ZONE_OPTIONS = {
    basecity: "📍 Your Base City",
    north: "🔵 North Zone",
    south: "🔵 South Zone",
    east: "🔵 East Zone",
    west: "🔵 West Zone",
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // If zones and plan are provided, fetch with filters to get finalPrice calculated
        if (selectedZones.length > 0 && selectedPlanIds.length > 0) {
          const query = new URLSearchParams({
            zone: selectedZones.join(","),
            plan: selectedPlanIds.join(","),
          });

          const productsRes = await axios.get(
            `${API_BASE}/products/${id}?${query.toString()}`,
          );
          setProduct(productsRes.data);
        } else {
          // Fetch product normally
          const productRes = await axios.get(`${API_BASE}/products/${id}`);
          setProduct(productRes.data);
        }

        // Fetch plans and cities for reference
        const plansRes = await axios.get(`${API_BASE}/plans`);
        setPlans(plansRes.data.plans || plansRes.data || []);

        const citiesRes = await axios.get(`${API_BASE}/cities`);
        setCities(citiesRes.data.cities || citiesRes.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, selectedZones.join(","), selectedPlanIds.join(",")]);

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

  // Find selected variant if single zone and plan are applied
  // (with multiple zones, variants across zones don't directly map to a single variant)
  let selectedVariant = null;
  if (selectedZones.length === 1 && selectedPlanIds.length === 1) {
    // Find the variant matching the zone and plan
    if (product.variants) {
      selectedVariant = product.variants.find(
        (v) =>
          v.zone === selectedZones[0] &&
          v.plan?._id?.toString() === selectedPlanIds[0],
      );
    }
  }

  // Get selected plan names for display
  const selectedPlans = plans.filter((p) => selectedPlanIds.includes(p._id));
  const selectedPlanNames = selectedPlans.map((p) => p.name);

  // Get selected zone names for display
  const ZONE_NAMES = {
    north: "North Zone",
    south: "South Zone",
    east: "East Zone",
    west: "West Zone",
    basecity: "Your Base City",
  };
  const selectedZoneNames = selectedZones.map((z) => ZONE_NAMES[z] || z);

  // Determine price to display
  // If finalPrice exists, it means multiple cities were selected - show the combined price
  const displayPrice = product.finalPrice
    ? product.finalPrice
    : selectedVariant?.salePrice ||
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
            {(selectedZones.length > 0 || selectedPlanIds.length > 0) && (
              <div className="product-detail__filter-info">
                <span className="product-detail__filter-label">
                  Applied Filters:
                </span>
                <div className="product-detail__filter-tags">
                  {selectedPlanNames.map((planName) => (
                    <span key={planName} className="product-detail__filter-tag">
                      {planName}
                    </span>
                  ))}
                  {selectedZoneNames.map((zoneName) => (
                    <span key={zoneName} className="product-detail__filter-tag">
                      {zoneName}
                    </span>
                  ))}
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
