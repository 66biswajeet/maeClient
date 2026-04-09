import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import ProductCard from "../components/ProductCard";
import { getProducts } from "../services/api";
import "./CategoryProductsPage.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export default function AllProductsPage() {
  const [products, setProducts] = useState([]);
  const [pageTitle, setPageTitle] = useState("All Services");
  const [pageDescription, setPageDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [viewMode, setViewMode] = useState("grid");

  const limit = 12;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getProducts({ skip, limit });
      const newProducts = res.data?.products || res.data || [];
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
  }, [skip]);

  useEffect(() => setSkip(0), []);
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleLoadMore = () => setSkip((p) => p + limit);

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
          <p>Try adjusting your filters or search term</p>
        </div>
      ) : (
        <>
          <div className={`products-grid ${viewMode}`}>
            {products.map((product) => (
              <ProductCard
                key={product._id || product.id}
                product={product}
                viewMode={viewMode}
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
  );
}
