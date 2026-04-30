import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Package,
  Settings,
  LogOut,
  CheckCircle,
  MapPin,
  Building2,
  Phone,
  Mail,
  ShoppingBag,
  ChevronRight,
  Edit3,
  IndianRupee,
} from "lucide-react";
import {
  getMyProfile,
  updateMyProfile,
  getMyBookings,
} from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./AccountPage.css";

// Utility: format currency
const fmt = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n || 0);

// Utility: format date
const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

// Status badge component
const StatusBadge = ({ status }) => (
  <span className={`order-status-badge ${status || "pending"}`}>
    {(status || "pending").replace("_", " ")}
  </span>
);

/* ── City-wise price breakdown for one booking item ── */
function CityBreakdown({ item }) {
  const filter = item.filterSnapshot || {};
  const plan   = filter.plan || filter.plans?.[0] || filter.planSnapshot || null;
  const cities = filter.cities || filter.citiesSelected || filter.cityList || [];
  const zones  = filter.zones || [];
  const product = item.productSnapshot || {};
  const variants = product.variants || [];

  const unitPrice = Number(item.unitPrice) || 0;
  const qty       = Number(item.quantity)  || 1;

  const hasCities = Array.isArray(cities) && cities.length > 0;

  const getCityPrice = (idx) => {
    const zone = zones[idx];
    if (!zone || !variants.length) return unitPrice / (cities.length || 1);

    const targetPlanId = (plan && typeof plan === "object") ? plan._id : plan;
    const variant = variants.find((v) => {
      const vPlanId = (v.plan && typeof v.plan === "object") ? v.plan._id : v.plan;
      return (
        v.zone === zone &&
        vPlanId?.toString() === targetPlanId?.toString()
      );
    });

    return variant
      ? variant.salePrice || variant.price
      : unitPrice / (cities.length || 1);
  };

  const subtotal = unitPrice * qty;
  const tax      = Math.round(subtotal * 0.18);
  const total    = subtotal + tax;

  return (
    <div className="city-breakdown">
      {/* Plan label (if any) */}
      {plan && (
        <div className="city-breakdown__plan">
          <span className="city-breakdown__plan-badge">
            {typeof plan === "object" ? plan.name || plan.title : plan}
          </span>
        </div>
      )}

      {/* City-wise rows */}
      {hasCities ? (
        <div className="city-breakdown__cities">
          <div className="city-breakdown__cities-header">
            <span>City</span>
            <span>Price</span>
          </div>
          {cities.map((c, i) => {
            const cityName = typeof c === "string" ? c : (c.name || c.city || `City ${i + 1}`);
            const zoneDisplay = typeof c === "object" && c.zone ? ` · ${c.zone}` : "";
            const price = getCityPrice(i);
            return (
              <div className="city-breakdown__city-row" key={i}>
                <span className="city-breakdown__city-name">
                  <span className="city-breakdown__city-dot" />
                  {cityName}{zoneDisplay}
                </span>
                <span className="city-breakdown__city-price">
                  {fmt(price)}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="city-breakdown__no-cities">
          <span>{item.productSnapshot?.title || "Service"} × {qty}</span>
          <span>{fmt(subtotal)}</span>
        </div>
      )}

      {/* Tax + Total */}
      <div className="city-breakdown__tax-row">
        <span>Subtotal</span>
        <span>{fmt(subtotal)}</span>
      </div>
      <div className="city-breakdown__tax-row">
        <span>GST (18%)</span>
        <span>{fmt(tax)}</span>
      </div>
      <div className="city-breakdown__total-row">
        <span>Total</span>
        <span>{fmt(total)}</span>
      </div>
    </div>
  );
}

export default function AccountPage() {
  const navigate = useNavigate();
  const { user: currentUser, logout } = useAuth();

  const [activeTab, setActiveTab] = useState("profile");
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [saveErr, setSaveErr] = useState("");

  // Form state
  const [form, setForm] = useState({
    name: "",
    phone: "",
    companyName: "",
    gstin: "",
    address: {
      street: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
    },
  });

  // Fetch profile
  const fetchProfile = useCallback(async () => {
    setLoadingProfile(true);
    try {
      const res = await getMyProfile();
      setProfile(res.data);
      const d = res.data;
      setForm({
        name: d.name || "",
        phone: d.phone || "",
        companyName: d.companyName || "",
        gstin: d.gstin || "",
        address: {
          street: d.address?.street || "",
          city: d.address?.city || "",
          state: d.address?.state || "",
          pincode: d.address?.pincode || "",
          country: d.address?.country || "India",
        },
      });
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  // Fetch bookings
  const fetchOrders = useCallback(async () => {
    const userId = currentUser?.id || currentUser?._id;
    if (!userId) return;
    setLoadingOrders(true);
    try {
      const res = await getMyBookings(userId);
      const data = res.data;
      // Response is { bookings: [...] } or plain array
      setOrders(Array.isArray(data) ? data : (data.bookings || []));
    } catch (err) {
      console.error("Failed to load bookings:", err);
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    fetchProfile();
  }, [currentUser, fetchProfile]);

  useEffect(() => {
    if (activeTab === "orders" && currentUser) {
      fetchOrders();
    }
  }, [activeTab, currentUser, fetchOrders]);

  // Handle form field change
  const handleField = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const key = name.replace("address.", "");
      setForm((f) => ({ ...f, address: { ...f.address, [key]: value } }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  // Save profile
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg("");
    setSaveErr("");
    try {
      const res = await updateMyProfile(form);
      setProfile(res.data);
      setSaveMsg("Profile updated successfully!");
      // Update local storage name if changed
      try {
        const stored = JSON.parse(localStorage.getItem("mae_user")) || {};
        stored.name = res.data.name;
        localStorage.setItem("mae_user", JSON.stringify(stored));
        setCurrentUser(stored);
      } catch {}
      setTimeout(() => setSaveMsg(""), 3500);
    } catch (err) {
      setSaveErr(err?.response?.data?.message || "Failed to update profile.");
      setTimeout(() => setSaveErr(""), 4000);
    } finally {
      setSaving(false);
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("mae_token");
    localStorage.removeItem("mae_user");
    setAuthToken(null);
    navigate("/");
  };

  // If not logged in
  if (!currentUser) {
    return (
      <div className="account-page">
        <div className="account-not-logged">
          <div className="account-not-logged-icon">
            <User size={40} />
          </div>
          <h2>Sign in to your account</h2>
          <p>Please sign in to view your profile, edit account information and see your order history.</p>
          <button
            className="btn-signin-cta"
            onClick={() => navigate("/")}
          >
            Go to Homepage & Sign In
          </button>
        </div>
      </div>
    );
  }

  const initials = (
    (profile?.name || currentUser?.name || currentUser?.email || "U")
      .charAt(0)
      .toUpperCase()
  );

  const totalOrders = profile?.totalOrders || orders.length || 0;
  const totalSpent = profile?.totalSpent || 0;

  return (
    <div className="account-page">
      {/* Hero */}
      <div className="account-hero">
        <div className="account-avatar">{initials}</div>
        <div className="account-hero-info">
          <div className="account-hero-name">
            {profile?.name || currentUser?.name || "My Account"}
          </div>
          <div className="account-hero-email">
            {profile?.email || currentUser?.email}
          </div>
          <div className="account-hero-stats">
            <div className="account-stat">
              <span className="account-stat-value">{totalOrders}</span>
              <span className="account-stat-label">Orders</span>
            </div>
            <div className="account-stat">
              <span className="account-stat-value">
                ₹{(totalSpent / 1000).toFixed(1)}K
              </span>
              <span className="account-stat-label">Spent</span>
            </div>
            <div className="account-stat">
              <span className="account-stat-value">
                {profile?.companyName ? "✓" : "—"}
              </span>
              <span className="account-stat-label">Company</span>
            </div>
          </div>
        </div>
      </div>

      {/* Layout */}
      <div className="account-layout">
        {/* Sidebar */}
        <nav className="account-sidebar">
          {[
            { id: "profile", label: "My Profile", icon: <User size={18} /> },
            { id: "orders", label: "My Bookings", icon: <Package size={18} /> },
            { id: "settings", label: "Settings", icon: <Settings size={18} /> },
          ].map((item) => (
            <button
              key={item.id}
              id={`account-tab-${item.id}`}
              className={`account-nav-item ${activeTab === item.id ? "active" : ""}`}
              onClick={() => setActiveTab(item.id)}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
          <button
            id="account-tab-logout"
            className="account-nav-item account-nav-danger"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            Logout
          </button>
        </nav>

        {/* Panel */}
        <div className="account-panel">
          {/* ── PROFILE TAB ── */}
          {activeTab === "profile" && (
            <>
              <div className="account-panel-title">
                <Edit3 size={22} />
                Edit Profile
              </div>
              <div className="account-panel-sub">
                Update your personal information and billing details.
              </div>

              {loadingProfile ? (
                <div className="orders-loading">
                  <div className="spinner" />
                  Loading profile…
                </div>
              ) : (
                <form onSubmit={handleSave}>
                  <div className="account-form-grid">
                    {/* Personal Info */}
                    <div className="account-form-section-title">
                      <User size={15} />
                      Personal Information
                    </div>

                    <div className="account-form-group">
                      <label className="account-form-label" htmlFor="field-name">
                        Full Name
                      </label>
                      <input
                        id="field-name"
                        className="account-form-input"
                        name="name"
                        value={form.name}
                        onChange={handleField}
                        placeholder="Your name"
                        required
                      />
                    </div>

                    <div className="account-form-group">
                      <label className="account-form-label" htmlFor="field-email">
                        Email Address
                      </label>
                      <input
                        id="field-email"
                        className="account-form-input"
                        value={profile?.email || currentUser?.email || ""}
                        disabled
                        title="Email cannot be changed"
                      />
                    </div>

                    <div className="account-form-group">
                      <label className="account-form-label" htmlFor="field-phone">
                        Phone Number
                      </label>
                      <input
                        id="field-phone"
                        className="account-form-input"
                        name="phone"
                        value={form.phone}
                        onChange={handleField}
                        placeholder="+91 98765 43210"
                        type="tel"
                      />
                    </div>

                    {/* Company Info */}
                    <div className="account-form-section-title">
                      <Building2 size={15} />
                      Company Details
                    </div>

                    <div className="account-form-group">
                      <label className="account-form-label" htmlFor="field-company">
                        Company Name
                      </label>
                      <input
                        id="field-company"
                        className="account-form-input"
                        name="companyName"
                        value={form.companyName}
                        onChange={handleField}
                        placeholder="Your company"
                      />
                    </div>

                    <div className="account-form-group">
                      <label className="account-form-label" htmlFor="field-gstin">
                        GSTIN
                      </label>
                      <input
                        id="field-gstin"
                        className="account-form-input"
                        name="gstin"
                        value={form.gstin}
                        onChange={handleField}
                        placeholder="22AAAAA0000A1Z5"
                        maxLength={15}
                      />
                    </div>

                    {/* Address */}
                    <div className="account-form-section-title">
                      <MapPin size={15} />
                      Billing Address
                    </div>

                    <div className="account-form-group full-width">
                      <label className="account-form-label" htmlFor="field-street">
                        Street / Building
                      </label>
                      <input
                        id="field-street"
                        className="account-form-input"
                        name="address.street"
                        value={form.address.street}
                        onChange={handleField}
                        placeholder="Street address"
                      />
                    </div>

                    <div className="account-form-group">
                      <label className="account-form-label" htmlFor="field-city">
                        City
                      </label>
                      <input
                        id="field-city"
                        className="account-form-input"
                        name="address.city"
                        value={form.address.city}
                        onChange={handleField}
                        placeholder="City"
                      />
                    </div>

                    <div className="account-form-group">
                      <label className="account-form-label" htmlFor="field-state">
                        State
                      </label>
                      <input
                        id="field-state"
                        className="account-form-input"
                        name="address.state"
                        value={form.address.state}
                        onChange={handleField}
                        placeholder="State"
                      />
                    </div>

                    <div className="account-form-group">
                      <label className="account-form-label" htmlFor="field-pincode">
                        Pincode
                      </label>
                      <input
                        id="field-pincode"
                        className="account-form-input"
                        name="address.pincode"
                        value={form.address.pincode}
                        onChange={handleField}
                        placeholder="560001"
                        maxLength={6}
                      />
                    </div>

                    <div className="account-form-group">
                      <label className="account-form-label" htmlFor="field-country">
                        Country
                      </label>
                      <input
                        id="field-country"
                        className="account-form-input"
                        name="address.country"
                        value={form.address.country}
                        onChange={handleField}
                        placeholder="India"
                      />
                    </div>

                    {/* Actions */}
                    <div className="account-save-row">
                      <button
                        id="btn-save-profile"
                        type="submit"
                        className="btn-save"
                        disabled={saving}
                      >
                        {saving ? (
                          <>
                            <div
                              style={{
                                width: 14,
                                height: 14,
                                border: "2px solid rgba(255,255,255,0.4)",
                                borderTopColor: "white",
                                borderRadius: "50%",
                                animation: "spin 0.7s linear infinite",
                              }}
                            />
                            Saving…
                          </>
                        ) : (
                          <>
                            <CheckCircle size={16} />
                            Save Changes
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        className="btn-save-secondary"
                        onClick={fetchProfile}
                        disabled={saving || loadingProfile}
                      >
                        Reset
                      </button>
                      {saveMsg && (
                        <span className="save-success">
                          <CheckCircle size={14} />
                          {saveMsg}
                        </span>
                      )}
                      {saveErr && (
                        <span className="save-error">{saveErr}</span>
                      )}
                    </div>
                  </div>
                </form>
              )}
            </>
          )}

          {/* ── ORDERS TAB ── */}
          {activeTab === "orders" && (
            <>
              <div className="account-panel-title">
                <ShoppingBag size={22} />
                My Bookings
              </div>
              <div className="account-panel-sub">
                Track all your service bookings placed with us.
              </div>

              {loadingOrders ? (
                <div className="orders-loading">
                  <div className="spinner" />
                  Loading your orders…
                </div>
              ) : orders.length === 0 ? (
                <div className="orders-empty">
                  <div className="orders-empty-icon">📦</div>
                  <h3>No bookings yet</h3>
                  <p>When you place a booking it will appear here.</p>
                </div>
              ) : (
                <div className="orders-list">
                  {orders.map((order) => (
                    <div key={order._id} className="order-card">
                      <div className="order-card-header">
                        <div>
                          <div className="order-number">
                            BK-{order._id?.slice(-8).toUpperCase()}
                          </div>
                          <div className="order-date">
                            Placed on {fmtDate(order.createdAt)}
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <StatusBadge status={order.status} />
                        </div>
                      </div>

                      <div className="order-card-body">
                        {/* Per-item city breakdown */}
                        <div className="order-items-expanded">
                          {(order.items || []).map((item, idx) => (
                            <div key={idx} className="order-item-expanded">
                              {/* Service name header */}
                              <div className="order-item-header">
                                <span className="order-item-service-name">
                                  {item.productSnapshot?.title || item.title || "Service"}
                                </span>
                                <span className="order-item-qty-badge">× {item.quantity || 1}</span>
                              </div>
                              {/* City breakdown */}
                              <CityBreakdown item={item} />
                            </div>
                          ))}
                        </div>

                        {/* Booking-level grand total (when multiple items) */}
                        {(order.items || []).length > 1 && (
                          <>
                            <div className="order-divider" />
                            <div className="order-grand-total">
                              <span>Booking Total</span>
                              <span>{fmt(order.total)}</span>
                            </div>
                          </>
                        )}

                        {order.notes && order.notes !== "Placed via checkout" && (
                          <div className="order-notes">
                            Note: {order.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── SETTINGS TAB ── */}
          {activeTab === "settings" && (
            <>
              <div className="account-panel-title">
                <Settings size={22} />
                Account Settings
              </div>
              <div className="account-panel-sub">
                Manage your account preferences and security.
              </div>

              {/* Quick Info Cards */}
              <div
                style={{
                  display: "grid",
                  gap: 12,
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  marginBottom: 28,
                }}
              >
                {[
                  {
                    icon: <Mail size={18} />,
                    label: "Email",
                    value: profile?.email || currentUser?.email || "—",
                    note: "Cannot be changed",
                  },
                  {
                    icon: <Phone size={18} />,
                    label: "Phone",
                    value: profile?.phone || "Not set",
                  },
                  {
                    icon: <Building2 size={18} />,
                    label: "Company",
                    value: profile?.companyName || "Not set",
                  },
                  {
                    icon: <MapPin size={18} />,
                    label: "Location",
                    value: profile?.address?.city
                      ? `${profile.address.city}, ${profile.address.state || "India"}`
                      : "Not set",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 14,
                      padding: "16px 18px",
                      border: "1.5px solid #e5e7eb",
                      borderRadius: 14,
                      background: "#fafafa",
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        background: "linear-gradient(135deg, #f0f4ff, #e8f9f7)",
                        borderRadius: 10,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#1d3783",
                        flexShrink: 0,
                      }}
                    >
                      {item.icon}
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: "#9ca3af",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        {item.label}
                      </div>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: "#0d1f3c",
                          marginTop: 2,
                        }}
                      >
                        {item.value}
                      </div>
                      {item.note && (
                        <div style={{ fontSize: 11, color: "#d1d5db", marginTop: 2 }}>
                          {item.note}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div
                style={{
                  padding: "16px 20px",
                  background: "#fef2f2",
                  borderRadius: 14,
                  border: "1.5px solid #fecaca",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 16,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#b91c1c",
                      marginBottom: 4,
                    }}
                  >
                    Sign Out
                  </div>
                  <div style={{ fontSize: 12, color: "#9ca3af" }}>
                    You will be signed out from all sessions on this device.
                  </div>
                </div>
                <button
                  id="btn-settings-logout"
                  onClick={handleLogout}
                  style={{
                    background: "#ef4444",
                    color: "white",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "var(--font)",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    whiteSpace: "nowrap",
                  }}
                >
                  <LogOut size={15} />
                  Sign Out
                </button>
              </div>

              <div
                style={{
                  marginTop: 16,
                  padding: "14px 20px",
                  background: "#f0f9ff",
                  borderRadius: 14,
                  border: "1.5px solid #bae6fd",
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 700, color: "#0369a1", marginBottom: 4 }}>
                  Account Status
                </div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>
                  Member since {fmtDate(profile?.createdAt)} · Account is{" "}
                  <strong style={{ color: "#10b981" }}>Active</strong>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
