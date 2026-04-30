import React, { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams, useNavigate, useLocation, Link } from "react-router-dom";
import { X, MapPin, Package, Heart, Share2, Check, ShoppingCart, ChevronRight, Trash2 } from "lucide-react";
import axios from "axios";
import { addToCart, getCart, removeCartItem } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../hooks/useWishlist";
import WishlistButton from "../components/WishlistButton";
import ProductFilterSelector from "../components/ProductFilterSelector";
import "./ProductDetailPage.css";

/* ── tiny toast helper ──────────────────────────────────── */
function Toast({ toasts, onClose }) {
  if (!toasts.length) return null;
  return (
    <div className="pdp-toast-stack">
      {toasts.map((t) => (
        <div key={t.id} className={`pdp-toast pdp-toast--${t.type || "success"}`}>
          <span className="pdp-toast__msg">{t.msg}</span>
          {t.link && (
            <Link to={t.link.href} className="pdp-toast__link">{t.link.label} →</Link>
          )}
          <button className="pdp-toast__close" onClick={() => onClose(t.id)}>✕</button>
        </div>
      ))}
    </div>
  );
}

/* ── cart side panel ─────────────────────────────────────── */
const fmt = (n) => "₹" + (Number(n) || 0).toLocaleString("en-IN");

function CartItemCityBreakdown({ item }) {
  const fs        = item.filterSnapshot || {};
  const cities    = fs.cities || fs.citiesSelected || fs.cityList || [];
  const zones     = fs.zones || [];
  const plan      = fs.plans?.[0] || fs.plan || null;
  const product   = item.productSnapshot || {};
  const variants  = product.variants || [];

  const hasCities = Array.isArray(cities) && cities.length > 0;
  const unit      = Number(item.unitPrice) || 0;
  const qty       = Number(item.quantity)  || 1;
  const subtotal  = unit * qty;
  const tax       = Math.round(subtotal * 0.18);
  const total     = subtotal + tax;

  const getCityPrice = (idx) => {
    const zone = zones[idx];
    if (!zone || !variants.length) return unit / (cities.length || 1);

    const targetPlanId = (plan && typeof plan === "object") ? plan._id : plan;
    const variant = variants.find((v) => {
      const vPlanId = (v.plan && typeof v.plan === "object") ? v.plan._id : v.plan;
      return (
        v.zone === zone &&
        vPlanId?.toString() === targetPlanId?.toString()
      );
    });

    return variant ? (variant.salePrice || variant.price) : (unit / cities.length);
  };

  return (
    <div className="cp-item__breakdown">
      {plan && <div className="cp-item__plan">Plan: {typeof plan === "object" ? plan.name : plan}</div>}
      {hasCities ? (
        <div className="cp-item__cities">
          {cities.map((c, i) => {
            const name = typeof c === "string" ? c : (c.name || c.city || `City ${i+1}`);
            const price = getCityPrice(i);
            return (
              <div key={i} className="cp-item__city-row">
                <span><span className="cp-dot"/>  {name}</span>
                <span>{fmt(price)}</span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="cp-item__city-row">
          <span>Service × {qty}</span>
          <span>{fmt(subtotal)}</span>
        </div>
      )}
      <div className="cp-item__tax-row"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
      <div className="cp-item__tax-row"><span>GST (18%)</span><span>{fmt(tax)}</span></div>
      <div className="cp-item__total-row"><span>Item Total</span><span>{fmt(total)}</span></div>
    </div>
  );
}

function CartPanel({ open, onClose, cartItems, onRemove, navigate }) {
  const grandSubtotal = cartItems.reduce((s, it) => s + (it.unitPrice || 0) * (it.quantity || 1), 0);
  const grandTax      = Math.round(grandSubtotal * 0.18);
  const grandTotal    = grandSubtotal + grandTax;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`cp-backdrop ${open ? "cp-backdrop--open" : ""}`}
        onClick={onClose}
      />
      {/* Panel */}
      <div className={`cart-panel ${open ? "cart-panel--open" : ""}`}>
        <div className="cp-header">
          <div className="cp-header__title">
            <ShoppingCart size={18} />
            My Cart
            <span className="cp-badge">{cartItems.length}</span>
          </div>
          <button className="cp-header__close" onClick={onClose}><X size={18}/></button>
        </div>

        <div className="cp-body">
          {cartItems.length === 0 ? (
            <div className="cp-empty">
              <div className="cp-empty__icon">🛒</div>
              <p>Your cart is empty</p>
            </div>
          ) : (
            cartItems.map((item, idx) => (
              <div key={item._id || idx} className="cp-item">
                <div className="cp-item__header">
                  <span className="cp-item__title">
                    {item.productSnapshot?.title || item.title || "Service"}
                  </span>
                  <button
                    className="cp-item__remove"
                    title="Remove"
                    onClick={() => onRemove(item._id)}
                  >
                    <Trash2 size={13}/>
                  </button>
                </div>
                <CartItemCityBreakdown item={item} />
              </div>
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="cp-footer">
            <div className="cp-footer__summary">
              <div className="cp-footer__row">
                <span>Subtotal</span><span>{fmt(grandSubtotal)}</span>
              </div>
              <div className="cp-footer__row">
                <span>GST (18%)</span><span>{fmt(grandTax)}</span>
              </div>
              <div className="cp-footer__row cp-footer__row--grand">
                <span>Grand Total</span><span>{fmt(grandTotal)}</span>
              </div>
            </div>
            <button
              className="cp-footer__checkout"
              onClick={() => { onClose(); navigate("/checkout"); }}
            >
              Proceed to Checkout <ChevronRight size={16}/>
            </button>
          </div>
        )}
      </div>
    </>
  );
}

const ProductDetailPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [plans, setPlans] = useState([]);
  const [cities, setCities] = useState([]);
  const [zones, setZones] = useState([]);
  const [quantity, setQuantity] = useState(1);

  // Cart panel
  const [cartOpen,  setCartOpen]  = useState(false);
  const [cartItems, setCartItems] = useState([]);

  // Toast stack
  const [toasts, setToasts] = useState([]);
  const addToast = (msg, type = "success", link = null) => {
    const t = { id: Date.now(), msg, type, link };
    setToasts((prev) => [...prev, t]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== t.id)), 4500);
  };
  const removeToast = (id) => setToasts((prev) => prev.filter((x) => x.id !== id));

  // Fetch cart for panel
  const fetchCart = useCallback(async () => {
    try {
      const res = await getCart();
      setCartItems(res.data.items || []);
    } catch { setCartItems([]); }
  }, []);

  // Remove item from cart
  const handleRemoveCartItem = async (itemId) => {
    try {
      await removeCartItem(itemId);
      await fetchCart();
    } catch (err) { console.error(err); }
  };

  // Wishlist hook
  const { isInWishlist } = useWishlist();

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

  // Extract filter parameters from URL
  const zoneParam = searchParams.get("zone");
  const planParam = searchParams.get("plan");
  const cityParam = searchParams.get("city");

  // Parse zone, plan, and city params (can be comma-separated for multiple, including duplicates)
  const selectedZones = zoneParam ? zoneParam.split(",").filter(Boolean) : [];
  const selectedPlanIds = planParam ? planParam.split(",").filter(Boolean) : [];

  // Try to get cities from URL params first, then fallback to localStorage
  let selectedCities = cityParam ? cityParam.split(",").filter(Boolean) : [];
  if (selectedCities.length === 0) {
    try {
      const storedCities = localStorage.getItem("selectedCities");
      console.log(
        "🔍 Checking localStorage - key exists:",
        !!storedCities,
        "value:",
        storedCities,
      );
      if (storedCities) {
        selectedCities = JSON.parse(storedCities);
        console.log("📍 Retrieved cities from localStorage:", selectedCities);
      } else {
        console.log("⚠️ No cities found in localStorage");
      }
    } catch (err) {
      console.error("Error reading cities from localStorage:", err);
    }
  } else {
    console.log("📍 Cities from URL params:", selectedCities);
  }

  // Helper: Generate filter hash from zones and plans (for comparison)
  const generateFilterHash = (zones = [], plansArray = []) => {
    const zoneStr = zones.sort().join("|");
    const planStr = plansArray.sort().join("|");
    return `${zoneStr}::${planStr}`;
  };

  // Check if product with current filters is already in wishlist
  const currentFilterHash = generateFilterHash(selectedZones, selectedPlanIds);
  const isCurrentFilterInWishlist = isInWishlist(id);

  // Zone options for display
  const ZONE_OPTIONS = {
    basecity: "📍 Your Base City",
    north: "🔵 North Zone",
    south: "🔵 South Zone",
    east: "🔵 East Zone",
    west: "🔵 West Zone",
  };

  // Handle Apply Filters from selector component
  const handleApplyFilters = (
    appliedZones,
    appliedPlans,
    appliedCities = [],
  ) => {
    console.log("🎯 ProductDetailPage.handleApplyFilters called with:", {
      appliedZones,
      appliedPlans,
      appliedCities,
    });

    // Store cities in localStorage for persistence
    if (appliedCities.length > 0) {
      localStorage.setItem("selectedCities", JSON.stringify(appliedCities));
      console.log("💾 Stored cities in localStorage:", appliedCities);
    }

    const zoneParam = appliedZones.join(",");
    const planParam = appliedPlans.join(",");
    const cityParam = appliedCities.join(",");
    const url = `/product/${id}?zone=${zoneParam}&plan=${planParam}${cityParam ? `&city=${cityParam}` : ""}`;
    console.log("🌐 Generated URL:", url);
    navigate(url, {
      replace: false,
    });
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

  // Extract zone pricing whenever product data changes
  useEffect(() => {
    if (product?.variants && product.variants.length > 0) {
      const zoneMap = new Map();
      product.variants.forEach((variant) => {
        const price = variant.salePrice || variant.price;
        if (!zoneMap.has(variant.zone)) {
          zoneMap.set(variant.zone, {
            zone: variant.zone,
            price,
            city: variant.city, // Store the city from variant
          });
        }
      });
      setZones(Array.from(zoneMap.values()));
    }
  }, [product]);

  // Auto-populate cities for selected zones if no cities are explicitly selected
  const finalSelectedCities =
    selectedCities.length > 0
      ? selectedCities
      : selectedZones
          .map((zone) => {
            // Find the first city that belongs to this zone from the cities list
            const cityForZone = cities.find((c) => c.zone === zone);
            return cityForZone?.name || null;
          })
          .filter(Boolean);

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

  const { user: currentUser, isAuthenticated } = useAuth();

  // Determine price to display
  // If finalPrice exists, it means multiple cities were selected - show the combined price
  const displayPrice = product.finalPrice
    ? product.finalPrice
    : selectedVariant?.salePrice ||
      selectedVariant?.price ||
      product.displayPrice ||
      product.basePrice ||
      0;

  // Calculate price breakdown for each city
  const priceBreakdown = selectedCities.map((cityId, index) => {
    // Find city details
    const cityDetails = cities.find((c) => c._id === cityId);
    const zone = selectedZones[index];
    const zoneName = ZONE_NAMES[zone] || zone;

    // Find variant for this city/zone/plan combination
    let price = 0;
    if (product.variants && product.variants.length > 0) {
      const matchingVariant = product.variants.find(
        (v) =>
          v.zone === zone &&
          selectedPlanIds.includes(
            v.plan?._id?.toString() || v.plan?.toString(),
          ),
      );
      price = matchingVariant
        ? matchingVariant.salePrice || matchingVariant.price
        : 0;
    }

    return {
      cityName: cityDetails?.name || cityId,
      zone: zoneName,
      price: price,
    };
  });

  return (
    <div className="product-detail">
      {/* Toast stack */}
      <Toast toasts={toasts} onClose={removeToast} />

      {/* Cart side panel */}
      <CartPanel
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cartItems={cartItems}
        onRemove={handleRemoveCartItem}
        navigate={navigate}
      />
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

        {/* Top Info Section - Vendor Info */}
        <div className="product-detail__top-info">
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

            {/* Applied Filters */}
            {(selectedZones.length > 0 || selectedPlanIds.length > 0) && (
              <div
                className="product-detail__filter-info"
                style={{ marginBottom: "20px" }}
              >
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
                  {selectedCities.length > 0 && (
                    <>
                      {selectedCities.map((city) => (
                        <span
                          key={city}
                          className="product-detail__filter-tag"
                          style={{ background: "#bfdbfe", color: "#1e40af" }}
                        >
                          📍 {city}
                        </span>
                      ))}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Price Breakdown */}
            {priceBreakdown.length > 0 && (
              <div
                style={{
                  marginBottom: "20px",
                  padding: "15px",
                  backgroundColor: "#f8fafc",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <h4
                  style={{
                    margin: "0 0 12px 0",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#0f172a",
                  }}
                >
                  Price Breakdown
                </h4>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {priceBreakdown.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "13px",
                        color: "#475569",
                      }}
                    >
                      <span>
                        {item.cityName} ({item.zone})
                      </span>
                      <span style={{ fontWeight: "500", color: "#0f172a" }}>
                        ₹{item.price.toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                  <div
                    style={{
                      borderTop: "1px solid #cbd5e1",
                      paddingTop: "8px",
                      marginTop: "4px",
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#1e293b",
                    }}
                  >
                    <span>Total Price</span>
                    <span style={{ color: "#0284c7" }}>
                      ₹{displayPrice.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>
            )}

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
                <button
                  className="qty-btn"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                >
                  −
                </button>
                <input type="number" value={quantity} readOnly />
                <button
                  className="qty-btn"
                  onClick={() => setQuantity((q) => q + 1)}
                >
                  +
                </button>
              </div>
              <button
                className="product-detail__btn-add-to-cart"
                onClick={async () => {
                  const payload = {
                    productId: product._id,
                    productSnapshot: product,
                    vendorSnapshot: product.vendor || null,
                    filterSnapshot: {
                      zones: selectedZones,
                      plans: selectedPlanIds,
                      cities: finalSelectedCities,
                      filterHash: currentFilterHash,
                      variantId: selectedVariant?._id || null,
                    },
                    quantity,
                    unitPrice: displayPrice,
                    currency: product.currency || "INR",
                  };

                  if (!isAuthenticated) {
                    localStorage.setItem("mae_pending_action", JSON.stringify({
                      type: "ADD_TO_CART",
                      payload
                    }));
                    navigate("/login", { state: { from: location } });
                    return;
                  }

                  try {
                    await addToCart(payload);
                    addToast(`"${product.title}" added to cart!`, "success");
                    await fetchCart();
                    setCartOpen(true);
                  } catch (err) {
                    console.error(err);
                    addToast(err?.response?.data?.message || "Failed to add to cart", "error");
                  }
                }}
              >
                <ShoppingCart size={15} /> Add to Cart
              </button>
            </div>

            {/* Secondary Actions */}
            <div className="product-detail__secondary-actions">
              <WishlistButton
                productId={id}
                zones={selectedZones}
                plans={selectedPlanIds}
                cities={finalSelectedCities}
                onWishlistToggle={(added) => {
                  if (added) {
                    addToast(
                      "Added to wishlist!",
                      "wish",
                      { href: "/wishlist", label: "View Wishlist" }
                    );
                  } else {
                    addToast("Removed from wishlist", "info");
                  }
                }}
              />
              <button className="product-detail__action-btn">
                <Share2 size={18} /> Share
              </button>
            </div>
          </div>
        </div>

        {/* Filter Selector */}
        {/* <ProductFilterSelector
          zones={zones}
          plans={plans}
          cities={cities}
          initialZones={selectedZones}
          initialPlans={selectedPlanIds}
          initialCities={selectedCities}
          onApplyFilters={handleApplyFilters}
        /> */}

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
