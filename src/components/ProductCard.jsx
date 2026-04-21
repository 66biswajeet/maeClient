import React, { useMemo } from "react";
import { MdStar, MdStarBorder } from "react-icons/md";
import WishlistButton from "./WishlistButton";
import { calculateProductPrice } from "../services/pricingCalculator";
import "./ProductCard.css";

const ProductCard = ({
  product,
  loading,
  viewMode = "grid",
  selectedCity = null,
  selectedPlan = null,
  selectedCities = [],
  selectedPlans = [],
  cities = [],
  selectedBaseCity = null,
}) => {
  // TEST: Absolute minimum log to see if code runs
  console.log(
    "PRODUCTCARD V2 LOADED - Cities:",
    selectedCities?.length,
    "Plans:",
    selectedPlans?.length,
  );

  // Calculate price based on selected cities and plan
  const calculatedPrice = useMemo(() => {
    if (
      !product ||
      !selectedPlans?.[0] ||
      selectedCities.length === 0 ||
      !selectedBaseCity
    ) {
      console.log(
        "⚠️ ProductCard: Missing required data for pricing calculation",
        {
          hasProduct: !!product,
          hasPlan: !!selectedPlans?.[0],
          hasCities: selectedCities.length > 0,
          hasBaseCity: !!selectedBaseCity,
        },
      );
      return (
        product?.finalPrice ||
        product?.displayPrice ||
        product?.basePrice ||
        product?.price ||
        product?.startingPrice ||
        0
      );
    }

    // Convert city IDs to city objects
    const cityObjects = selectedCities
      .map((cityId) => cities.find((c) => c._id === cityId))
      .filter(Boolean);

    if (cityObjects.length === 0) {
      console.log("⚠️ ProductCard: Could not convert city IDs to objects");
      return (
        product?.finalPrice ||
        product?.displayPrice ||
        product?.basePrice ||
        product?.price ||
        product?.startingPrice ||
        0
      );
    }

    // ===== DEBUG: Log what we're passing to the pricing calculator =====
    console.log("\n📱 PRODUCTCARD - Calling Pricing Calculator:");
    console.log(`   📦 Product: ${product?.title}`);
    console.log(`   🏢 Vendor Base City: ${product?.vendor?.baseCity}`);
    console.log(`   👤 Client Base City: ${selectedBaseCity?.name}`);
    console.log(
      `   📍 Selected Cities:`,
      cityObjects.map((c) => ({ name: c.name, zone: c.zone })),
    );
    console.log(`   📋 Selected Plan: ${selectedPlans[0]}\n`);

    // Calculate price using the pricing calculator
    const result = calculateProductPrice(
      product,
      product?.vendor?.baseCity, // vendorBaseCity
      cityObjects, // selectedCities as objects
      selectedPlans[0], // selectedPlan ID
      selectedBaseCity?.name, // clientBaseCity name
    );

    if (result.error || result.finalPrice === 0) {
      console.log(
        "⚠️ ProductCard: Pricing calculation returned error or 0:",
        result.error,
      );
      return (
        product?.finalPrice ||
        product?.displayPrice ||
        product?.basePrice ||
        product?.price ||
        product?.startingPrice ||
        0
      );
    }

    console.log(
      `✅ ProductCard: Calculated Price = ₹${result.finalPrice.toLocaleString("en-IN")}\n`,
    );
    return result.finalPrice;
  }, [product, selectedPlans, selectedCities, selectedBaseCity, cities]);

  const productUrl = useMemo(() => {
    // Ensure we have arrays and filter out any falsy values
    const citiesToPass =
      Array.isArray(selectedCities) && selectedCities.length > 0
        ? selectedCities.filter(Boolean)
        : selectedCity
          ? [selectedCity]
          : [];

    const plansToPass =
      Array.isArray(selectedPlans) && selectedPlans.length > 0
        ? selectedPlans.filter(Boolean)
        : selectedPlan
          ? [selectedPlan]
          : [];

    // Convert city IDs to zones
    // IMPORTANT: If base city (first city) matches vendor base city, use "basecity" zone
    const zonesToPass = citiesToPass
      .map((cityId, index) => {
        const city = cities.find((c) => c._id === cityId);
        if (!city) return null;

        // Check if this is the base city (first selection) and it matches vendor base city
        if (index === 0 && selectedBaseCity && product?.vendor?.baseCity) {
          const clientCityName = selectedBaseCity.name?.toLowerCase().trim();
          const vendorCityName = product.vendor.baseCity?.toLowerCase().trim();

          if (clientCityName === vendorCityName) {
            console.log(
              `🎯 BASE CITY MATCH: Using zone="basecity" instead of "${city.zone}"`,
            );
            return "basecity";
          }
        }

        return city?.zone;
      })
      .filter(Boolean);

    // Debug logging
    console.log("🔗 Building URL with:", {
      citiesToPass,
      zonesToPass,
      plansToPass,
      citiesString: citiesToPass.join(","),
      zonesString: zonesToPass.join(","),
      plansString: plansToPass.join(","),
    });

    // Build URL directly with string concatenation for clarity
    let url = `/product/${product?._id}`;
    const queryParts = [];

    if (zonesToPass.length > 0) {
      const zoneString = zonesToPass.join(",");
      queryParts.push(`zone=${zoneString}`);
      console.log("✅ Zone param added:", zoneString);
    }

    if (plansToPass.length > 0) {
      const planString = plansToPass.join(",");
      queryParts.push(`plan=${planString}`);
      console.log("✅ Plan param added:", planString);
    }

    if (citiesToPass.length > 0) {
      const cityString = citiesToPass.join(",");
      queryParts.push(`city=${cityString}`);
      console.log("✅ City param added:", cityString);
    }

    if (queryParts.length > 0) {
      url += `?${queryParts.join("&")}`;
    }

    console.log("🎯 Final URL:", url);
    return url;
  }, [
    product?._id,
    product?.vendor?.baseCity,
    selectedCities,
    selectedPlans,
    selectedCity,
    selectedPlan,
    selectedBaseCity,
    cities,
  ]);

  // Debug: Always log to ensure code is running
  console.log("🎨 ProductCard RENDER - New memoized version active", {
    productId: product?._id,
    selectedCitiesReceived: selectedCities,
    selectedPlansReceived: selectedPlans,
    productUrl: productUrl,
  });
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
          {/* Vendor Base City Pill */}
          {product?.vendor?.baseCity && (
            <span className="product-card__vendor-badge">
              {product.vendor.baseCity}
            </span>
          )}
          {(() => {
            // Calculate zones and plans for wishlist button (same logic as productUrl)
            const citiesToPass =
              Array.isArray(selectedCities) && selectedCities.length > 0
                ? selectedCities.filter(Boolean)
                : selectedCity
                  ? [selectedCity]
                  : [];

            const plansToPass =
              Array.isArray(selectedPlans) && selectedPlans.length > 0
                ? selectedPlans.filter(Boolean)
                : selectedPlan
                  ? [selectedPlan]
                  : [];

            const zonesToPass = citiesToPass
              .map((cityId) => {
                const city = cities.find((c) => c._id === cityId);
                return city?.zone;
              })
              .filter(Boolean);

            // Extract city names from citiesToPass
            const cityNames = citiesToPass
              .map((cityId) => {
                const city = cities.find((c) => c._id === cityId);
                return city?.name;
              })
              .filter(Boolean);

            return (
              <WishlistButton
                productId={product?._id}
                zones={zonesToPass}
                plans={plansToPass}
                cities={cityNames}
              />
            );
          })()}
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
            ₹{Number(calculatedPrice).toLocaleString("en-IN")}
          </p>
          <a href={productUrl} className="product-card__btn">
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
        {/* Vendor Base City Pill */}
        {product?.vendor?.baseCity && (
          <span className="product-card__vendor-badge">
            {product.vendor.baseCity}
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
          ₹{Number(calculatedPrice).toLocaleString("en-IN")}
        </p>
        <span className="product-card__fee-label">FIXED FEE</span>
        <a href={productUrl} className="product-card__btn">
          CONFIGURE SERVICE
        </a>
      </div>
    </div>
  );
};

export default ProductCard;
