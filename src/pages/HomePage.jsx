import React from "react";
import HeroSection from "../components/HeroSection";
import CategoryBar from "../components/CategoryBar";
import PromoBannerSlider from "../components/PromoBannerSlider";
import FeaturedProducts from "../components/FeaturedProducts";
import SpecialBanner from "../components/SpecialBanner";
import BestDeals from "../components/BestDeals";
import TrustSection from "../components/TrustSection";
import NewsletterSection from "../components/NewsletterSection";

const HomePage = ({ settings }) => {
  if (!settings) return null;

  const {
    hero,
    heroScenePromos,
    promoBanners,
    featuredGrid,
    specialBanner,
    bestDeals,
    trustSection,
    newsletter,
  } = settings;

  return (
    <main className="home-page">
      {hero?.sectionVisible !== false && (
        <HeroSection hero={hero} heroScenePromos={heroScenePromos} />
      )}

      {promoBanners?.length > 0 && <PromoBannerSlider banners={promoBanners} />}

      {/* Show promo slider with defaults if empty */}
      {(!promoBanners || promoBanners.length === 0) && (
        <PromoBannerSlider banners={[]} />
      )}

      {featuredGrid?.sectionVisible !== false && (
        <FeaturedProducts featuredGrid={featuredGrid} />
      )}

      {specialBanner?.sectionVisible !== false && (
        <SpecialBanner specialBanner={specialBanner} />
      )}

      {bestDeals?.sectionVisible !== false && (
        <BestDeals bestDeals={bestDeals} />
      )}

      {trustSection?.sectionVisible !== false && (
        <TrustSection trustSection={trustSection} />
      )}

      {newsletter?.sectionVisible !== false && (
        <NewsletterSection newsletter={newsletter} />
      )}
    </main>
  );
};

export default HomePage;
