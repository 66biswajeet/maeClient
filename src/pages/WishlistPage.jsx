import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Trash2, ShoppingCart, ArrowLeft } from "lucide-react";
import { useWishlist } from "../hooks/useWishlist";
import "./WishlistPage.css";

const WishlistPage = () => {
  const navigate = useNavigate();
  const { wishlist, loading, fetchWishlist, removeFromWishlist } =
    useWishlist();

  useEffect(() => {
    const token = localStorage.getItem("mae_token");
    if (!token) {
      navigate("/");
      return;
    }
    fetchWishlist();
  }, []);

  if (!localStorage.getItem("mae_token")) {
    return (
      <div className="wishlist-page empty">
        <div className="content-wrapper">
          <div className="empty-state">
            <p>Please login to view your wishlist</p>
            <button onClick={() => navigate("/")} className="btn primary">
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="wishlist-page loading">
        <div className="content-wrapper">
          <p>Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <div className="wishlist-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
        <h1>
          <Heart size={24} fill="currentColor" />
          My Wishlist
        </h1>
        <div className="header-info">
          {wishlist.length > 0 && <span>{wishlist.length} item(s)</span>}
        </div>
      </div>

      <div className="content-wrapper">
        {wishlist.length === 0 ? (
          <div className="empty-state">
            <Heart size={48} />
            <h2>Your wishlist is empty</h2>
            <p>Start adding services you like to your wishlist</p>
            <button onClick={() => navigate("/")} className="btn primary">
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="wishlist-grid">
            {wishlist.map((item) => (
              <WishlistItemCard
                key={item._id}
                item={item}
                onRemove={removeFromWishlist}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const WishlistItemCard = ({ item, onRemove }) => {
  const navigate = useNavigate();
  const [isRemoving, setIsRemoving] = React.useState(false);

  const handleRemove = async () => {
    setIsRemoving(true);
    await onRemove(item._id);
    setIsRemoving(false);
  };

  const product = item.product;
  const variants = item.variants || [];
  const totalPrice = item.totalPrice || 0;

  return (
    <div className="wishlist-card">
      <div className="card-image">
        {product?.images?.[0] ? (
          <img src={product.images[0]} alt={product.title} />
        ) : (
          <div className="placeholder-image">No Image</div>
        )}
        <button
          className="remove-btn"
          onClick={handleRemove}
          disabled={isRemoving}
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="card-content">
        <h3 className="product-title">{product?.title || "Product"}</h3>

        <div className="vendor-info">
          {product?.vendor?.logoUrl && (
            <img src={product.vendor.logoUrl} alt={product.vendor.name} />
          )}
          <span className="vendor-name">
            {item.vendorInfo?.vendorName || product?.vendor?.name || "Vendor"}
          </span>
        </div>

        {variants.length > 0 && (
          <div className="variant-details">
            {variants.length > 1 && (
              <span className="badge multi">
                {variants.length} variant{variants.length > 1 ? "s" : ""}
              </span>
            )}
            {variants.slice(0, 2).map((v, idx) => (
              <span key={idx} className="badge">
                {v.zone}
                {v.city && ` • ${v.city}`}
                {v.planName && ` - ${v.planName}`}
              </span>
            ))}
          </div>
        )}

        {item.filters && (
          <div className="applied-filters">
            {item.filters.zones && item.filters.zones.length > 0 && (
              <div className="filter-group">
                <span className="filter-label">Zones:</span>
                {item.filters.zones.map((zone, idx) => (
                  <span key={idx} className="filter-pill zone">
                    {zone}
                  </span>
                ))}
              </div>
            )}
            {item.filters.cities && item.filters.cities.length > 0 && (
              <div className="filter-group">
                <span className="filter-label">Cities:</span>
                {item.filters.cities.map((city, idx) => (
                  <span key={idx} className="filter-pill city">
                    {city}
                  </span>
                ))}
              </div>
            )}
            {item.filters.planNames && item.filters.planNames.length > 0 && (
              <div className="filter-group">
                <span className="filter-label">Plans:</span>
                {item.filters.planNames.slice(0, 3).map((planName, idx) => (
                  <span key={idx} className="filter-pill plan">
                    {planName}
                  </span>
                ))}
                {item.filters.planNames.length > 3 && (
                  <span className="filter-pill more">
                    +{item.filters.planNames.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        <div className="card-footer">
          <div className="price">
            <span className="label">Total Price</span>
            <span className="amount">₹{totalPrice.toLocaleString()}</span>
          </div>

          <button
            className="add-to-cart-btn"
            onClick={() => {
              // Extract unique zones and plans from variants
              const zones = [...new Set(variants.map((v) => v.zone))];
              const plans = [
                ...new Set(variants.map((v) => v.plan).filter(Boolean)),
              ];

              // Build query string with comma-separated values
              const params = new URLSearchParams();
              if (zones.length > 0) params.append("zone", zones.join(","));
              if (plans.length > 0) params.append("plan", plans.join(","));

              navigate(`/product/${product?._id}?${params.toString()}`);
            }}
          >
            <ShoppingCart size={16} />
            View
          </button>
        </div>
      </div>
    </div>
  );
};

export default WishlistPage;
