import React from "react";
import { MdStar, MdStarBorder } from "react-icons/md";
import "./ProductCard.css";

const ProductCard = ({
  product,
  loading,
  viewMode = "grid",
  selectedCity = null,
  selectedPlan = null,
}) => {
  // Build product URL with filter parameters if available
  const buildProductUrl = () => {
    let url = `/product/${product?._id}`;
    const params = new URLSearchParams();

    if (selectedCity) {
      params.append("city", selectedCity);
    }
    if (selectedPlan) {
      params.append("plan", selectedPlan);
    }

    const queryString = params.toString();
    return queryString ? `${url}?${queryString}` : url;
  };
  if (loading) {
    return (
      <div className="product-card product-card--skeleton">
        <div className="product-card__image skeleton" />
        <div className="product-card__body">
          <div
            className="skeleton"
            style={{ height: 12, width: 60, marginBottom: 8 }}
          />
          <div
            className="skeleton"
            style={{ height: 16, width: "80%", marginBottom: 6 }}
          />
          <div
            className="skeleton"
            style={{ height: 16, width: "60%", marginBottom: 16 }}
          />
          <div
            className="skeleton"
            style={{ height: 12, width: 80, marginBottom: 6 }}
          />
          <div
            className="skeleton"
            style={{ height: 20, width: 100, marginBottom: 20 }}
          />
          <div
            className="skeleton"
            style={{ height: 40, width: "100%", borderRadius: 6 }}
          />
        </div>
      </div>
    );
  }

  const imgUrl = product?.images?.[0]?.url || product?.imageUrl || "";

  // Grid view (default)
  if (viewMode === "grid") {
    return (
      <div className="product-card">
        <div className="product-card__image">
          {imgUrl ? (
            <img
              src={imgUrl.startsWith("http") ? imgUrl : `${imgUrl}`}
              alt={product.title}
            />
          ) : (
            <div className="product-card__img-placeholder">
              <svg
                viewBox="0 0 80 60"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                width="48"
              >
                <rect width="80" height="60" rx="4" fill="#f0f0f0" />
                <path d="M28 42L40 24L52 42H28Z" fill="#c0c0c0" />
                <circle cx="54" cy="22" r="6" fill="#c0c0c0" />
              </svg>
            </div>
          )}
        </div>
        <div className="product-card__body">
          <span className="product-card__category">
            {product?.categories?.[0]?.name ||
              product?.category?.name ||
              product?.category ||
              product?.framework ||
              "PRODUCTS"}
          </span>
          <h3 className="product-card__title">
            {product?.title || product?.productTitle}
          </h3>
          <p className="product-card__price-label">Starts from</p>
          <p className="product-card__price">
            ₹
            {Number(
              product?.displayPrice ||
                product?.basePrice ||
                product?.price ||
                product?.startingPrice ||
                0,
            ).toLocaleString("en-IN")}
          </p>
          <a href={buildProductUrl()} className="product-card__btn">
            SELECT OPTIONS
          </a>
        </div>
      </div>
    );
  }

  // List view (horizontal layout — image left, info middle, price/CTA right)
  const rating = product?.rating || 4;
  const reviewCount = product?.reviewCount || 0;
  const stars = Array.from({ length: 5 }, (_, i) => i < Math.round(rating));
  const description = product?.description || "";

  return (
    <div className="product-card product-card--list">
      {/* Left: Image */}
      <div className="product-card__image product-card__image--list">
        {imgUrl ? (
          <img
            src={imgUrl.startsWith("http") ? imgUrl : `${imgUrl}`}
            alt={product.title}
          />
        ) : (
          <div className="product-card__img-placeholder">
            <svg
              viewBox="0 0 80 60"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              width="48"
            >
              <rect width="80" height="60" rx="4" fill="#f0f0f0" />
              <path d="M28 42L40 24L52 42H28Z" fill="#c0c0c0" />
              <circle cx="54" cy="22" r="6" fill="#c0c0c0" />
            </svg>
          </div>
        )}
        {product?.categories?.[0]?.name && (
          <span className="product-card__badge">
            {product.categories[0].name}
          </span>
        )}
      </div>

      {/* Middle: Info & Rating */}
      <div className="product-card__body product-card__body--list">
        {/* Rating */}
        <div className="product-card__rating">
          <div className="product-card__stars">
            {stars.map((filled, i) =>
              filled ? (
                <MdStar key={i} className="product-card__star-icon" />
              ) : (
                <MdStarBorder key={i} className="product-card__star-icon" />
              ),
            )}
          </div>
          <span className="product-card__rating-score">
            {Number(rating).toFixed(1)}
          </span>
          {reviewCount > 0 && (
            <span className="product-card__review-count">
              ({reviewCount} audits)
            </span>
          )}
        </div>

        <span className="product-card__category">
          {product?.categories?.[0]?.name ||
            product?.category?.name ||
            product?.category ||
            product?.framework ||
            "PRODUCTS"}
        </span>
        <h3 className="product-card__title">
          {product?.title || product?.productTitle}
        </h3>
        {description && (
          <p className="product-card__description">{description}</p>
        )}
      </div>

      {/* Right: Price & CTA */}
      <div className="product-card__footer product-card__footer--list">
        <p className="product-card__price-label">Base Package</p>
        <p className="product-card__price">
          ₹
          {Number(
            product?.displayPrice ||
              product?.basePrice ||
              product?.price ||
              product?.startingPrice ||
              0,
          ).toLocaleString("en-IN")}
        </p>
        <span className="product-card__fee-label">FIXED FEE</span>
        <a href={buildProductUrl()} className="product-card__btn">
          CONFIGURE SERVICE
        </a>
      </div>
    </div>
  );
};

export default ProductCard;
