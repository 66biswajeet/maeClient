import React, { useState, useEffect } from "react";
import { MdClose, MdSearch } from "react-icons/md";
import "./PlanBasedCitySelector.css";

/**
 * Two-phase city selector component for plan-based city selection
 * Phase 1: Select Base City (if plan allows)
 * Phase 2: Add Additional Cities (if plan allows and has limit > 0)
 */
export default function PlanBasedCitySelector({
  plan,
  selectedBaseCity,
  additionalSelectedCities,
  cities = [],
  searchResults = [],
  searchInput = "",
  searching = false,
  searchError = "",
  validationError = "",
  onSelectBaseCity,
  onAddAdditionalCity,
  onRemoveBaseCity,
  onRemoveAdditionalCity,
  onSearch,
  disabled = false,
}) {
  const [phase, setPhase] = useState("base"); // "base" or "additional"
  const [localSearchInput, setLocalSearchInput] = useState(""); // Local state for search input

  // Determine available cities for each phase
  const availableCitiesForBase = cities.filter(
    (c) => !additionalSelectedCities.some((ac) => ac._id === c._id),
  );

  const availableCitiesForAdditional = cities.filter(
    (c) => !selectedBaseCity || c._id !== selectedBaseCity._id,
  );

  const canAddMore =
    additionalSelectedCities.length < (plan?.additionalCitiesLimit || 0);

  // Reset local search input when search is cleared
  useEffect(() => {
    if (!searchInput) {
      setLocalSearchInput("");
    }
  }, [searchInput]);

  // Handle search button click for base city
  const handleBaseSearchClick = () => {
    if (localSearchInput.trim().length >= 2) {
      onSearch(localSearchInput);
    }
  };

  // Handle search button click for additional cities
  const handleAdditionalSearchClick = () => {
    if (localSearchInput.trim().length >= 2) {
      onSearch(localSearchInput);
    }
  };

  // Handle Enter key for search
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && localSearchInput.trim().length >= 2) {
      onSearch(localSearchInput);
    }
  };

  if (!plan) {
    return (
      <div className="city-selector-empty">Please select a plan first</div>
    );
  }

  // If plan is virtual only
  if (plan.allowVirtual && !plan.allowBasecity) {
    return (
      <div className="city-selector-virtual">
        <div className="virtual-info">
          <p className="virtual-badge">🌐 Virtual Plan</p>
          <p className="virtual-desc">Only virtual service available</p>
        </div>
      </div>
    );
  }

  // If plan doesn't allow city selection
  if (!plan.allowBasecity) {
    return (
      <div className="city-selector-empty">
        This plan does not allow city selection
      </div>
    );
  }

  return (
    <div className="plan-based-city-selector">
      {/* Phase 1: Select Base City */}
      <div className="selector-phase">
        <div className="phase-header">
          <h4 className="phase-title">
            <span className="phase-number">1</span>
            Select Base City
          </h4>
          <p className="phase-desc">Choose where you want the service</p>
        </div>

        <div className="phase-content">
          {selectedBaseCity ? (
            <div className="selected-city-item">
              <div className="city-badge">{selectedBaseCity.name}</div>
              <button
                className="remove-city-btn"
                onClick={onRemoveBaseCity}
                title="Remove base city"
              >
                <MdClose size={16} />
              </button>
            </div>
          ) : (
            <div className="city-search">
              <div className="search-input-group">
                <div className="search-input-wrapper">
                  <MdSearch className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search by pincode or city..."
                    value={localSearchInput}
                    onChange={(e) => setLocalSearchInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={disabled}
                    className="city-search-input"
                  />
                </div>
                <button
                  className="search-button"
                  onClick={handleBaseSearchClick}
                  disabled={
                    disabled || localSearchInput.trim().length < 2 || searching
                  }
                  title="Search for cities"
                >
                  {searching ? "Searching..." : "Search"}
                </button>
              </div>

              {searching && <p className="search-status">Searching...</p>}
              {searchError && <p className="search-error">{searchError}</p>}
              {searchResults && searchResults.length > 0 ? (
                <div className="search-results">
                  {searchResults.map((result) => (
                    <div
                      key={result._id}
                      className="search-result-item"
                      onClick={() => {
                        onSelectBaseCity(result);
                        setPhase("additional");
                        setLocalSearchInput("");
                      }}
                    >
                      <div className="result-name">{result.name}</div>
                      <div className="result-meta">
                        {result.state} • Zone: {result.zone}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                !searching &&
                localSearchInput && (
                  <p className="search-status" style={{ color: "#999" }}>
                    No results found
                  </p>
                )
              )}
            </div>
          )}
        </div>
      </div>

      {/* Phase 2: Add Additional Cities (if base city is selected and plan allows) */}
      {selectedBaseCity && plan.additionalCitiesLimit > 0 && (
        <div className="selector-phase">
          <div className="phase-header">
            <h4 className="phase-title">
              <span className="phase-number">2</span>
              Add Additional Cities
              <span className="limit-badge">
                {additionalSelectedCities.length}/{plan.additionalCitiesLimit}
              </span>
            </h4>
            <p className="phase-desc">Choose additional service locations</p>
          </div>

          <div className="phase-content">
            {additionalSelectedCities.length > 0 && (
              <div className="selected-cities-list">
                {additionalSelectedCities.map((city) => (
                  <div key={city._id} className="selected-city-item">
                    <div className="city-badge">{city.name}</div>
                    <button
                      className="remove-city-btn"
                      onClick={() => onRemoveAdditionalCity(city._id)}
                      title="Remove city"
                    >
                      <MdClose size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {canAddMore && (
              <div className="city-search">
                <div className="search-input-group">
                  <div className="search-input-wrapper">
                    <MdSearch className="search-icon" />
                    <input
                      type="text"
                      placeholder="Search by pincode or city..."
                      value={phase === "additional" ? localSearchInput : ""}
                      onChange={(e) => {
                        setPhase("additional");
                        setLocalSearchInput(e.target.value);
                      }}
                      onKeyPress={handleKeyPress}
                      disabled={disabled || !canAddMore}
                      className="city-search-input"
                    />
                  </div>
                  <button
                    className="search-button"
                    onClick={handleAdditionalSearchClick}
                    disabled={
                      disabled ||
                      !canAddMore ||
                      localSearchInput.trim().length < 2 ||
                      searching
                    }
                    title="Search for cities"
                  >
                    {searching ? "Searching..." : "Search"}
                  </button>
                </div>

                {searching && phase === "additional" && (
                  <p className="search-status">Searching...</p>
                )}
                {searchError && phase === "additional" && (
                  <p className="search-error">{searchError}</p>
                )}
                {phase === "additional" &&
                searchResults &&
                searchResults.length > 0 ? (
                  <div className="search-results">
                    {searchResults.map((result) => (
                      <div
                        key={result._id}
                        className="search-result-item"
                        onClick={() => onAddAdditionalCity(result)}
                      >
                        <div className="result-name">{result.name}</div>
                        <div className="result-meta">
                          {result.state} • Zone: {result.zone}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  phase === "additional" &&
                  !searching &&
                  localSearchInput && (
                    <p className="search-status" style={{ color: "#999" }}>
                      No results found
                    </p>
                  )
                )}
              </div>
            )}

            {!canAddMore && additionalSelectedCities.length > 0 && (
              <p className="max-reached">Maximum additional cities reached</p>
            )}
          </div>
        </div>
      )}

      {/* Validation Error */}
      {validationError && (
        <div className="validation-error">{validationError}</div>
      )}
    </div>
  );
}
