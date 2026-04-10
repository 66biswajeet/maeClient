import { useEffect, useState, useRef } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

// Module-level cache to prevent multiple identical requests
const categoriesCache = {
  rootCategories: null,
  subcategoriesMap: {},
  isFetching: false,
  fetchPromise: null,
};

/**
 * Custom hook to fetch and cache root categories with their subcategories
 * Prevents multiple identical API calls by caching results
 */
export const useRootCategories = () => {
  const [categories, setCategories] = useState([]);
  const [subcategoriesMap, setSubcategoriesMap] = useState({});
  const [loading, setLoading] = useState(true);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    // If data is already cached, use it immediately
    if (categoriesCache.rootCategories !== null) {
      if (isMountedRef.current) {
        setCategories(categoriesCache.rootCategories);
        setSubcategoriesMap(categoriesCache.subcategoriesMap);
        setLoading(false);
      }
      return;
    }

    // If a fetch is already in progress, wait for it
    if (categoriesCache.isFetching && categoriesCache.fetchPromise) {
      categoriesCache.fetchPromise.then(() => {
        if (isMountedRef.current) {
          setCategories(categoriesCache.rootCategories);
          setSubcategoriesMap(categoriesCache.subcategoriesMap);
          setLoading(false);
        }
      });
      return;
    }

    // Start fetching
    categoriesCache.isFetching = true;

    const fetchPromise = axios
      .get(`${API_BASE}/categories?isActive=true&parent=root`)
      .then((res) => {
        const cats = res.data.categories || res.data || [];
        categoriesCache.rootCategories = cats;

        // Fetch subcategories for each parent category
        const subcategoryPromises = cats.map((cat) =>
          axios
            .get(`${API_BASE}/categories?parent=${cat._id}`)
            .then((subRes) => {
              const subs = subRes.data.categories || subRes.data || [];
              categoriesCache.subcategoriesMap[cat._id] = subs;
            })
            .catch(() => {
              categoriesCache.subcategoriesMap[cat._id] = [];
            }),
        );

        return Promise.all(subcategoryPromises);
      })
      .then(() => {
        if (isMountedRef.current) {
          setCategories(categoriesCache.rootCategories);
          setSubcategoriesMap(categoriesCache.subcategoriesMap);
          setLoading(false);
        }
        categoriesCache.isFetching = false;
      })
      .catch(() => {
        if (isMountedRef.current) {
          setCategories([]);
          setLoading(false);
        }
        categoriesCache.isFetching = false;
      });

    categoriesCache.fetchPromise = fetchPromise;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return { categories, subcategoriesMap, loading };
};
