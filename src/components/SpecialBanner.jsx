import React from "react";
import { Zap, Tag } from "lucide-react";
import "./SpecialBanner.css";

const SpecialBanner = ({ specialBanner }) => {
  const data = specialBanner || {
    campaignTitle: "GEN Next VAPT Audit",
    price: "RS 20,000 /-",
    badgeText: "NEW",
    badgeVisible: true,
    ctaText: "Book It Now",
    ctaLink: "#",
  };

  return (
    <section className="special-banner">
      <div className="special-banner__inner">
        <div className="special-banner__card">
          <div className="special-banner__left">
            <div className="special-banner__icon-wrap">
              <Zap size={20} color="#00bfae" />
            </div>
            <div className="special-banner__info">
              <div className="special-banner__title-row">
                <h3 className="special-banner__title">{data.campaignTitle}</h3>
                {data.badgeVisible !== false && data.badgeText && (
                  <span className="special-banner__badge">
                    {data.badgeText}
                  </span>
                )}
              </div>
              <p className="special-banner__desc">
                Advanced Vulnerability Assessment &amp; Penetration Testing for
                next-gen cloud architectures.
              </p>
              <div className="special-banner__pricing">
                <Tag size={13} color="#00a896" />
                <span className="special-banner__pricing-label">
                  SPECIAL PRICING
                </span>
                <span className="special-banner__pricing-text">
                  starting at <strong>{data.price}</strong>
                </span>
              </div>
            </div>
          </div>
          <a href={data.ctaLink || "#"} className="special-banner__cta">
            {data.ctaText || "Book It Now"}
          </a>
        </div>
      </div>
    </section>
  );
};

export default SpecialBanner;
