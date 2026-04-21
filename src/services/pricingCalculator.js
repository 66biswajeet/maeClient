/**
 * Pricing Calculator Utility
 * Handles pricing calculation based on plan-based city selection
 *
 * Rules:
 * 1. Base City: If client baseCity == vendor baseCity → use basecity pricing
 * 2. Base City: If client baseCity != vendor baseCity → use zone-wise pricing
 * 3. Additional Cities: Always use zone-wise pricing
 * 4. Final Price = Sum of all selected city prices
 */

/**
 * Calculate product price based on selected cities, plan, and vendor baseCity
 * @param {Object} product - Product object with variants array
 * @param {string} vendorBaseCity - Vendor's base city name
 * @param {Array} selectedCities - Array of city objects with {_id, name, zone, city}
 * @param {string} selectedPlan - Selected plan ID
 * @param {string} clientBaseCity - Client's selected base city (can be null for virtual)
 * @returns {Object} - { finalPrice: number, breakdown: Array, error: string|null }
 */
export const calculateProductPrice = (
  product,
  vendorBaseCity,
  selectedCities = [],
  selectedPlan,
  clientBaseCity = null,
) => {
  try {
    // ===== DEBUG: Log all input parameters =====
    console.log("🎯 PRICING CALCULATOR - INPUTS:");
    console.log("   🏢 Vendor Base City:", vendorBaseCity);
    console.log("   👤 Client Base City:", clientBaseCity);
    console.log(
      "   📍 Selected Cities:",
      selectedCities?.map((c) => ({ name: c.name, zone: c.zone })),
    );
    console.log("   📋 Selected Plan:", selectedPlan);
    console.log("   📦 Product Title:", product?.title);
    console.log("   🔢 Available Variants:", product?.variants?.length || 0);

    if (!product || !product.variants || !selectedPlan) {
      console.warn("❌ Missing required data:", {
        hasProduct: !!product,
        hasVariants: !!product?.variants,
        hasPlan: !!selectedPlan,
      });
      return {
        finalPrice: 0,
        breakdown: [],
        error: "Missing required product or plan information",
      };
    }

    if (selectedCities.length === 0) {
      console.warn("❌ No cities selected");
      return {
        finalPrice: 0,
        breakdown: [],
        error: "No cities selected",
      };
    }

    const breakdown = [];
    let totalPrice = 0;

    // ===== DEBUG: Log all available variants for this plan =====
    const planVariants = product.variants.filter(
      (v) => v.plan._id === selectedPlan,
    );
    console.log(
      `\n📊 VARIANTS FOR PLAN "${selectedPlan}":`,
      planVariants.map((v) => ({
        zone: v.zone,
        city: v.city || "N/A",
        price: v.price,
        salePrice: v.salePrice,
        planId: v.plan._id,
        planName: v.plan.name,
      })),
    );
    console.log(`   ✅ Found ${planVariants.length} variants for this plan\n`);

    // Process each selected city
    selectedCities.forEach((city, index) => {
      console.log(
        `\n🔄 Processing City ${index + 1}: ${city.name} (Zone: ${city.zone})`,
      );

      let variant = null;
      let pricingType = "zone-wise";

      // Determine if this is the base city (first selection)
      const isBaseCity = index === 0;
      console.log(`   ➜ Is Base City: ${isBaseCity}`);

      if (isBaseCity && clientBaseCity && vendorBaseCity) {
        // Check if client baseCity matches vendor baseCity (case-insensitive)
        const clientCityName = clientBaseCity.toLowerCase().trim();
        const vendorCityName = vendorBaseCity.toLowerCase().trim();

        console.log(`\n   🔍 BASE CITY MATCHING:`);
        console.log(`      Client City (normalized): "${clientCityName}"`);
        console.log(`      Vendor City (normalized): "${vendorCityName}"`);
        console.log(
          `      Match Result: ${clientCityName === vendorCityName ? "✅ MATCH" : "❌ NO MATCH"}`,
        );

        if (clientCityName === vendorCityName) {
          // Find basecity variant for this plan
          // Look for variant with zone "basecity" or similar for base city pricing
          console.log(`   🔎 Looking for BASECITY variant...`);

          variant = product.variants.find((v) => {
            const isCorrectPlan = v.plan._id === selectedPlan;
            const isBasecityZone = v.zone === "basecity" || v.zone === "base";
            const isCityMatch = v.city === vendorBaseCity || !v.city;

            if (isCorrectPlan && isBasecityZone) {
              console.log(
                `      Checking variant: zone="${v.zone}", city="${v.city || "N/A"}", isMatch: ${isCityMatch}`,
              );
            }

            return isCorrectPlan && isBasecityZone && isCityMatch;
          });

          if (variant) {
            console.log(
              `   ✅ BASECITY VARIANT FOUND: zone="${variant.zone}", price="${variant.price}", salePrice="${variant.salePrice}"`,
            );
            pricingType = "basecity";
          } else {
            console.log(
              `   ⚠️ NO BASECITY VARIANT FOUND - Will use zone-wise pricing`,
            );
          }
        }
      }

      // If no basecity variant found (or not applicable), use zone-wise pricing
      if (!variant) {
        console.log(
          `   🔎 Looking for ZONE-WISE variant (zone: "${city.zone}")...`,
        );

        variant = product.variants.find((v) => {
          const match = v.plan._id === selectedPlan && v.zone === city.zone;
          if (match) {
            console.log(
              `      Found variant: zone="${v.zone}", price="${v.price}", salePrice="${v.salePrice}"`,
            );
          }
          return match;
        });

        pricingType = "zone-wise";

        if (variant) {
          console.log(
            `   ✅ ZONE-WISE VARIANT FOUND: price="${variant.price}", salePrice="${variant.salePrice}"`,
          );
        } else {
          console.log(`   ❌ NO ZONE-WISE VARIANT FOUND`);
        }
      }

      if (variant) {
        const price = variant.salePrice || variant.price || 0;
        totalPrice += price;

        console.log(
          `   💰 PRICE RESULT: Type="${pricingType}", Price="₹${price}"`,
        );

        breakdown.push({
          cityName: city.name,
          zone: city.zone,
          pricingType,
          price,
          originalPrice: variant.price,
          discount: variant.salePrice
            ? (
                ((variant.price - variant.salePrice) / variant.price) *
                100
              ).toFixed(0)
            : 0,
        });
      } else {
        // Variant not found for this city/zone
        console.log(`   ❌ ERROR: No pricing variant found`);

        breakdown.push({
          cityName: city.name,
          zone: city.zone,
          pricingType,
          price: 0,
          error: `No pricing available for ${city.name}`,
        });
      }
    });

    // ===== DEBUG: Log final result =====
    console.log("\n" + "=".repeat(60));
    console.log("📊 FINAL PRICING RESULT:");
    console.log(`   💵 Total Price: ₹${totalPrice.toLocaleString("en-IN")}`);
    console.log(`   🔢 Number of Cities: ${breakdown.length}`);
    console.log(`   📋 Breakdown:`, breakdown);
    console.log("=".repeat(60) + "\n");

    return {
      finalPrice: totalPrice,
      breakdown,
      error: null,
    };
  } catch (err) {
    console.error("Error calculating product price:", err);
    return {
      finalPrice: 0,
      breakdown: [],
      error: err.message || "Error calculating price",
    };
  }
};

/**
 * Get available cities for a plan based on plan configuration
 * @param {Object} plan - Plan object with allowVirtual, allowBasecity, additionalCitiesLimit
 * @param {Array} allCities - All available cities
 * @param {string} clientBaseCity - Client's selected base city (if any)
 * @returns {Object} - { availableForBaseCity: Array, availableForAdditional: Array }
 */
export const getAvailableCitiesForPlan = (
  plan,
  allCities = [],
  clientBaseCity = null,
) => {
  if (!plan) {
    return {
      availableForBaseCity: [],
      availableForAdditional: [],
      baseCityLimit: 0,
      additionalCitiesLimit: 0,
    };
  }

  const availableForBaseCity = [];
  const availableForAdditional = [];

  if (plan.allowVirtual) {
    // For base plan with virtual only
    const virtualCity = allCities.find(
      (c) => c.isVirtual || c.name.toLowerCase() === "virtual",
    );
    if (virtualCity) {
      availableForBaseCity.push(virtualCity);
    }
  } else if (plan.allowBasecity) {
    // For plans that allow base city selection
    availableForBaseCity.push(...allCities.filter((c) => !c.isVirtual));

    // Additional cities can be any city except the selected base city
    if (clientBaseCity) {
      availableForAdditional.push(
        ...allCities.filter(
          (c) =>
            !c.isVirtual &&
            c.name.toLowerCase() !== clientBaseCity.toLowerCase(),
        ),
      );
    } else {
      availableForAdditional.push(...allCities.filter((c) => !c.isVirtual));
    }
  }

  return {
    availableForBaseCity,
    availableForAdditional,
    baseCityLimit: plan.allowVirtual || plan.allowBasecity ? 1 : 0,
    additionalCitiesLimit: plan.additionalCitiesLimit || 0,
  };
};

/**
 * Format price for display
 * @param {number} price - Price value
 * @returns {string} - Formatted price string
 */
export const formatPrice = (price) => {
  if (!price || price === 0) return "Free";
  return `₹${price.toLocaleString("en-IN")}`;
};
