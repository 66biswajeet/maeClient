import React, { useEffect, useState } from "react";
import { getCart, clearCart, createBooking, removeCartItem } from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import {
  ShoppingBag, MapPin, Tag, ChevronRight, CheckCircle,
  Trash2, ArrowLeft, CreditCard, FileText, Package,
} from "lucide-react";
import "./CheckoutPage.css";

/* ── helpers ── */
const fmt = (n) => "₹" + (Number(n) || 0).toLocaleString("en-IN");

function CityBreakdown({ item }) {
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

  // Helper to find actual price for each city selection
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
    <div className="co-breakdown">
      {/* Plan pill */}
      {plan && (
        <div className="co-plan-pill">
          <Tag size={10} />
          {typeof plan === "object" ? plan.name || "Plan" : plan}
        </div>
      )}

      {/* City rows */}
      {hasCities ? (
        <div className="co-cities">
          <div className="co-cities__head">
            <span>City</span><span>Price</span>
          </div>
          {cities.map((c, i) => {
            const name = typeof c === "string" ? c : (c.name || c.city || `City ${i + 1}`);
            const price = getCityPrice(i);
            return (
              <div key={i} className="co-city-row">
                <span className="co-city-name">
                  <span className="co-dot" />{name}
                </span>
                <span className="co-city-price">{fmt(price)}</span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="co-city-row">
          <span>Qty × {qty}</span>
          <span>{fmt(subtotal)}</span>
        </div>
      )}

      {/* Tax & item total */}
      <div className="co-tax-grid">
        <div className="co-tax-row"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
        <div className="co-tax-row"><span>GST (18%)</span><span>{fmt(tax)}</span></div>
        <div className="co-tax-row co-tax-row--total">
          <span>Item Total</span><span>{fmt(total)}</span>
        </div>
      </div>
    </div>
  );
}

/* ── main component ── */
const CheckoutPage = () => {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [placing, setPlacing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [bookingSummary, setBookingSummary] = useState(null);
  const navigate = useNavigate();

  /* load cart */
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await getCart();
        setItems(res.data.items || []);
      } catch (err) {
        setError(err?.response?.data?.message || err.message || "Failed to load cart");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* totals */
  const subtotal = items.reduce((s, it) => s + (it.unitPrice || 0) * (it.quantity || 1), 0);
  const tax      = Math.round(subtotal * 0.18);
  const total    = subtotal + tax;

  /* remove item */
  const handleRemove = async (itemId) => {
    try {
      await removeCartItem(itemId);
      setItems((prev) => prev.filter((it) => it._id !== itemId));
    } catch (err) { console.error(err); }
  };

  /* place booking */
  const handlePlaceOrder = async () => {
    try {
      setPlacing(true);

      const payloadItems = items.map((it) => ({
        productId:       it.product || it.productSnapshot?._id,
        productSnapshot: it.productSnapshot || null,
        vendorSnapshot:  it.vendorSnapshot  || null,
        filterSnapshot:  it.filterSnapshot  || null,
        quantity:  it.quantity || 1,
        unitPrice: it.unitPrice || it.productSnapshot?.finalPrice || it.productSnapshot?.basePrice || 0,
        currency:  it.currency || it.productSnapshot?.currency || "INR",
      }));

      const getStoredCustomer = () => {
        for (const k of ["mae_user", "user", "customer", "mae_customer"]) {
          try {
            const v = localStorage.getItem(k);
            if (v) { const p = JSON.parse(v); if (p && (p._id || p.id)) return p; }
          } catch (_) {}
        }
        return null;
      };

      const customer   = getStoredCustomer();
      const customerId = customer?._id || customer?.id || null;

      const res = await createBooking({
        customerId,
        items: payloadItems,
        paymentMethod: "offline",
        notes: "Placed via checkout",
      });

      await clearCart();
      setBookingSummary({
        count: (res.data.bookings || []).length,
        total: res.data.total || total,
      });
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to place booking. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  /* ── states ── */
  if (loading) return (
    <div className="co-state">
      <div className="co-spinner" />
      <p>Loading your cart…</p>
    </div>
  );

  if (success) return (
    <div className="co-state co-state--success">
      <div className="co-success-icon">
        <CheckCircle size={52} strokeWidth={1.5} />
      </div>
      <h2>Booking Confirmed!</h2>
      <p>
        {bookingSummary?.count} booking{bookingSummary?.count !== 1 ? "s" : ""} created · {fmt(bookingSummary?.total)} total
      </p>
      <div className="co-success-actions">
        <button className="co-btn co-btn--primary" onClick={() => navigate("/account")}>
          View My Bookings
        </button>
        <button className="co-btn co-btn--ghost" onClick={() => navigate("/")}>
          Continue Shopping
        </button>
      </div>
    </div>
  );

  if (error) return (
    <div className="co-state co-state--error">
      <p className="co-error-msg">{error}</p>
      <button className="co-btn co-btn--ghost" onClick={() => { setError(null); navigate(-1); }}>
        <ArrowLeft size={14} /> Go Back
      </button>
    </div>
  );

  if (!items.length) return (
    <div className="co-state">
      <div className="co-empty-icon">🛒</div>
      <h3>Your cart is empty</h3>
      <p>Add some services before checking out.</p>
      <button className="co-btn co-btn--primary" onClick={() => navigate("/")}>
        Browse Services
      </button>
    </div>
  );

  /* ── main layout ── */
  return (
    <div className="co-page">
      {/* top bar */}
      <div className="co-topbar">
        <button className="co-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={15} /> Back
        </button>
        <div className="co-topbar__steps">
          <span className="co-step co-step--active">
            <span className="co-step__dot">1</span> Review
          </span>
          <ChevronRight size={14} className="co-step__sep" />
          <span className="co-step">
            <span className="co-step__dot">2</span> Payment
          </span>
          <ChevronRight size={14} className="co-step__sep" />
          <span className="co-step">
            <span className="co-step__dot">3</span> Confirm
          </span>
        </div>
      </div>

      <div className="co-layout">
        {/* ── LEFT: item list ── */}
        <div className="co-items-col">
          <div className="co-section-header">
            <ShoppingBag size={16} />
            <h2>Order Summary <span className="co-count">({items.length} item{items.length !== 1 ? "s" : ""})</span></h2>
          </div>

          <div className="co-items">
            {items.map((it, idx) => (
              <div key={it._id || idx} className="co-item">
                {/* item header */}
                <div className="co-item__head">
                  <div className="co-item__title-wrap">
                    {it.productSnapshot?.images?.[0]?.url && (
                      <img
                        className="co-item__thumb"
                        src={it.productSnapshot.images[0].url}
                        alt={it.productSnapshot?.title}
                      />
                    )}
                    <div>
                      <div className="co-item__title">
                        {it.productSnapshot?.title || "Service"}
                      </div>
                      {it.productSnapshot?.shortDesc && (
                        <div className="co-item__desc">{it.productSnapshot.shortDesc}</div>
                      )}
                      {it.vendorSnapshot && (
                        <div className="co-item__vendor">
                          by {typeof it.vendorSnapshot === "object"
                            ? it.vendorSnapshot.name || it.vendorSnapshot.companyName
                            : it.vendorSnapshot}
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    className="co-item__remove"
                    onClick={() => handleRemove(it._id)}
                    title="Remove"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* city/plan breakdown */}
                <CityBreakdown item={it} />
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT: summary + place order ── */}
        <div className="co-summary-col">
          {/* price summary card */}
          <div className="co-summary-card">
            <div className="co-summary-card__title">
              <FileText size={15} /> Price Details
            </div>

            <div className="co-summary-rows">
              <div className="co-summary-row">
                <span>Subtotal ({items.length} item{items.length !== 1 ? "s" : ""})</span>
                <span>{fmt(subtotal)}</span>
              </div>
              <div className="co-summary-row">
                <span>GST (18%)</span>
                <span>{fmt(tax)}</span>
              </div>
              <div className="co-summary-row co-summary-row--discount">
                <span>Discount</span>
                <span>— 0</span>
              </div>
            </div>

            <div className="co-summary-total">
              <span>Amount Payable</span>
              <span>{fmt(total)}</span>
            </div>
          </div>

          {/* payment method */}
          <div className="co-payment-card">
            <div className="co-summary-card__title">
              <CreditCard size={15} /> Payment Method
            </div>
            <label className="co-radio-option co-radio-option--selected">
              <input type="radio" name="payment" defaultChecked readOnly />
              <Package size={14} />
              <span>Offline / Pay on Service</span>
            </label>
          </div>

          {/* CTA */}
          {error && <p className="co-error-inline">{error}</p>}

          <button
            className="co-place-btn"
            onClick={handlePlaceOrder}
            disabled={placing || items.length === 0}
          >
            {placing ? (
              <><span className="co-place-spinner" /> Processing…</>
            ) : (
              <>Place Booking · {fmt(total)} <ChevronRight size={16} /></>
            )}
          </button>

          <p className="co-terms">
            By placing this booking you agree to our{" "}
            <Link to="/terms" className="co-link">Terms of Service</Link>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
