import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import ProductCard from "../components/ProductCard";
import PlanBasedCitySelector from "../components/PlanBasedCitySelector";
import { getProducts } from "../services/api";
import {
  getZoneByInput,
  formatCityResult,
  ensureVirtualCity,
} from "../services/indiaPostAPI";
import {
  calculateProductPrice,
  getAvailableCitiesForPlan,
  formatPrice,
} from "../services/pricingCalculator";
import "./CategoryProductsPage.css";
import {
  MdFilterList,
  MdExpandMore,
  MdExpandLess,
  MdClose,
  MdRefresh,
} from "react-icons/md";
//comment
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

// Request cache to prevent duplicate simultaneous API calls
const requestCache = new Map();

export default function AllProductsPage() {
  const [products, setProducts] = useState([]);
  const [pageTitle, setPageTitle] = useState("All Services");
  const [pageDescription, setPageDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("most-relevant");

  // Filter states
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [priceSlider, setPriceSlider] = useState({ min: 0, max: 100000 });
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);
  const [selectedPlans, setSelectedPlans] = useState([]);
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [activeFilters, setActiveFilters] = useState([]);

  // Sidebar collapse states
  const [isPriceOpen, setIsPriceOpen] = useState(true);
  const [isRatingsOpen, setIsRatingsOpen] = useState(true);
  const [isCategoryOpen, setIsCategoryOpen] = useState(true);

  // Track which categories have expanded subcategories
  const [expandedCategories, setExpandedCategories] = useState({});

  // Validation error state
  const [validationError, setValidationError] = useState("");

  const limit = 12;

  // Filter options from API
  const [categories, setCategories] = useState([]);
  const [subcategoriesMap, setSubcategoriesMap] = useState({});
  const [cities, setCities] = useState([]);
  const [plans, setPlans] = useState([]);

  // City search states (India Post API)
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  // Plan-based city selection states
  const [selectedBaseCity, setSelectedBaseCity] = useState(null);
  const [additionalSelectedCities, setAdditionalSelectedCities] = useState([]);

  const ratingOptions = [5, 4, 3, 2, 1];

  // Track pending requests to avoid duplicates
  const pendingRequestRef = useRef(null);

  // Fetch all categories and subcategories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${API_BASE}/categories`);
        const allCats = Array.isArray(res.data)
          ? res.data
          : res.data.categories || [];

        // Separate root categories and build subcategories map
        const roots = allCats.filter((c) => !c.parent);
        const subMap = {};

        roots.forEach((root) => {
          subMap[root._id] = allCats.filter(
            (c) => c.parent?._id === root._id || c.parent === root._id,
          );
        });

        setCategories(roots);
        setSubcategoriesMap(subMap);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch cities and plans
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [citiesRes, plansRes] = await Promise.all([
          axios.get(`${API_BASE}/cities`),
          axios.get(`${API_BASE}/plans`),
        ]);
        let fetchedCities = Array.isArray(citiesRes.data)
          ? citiesRes.data
          : citiesRes.data.cities || [];

        // Ensure Virtual city exists for base plan support
        fetchedCities = ensureVirtualCity(fetchedCities);

        setCities(fetchedCities);
        const fetchedPlans = Array.isArray(plansRes.data)
          ? plansRes.data
          : plansRes.data.plans || [];
        // Sort plans by sequence
        const sortedPlans = [...fetchedPlans].sort(
          (a, b) => (a.sequence || 0) - (b.sequence || 0),
        );
        setPlans(sortedPlans);
      } catch (err) {
        console.error("Failed to fetch cities/plans:", err);
      }
    };
    fetchMetadata();
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        skip,
        limit,
      };

      // Add price range filters
      if (priceRange.min) params.minPrice = priceRange.min;
      if (priceRange.max) params.maxPrice = priceRange.max;

      // Add category filter
      if (selectedCategories.length > 0 || selectedSubcategories.length > 0) {
        const allCatIds = [...selectedCategories, ...selectedSubcategories];
        params.category = allCatIds.join(",");
      }

      // Add clientBaseCity and additionalZones (server expects these)
      if (selectedBaseCity) {
        params.clientBaseCity = selectedBaseCity.name;
      }
      if (additionalSelectedCities.length > 0) {
        const additionalZones = additionalSelectedCities
          .map((c) => c.zone)
          .filter(Boolean);
        if (additionalZones.length > 0)
          params.additionalZones = additionalZones.join(",");
      }

      // Add plan filter
      if (selectedPlans.length > 0) params.plan = selectedPlans.join(",");

      // Add rating filter (using minRating)
      if (selectedRatings.length > 0) {
        params.minRating = Math.min(...selectedRatings);
      }

      // Generate cache key from params
      const cacheKey = JSON.stringify(params);

      // If there's a pending request with the same params, wait for it
      if (pendingRequestRef.current?.key === cacheKey) {
        const cachedResult = await pendingRequestRef.current.promise;
        setProducts(
          skip === 0
            ? cachedResult.newProducts
            : [...products, ...cachedResult.newProducts],
        );
        setHasMore(cachedResult.hasMore);
        setLoading(false);
        return;
      }

      // Create the promise and store it
      const promise = getProducts(params).then((res) => {
        const newProducts = res.data?.products || [];
        return { newProducts, hasMore: res.data?.hasMore || false };
      });

      // Track this request
      pendingRequestRef.current = { key: cacheKey, promise };

      const result = await promise;
      setProducts(
        skip === 0 ? result.newProducts : [...products, ...result.newProducts],
      );
      setHasMore(result.hasMore);

      // Clear pending request after a short delay
      setTimeout(() => {
        if (pendingRequestRef.current?.key === cacheKey) {
          pendingRequestRef.current = null;
        }
      }, 100);
    } catch (err) {
      setError("Failed to load products");
      console.error(err);
      pendingRequestRef.current = null;
    } finally {
      setLoading(false);
    }
  }, [
    skip,
    priceRange,
    selectedCategories,
    selectedSubcategories,
    selectedPlans,
    selectedRatings,
    products,
    selectedBaseCity,
    additionalSelectedCities,
  ]);

  useEffect(() => {
    setSkip(0);
  }, [
    priceRange,
    selectedCategories,
    selectedSubcategories,
    selectedCities,
    selectedPlans,
    selectedRatings,
  ]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleLoadMore = () => setSkip((p) => p + limit);

  const updateActiveFilters = () => {
    const filters = [];
    if (priceRange.min || priceRange.max) {
      filters.push(
        `Price: ₹${priceRange.min || 0} - ₹${priceRange.max || "∞"}`,
      );
    }

    selectedCategories.forEach((catId) => {
      const cat = categories.find((c) => c._id === catId);
      if (cat) filters.push(cat.name);
    });

    selectedSubcategories.forEach((subId) => {
      let subcat = null;
      for (const subs of Object.values(subcategoriesMap)) {
        subcat = subs.find((s) => s._id === subId);
        if (subcat) break;
      }
      if (subcat) filters.push(subcat.name);
    });

    selectedPlans.forEach((planId) => {
      const plan = plans.find((p) => p._id === planId);
      if (plan) filters.push(plan.name);
    });

    selectedCities.forEach((cityId) => {
      const city = cities.find((c) => c._id === cityId);
      if (city) filters.push(city.name);
    });

    selectedRatings.forEach((rating) => filters.push(`${rating} Stars`));
    setActiveFilters(filters);
  };

  useEffect(() => {
    updateActiveFilters();
  }, [
    priceRange,
    selectedCategories,
    selectedSubcategories,
    selectedPlans,
    selectedCities,
    selectedRatings,
  ]);

  const handleClearAll = () => {
    setPriceRange({ min: "", max: "" });
    setPriceSlider({ min: 0, max: 100000 });
    setSelectedCategories([]);
    setSelectedSubcategories([]);
    setSelectedCities([]);
    setSelectedPlans([]);
    setSelectedRatings([]);
    setActiveFilters([]);
    setSelectedBaseCity(null);
    setAdditionalSelectedCities([]);
    setValidationError("");
    setSkip(0);
  };

  // City search handler (India Post API)
  const handleCitySearch = async (input) => {
    setSearchInput(input);
    setSearchError("");
    setSearchResults([]); // Clear previous results immediately

    if (input.length < 2) {
      return;
    }

    setSearching(true);
    const result = await getZoneByInput(input);

    if (result.success) {
      // Format ALL results from the API, not just the first one
      const formattedResults = result.results.map((res) =>
        formatCityResult(res),
      );
      setSearchResults(formattedResults);
    } else {
      setSearchError(result.error || "No results found");
    }
    setSearching(false);
  };

  // Add searched city to filter
  const handleAddSearchedCity = (searchResult) => {
    // Auto-select base plan if virtual city is being added and base is not selected
    if (
      searchResult.name?.toLowerCase() === "virtual" &&
      plans.find((p) => p.name?.toLowerCase() === "base")?._id !==
        selectedPlans[0]
    ) {
      const basePlan = plans.find((p) => p.name?.toLowerCase() === "base");
      if (basePlan) {
        setSelectedPlans([basePlan._id]);
      }
    }

    // Check if already in cities list
    const exists = cities.some((c) => c._id === searchResult._id);
    if (!exists) {
      setCities([...cities, searchResult]);
    }
    setSelectedCities([...selectedCities, searchResult._id]);
    setSearchInput("");
    setSearchResults([]);
    setSearchError("");
  };

  // Handle base city selection
  const handleSelectBaseCity = (cityObj) => {
    // Ensure city is in cities list
    const exists = cities.some((c) => c._id === cityObj._id);
    if (!exists) {
      setCities([...cities, cityObj]);
    }

    setSelectedBaseCity(cityObj);
    setSearchInput("");
    setSearchResults([]);
    setSearchError("");
    setValidationError("");
  };

  // Handle adding additional city
  const handleAddAdditionalCity = (cityObj) => {
    const selectedPlan = plans.find((p) => p._id === selectedPlans[0]);
    const additionalLimit = selectedPlan?.additionalCitiesLimit || 0;

    if (additionalSelectedCities.length >= additionalLimit) {
      setValidationError(
        `You can only add up to ${additionalLimit} additional cities for this plan`,
      );
      return;
    }

    // Check if already selected as base city
    if (selectedBaseCity && selectedBaseCity._id === cityObj._id) {
      setValidationError("This city is already selected as base city");
      return;
    }

    // Check if already in additional cities
    if (additionalSelectedCities.some((c) => c._id === cityObj._id)) {
      setValidationError("This city is already selected");
      return;
    }

    // Ensure city is in cities list
    const exists = cities.some((c) => c._id === cityObj._id);
    if (!exists) {
      setCities([...cities, cityObj]);
    }

    setAdditionalSelectedCities([...additionalSelectedCities, cityObj]);
    setSearchInput("");
    setSearchResults([]);
    setSearchError("");
    setValidationError("");
  };

  // Remove base city
  const handleRemoveBaseCity = () => {
    setSelectedBaseCity(null);
    setValidationError("");
  };

  // Remove additional city
  const handleRemoveAdditionalCity = (cityId) => {
    setAdditionalSelectedCities(
      additionalSelectedCities.filter((c) => c._id !== cityId),
    );
    setValidationError("");
  };

  // Sync baseCity + additionalCities to selectedCities for product filter
  useEffect(() => {
    const citiesArray = [];
    if (selectedBaseCity) citiesArray.push(selectedBaseCity._id);
    if (additionalSelectedCities.length > 0) {
      citiesArray.push(...additionalSelectedCities.map((c) => c._id));
    }
    setSelectedCities(citiesArray);
  }, [selectedBaseCity, additionalSelectedCities]);

  return (
    <div className="category-products-page">
      <div className="compliance-header">
        <div className="header-content">
          <div className="compliance-badge">
            <span>ALL SERVICES</span>
          </div>
          <h1 className="header-title">{pageTitle}</h1>
          {pageDescription && (
            <p className="header-description">{pageDescription}</p>
          )}
        </div>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      <div className="products-container">
        {/* Top Filters - Category, Plan, City */}
        <div className="top-filters-section">
          {/* Categories */}
          <div className="top-filter-group">
            <h4 className="top-filter-title">Audits</h4>
            <div className="top-filter-items-expandable">
              {categories.length > 0 ? (
                categories.map((cat) => (
                  <div key={cat._id} className="category-item-container">
                    {/* Parent Category with expand toggle */}
                    <div className="category-row">
                      <label className="top-filter-checkbox">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(cat._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCategories([
                                ...selectedCategories,
                                cat._id,
                              ]);
                            } else {
                              setSelectedCategories(
                                selectedCategories.filter(
                                  (id) => id !== cat._id,
                                ),
                              );
                            }
                          }}
                        />
                        <span>{cat.name}</span>
                      </label>
                      {subcategoriesMap[cat._id]?.length > 0 && (
                        <button
                          className="expand-toggle"
                          onClick={() => {
                            setExpandedCategories({
                              ...expandedCategories,
                              [cat._id]: !expandedCategories[cat._id],
                            });
                          }}
                          aria-label={
                            expandedCategories[cat._id] ? "Collapse" : "Expand"
                          }
                        >
                          {expandedCategories[cat._id] ? (
                            <MdExpandLess size={18} />
                          ) : (
                            <MdExpandMore size={18} />
                          )}
                        </button>
                      )}
                    </div>

                    {/* Nested Subcategories - Expandable */}
                    {expandedCategories[cat._id] &&
                      subcategoriesMap[cat._id]?.length > 0 && (
                        <div className="subcategories-container">
                          {subcategoriesMap[cat._id].map((sub) => (
                            <label
                              key={sub._id}
                              className="top-filter-checkbox top-filter-checkbox-nested"
                            >
                              <input
                                type="checkbox"
                                checked={selectedSubcategories.includes(
                                  sub._id,
                                )}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedSubcategories([
                                      ...selectedSubcategories,
                                      sub._id,
                                    ]);
                                  } else {
                                    setSelectedSubcategories(
                                      selectedSubcategories.filter(
                                        (id) => id !== sub._id,
                                      ),
                                    );
                                  }
                                }}
                              />
                              <span>{sub.name}</span>
                            </label>
                          ))}
                        </div>
                      )}
                  </div>
                ))
              ) : (
                <p style={{ fontSize: "12px", color: "#999" }}>Loading...</p>
              )}
            </div>
          </div>

          {/* Plans */}
          {plans.length > 0 && (
            <div className="top-filter-group">
              <h4 className="top-filter-title">Plan</h4>
              <div className="top-filter-items">
                {plans.map((plan) => (
                  <label key={plan._id} className="top-filter-checkbox">
                    <input
                      type="radio"
                      name="service-plan"
                      checked={selectedPlans[0] === plan._id}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedPlans([plan._id]);
                          setValidationError("");
                          // Clear previously selected cities when changing plan
                          setSelectedCities([]); // Clear search input and results when plan changes
                          setSearchInput("");
                          setSearchResults([]);
                          // If "base" plan is selected, auto-select "virtual" city
                          if (plan.name?.toLowerCase() === "base") {
                            const virtualCity = cities.find(
                              (c) => c.name?.toLowerCase() === "virtual",
                            );
                            if (virtualCity) {
                              setSelectedCities([virtualCity._id]);
                            }
                          }
                        }
                      }}
                    />
                    <span>{plan.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Cities - Using new two-phase selector */}
          <div className="top-filter-group">
            <h4 className="top-filter-title">Service Locations</h4>
            {selectedPlans.length > 0 ? (
              <PlanBasedCitySelector
                plan={plans.find((p) => p._id === selectedPlans[0])}
                selectedBaseCity={selectedBaseCity}
                additionalSelectedCities={additionalSelectedCities}
                cities={cities}
                searchResults={searchResults}
                searchInput={searchInput}
                searching={searching}
                searchError={searchError}
                validationError={validationError}
                onSelectBaseCity={handleSelectBaseCity}
                onAddAdditionalCity={handleAddAdditionalCity}
                onRemoveBaseCity={handleRemoveBaseCity}
                onRemoveAdditionalCity={handleRemoveAdditionalCity}
                onSearch={handleCitySearch}
                disabled={selectedPlans.length === 0}
              />
            ) : (
              <p className="filter-info-text">Select a plan first</p>
            )}
          </div>
        </div>

        {/* Left Sidebar - Price & Ratings Only */}
        <aside className="filters-sidebar">
          <div className="sidebar-header">
            <h3>Filters</h3>
            {activeFilters.length > 0 && (
              <span className="active-count">{activeFilters.length}</span>
            )}
          </div>

          {/* Validation Error Message */}
          {validationError && (
            <div className="filter-error-text">
              <MdFilterList size={16} />
              {validationError}
            </div>
          )}

          {/* Price Range Filter */}
          <div className="sidebar-filter-section">
            <button
              className="filter-section-header"
              onClick={() => setIsPriceOpen(!isPriceOpen)}
            >
              <span>Price Range</span>
              {isPriceOpen ? (
                <MdExpandLess size={20} />
              ) : (
                <MdExpandMore size={20} />
              )}
            </button>
            {isPriceOpen && (
              <div className="filter-section-content">
                {/* Price Slider */}
                <div className="price-slider-container">
                  <div className="slider-track">
                    <input
                      type="range"
                      min="0"
                      max="100000"
                      value={priceSlider.min}
                      onChange={(e) => {
                        const newMin = Number(e.target.value);
                        if (newMin <= priceSlider.max) {
                          setPriceSlider({ ...priceSlider, min: newMin });
                          setPriceRange({ ...priceRange, min: newMin });
                        }
                      }}
                      className="slider-input slider-input-min"
                    />
                    <input
                      type="range"
                      min="0"
                      max="100000"
                      value={priceSlider.max}
                      onChange={(e) => {
                        const newMax = Number(e.target.value);
                        if (newMax >= priceSlider.min) {
                          setPriceSlider({ ...priceSlider, max: newMax });
                          setPriceRange({ ...priceRange, max: newMax });
                        }
                      }}
                      className="slider-input slider-input-max"
                    />
                  </div>
                  <div className="slider-labels">
                    <span className="slider-label-min">₹0</span>
                    <span className="slider-label-max">₹1,00,000</span>
                  </div>
                </div>

                {/* Price Input Fields */}
                <div className="price-inputs-sidebar">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => {
                      const val = Number(e.target.value) || 0;
                      setPriceRange({ ...priceRange, min: val });
                      setPriceSlider({ ...priceSlider, min: val });
                    }}
                    className="price-input-sidebar"
                  />
                  <span className="price-separator-sidebar">to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => {
                      const val = Number(e.target.value) || 100000;
                      setPriceRange({ ...priceRange, max: val });
                      setPriceSlider({ ...priceSlider, max: val });
                    }}
                    className="price-input-sidebar"
                  />
                </div>
                {(priceRange.min || priceRange.max) && (
                  <div className="price-display">
                    ₹{priceRange.min || 0} - ₹{priceRange.max || "∞"}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Ratings Filter */}
          <div className="sidebar-filter-section">
            <button
              className="filter-section-header"
              onClick={() => setIsRatingsOpen(!isRatingsOpen)}
            >
              <span>Expert Ratings</span>
              {isRatingsOpen ? (
                <MdExpandLess size={20} />
              ) : (
                <MdExpandMore size={20} />
              )}
            </button>
            {isRatingsOpen && (
              <div className="filter-section-content">
                <div className="rating-options-sidebar">
                  {ratingOptions.map((rating) => (
                    <label key={rating} className="rating-label-sidebar">
                      <input
                        type="checkbox"
                        checked={selectedRatings.includes(rating)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRatings([...selectedRatings, rating]);
                          } else {
                            setSelectedRatings(
                              selectedRatings.filter((r) => r !== rating),
                            );
                          }
                        }}
                      />
                      <span>
                        {Array(rating).fill("⭐").join("")} ({rating} Stars)
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Clear All */}
          {activeFilters.length > 0 && (
            <button className="clear-all-filters-btn" onClick={handleClearAll}>
              Clear All Filters
            </button>
          )}
        </aside>

        {/* Main Content Area */}
        <div className="products-main-content">
          {/* Top Filters */}
          {activeFilters.length > 0 && (
            <div className="active-filters-section">
              <div className="filters-chips">
                {activeFilters.map((filter, idx) => (
                  <span key={idx} className="filter-chip">
                    {filter}
                    <button
                      className="chip-remove"
                      onClick={() => handleClearAll()}
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* View Controls */}
          <div className="products-header">
            <div className="header-controls">
              <button
                className={`view-btn ${viewMode === "grid" ? "active" : ""}`}
                onClick={() => setViewMode("grid")}
                title="Grid View"
              >
                ⊞
              </button>
              <button
                className={`view-btn ${viewMode === "list" ? "active" : ""}`}
                onClick={() => setViewMode("list")}
                title="List View"
              >
                ≡
              </button>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="most-relevant">Most Relevant</option>
                <option value="price-low-high">Price: Low to High</option>
                <option value="price-high-low">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest First</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="error-message">
              <p>{error}</p>
            </div>
          )}

          {loading && products.length === 0 ? (
            <div className="loading-state">
              <div className={`skeleton-grid ${viewMode}`}>
                {Array(12)
                  .fill(null)
                  .map((_, i) => (
                    <ProductCard key={i} loading={true} viewMode={viewMode} />
                  ))}
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <h3>No products found</h3>
              <p>Try adjusting your filters or search criteria</p>
              <button className="reset-filters-btn" onClick={handleClearAll}>
                Reset All Filters
              </button>
            </div>
          ) : (
            <>
              <div className={`products-grid ${viewMode}`}>
                {products.map((product) => (
                  <ProductCard
                    key={product._id || product.id}
                    product={product}
                    viewMode={viewMode}
                    selectedCities={selectedCities}
                    selectedPlans={selectedPlans}
                    cities={cities}
                    selectedBaseCity={selectedBaseCity}
                  />
                ))}
              </div>

              {hasMore && (
                <div className="load-more-section">
                  <button
                    className="btn-load-more"
                    onClick={handleLoadMore}
                    disabled={loading}
                  >
                    {loading ? "Loading..." : "Load More Products"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
