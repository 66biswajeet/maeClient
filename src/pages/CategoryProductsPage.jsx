// import { useState, useEffect, useCallback } from "react";
// import { useParams } from "react-router-dom";
// import axios from "axios";
// import ProductCard from "../components/ProductCard";
// import { getProducts } from "../services/api";
// import "./CategoryProductsPage.css";
// import {
//   MdFilterList,
//   MdViewModule,
//   MdViewList,
//   MdKeyboardArrowDown,
//   MdClose,
//   MdCheckCircle,
//   MdInfo,
// } from "react-icons/md";

// const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

// export default function CategoryProductsPage() {
//   const { categoryId } = useParams();
//   const [products, setProducts] = useState([]);
//   const [categoryName, setCategoryName] = useState("");
//   const [categoryDescription, setCategoryDescription] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [skip, setSkip] = useState(0);
//   const [hasMore, setHasMore] = useState(false);
//   const [viewMode, setViewMode] = useState("grid"); // grid or list
//   const [sortBy, setSortBy] = useState("most-relevant");

//   // Filter states
//   const [showFilters, setShowFilters] = useState(true);
//   const [priceRange, setPriceRange] = useState({ min: "", max: "" });
//   const [selectedSubcategories, setSelectedSubcategories] = useState([]);
//   const [selectedCities, setSelectedCities] = useState([]);
//   const [selectedPlans, setSelectedPlans] = useState([]);
//   const [selectedRatings, setSelectedRatings] = useState([]);
//   const [activeFilters, setActiveFilters] = useState([]);

//   const limit = 12;

//   // Filter options from API
//   const [subcategories, setSubcategories] = useState([]);
//   const [cities, setCities] = useState([]);
//   const [plans, setPlans] = useState([]);
//   const [filtersLoading, setFiltersLoading] = useState(false);
//   const [categoryParent, setCategoryParent] = useState(null);

//   const ratingOptions = [5, 4, 3, 2, 1];

//   // Fetch category details for display
//   useEffect(() => {
//     axios
//       .get(`${API_BASE}/categories/${categoryId}`)
//       .then((res) => {
//         setCategoryName(res.data?.name || "Products");
//         setCategoryDescription(res.data?.description || "");
//         setCategoryParent(res.data?.parent || null);

//         // Fetch subcategories if this is a parent category
//         if (!res.data?.parent) {
//           axios
//             .get(`${API_BASE}/categories?parent=${categoryId}&isActive=true`)
//             .then((subRes) => {
//               setSubcategories(subRes.data?.categories || subRes.data || []);
//             })
//             .catch(() => setSubcategories([]));
//         } else {
//           setSubcategories([]);
//         }
//       })
//       .catch(() => {
//         setCategoryName("Products");
//         setCategoryDescription("");
//         setSubcategories([]);
//       });
//   }, [categoryId]);

//   // Fetch cities and plans for filters
//   useEffect(() => {
//     setFiltersLoading(true);
//     Promise.all([
//       axios.get(`${API_BASE}/cities`),
//       axios.get(`${API_BASE}/plans`),
//     ])
//       .then(([citiesRes, plansRes]) => {
//         setCities(citiesRes.data?.cities || citiesRes.data || []);
//         setPlans(plansRes.data?.plans || plansRes.data || []);
//       })
//       .catch(() => {
//         setCities([]);
//         setPlans([]);
//       })
//       .finally(() => setFiltersLoading(false));
//   }, []);

//   const fetchProducts = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const params = {
//         category: categoryId,
//         skip,
//         limit,
//       };

//       // Add price range filters
//       if (priceRange.min) params.minPrice = priceRange.min;
//       if (priceRange.max) params.maxPrice = priceRange.max;

//       // Add city filter (using city IDs)
//       if (selectedCities.length > 0) params.city = selectedCities.join(",");

//       // Add plan filter (using plan IDs)
//       if (selectedPlans.length > 0) params.plan = selectedPlans.join(",");

//       // Add subcategory filter
//       if (selectedSubcategories.length > 0) {
//         params.category = selectedSubcategories.join(",");
//       }

//       const res = await getProducts(params);

//       const newProducts = res.data?.products || [];
//       setProducts((prev) =>
//         skip === 0 ? newProducts : [...prev, ...newProducts],
//       );
//       setHasMore(res.data?.hasMore || false);
//     } catch (err) {
//       setError("Failed to load products");
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   }, [
//     categoryId,
//     skip,
//     limit,
//     priceRange,
//     selectedCities,
//     selectedPlans,
//     selectedSubcategories,
//   ]);

//   useEffect(() => {
//     setSkip(0);
//   }, [
//     categoryId,
//     priceRange,
//     selectedCities,
//     selectedPlans,
//     selectedSubcategories,
//   ]);

//   useEffect(() => {
//     fetchProducts();
//   }, [fetchProducts]);

//   const handleLoadMore = () => {
//     setSkip((prev) => prev + limit);
//   };

//   const handleApplyFilters = () => {
//     setSkip(0);
//     updateActiveFilters();
//   };

//   const handleClearAll = () => {
//     setPriceRange({ min: "", max: "" });
//     setSelectedSubcategories([]);
//     setSelectedCities([]);
//     setSelectedPlans([]);
//     setSelectedRatings([]);
//     setActiveFilters([]);
//     setSkip(0);
//   };

//   const updateActiveFilters = () => {
//     const filters = [];
//     if (priceRange.min || priceRange.max) {
//       filters.push(
//         `Price: ₹${priceRange.min || 0} - ₹${priceRange.max || "∞"}`,
//       );
//     }

//     // Add subcategory filters
//     selectedSubcategories.forEach((subId) => {
//       const subcat = subcategories.find((s) => s._id === subId);
//       if (subcat) filters.push(subcat.name);
//     });

//     // Add plan filters
//     selectedPlans.forEach((planId) => {
//       const plan = plans.find((p) => p._id === planId);
//       if (plan) filters.push(plan.name);
//     });

//     // Add city filters
//     selectedCities.forEach((cityId) => {
//       const city = cities.find((c) => c._id === cityId);
//       if (city) filters.push(city.name);
//     });

//     selectedRatings.forEach((rating) => filters.push(`${rating} Stars`));
//     setActiveFilters(filters);
//   };

//   const removeFilter = (filter) => {
//     // Logic to remove specific filter
//     setActiveFilters(activeFilters.filter((f) => f !== filter));
//   };

//   const toggleCheckbox = (value, selected, setSelected) => {
//     if (selected.includes(value)) {
//       setSelected(selected.filter((item) => item !== value));
//     } else {
//       setSelected([...selected, value]);
//     }
//   };

//   return (
//     <div className="category-products-page">
//       {/* Hero Header Section */}
//       <div className="compliance-header">
//         <div className="header-content">
//           <div className="compliance-badge">
//             <MdCheckCircle size={20} />
//             <span>COMPLIANCE STANDARDS</span>
//           </div>
//           <h1 className="header-title">{categoryName || "Products"}</h1>
//           <p className="header-description">
//             {categoryDescription ||
//               "Explore products and services in this category."}
//           </p>
//           <div className="header-features">
//             <div className="feature-item">
//               <MdCheckCircle className="feature-icon" />
//               <span>KAI Certified Auditors</span>
//             </div>
//             <div className="feature-item">
//               <MdCheckCircle className="feature-icon" />
//               <span>MeitY Guidelines Compliant</span>
//             </div>
//             <div className="feature-item">
//               <MdCheckCircle className="feature-icon" />
//               <span>24/7 DPO Support</span>
//             </div>
//           </div>
//         </div>
//         <div className="header-icon">
//           <div className="shield-icon">
//             <MdCheckCircle size={80} />
//           </div>
//           <div className="info-badge">
//             <MdInfo size={24} />
//           </div>
//         </div>
//       </div>

//       {/* Advanced Search Filters Section */}
//       <div className="filters-section">
//         <div className="filters-header">
//           <div className="filters-title">
//             <MdFilterList size={24} />
//             <h3>Advanced Search Filters</h3>
//           </div>
//           <button className="clear-all-btn" onClick={handleClearAll}>
//             Clear All
//           </button>
//         </div>

//         <div className="filters-grid">
//           {/* Price Range */}
//           <div className="filter-group">
//             <label className="filter-label">
//               <input type="checkbox" />
//               <span>Price Range</span>
//             </label>
//             <div className="price-inputs">
//               <input
//                 type="number"
//                 placeholder="Min"
//                 value={priceRange.min}
//                 onChange={(e) =>
//                   setPriceRange({ ...priceRange, min: e.target.value })
//                 }
//                 className="price-input"
//               />
//               <span className="price-separator">-</span>
//               <input
//                 type="number"
//                 placeholder="Max"
//                 value={priceRange.max}
//                 onChange={(e) =>
//                   setPriceRange({ ...priceRange, max: e.target.value })
//                 }
//                 className="price-input"
//               />
//             </div>
//           </div>

//           {/* Subcategories (if parent category) */}
//           {!categoryParent && subcategories.length > 0 && (
//             <div className="filter-group">
//               <label className="filter-label">
//                 <input type="checkbox" />
//                 <span>Sub Categories</span>
//               </label>
//               <div className="checkbox-group">
//                 {subcategories.map((subcat) => (
//                   <label key={subcat._id} className="checkbox-label">
//                     <input
//                       type="checkbox"
//                       checked={selectedSubcategories.includes(subcat._id)}
//                       onChange={() =>
//                         toggleCheckbox(
//                           subcat._id,
//                           selectedSubcategories,
//                           setSelectedSubcategories,
//                         )
//                       }
//                     />
//                     <span>{subcat.name}</span>
//                   </label>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* Plans */}
//           <div className="filter-group">
//             <label className="filter-label">
//               <input type="checkbox" />
//               <span>Service Plan</span>
//             </label>
//             <div className="checkbox-group">
//               {plans.length > 0 ? (
//                 plans.map((plan) => (
//                   <label key={plan._id} className="checkbox-label">
//                     <input
//                       type="checkbox"
//                       checked={selectedPlans.includes(plan._id)}
//                       onChange={() =>
//                         toggleCheckbox(
//                           plan._id,
//                           selectedPlans,
//                           setSelectedPlans,
//                         )
//                       }
//                     />
//                     <span>{plan.name}</span>
//                   </label>
//                 ))
//               ) : (
//                 <p className="no-options">Loading plans...</p>
//               )}
//             </div>
//           </div>

//           {/* Cities */}
//           <div className="filter-group">
//             <label className="filter-label">
//               <input type="checkbox" />
//               <span>Base City / Zone</span>
//             </label>
//             <div className="city-filter">
//               <select
//                 className="city-select"
//                 onChange={(e) => {
//                   if (e.target.value) {
//                     toggleCheckbox(
//                       e.target.value,
//                       selectedCities,
//                       setSelectedCities,
//                     );
//                     e.target.value = "";
//                   }
//                 }}
//               >
//                 <option value="">Select/Search City</option>
//                 {cities.map((city) => (
//                   <option key={city._id} value={city._id}>
//                     {city.name}
//                   </option>
//                 ))}
//               </select>
//               <div className="city-tags">
//                 {selectedCities.map((cityId) => {
//                   const city = cities.find((c) => c._id === cityId);
//                   return (
//                     <span key={cityId} className="city-tag">
//                       {city?.name}
//                       <button
//                         onClick={() =>
//                           setSelectedCities(
//                             selectedCities.filter((c) => c !== cityId),
//                           )
//                         }
//                       >
//                         ✕
//                       </button>
//                     </span>
//                   );
//                 })}
//               </div>
//             </div>
//           </div>

//           {/* Expert Ratings */}
//           <div className="filter-group">
//             <label className="filter-label">
//               <input type="checkbox" />
//               <span>Expert Ratings</span>
//             </label>
//             <div className="rating-options">
//               {ratingOptions.map((rating) => (
//                 <label key={rating} className="rating-label">
//                   <input
//                     type="checkbox"
//                     checked={selectedRatings.includes(rating)}
//                     onChange={() =>
//                       toggleCheckbox(
//                         rating,
//                         selectedRatings,
//                         setSelectedRatings,
//                       )
//                     }
//                   />
//                   <span className="stars">
//                     {Array(rating)
//                       .fill(0)
//                       .map((_, i) => (
//                         <span key={i} className="star filled">
//                           ★
//                         </span>
//                       ))}
//                     {Array(5 - rating)
//                       .fill(0)
//                       .map((_, i) => (
//                         <span key={i} className="star">
//                           ★
//                         </span>
//                       ))}
//                   </span>
//                   <span className="rating-count">12,345</span>
//                 </label>
//               ))}
//             </div>
//           </div>
//         </div>

//         <button className="apply-filters-btn" onClick={handleApplyFilters}>
//           APPLY FILTERS
//         </button>
//       </div>

//       {/* Active Filters Display - Just before products section */}
//       {activeFilters.length > 0 && (
//         <div className="active-filters">
//           <span className="filters-label">FILTERED BY:</span>
//           <div className="filter-tags">
//             {activeFilters.map((filter, idx) => (
//               <span key={idx} className="filter-tag">
//                 {filter}
//                 <button onClick={() => removeFilter(filter)}>
//                   <MdClose size={14} />
//                 </button>
//               </span>
//             ))}
//           </div>
//           <button className="reset-filters" onClick={handleClearAll}>
//             Reset All Searching Criteria
//           </button>
//         </div>
//       )}

//       {/* Products Section Header */}
//       <div className="products-section-header">
//         <div className="section-title">
//           <h2>Compliance Products</h2>
//           <p className="subtitle">
//             Tailored for Startups / SME / Enterprise (GDPR)
//           </p>
//         </div>
//         <div className="section-controls">
//           <div className="view-toggle">
//             <button
//               className={`view-btn ${viewMode === "list" ? "active" : ""}`}
//               onClick={() => setViewMode("list")}
//             >
//               <MdViewList size={20} />
//             </button>
//             <button
//               className={`view-btn ${viewMode === "grid" ? "active" : ""}`}
//               onClick={() => setViewMode("grid")}
//             >
//               <MdViewModule size={20} />
//             </button>
//           </div>
//           <div className="sort-dropdown">
//             <span>SORT BY:</span>
//             <select
//               value={sortBy}
//               onChange={(e) => setSortBy(e.target.value)}
//               className="sort-select"
//             >
//               <option value="most-relevant">Most Relevant</option>
//               <option value="price-low">Price: Low to High</option>
//               <option value="price-high">Price: High to Low</option>
//               <option value="rating">Highest Rated</option>
//               <option value="newest">Newest First</option>
//             </select>
//           </div>
//         </div>
//       </div>

//       {error && (
//         <div className="error-message">
//           <p>{error}</p>
//         </div>
//       )}

//       {loading && products.length === 0 ? (
//         <div className="loading-state">
//           <div className={`skeleton-grid ${viewMode}`}>
//             {Array(12)
//               .fill(null)
//               .map((_, i) => (
//                 <ProductCard key={i} loading={true} viewMode={viewMode} />
//               ))}
//           </div>
//         </div>
//       ) : products.length === 0 ? (
//         <div className="empty-state">
//           <h3>No products found</h3>
//           <p>Try adjusting your filters or search term</p>
//         </div>
//       ) : (
//         <>
//           <div className={`products-grid ${viewMode}`}>
//             {products.map((product) => (
//               <ProductCard
//                 key={product._id}
//                 product={product}
//                 viewMode={viewMode}
//               />
//             ))}
//           </div>

//           {hasMore && (
//             <div className="load-more-section">
//               <button
//                 className="btn-load-more"
//                 onClick={handleLoadMore}
//                 disabled={loading}
//               >
//                 {loading ? "Loading..." : "Load More Products"}
//               </button>
//             </div>
//           )}
//         </>
//       )}
//     </div>
//   );
// }

import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
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
  MdViewModule,
  MdViewList,
  MdClose,
  MdCheckCircle,
  MdInfo,
  MdRefresh,
  MdExpandMore,
  MdExpandLess,
} from "react-icons/md";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export default function CategoryProductsPage() {
  const { categoryId } = useParams();
  const [products, setProducts] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("most-relevant");

  // Filter states
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [priceSlider, setPriceSlider] = useState({ min: 0, max: 100000 });
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);
  const [selectedPlans, setSelectedPlans] = useState([]);
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [activeFilters, setActiveFilters] = useState([]);

  // Sidebar collapse states
  const [isPriceOpen, setIsPriceOpen] = useState(true);
  const [isRatingsOpen, setIsRatingsOpen] = useState(true);

  const limit = 12;

  // Filter options from API
  const [subcategories, setSubcategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [plans, setPlans] = useState([]);
  const [categoryParent, setCategoryParent] = useState(null);

  // City search states (India Post API)
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  // Plan-based city selection states
  const [selectedBaseCity, setSelectedBaseCity] = useState(null);
  const [additionalSelectedCities, setAdditionalSelectedCities] = useState([]);
  const [validationError, setValidationError] = useState("");

  const ratingOptions = [5, 4, 3, 2, 1];

  // Fetch category details
  useEffect(() => {
    axios
      .get(`${API_BASE}/categories/${categoryId}`)
      .then((res) => {
        setCategoryName(res.data?.name || "Products");
        setCategoryDescription(res.data?.description || "");
        setCategoryParent(res.data?.parent || null);

        if (!res.data?.parent) {
          axios
            .get(`${API_BASE}/categories?parent=${categoryId}&isActive=true`)
            .then((subRes) => {
              setSubcategories(subRes.data?.categories || subRes.data || []);
            })
            .catch(() => setSubcategories([]));
        } else {
          setSubcategories([]);
        }
      })
      .catch(() => {
        setCategoryName("Products");
        setCategoryDescription("");
        setSubcategories([]);
      });
  }, [categoryId]);

  // Fetch cities and plans
  useEffect(() => {
    Promise.all([
      axios.get(`${API_BASE}/cities`),
      axios.get(`${API_BASE}/plans`),
    ])
      .then(([citiesRes, plansRes]) => {
        let fetchedCities = citiesRes.data?.cities || citiesRes.data || [];

        // Ensure Virtual city exists for base plan support
        fetchedCities = ensureVirtualCity(fetchedCities);

        setCities(fetchedCities);
        const fetchedPlans = plansRes.data?.plans || plansRes.data || [];
        // Sort plans by sequence
        const sortedPlans = [...fetchedPlans].sort(
          (a, b) => (a.sequence || 0) - (b.sequence || 0),
        );
        setPlans(sortedPlans);
      })
      .catch(() => {
        // Set at least the Virtual city if API fails
        setCities([
          {
            _id: "virtual",
            name: "Virtual",
            zone: "virtual",
            isVirtual: true,
          },
        ]);
        setPlans([]);
      });
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        category: categoryId,
        skip,
        limit,
      };

      if (priceRange.min) params.minPrice = priceRange.min;
      if (priceRange.max) params.maxPrice = priceRange.max;

      // Send client base city and additional zones
      if (selectedBaseCity) params.clientBaseCity = selectedBaseCity.name;
      if (additionalSelectedCities.length > 0) {
        const additionalZones = additionalSelectedCities
          .map((c) => c.zone)
          .filter(Boolean);
        if (additionalZones.length > 0)
          params.additionalZones = additionalZones.join(",");
      }

      if (selectedPlans.length > 0) params.plan = selectedPlans.join(",");
      if (selectedSubcategories.length > 0) {
        params.category = selectedSubcategories.join(",");
      }
      if (selectedRatings.length > 0) params.rating = selectedRatings.join(",");

      const res = await getProducts(params);

      const newProducts = res.data?.products || [];
      setProducts((prev) =>
        skip === 0 ? newProducts : [...prev, ...newProducts],
      );
      setHasMore(res.data?.hasMore || false);
    } catch (err) {
      setError("Failed to load products");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [
    categoryId,
    skip,
    limit,
    priceRange,
    selectedCities,
    selectedPlans,
    selectedSubcategories,
    selectedRatings,
    cities,
  ]);

  useEffect(() => {
    setSkip(0);
  }, [
    categoryId,
    priceRange,
    selectedCities,
    selectedPlans,
    selectedSubcategories,
    selectedRatings,
  ]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleLoadMore = () => {
    setSkip((prev) => prev + limit);
  };

  const handleClearAll = () => {
    setPriceRange({ min: "", max: "" });
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

  const handleApplyFilters = () => {
    setSkip(0);
    updateActiveFilters();
  };

  // Handle base plan logic - auto-set city to virtual and disable
  useEffect(() => {
    const basePlan = plans.find((p) => p.name.toLowerCase() === "base");
    const virtualCity = cities.find((c) => c.name.toLowerCase() === "virtual");

    if (basePlan && selectedPlans[0] === basePlan._id) {
      // If base plan is selected, auto-select virtual city
      if (virtualCity && !selectedCities.includes(virtualCity._id)) {
        setSelectedCities([virtualCity._id]);
      }
    } else {
      // If base plan is not selected, remove virtual city if it exists
      if (virtualCity && selectedCities.includes(virtualCity._id)) {
        setSelectedCities(selectedCities.filter((c) => c !== virtualCity._id));
      }
    }
  }, [selectedPlans, plans, cities]);

  const updateActiveFilters = () => {
    const filters = [];
    if (priceRange.min || priceRange.max) {
      filters.push(
        `Price: ₹${priceRange.min || 0} - ₹${priceRange.max || "∞"}`,
      );
    }

    selectedSubcategories.forEach((subId) => {
      const subcat = subcategories.find((s) => s._id === subId);
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
    selectedSubcategories,
    selectedPlans,
    selectedCities,
    selectedRatings,
  ]);

  const removeFilter = (filter) => {
    setActiveFilters(activeFilters.filter((f) => f !== filter));
  };

  const toggleCheckbox = (value, selected, setSelected) => {
    if (selected.includes(value)) {
      setSelected(selected.filter((item) => item !== value));
    } else {
      setSelected([...selected, value]);
    }
  };

  return (
    <div className="category-products-page">
      {/* Hero Header Section */}
      <div className="compliance-header">
        <div className="header-content">
          <div className="compliance-badge">
            <MdCheckCircle size={20} />
            <span>COMPLIANCE STANDARDS</span>
          </div>
          <h1 className="header-title">{categoryName || "Products"}</h1>
          <p className="header-description">
            {categoryDescription ||
              "Explore products and services in this category."}
          </p>
          <div className="header-features">
            <div className="feature-item">
              <MdCheckCircle className="feature-icon" />
              <span>KAI Certified Auditors</span>
            </div>
            <div className="feature-item">
              <MdCheckCircle className="feature-icon" />
              <span>MeitY Guidelines Compliant</span>
            </div>
            <div className="feature-item">
              <MdCheckCircle className="feature-icon" />
              <span>24/7 DPO Support</span>
            </div>
          </div>
        </div>
        <div className="header-icon">
          <div className="shield-icon">
            <MdCheckCircle size={80} />
          </div>
          <div className="info-badge">
            <MdInfo size={24} />
          </div>
        </div>
      </div>

      {/* Top Filters Section - Subcategories, Plans, Cities */}
      <div className="filters-section-top">
        <div className="filters-header">
          <div className="filters-title">
            <MdFilterList size={24} />
            <h3>Refine Your Search</h3>
          </div>
          <button className="clear-all-btn" onClick={handleClearAll}>
            <MdRefresh size={16} />
            Clear All
          </button>
        </div>

        <div className="filters-grid-top">
          {/* Subcategories */}
          {!categoryParent && subcategories.length > 0 && (
            <div className="filter-group-top">
              <label className="filter-label-top">Audit Categories</label>
              <div className="checkbox-group-horizontal">
                {subcategories.slice(0, 4).map((subcat) => (
                  <label key={subcat._id} className="checkbox-label-top">
                    <input
                      type="checkbox"
                      checked={selectedSubcategories.includes(subcat._id)}
                      onChange={() =>
                        toggleCheckbox(
                          subcat._id,
                          selectedSubcategories,
                          setSelectedSubcategories,
                        )
                      }
                    />
                    <span>{subcat.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Service Plans */}
          <div className="filter-group-top">
            <label className="filter-label-top">Service Plans</label>
            <div className="checkbox-group-horizontal">
              {plans.map((plan) => (
                <label key={plan._id} className="checkbox-label-top">
                  <input
                    type="radio"
                    name="service-plan"
                    checked={selectedPlans[0] === plan._id}
                    onChange={() => {
                      setSelectedPlans([plan._id]);
                      // Clear previously selected cities when changing plan
                      setSelectedCities([]);
                      setSelectedBaseCity(null);
                      setAdditionalSelectedCities([]);
                      // Clear search input and results when plan changes
                      setSearchInput("");
                      setSearchResults([]);
                      setValidationError("");
                    }}
                  />
                  <span>{plan.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Cities - Using new two-phase selector */}
          <div className="filter-group-top">
            <label className="filter-label-top">Service Locations</label>
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
              <div
                style={{
                  color: "#999",
                  fontSize: "12px",
                  textAlign: "center",
                  padding: "8px",
                }}
              >
                Select a plan first
              </div>
            )}
          </div>
        </div>

        {/* Apply Filters Button */}
        <button className="apply-filters-btn-top" onClick={handleApplyFilters}>
          APPLY FILTERS
        </button>
      </div>

      {/* Main Content Area with Sidebar */}
      <div className="content-with-sidebar">
        {/* Left Sidebar - Price & Ratings */}
        <aside className="filters-sidebar">
          <div className="sidebar-header">
            <h3>Filters</h3>
            {activeFilters.length > 0 && (
              <span className="active-count">{activeFilters.length}</span>
            )}
          </div>

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
                        onChange={() =>
                          toggleCheckbox(
                            rating,
                            selectedRatings,
                            setSelectedRatings,
                          )
                        }
                      />
                      <span className="stars-sidebar">
                        {Array(rating)
                          .fill(0)
                          .map((_, i) => (
                            <span key={i} className="star filled">
                              ★
                            </span>
                          ))}
                        {Array(5 - rating)
                          .fill(0)
                          .map((_, i) => (
                            <span key={`empty-${i}`} className="star">
                              ★
                            </span>
                          ))}
                      </span>
                      <span className="rating-text-sidebar">& up</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Clear Filters Button */}
          {activeFilters.length > 0 && (
            <button className="sidebar-clear-btn" onClick={handleClearAll}>
              <MdRefresh size={16} />
              Clear All Filters
            </button>
          )}
        </aside>

        {/* Main Products Area */}
        <main className="products-main-area">
          {/* Active Filters Display */}
          {activeFilters.length > 0 && (
            <div className="active-filters-inline">
              <span className="filters-label-inline">Applied Filters:</span>
              <div className="filter-tags-inline">
                {activeFilters.map((filter, idx) => (
                  <span key={idx} className="filter-tag-inline">
                    {filter}
                    <button onClick={() => removeFilter(filter)}>
                      <MdClose size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Products Section Header */}
          <div className="products-section-header">
            <div className="section-title">
              <h2>Compliance Products</h2>
              <p className="subtitle">
                {products.length}{" "}
                {products.length === 1 ? "product" : "products"} found
              </p>
            </div>
            <div className="section-controls">
              <div className="view-toggle">
                <button
                  className={`view-btn ${viewMode === "list" ? "active" : ""}`}
                  onClick={() => setViewMode("list")}
                  title="List view"
                >
                  <MdViewList size={20} />
                </button>
                <button
                  className={`view-btn ${viewMode === "grid" ? "active" : ""}`}
                  onClick={() => setViewMode("grid")}
                  title="Grid view"
                >
                  <MdViewModule size={20} />
                </button>
              </div>
              <div className="sort-dropdown">
                <span>Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sort-select"
                >
                  <option value="most-relevant">Most Relevant</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>
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
                    key={product._id}
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
        </main>
      </div>
    </div>
  );
}
