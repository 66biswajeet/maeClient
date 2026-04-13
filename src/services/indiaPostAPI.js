/**
 * India Post API Service
 * Provides city/zone lookup using India Post's postal pincode API
 * Supports both pincode (6-digit) and city name searches
 */

// Zone mapping based on Indian states
export const ZONE_MAPPING = {
  north: [
    "Delhi",
    "Haryana",
    "Punjab",
    "Himachal Pradesh",
    "Jammu and Kashmir",
    "Uttarakhand",
    "Rajasthan",
    "Uttar Pradesh",
    "Chandigarh",
  ],
  south: [
    "Andhra Pradesh",
    "Telangana",
    "Karnataka",
    "Kerala",
    "Tamil Nadu",
    "Puducherry",
  ],
  east: [
    "West Bengal",
    "Bihar",
    "Jharkhand",
    "Odisha",
    "Assam",
    "Arunachal Pradesh",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Tripura",
    "Sikkim",
    "Andaman and Nicobar Islands",
  ],
  west: [
    "Maharashtra",
    "Gujarat",
    "Goa",
    "Madhya Pradesh",
    "Chhattisgarh",
    "Dadra and Nagar Haveli",
    "Daman and Diu",
  ],
};

/**
 * Get zone from state using the zone mapping
 * @param {string} state - State name
 * @returns {string} Zone name or "Unknown"
 */
const getZoneFromState = (state) => {
  for (const [zone, states] of Object.entries(ZONE_MAPPING)) {
    if (states.includes(state)) {
      return zone;
    }
  }
  return "Unknown";
};

/**
 * Search for location using India Post API
 * Detects if input is a 6-digit pincode or city name
 * @param {string} input - Either a 6-digit pincode or a city name
 * @returns {Promise<Object>} - Result with city, state, zone, pincode info
 */
export const getZoneByInput = async (input) => {
  if (!input?.trim()) {
    return { error: "No input provided", success: false };
  }

  const isPincode = /^\d{6}$/.test(input.trim());
  const endpoint = isPincode
    ? `https://api.postalpincode.in/pincode/${input}`
    : `https://api.postalpincode.in/postoffice/${input}`;

  // Add timeout to prevent hanging requests
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000); // 5 second timeout

  try {
    const response = await fetch(endpoint, { signal: controller.signal });
    const data = await response.json();

    if (data[0]?.Status === "Success" && data[0].PostOffice?.length > 0) {
      const result = data[0].PostOffice[0];
      const state = result.State;
      const zone = getZoneFromState(state);

      return {
        city: result.District, // District is actually the city name in India Post API
        state,
        zone,
        pincode: result.Pincode,
        postOffice: result.Name,
        success: true,
      };
    }

    return {
      error:
        "Location not found. Please check spelling or try a different pincode.",
      success: false,
    };
  } catch (error) {
    if (error.name === "AbortError") {
      return {
        error: "Search timeout. Please try again.",
        success: false,
      };
    }
    console.error("India Post API error:", error);
    return {
      error: "Search failed. Please try a different input.",
      success: false,
    };
  } finally {
    clearTimeout(timeout);
  }
};

/**
 * Format India Post API result into city object structure
 * @param {Object} result - Raw result from getZoneByInput
 * @returns {Object} - Formatted city object with _id, name, zone, etc.
 */
export const formatCityResult = (result) => ({
  _id: `${result.pincode}_${result.city.replace(/\s+/g, "_")}`,
  name: result.city,
  state: result.state,
  zone: result.zone,
  pincode: result.pincode,
  postOffice: result.postOffice,
  source: "india-post", // Track data source
});

/**
 * Ensure Virtual city exists in cities list (needed for base plan)
 * @param {Array} cities - Current cities array
 * @returns {Array} - Cities array with Virtual city added if missing
 */
export const ensureVirtualCity = (cities) => {
  const hasVirtual = cities.some((c) => c.name?.toLowerCase() === "virtual");
  if (!hasVirtual) {
    return [
      {
        _id: "virtual",
        name: "Virtual",
        zone: "virtual",
        isVirtual: true,
      },
      ...cities,
    ];
  }
  return cities;
};
