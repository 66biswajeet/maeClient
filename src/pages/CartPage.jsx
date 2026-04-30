// import React, { useEffect, useState } from "react";
// import { getCart, updateCartItem, removeCartItem } from "../services/api";

// const CartPage = () => {
//   const [items, setItems] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const fetchCart = async () => {
//     try {
//       setLoading(true);
//       const res = await getCart();
//       setItems(res.data.items || []);
//     } catch (err) {
//       console.error(err);
//       setError(
//         err?.response?.data?.message || err.message || "Failed to load cart",
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchCart();
//   }, []);

//   const handleRemove = async (id) => {
//     try {
//       await removeCartItem(id);
//       setItems((s) => s.filter((it) => it._id !== id));
//     } catch (err) {
//       console.error(err);
//       alert("Failed to remove item");
//     }
//   };

//   const handleQty = async (item, delta) => {
//     const newQty = Math.max(1, (item.quantity || 1) + delta);
//     try {
//       const res = await updateCartItem(item._id, { quantity: newQty });
//       setItems((s) => s.map((it) => (it._id === item._id ? res.data : it)));
//     } catch (err) {
//       console.error(err);
//       alert("Failed to update quantity");
//     }
//   };

//   const grandTotal = items.reduce(
//     (sum, it) => sum + (it.unitPrice || 0) * (it.quantity || 1),
//     0,
//   );

//   if (loading) return <div style={{ padding: 24 }}>Loading cart...</div>;
//   if (error) return <div style={{ padding: 24 }}>Error: {error}</div>;

//   return (
//     <div style={{ padding: 24 }}>
//       <h1>Your Cart</h1>
//       {items.length === 0 ? (
//         <p>Your cart is empty.</p>
//       ) : (
//         <div style={{ display: "grid", gap: 12 }}>
//           {items.map((it) => {
//             const p = it.productSnapshot || {};
//             const images = p.images || [];
//             const img = images.length > 0 ? images[0].url : "";
//             const vendor = it.vendorSnapshot || p.vendor || {};
//             const vendorName = vendor?.name || "";
//             return (
//               <div
//                 key={it._id}
//                 style={{
//                   display: "flex",
//                   gap: 12,
//                   alignItems: "flex-start",
//                   border: "1px solid #e5e7eb",
//                   padding: 12,
//                   borderRadius: 8,
//                 }}
//               >
//                 <div style={{ width: 140 }}>
//                   {images.length > 0 ? (
//                     <div style={{ display: "grid", gap: 6 }}>
//                       {images.map((im, idx) => (
//                         <img
//                           key={idx}
//                           src={im.url}
//                           alt={im.alt || p.title}
//                           style={{
//                             width: "100%",
//                             height: 84,
//                             objectFit: "cover",
//                             borderRadius: 6,
//                           }}
//                         />
//                       ))}
//                     </div>
//                   ) : (
//                     <div
//                       style={{
//                         width: "100%",
//                         height: 84,
//                         background: "#f1f5f9",
//                         borderRadius: 6,
//                       }}
//                     />
//                   )}
//                 </div>

//                 <div style={{ flex: 1 }}>
//                   <div
//                     style={{
//                       display: "flex",
//                       justifyContent: "space-between",
//                       alignItems: "flex-start",
//                     }}
//                   >
//                     <div>
//                       <div style={{ fontWeight: 700, fontSize: 16 }}>
//                         {p.title}
//                       </div>
//                       {p.shortDesc && (
//                         <div style={{ color: "#374151", marginTop: 6 }}>
//                           {p.shortDesc}
//                         </div>
//                       )}
//                       <div
//                         style={{ marginTop: 8, color: "#6b7280", fontSize: 13 }}
//                       >
//                         SKU: {p.sku || "—"}
//                       </div>
//                       <div
//                         style={{ marginTop: 6, color: "#6b7280", fontSize: 13 }}
//                       >
//                         Categories:{" "}
//                         {Array.isArray(p.categories)
//                           ? p.categories.map((c) => c.name || c).join(", ")
//                           : "—"}
//                       </div>
//                       {p.finalPrice !== undefined && (
//                         <div
//                           style={{
//                             marginTop: 6,
//                             color: "#0f172a",
//                             fontWeight: 700,
//                           }}
//                         >
//                           Final Price: ₹
//                           {(p.finalPrice || 0).toLocaleString("en-IN")}
//                         </div>
//                       )}
//                     </div>

//                     <div style={{ textAlign: "right" }}>
//                       <div style={{ fontWeight: 700 }}>
//                         ₹
//                         {(
//                           (it.unitPrice || 0) * (it.quantity || 1)
//                         ).toLocaleString("en-IN")}
//                       </div>
//                       <div style={{ color: "#6b7280", fontSize: 13 }}>
//                         ₹{(it.unitPrice || 0).toLocaleString("en-IN")}/unit
//                       </div>
//                     </div>
//                   </div>

//                   <div
//                     style={{
//                       marginTop: 12,
//                       display: "flex",
//                       gap: 12,
//                       alignItems: "center",
//                     }}
//                   >
//                     <div>
//                       <button onClick={() => handleQty(it, -1)}>-</button>
//                       <span style={{ margin: "0 8px" }}>{it.quantity}</span>
//                       <button onClick={() => handleQty(it, 1)}>+</button>
//                     </div>

//                     <div style={{ color: "#374151" }}>
//                       <div>
//                         <strong>Vendor:</strong> {vendorName}
//                       </div>
//                       <div>
//                         <strong>Vendor City:</strong> {vendor?.baseCity || "—"}
//                       </div>
//                     </div>

//                     <div style={{ marginLeft: "auto" }}>
//                       <button
//                         onClick={() => handleRemove(it._id)}
//                         style={{ color: "#ef4444" }}
//                       >
//                         Remove
//                       </button>
//                     </div>
//                   </div>

//                   {/* Expanded details */}
//                   <div
//                     style={{
//                       marginTop: 12,
//                       background: "#fcfcfd",
//                       border: "1px solid #eef2ff",
//                       padding: 10,
//                       borderRadius: 6,
//                     }}
//                   >
//                     <div style={{ marginBottom: 6 }}>
//                       <strong>Filter Details</strong>
//                     </div>
//                     <div style={{ fontSize: 13, color: "#374151" }}>
//                       Zones:{" "}
//                       {Array.isArray(it.filterSnapshot?.zones)
//                         ? it.filterSnapshot.zones.join(", ")
//                         : "—"}
//                     </div>
//                     <div style={{ fontSize: 13, color: "#374151" }}>
//                       Plans:{" "}
//                       {Array.isArray(it.filterSnapshot?.plans)
//                         ? it.filterSnapshot.plans.join(", ")
//                         : "—"}
//                     </div>
//                     <div style={{ fontSize: 13, color: "#374151" }}>
//                       Cities:{" "}
//                       {Array.isArray(it.filterSnapshot?.cities)
//                         ? it.filterSnapshot.cities.join(", ")
//                         : "—"}
//                     </div>
//                     <div style={{ fontSize: 13, color: "#374151" }}>
//                       Filter Hash: {it.filterSnapshot?.filterHash || "—"}
//                     </div>
//                     <div
//                       style={{ fontSize: 13, color: "#374151", marginTop: 8 }}
//                     >
//                       Variant Id: {it.filterSnapshot?.variantId || "—"}
//                     </div>
//                     {p.description && (
//                       <div style={{ marginTop: 10 }}>
//                         <div style={{ fontWeight: 600, marginBottom: 6 }}>
//                           Description
//                         </div>
//                         <div
//                           dangerouslySetInnerHTML={{ __html: p.description }}
//                           style={{ fontSize: 13, color: "#374151" }}
//                         />
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             );
//           })}

//           <div
//             style={{
//               display: "flex",
//               justifyContent: "space-between",
//               padding: 12,
//               borderTop: "1px solid #e5e7eb",
//             }}
//           >
//             <div style={{ fontWeight: 700 }}>Total</div>
//             <div style={{ fontWeight: 700 }}>
//               ₹{grandTotal.toLocaleString("en-IN")}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default CartPage;

import React, { useEffect, useState } from "react";
import { getCart, updateCartItem, removeCartItem } from "../services/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./cartPage.css";

const CartPage = () => {
  const { user: currentUser, isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await getCart();
      setItems(res.data.items || []);
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message || err.message || "Failed to load cart",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleRemove = async (id) => {
    try {
      await removeCartItem(id);
      setItems((s) => s.filter((it) => it._id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to remove item");
    }
  };

  const handleQty = async (item, delta) => {
    const newQty = Math.max(1, (item.quantity || 1) + delta);
    try {
      const res = await updateCartItem(item._id, { quantity: newQty });
      setItems((s) => s.map((it) => (it._id === item._id ? res.data : it)));
    } catch (err) {
      console.error(err);
      alert("Failed to update quantity");
    }
  };

  const grandTotal = items.reduce(
    (sum, it) => sum + (it.unitPrice || 0) * (it.quantity || 1),
    0,
  );

  const navigate = useNavigate();

  const handleProceedToCheckout = () => {
    navigate("/checkout");
  };

  /* ── Loading ── */
  if (loading)
    return (
      <div className="cart-page">
        <div className="cart-state">
          <div className="cart-loader">
            <span className="cart-loader__dot" />
            <span className="cart-loader__dot" />
            <span className="cart-loader__dot" />
            <span style={{ marginLeft: 10 }}>Loading your cart…</span>
          </div>
        </div>
      </div>
    );

  /* ── Error ── */
  if (error)
    return (
      <div className="cart-page">
        <div className="cart-state">
          <div className="cart-error">⚠ {error}</div>
        </div>
      </div>
    );

  /* ── Empty ── */
  if (items.length === 0)
    return (
      <div className="cart-page">
        <div className="cart-empty">
          <div className="cart-empty__icon">🛒</div>
          <div className="cart-empty__title">Your cart is empty</div>
          <p className="cart-empty__text">
            Looks like you haven't added anything yet. Browse our offerings and
            find something you'll love.
          </p>
          <a href="/" className="btn-shop">
            Continue Shopping
          </a>
        </div>
      </div>
    );

  /* ── Main ── */
  return (
    <div className="cart-page">
      {/* Header */}
      <div className="cart-header">
        <div className="cart-header__icon">🛒</div>
        <h1>Your Cart</h1>
        <div className="cart-header__count">
          <span>{items.length}</span> {items.length === 1 ? "item" : "items"}
        </div>
      </div>

      <div className="cart-layout">
        {/* ── Items ── */}
        <div className="cart-items">
          {items.map((it) => {
            const p = it.productSnapshot || {};
            const images = p.images || [];
            const vendor = it.vendorSnapshot || p.vendor || {};
            const vendorName = vendor?.name || "—";
            const subtotal = (it.unitPrice || 0) * (it.quantity || 1);

            // Build per-city price breakdown (map zones -> variants)
            const zonesArr = Array.isArray(it.filterSnapshot?.zones)
              ? it.filterSnapshot.zones
              : [];
            const citiesArr = Array.isArray(it.filterSnapshot?.cities)
              ? it.filterSnapshot.cities
              : [];
            const plansArr = Array.isArray(it.filterSnapshot?.plans)
              ? it.filterSnapshot.plans
              : [];
            const variants = p.variants || [];

            const breakdown = citiesArr.map((cityId, idx) => {
              const zone = zonesArr[idx] || zonesArr[0] || null;
              const planId = plansArr[idx] || plansArr[0] || null;
              let variant = null;
              if (zone) {
                variant = variants.find((v) => {
                  const vPlanId = v.plan?._id || v.plan;
                  const sameZone = v.zone === zone;
                  const samePlan =
                    !planId ||
                    (vPlanId && vPlanId.toString() === planId.toString());
                  return sameZone && samePlan;
                });
              }
              if (!variant && zone)
                variant = variants.find((v) => v.zone === zone);
              const price = variant
                ? variant.salePrice || variant.price
                : it.unitPrice ||
                  (p.finalPrice
                    ? Math.round(
                        (p.finalPrice || 0) / Math.max(1, citiesArr.length),
                      )
                    : p.basePrice || 0);
              const cityLabel =
                String(cityId || "")
                  .replace(/_/g, " ")
                  .split(" ")
                  .slice(1)
                  .join(" ") || cityId;
              return { cityId, cityLabel, zone, price };
            });

            return (
              <div key={it._id} className="cart-item">
                {/* Images */}
                <div className="cart-item__images">
                  {images.length > 0 ? (
                    images.map((im, idx) => (
                      <img
                        key={idx}
                        src={im.url}
                        alt={im.alt || p.title}
                        className="cart-item__img"
                      />
                    ))
                  ) : (
                    <div className="cart-item__img-placeholder">📦</div>
                  )}
                </div>

                {/* Body */}
                <div className="cart-item__body">
                  {/* Top row */}
                  <div className="cart-item__top">
                    <div>
                      <div className="cart-item__title">{p.title}</div>
                      {p.shortDesc && (
                        <div className="cart-item__short-desc">
                          {p.shortDesc}
                        </div>
                      )}
                      <div className="cart-item__meta">
                        {p.sku && (
                          <span className="cart-item__meta-tag">
                            <strong>SKU</strong> {p.sku}
                          </span>
                        )}
                        {Array.isArray(p.categories) &&
                          p.categories.length > 0 && (
                            <span className="cart-item__meta-tag">
                              <strong>Cat.</strong>{" "}
                              {p.categories.map((c) => c.name || c).join(", ")}
                            </span>
                          )}
                      </div>
                      {p.finalPrice !== undefined && (
                        <div className="cart-item__final-price">
                          Final Price: ₹
                          {(p.finalPrice || 0).toLocaleString("en-IN")}
                        </div>
                      )}
                    </div>

                    <div className="cart-item__pricing">
                      <div className="cart-item__line-total">
                        ₹{subtotal.toLocaleString("en-IN")}
                      </div>
                      <div className="cart-item__unit-price">
                        ₹{(it.unitPrice || 0).toLocaleString("en-IN")} / unit
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="cart-item__actions">
                    {/* Qty stepper */}
                    <div className="qty-stepper">
                      <button
                        className="qty-stepper__btn"
                        onClick={() => handleQty(it, -1)}
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="qty-stepper__val">{it.quantity}</span>
                      <button
                        className="qty-stepper__btn"
                        onClick={() => handleQty(it, 1)}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    {/* Vendor */}
                    <div className="vendor-info">
                      <div className="vendor-info__name">
                        <strong>Vendor:</strong> {vendorName}
                      </div>
                      <div className="vendor-info__city">
                        <strong>City:</strong> {vendor?.baseCity || "—"}
                      </div>
                    </div>

                    {/* Remove */}
                    <button
                      className="btn-remove"
                      onClick={() => handleRemove(it._id)}
                    >
                      ✕ Remove
                    </button>
                  </div>

                  {/* Price breakdown per city */}
                  <div
                    className="price-breakdown"
                    aria-label="Price breakdown per city"
                  >
                    <div
                      style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}
                    >
                      Price breakdown
                    </div>
                    {breakdown.length === 0 ? (
                      <div style={{ color: "#6b7280" }}>
                        No per-city pricing available
                      </div>
                    ) : (
                      breakdown.map((b, i) => (
                        <div key={i} className="price-breakdown__row">
                          <div className="price-breakdown__city">
                            {b.cityLabel || b.cityId || "—"}{" "}
                            <span className="price-breakdown__zone">
                              {b.zone ? `(${b.zone})` : ""}
                            </span>
                          </div>
                          <div className="price-breakdown__price">
                            ₹{(b.price || 0).toLocaleString("en-IN")}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Filter detail panel */}
                  <div className="filter-panel">
                    <div className="filter-panel__title">Filter Details</div>
                    <div className="filter-panel__grid">
                      <div className="filter-panel__row">
                        <strong>Zones</strong>
                        {Array.isArray(it.filterSnapshot?.zones)
                          ? it.filterSnapshot.zones.join(", ")
                          : "—"}
                      </div>
                      <div className="filter-panel__row">
                        <strong>Plans</strong>
                        {Array.isArray(it.productSnapshot?.variants)
                          ? it.productSnapshot.variants.plan
                          : "—"}
                      </div>
                      <div className="filter-panel__row">
                        <strong>Cities</strong>
                        {Array.isArray(it.filterSnapshot?.cities)
                          ? it.filterSnapshot.cities.join(", ")
                          : "—"}
                      </div>
                      <div className="filter-panel__row">
                        <strong>Variant ID</strong>
                        {it.filterSnapshot?.variantId || "—"}
                      </div>
                    </div>
                    {/* {it.filterSnapshot?.filterHash && (
                      <div className="filter-panel__hash">
                        Hash: {it.filterSnapshot.filterHash}
                      </div>
                    )} */}
                    {/* {p.description && (
                      <div className="filter-panel__desc">
                        <div className="filter-panel__desc-title">
                          Description
                        </div>
                        <div
                          className="filter-panel__desc-body"
                          dangerouslySetInnerHTML={{ __html: p.description }}
                        />
                      </div>
                    )} */}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Sidebar Summary ── */}
        <div className="cart-summary">
          <div className="cart-summary__title">Order Summary</div>

          <div className="cart-summary__row">
            <span>
              Subtotal ({items.length} {items.length === 1 ? "item" : "items"})
            </span>
            <span className="cart-summary__amount">
              ₹{grandTotal.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="cart-summary__row">
            <span>Taxes & Fees</span>
            <span className="cart-summary__amount">Calculated at checkout</span>
          </div>

          <div className="cart-divider" />

          <div className="cart-summary__row cart-summary__row--total">
            <span>Total</span>
            <span className="cart-summary__amount">
              ₹{grandTotal.toLocaleString("en-IN")}
            </span>
          </div>

          <button className="btn-checkout" onClick={handleProceedToCheckout}>
            Proceed to Checkout →
          </button>

          <div className="cart-summary__secure">
            🔒 Secure &amp; encrypted checkout
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
