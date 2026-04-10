// import { useRef, useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { ChevronRight } from "lucide-react";
// import axios from "axios"; // or use your existing api service
// import "./CategoryBar.css";

// const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

// const DEFAULT_CATEGORIES = [
//   "DPDP",
//   "SOC 2",
//   "HIPAA Assessments",
//   "ISO 27001",
//   "PCI DSS",
//   "Cloud Security",
//   "Third Party Risk",
//   "Business Continuity",
// ];

// const CategoryBar = ({ categoryLinks = [] }) => {
//   const navigate = useNavigate();
//   const [active, setActive] = useState(0);
//   const [apiCats, setApiCats] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [hoveredIndex, setHoveredIndex] = useState(null);
//   const [subcategoriesMap, setSubcategoriesMap] = useState({});
//   const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
//   const scrollRef = useRef(null);
//   const itemRefs = useRef({});

//   useEffect(() => {
//     // Fetch active root categories from the API
//     axios
//       .get(`${API_BASE}/categories?isActive=true&parent=root`)
//       .then((res) => {
//         const cats = res.data.categories || res.data || [];
//         setApiCats(cats);
//         setCategories(cats);

//         // Fetch subcategories for each parent category
//         cats.forEach((cat) => {
//           axios
//             .get(`${API_BASE}/categories?parent=${cat._id}`)
//             .then((subRes) => {
//               const subs = subRes.data.categories || subRes.data || [];
//               setSubcategoriesMap((prev) => ({
//                 ...prev,
//                 [cat._id]: subs,
//               }));
//             })
//             .catch(() => {
//               setSubcategoriesMap((prev) => ({
//                 ...prev,
//                 [cat._id]: [],
//               }));
//             });
//         });
//       })
//       .catch(() => {
//         // Fall back to categoryLinks or defaults
//         const fallback =
//           categoryLinks.length > 0 ? categoryLinks : DEFAULT_CATEGORIES;
//         setCategories(fallback);
//       });
//   }, [categoryLinks]);

//   // Use categories state, priority: API categories → prop categoryLinks → hard-coded defaults
//   const labels =
//     categories.length > 0
//       ? Array.isArray(categories[0])
//         ? categories.map((c) => c.name)
//         : categories.map((c) => c.label || c.name || c)
//       : DEFAULT_CATEGORIES;

//   const handleCategoryClick = (index) => {
//     setActive(index);
//     const category = categories[index];
//     // Use category ID if available, otherwise use slug format
//     const categoryId =
//       category._id ||
//       (category.name || category.label || category)
//         .toLowerCase()
//         .replace(/\s+/g, "-")
//         .replace(/[^\w-]/g, "");
//     navigate(`/category/${categoryId}/all`);
//   };

//   const handleSubcategoryClick = (subcategoryId) => {
//     navigate(`/category/${subcategoryId}/all`);
//   };

//   const handleMouseEnter = (index) => {
//     setHoveredIndex(index);
//     // Calculate dropdown position
//     const itemElem = itemRefs.current[index];
//     if (itemElem) {
//       const rect = itemElem.getBoundingClientRect();
//       setDropdownPos({
//         top: rect.bottom + 4, // 4px below the item
//         left: rect.left,
//       });
//     }
//   };

//   const scrollRight = () => {
//     if (scrollRef.current) {
//       scrollRef.current.scrollBy({ left: 220, behavior: "smooth" });
//     }
//   };

//   return (
//     <nav className="category-bar">
//       <div className="category-bar__inner">
//         <div className="category-bar__list" ref={scrollRef}>
//           {labels.map((label, i) => {
//             const category = categories[i];
//             const categoryId = category?._id || i;
//             const subs = subcategoriesMap[categoryId] || [];
//             const hasSubcategories = subs.length > 0;

//             return (
//               <div
//                 key={i}
//                 ref={(el) => {
//                   itemRefs.current[i] = el;
//                 }}
//                 className="category-bar__item-wrapper"
//                 onMouseEnter={() => handleMouseEnter(i)}
//                 onMouseLeave={() => setHoveredIndex(null)}
//               >
//                 <button
//                   className={`category-bar__item ${active === i ? "active" : ""}`}
//                   onClick={() => handleCategoryClick(i)}
//                 >
//                   {label}
//                 </button>

//                 {/* Dropdown for subcategories */}
//                 {hasSubcategories && hoveredIndex === i && (
//                   <div
//                     className="category-bar__dropdown"
//                     style={{
//                       top: `${dropdownPos.top}px`,
//                       left: `${dropdownPos.left}px`,
//                     }}
//                   >
//                     {subs.map((sub) => (
//                       <button
//                         key={sub._id}
//                         className="category-bar__subcategory"
//                         onClick={() => handleSubcategoryClick(sub._id)}
//                       >
//                         {sub.name}
//                       </button>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             );
//           })}
//         </div>
//         <button className="category-bar__arrow" onClick={scrollRight}>
//           <ChevronRight size={16} strokeWidth={2.5} />
//         </button>
//       </div>
//     </nav>
//   );
// };

// export default CategoryBar;

import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, ChevronDown } from "lucide-react";
import { useRootCategories } from "../hooks/useRootCategories";
import "./CategoryBar.css";

const DEFAULT_CATEGORIES = [
  "DPDP",
  "SOC 2",
  "HIPAA Assessments",
  "ISO 27001",
  "PCI DSS",
  "Cloud Security",
  "Third Party Risk",
  "Business Continuity",
];

const CategoryBar = ({ categoryLinks = [] }) => {
  const navigate = useNavigate();
  const [active, setActive] = useState(null);
  const [categories, setCategories] = useState([]);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const scrollRef = useRef(null);
  const itemRefs = useRef({});
  const dropdownRefs = useRef({});
  const hoverTimeoutRef = useRef(null);

  // Use the caching hook to fetch categories only once globally
  const {
    categories: cachedCategories,
    subcategoriesMap,
    loading,
  } = useRootCategories();

  useEffect(() => {
    if (cachedCategories.length > 0) {
      setCategories(cachedCategories);
    } else if (categoryLinks.length > 0) {
      setCategories(categoryLinks);
    } else {
      setCategories(DEFAULT_CATEGORIES);
    }
  }, [cachedCategories, categoryLinks]);

  // Use categories state, priority: API categories → prop categoryLinks → hard-coded defaults
  const labels =
    categories.length > 0
      ? Array.isArray(categories[0])
        ? categories.map((c) => c.name)
        : categories.map((c) => c.label || c.name || c)
      : DEFAULT_CATEGORIES;

  const handleCategoryClick = (index, e) => {
    e.stopPropagation();
    setActive(index);
    const category = categories[index];
    const categoryId =
      category._id ||
      (category.name || category.label || category)
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]/g, "");

    // Close dropdown when navigating
    setHoveredIndex(null);
    navigate(`/category/${categoryId}/all`);
  };

  const handleSubcategoryClick = (subcategoryId, e) => {
    e.stopPropagation();
    setHoveredIndex(null);
    navigate(`/category/${subcategoryId}/all`);
  };

  const handleMouseEnter = (index) => {
    // Clear any existing timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    // Small delay before showing dropdown for better UX
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredIndex(index);
    }, 150);
  };

  const handleMouseLeave = () => {
    // Clear timeout if user moves away quickly
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    // Delay before hiding to allow moving to dropdown
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredIndex(null);
    }, 200);
  };

  const handleDropdownMouseEnter = () => {
    // Keep dropdown open when hovering over it
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
  };

  const handleDropdownMouseLeave = () => {
    // Hide dropdown when leaving it
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredIndex(null);
    }, 200);
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 220, behavior: "smooth" });
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  return (
    <nav className="category-bar">
      <div className="category-bar__inner">
        <div className="category-bar__list" ref={scrollRef}>
          {labels.map((label, i) => {
            const category = categories[i];
            const categoryId = category?._id || i;
            const subs = subcategoriesMap[categoryId] || [];
            const hasSubcategories = subs.length > 0;
            const isHovered = hoveredIndex === i;

            return (
              <div
                key={i}
                ref={(el) => {
                  itemRefs.current[i] = el;
                }}
                className="category-bar__item-wrapper"
                onMouseEnter={() => handleMouseEnter(i)}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  className={`category-bar__item ${active === i ? "active" : ""} ${isHovered && hasSubcategories ? "hovered" : ""}`}
                  onClick={(e) => handleCategoryClick(i, e)}
                >
                  <span className="category-bar__item-text">{label}</span>
                  {hasSubcategories && (
                    <ChevronDown
                      size={14}
                      className={`category-bar__item-icon ${isHovered ? "rotated" : ""}`}
                    />
                  )}
                </button>

                {/* Dropdown for subcategories */}
                {hasSubcategories && isHovered && (
                  <div
                    ref={(el) => {
                      dropdownRefs.current[i] = el;
                    }}
                    className="category-bar__dropdown"
                    onMouseEnter={handleDropdownMouseEnter}
                    onMouseLeave={handleDropdownMouseLeave}
                  >
                    <div className="category-bar__dropdown-header">
                      <span className="category-bar__dropdown-title">
                        {label}
                      </span>
                      <span className="category-bar__dropdown-count">
                        {subs.length} {subs.length === 1 ? "option" : "options"}
                      </span>
                    </div>
                    <div className="category-bar__dropdown-list">
                      {subs.map((sub, idx) => (
                        <button
                          key={sub._id}
                          className="category-bar__subcategory"
                          onClick={(e) => handleSubcategoryClick(sub._id, e)}
                        >
                          <span className="subcategory-bullet">•</span>
                          <span className="subcategory-text">{sub.name}</span>
                          <ChevronRight
                            size={14}
                            className="subcategory-arrow"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <button
          className="category-bar__arrow"
          onClick={scrollRight}
          aria-label="Scroll right"
        >
          <ChevronRight size={16} strokeWidth={2.5} />
        </button>
      </div>
    </nav>
  );
};

export default CategoryBar;
