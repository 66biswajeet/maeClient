import React, { useState, useMemo, useEffect } from "react";
import { ChevronDown, Plus, X } from "lucide-react";
import "./ProductFilterSelector.css";

const ProductFilterSelector = ({
  zones = [],
  plans = [],
  cities = [],
  onApplyFilters = (selectedZones, selectedPlans, selectedCities) => {},
  initialZones = [],
  initialPlans = [],
  initialCities = [],
}) => {
  const [selectedZones, setSelectedZones] = useState(initialZones || []);
  const [selectedPlans, setSelectedPlans] = useState(initialPlans || []);
  const [selectedCities, setSelectedCities] = useState(initialCities || []);
  const [showZoneDropdown, setShowZoneDropdown] = useState(false);
  const [showPlanDropdown, setShowPlanDropdown] = useState(false);

  // Debug: Log whenever selectedCities changes
  useEffect(() => {
    console.log("🔍 selectedCities state updated:", selectedCities);
  }, [selectedCities]);

  // Get unique zone options from cities
  const zoneOptions = useMemo(() => {
    const uniqueZones = [...new Set(cities.map((c) => c.zone))];
    return uniqueZones.map((zone) => ({
      zone,
      cities: cities.filter((c) => c.zone === zone),
      price: zones.find((z) => z.zone === zone)?.price || 0,
    }));
  }, [cities, zones]);

  // Calculate total price
  const totalPrice = useMemo(() => {
    let total = 0;
    selectedZones.forEach((zone) => {
      const zoneInfo = zones.find((z) => z.zone === zone);
      if (zoneInfo) {
        total += zoneInfo.price;
      }
    });
    return total;
  }, [selectedZones, zones]);

  // Add a zone selection
  const addZone = (zone) => {
    console.log("➕ Zone selected:", zone);
    setSelectedZones([...selectedZones, zone]);
  };

  // Remove a zone selection by index
  const removeZone = (index) => {
    setSelectedZones(selectedZones.filter((_, i) => i !== index));
    // Also remove the corresponding city
    setSelectedCities(selectedCities.filter((_, i) => i !== index));
  };

  // Toggle plan selection
  const togglePlan = (planId) => {
    setSelectedPlans((prev) =>
      prev.includes(planId)
        ? prev.filter((p) => p !== planId)
        : [...prev, planId],
    );
  };

  // Apply filters and navigate
  const handleApplyFilters = () => {
    if (selectedZones.length > 0 && selectedPlans.length > 0) {
      // Extract city names for the selected zones from available cities
      const citiesToStore = [];
      selectedZones.forEach((zone) => {
        const citiesInZone = cities.filter((c) => c.zone === zone);
        if (citiesInZone.length > 0) {
          // Add the first city of this zone
          citiesToStore.push(citiesInZone[0].name);
          console.log(`🏙️ Added city for zone ${zone}:`, citiesInZone[0].name);
        }
      });

      console.log("📋 Filter Summary:", {
        zones: selectedZones,
        cities: citiesToStore,
        plans: selectedPlans,
      });

      // Store extracted cities in localStorage
      if (citiesToStore.length > 0) {
        localStorage.setItem("selectedCities", JSON.stringify(citiesToStore));
        console.log("💾 Stored cities in localStorage:", citiesToStore);
      } else {
        console.warn("⚠️ No cities found for selected zones!");
      }

      onApplyFilters(selectedZones, selectedPlans, citiesToStore);
      setShowZoneDropdown(false);
      setShowPlanDropdown(false);
    }
  };

  const ZONE_NAMES = {
    north: "🔵 North Zone",
    south: "🔵 South Zone",
    east: "🔵 East Zone",
    west: "🔵 West Zone",
    basecity: "📍 Your Base City",
  };

  return (
    <div className="product-filter-selector">
      <h3 className="filter-selector__title">Customize Your Selection</h3>

      {/* Zones Section */}
      <div className="filter-selector__section">
        <label className="filter-selector__label">Select Zones/Cities</label>

        {/* Selected Zones Display */}
        <div className="filter-selector__selected-items">
          {selectedZones.length === 0 ? (
            <p className="filter-selector__placeholder">No zones selected</p>
          ) : (
            selectedZones.map((zone, idx) => (
              <div key={idx} className="filter-selector__chip">
                <span className="chip__text">
                  {ZONE_NAMES[zone] || zone}
                  {selectedCities[idx] && ` (${selectedCities[idx]})`}
                </span>
                <button
                  className="chip__remove"
                  onClick={() => removeZone(idx)}
                  title="Remove zone"
                >
                  <X size={14} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Zone Dropdown */}
        <div className="filter-selector__dropdown">
          <button
            className="dropdown__toggle"
            onClick={() => setShowZoneDropdown(!showZoneDropdown)}
          >
            <Plus size={16} /> Add Zone/City
            <ChevronDown
              size={16}
              className={`toggle-icon ${showZoneDropdown ? "open" : ""}`}
            />
          </button>

          {showZoneDropdown && (
            <div className="dropdown__menu">
              {zoneOptions.map((option) => (
                <div key={option.zone} className="dropdown__zone-group">
                  <div className="zone-group__header">
                    <span className="zone-name">
                      {ZONE_NAMES[option.zone] || option.zone}
                    </span>
                    <span className="zone-price">₹{option.price}</span>
                  </div>
                  <div className="zone-group__cities">
                    {option.cities.map((city) => (
                      <button
                        key={city._id}
                        className="city-option"
                        onClick={() => {
                          console.log("🏙️ City button clicked:", {
                            zone: option.zone,
                            city: city.name,
                          });
                          addZone(option.zone);
                        }}
                      >
                        <span>+</span> {city.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Plans Section */}
      <div className="filter-selector__section">
        <label className="filter-selector__label">Select Plans</label>

        {/* Plan Dropdown */}
        <div className="filter-selector__dropdown">
          <button
            className="dropdown__toggle"
            onClick={() => setShowPlanDropdown(!showPlanDropdown)}
          >
            {selectedPlans.length === 0
              ? "Select Plans"
              : `${selectedPlans.length} Plan${selectedPlans.length > 1 ? "s" : ""} Selected`}
            <ChevronDown
              size={16}
              className={`toggle-icon ${showPlanDropdown ? "open" : ""}`}
            />
          </button>

          {showPlanDropdown && (
            <div className="dropdown__menu">
              {plans.map((plan) => (
                <label key={plan._id} className="plan-option">
                  <input
                    type="checkbox"
                    checked={selectedPlans.includes(plan._id)}
                    onChange={() => togglePlan(plan._id)}
                  />
                  <span className="plan-name">{plan.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Price Summary */}
      <div className="filter-selector__price-summary">
        <div className="price-summary__row">
          <span>Zones Selected:</span>
          <strong>{selectedZones.length}</strong>
        </div>
        <div className="price-summary__row">
          <span>Total Zone Price:</span>
          <strong>₹{totalPrice}</strong>
        </div>
      </div>

      {/* Apply Button */}
      <button
        className={`filter-selector__apply-btn ${
          selectedZones.length > 0 && selectedPlans.length > 0
            ? "enabled"
            : "disabled"
        }`}
        onClick={() => {
          console.log("🔘 Apply Filters button clicked!");
          console.log("  selectedZones:", selectedZones);
          console.log("  selectedPlans:", selectedPlans);
          console.log("  cities data:", cities);
          handleApplyFilters();
        }}
        disabled={selectedZones.length === 0 || selectedPlans.length === 0}
      >
        Apply Filters
      </button>
    </div>
  );
};

export default ProductFilterSelector;
