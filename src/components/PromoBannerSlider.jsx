import React, { useState, useEffect, useRef } from "react";
import "./PromoBannerSlider.css";

const DEFAULT_BANNERS = [
  {
    _id: "1",
    bannerTitle: "SOC 2 Type 2 Compliance",
    bannerDescription:
      "Build trust and security with automated compliance reporting, continuous monitoring, and expert guidance.",
    primaryDiscountLabel: "60% Off",
    secondaryDiscountLabel: "50% DISCOUNT",
    ctaPrimaryText: "Book Now",
    ctaPrimaryLink: "#",
    backgroundImageUrl:
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=700&q=80",
  },
  {
    _id: "2",
    bannerTitle: "ISO 27001 Certification",
    bannerDescription:
      "Achieve ISO 27001 certification with our end-to-end implementation and audit support program.",
    primaryDiscountLabel: "40% Off",
    secondaryDiscountLabel: "40% DISCOUNT",
    ctaPrimaryText: "Book Now",
    ctaPrimaryLink: "#",
    backgroundImageUrl:
      "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=700&q=80",
  },
  {
    _id: "3",
    bannerTitle: "DPDP Compliance Audit",
    bannerDescription:
      "Stay ahead of India's DPDP regulations with our comprehensive compliance and audit framework.",
    primaryDiscountLabel: "30% Off",
    secondaryDiscountLabel: "30% DISCOUNT",
    ctaPrimaryText: "Book Now",
    ctaPrimaryLink: "#",
    backgroundImageUrl:
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=700&q=80",
  },
];

const PromoBannerSlider = ({ banners = [] }) => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef(null);
  const items = banners.length ? banners : DEFAULT_BANNERS;
  const active = items[index];

  // Auto-slide every 2 seconds, pause on hover. Reset timer on index change.
  useEffect(() => {
    if (paused) return;
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, 2000);
    return () => clearInterval(intervalRef.current);
  }, [paused, items.length, index]);

  // When user manually clicks a dot, just set the index; effect resets timer.
  const handleDotClick = (i) => {
    setIndex(i);
  };

  return (
    <div
      className="promo-slider"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="promo-slider__inner">
        <div className="promo-slider__cards">
          {items.map((item, i) => (
            <div
              key={item._id || i}
              className={`promo-slider__card ${i === index ? "active" : ""}`}
            >
              <div className="promo-slider__text">
                <div className="promo-slider__badges">
                  {item.primaryDiscountLabel && (
                    <span className="badge-grey">
                      {item.primaryDiscountLabel}
                    </span>
                  )}
                  {item.secondaryDiscountLabel && (
                    <span className="badge-teal">
                      {item.secondaryDiscountLabel}
                    </span>
                  )}
                </div>
                <h2 className="promo-slider__title">{item.bannerTitle}</h2>
                <p className="promo-slider__desc">{item.bannerDescription}</p>
                <a
                  href={item.ctaPrimaryLink || "#"}
                  className="promo-slider__cta"
                >
                  {item.ctaPrimaryText}
                </a>
              </div>

              <div className="promo-slider__image">
                {item.backgroundImageUrl ? (
                  <img src={item.backgroundImageUrl} alt={item.bannerTitle} />
                ) : (
                  <div className="promo-slider__img-fallback" />
                )}
                {item.secondaryDiscountLabel && (
                  <span className="promo-slider__corner-badge">
                    {item.secondaryDiscountLabel}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Dots */}
        <div className="promo-slider__dots">
          {items.map((_, i) => (
            <button
              key={i}
              className={`promo-slider__dot ${i === index ? "active" : ""}`}
              onClick={() => handleDotClick(i)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PromoBannerSlider;
