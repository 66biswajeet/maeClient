import React, { useState, useEffect } from "react";
import { Shield, ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./HeroSection.css";
import axios from "axios";

const DEFAULT_CATEGORY_LINKS = [
  { label: "DPDP Compliance", count: 6 },
  { label: "GDPR Audit", count: 4 },
  { label: "HIPAA Health", count: 3 },
  { label: "IRDA IT Audit", count: 5 },
  { label: "ISO 27001", count: 8 },
  { label: "ISO 27017 Cloud", count: 2 },
];

const DEFAULT_PROMOS = [
  {
    _id: "1",
    primaryDiscountLabel: "50% DISCOUNT",
    bannerTitle: "RBI IT & Cyber Compliance",
    bannerDescription:
      "Equip your enterprise for the DPDP transition with our priority assessment package.",
    benefits: [
      "48-Hour Gap Report",
      "Legal Desk Consultation",
      "Implementation Toolkit",
    ],
    ctaPrimaryText: "CLAIM DISCOUNT NOW",
    ctaPrimaryLink: "#",
    bgGradient: "linear-gradient(160deg, #1a3a6b 0%, #0d2347 100%)",
  },
  {
    _id: "2",
    primaryDiscountLabel: "30% DISCOUNT",
    bannerTitle: "ISO 27001 Fast Track",
    bannerDescription:
      "Get certified in 90 days with our expert-guided implementation program.",
    benefits: ["Gap Assessment", "Policy Templates", "Audit Support"],
    ctaPrimaryText: "CLAIM DISCOUNT NOW",
    ctaPrimaryLink: "#",
    bgGradient: "linear-gradient(160deg, #1a3a6b 0%, #0d2347 100%)",
  },
  {
    _id: "3",
    primaryDiscountLabel: "40% DISCOUNT",
    bannerTitle: "SOC 2 Type II Audit",
    bannerDescription:
      "Complete SOC 2 Type II certification with real-time readiness monitoring.",
    benefits: ["Readiness Report", "Control Mapping", "Auditor Liaison"],
    ctaPrimaryText: "CLAIM DISCOUNT NOW",
    ctaPrimaryLink: "#",
    bgGradient: "linear-gradient(160deg, #1a3a6b 0%, #0d2347 100%)",
  },
];

const HeroSection = ({ hero, heroScenePromos = [] }) => {
  const [promoIndex, setPromoIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [apiCats, setApiCats] = useState([]);
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

  useEffect(() => {
    // trigger mount animations shortly after render
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    axios
      .get(`${API_BASE}/categories?isActive=true&parent=root`)
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0)
          setApiCats(res.data);
      })
      .catch(() => {});
  }, []);

  // if API returned categories use them, otherwise use hero prop or defaults
  const categoryLinks =
    apiCats.length > 0
      ? apiCats.map((c) => ({
          _id: c._id,
          label: c.name,
          slug: c.slug || "",
          count: c.subCount || 0,
        }))
      : hero?.categoryLinks?.length
        ? hero.categoryLinks
        : DEFAULT_CATEGORY_LINKS;

  const promos = heroScenePromos?.length ? heroScenePromos : DEFAULT_PROMOS;
  const activePromo = promos[promoIndex] || promos[0];
  const prevPromo = () =>
    setPromoIndex((i) => (i - 1 + promos.length) % promos.length);
  const nextPromo = () => setPromoIndex((i) => (i + 1) % promos.length);

  return (
    <section className={`hero ${mounted ? "hero--mounted" : ""}`}>
      <div className="hero__inner">
        {/* Left sidebar - Frameworks */}
        <aside className="hero__sidebar">
          <h4
            className="sidebar__title hero-anim hero-anim--title"
            style={{ "--delay": "0.02s" }}
          >
            {hero?.categoryTitle || "FRAMEWORKS"}
          </h4>
          <ul className="sidebar__list">
            {categoryLinks.map((link, i) => {
              const toId =
                link._id ||
                link.slug ||
                (link.label || "")
                  .toLowerCase()
                  .replace(/\s+/g, "-")
                  .replace(/[^\w-]/g, "");
              return (
                <li
                  key={link._id || i}
                  className="sidebar__item hero-anim hero-anim--sidebar"
                  style={{ "--delay": `${0.06 + i * 0.06}s` }}
                >
                  <a
                    href={`/category/${toId}/all`}
                    className="sidebar__link"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(`/category/${toId}/all`);
                    }}
                  >
                    <Shield size={14} className="sidebar__icon" />
                    <span className="sidebar__label">{link.label}</span>
                    <span className="sidebar__count">{link.count}</span>
                  </a>
                </li>
              );
            })}
          </ul>
          <a
            href="/products"
            className="sidebar__view-all hero-anim hero-anim--fade"
            style={{ "--delay": "0.6s" }}
            onClick={(e) => {
              e.preventDefault();
              navigate("/products");
            }}
          >
            VIEW ALL SERVICES
          </a>

          {/* Verification card */}
          {hero?.showVerificationCard !== false && (
            <div
              className="sidebar__verify-card hero-anim hero-anim--fade verify-shimmer"
              style={{ "--delay": "0.7s" }}
            >
              <div className="verify-card__icon">
                <CheckCircle size={22} color="#0d1f3c" />
              </div>
              <div>
                <p className="verify-card__title">
                  {hero?.verificationTitle || "Audit Complete"}
                </p>
                <p className="verify-card__sub">
                  {hero?.verificationSubText ||
                    "ISO 27001 Certification Verified"}
                </p>
              </div>
            </div>
          )}
        </aside>

        {/* Center - Hero content */}
        <div className="hero__main">
          <div
            className="hero__badge hero-anim hero-anim--badge"
            style={{ "--delay": "0.08s" }}
          >
            <span>{hero?.topBadgeText || "Authorized Authority"}</span>
          </div>
          <h1
            className="hero__title hero-anim hero-anim--title"
            style={{ "--delay": "0.12s" }}
          >
            {hero?.marketplaceMainTitle ? (
              renderTitle(hero.marketplaceMainTitle)
            ) : (
              <>
                India's <span className="title-accent">#1</span> Audit &amp;
                Compliance <span className="title-teal">Marketplace</span>
              </>
            )}
          </h1>
          <p
            className="hero__subtext hero-anim hero-anim--fade"
            style={{ "--delay": "0.22s" }}
          >
            {hero?.heroSubText ||
              "Comprehensive compliance auditing and strategic advisory for India's primary data privacy law. Ensure regulatory alignment with Meity guidelines today."}
          </p>
          <div className="hero__buttons">
            <a
              href={hero?.button1Link || "#"}
              className="btn btn--primary btn--ripple hero-anim hero-anim--fade"
              style={{ "--delay": "0.34s" }}
            >
              {hero?.button1Text || "Start Compliance Audit"}
            </a>
            <a
              href={hero?.button2Link || "#"}
              className="btn btn--outline hero-anim hero-anim--fade"
              style={{ "--delay": "0.38s" }}
            >
              {hero?.button2Text || "View Standards"}
            </a>
          </div>
        </div>

        {/* Right - Promo slider card */}
        <div
          className="hero__promo hero-anim hero-anim--promo"
          style={{ "--delay": "0.18s" }}
        >
          <button className="promo-nav promo-nav--left" onClick={prevPromo}>
            <ChevronLeft size={18} />
          </button>

          <div
            className="promo-card"
            style={{
              background:
                activePromo?.bgGradient ||
                "linear-gradient(160deg, #1a3a6b 0%, #0d2347 100%)",
            }}
          >
            {activePromo?.backgroundImageUrl && (
              <img
                src={activePromo.backgroundImageUrl}
                alt=""
                className="promo-card__bg"
              />
            )}
            <div className="promo-card__content">
              <span className="promo-card__discount">
                {activePromo?.primaryDiscountLabel}
              </span>
              <h3 className="promo-card__title">{activePromo?.bannerTitle}</h3>
              <p className="promo-card__desc">
                {activePromo?.bannerDescription}
              </p>
              {activePromo?.benefits?.length > 0 && (
                <ul className="promo-card__benefits">
                  {activePromo.benefits.map((b, i) => (
                    <li key={i}>
                      <CheckCircle size={16} color="#00bfae" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
              <a
                href={activePromo?.ctaPrimaryLink || "#"}
                className="promo-card__cta"
              >
                {activePromo?.ctaPrimaryText || "CLAIM DISCOUNT NOW"}
              </a>
            </div>
          </div>

          <button className="promo-nav promo-nav--right" onClick={nextPromo}>
            <ChevronRight size={18} />
          </button>

          {/* Dots */}
          <div className="promo-dots">
            {promos.map((_, i) => (
              <button
                key={i}
                className={`promo-dot ${i === promoIndex ? "active" : ""}`}
                onClick={() => setPromoIndex(i)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

function renderTitle(text) {
  // Highlight #1 in teal
  const parts = text.split("#1");
  if (parts.length === 2) {
    const afterParts = parts[1].split("Marketplace");
    return (
      <>
        {parts[0]}
        <span className="title-accent">#1</span>
        {afterParts[0]}
        {afterParts.length > 1 && (
          <span className="title-teal">Marketplace</span>
        )}
        {afterParts.slice(1).join("Marketplace")}
      </>
    );
  }
  return text;
}

export default HeroSection;
