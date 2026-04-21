import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import MobileBottomNav from "./components/MobileBottomNav";
import CategoryBar from "./components/CategoryBar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import CategoryProductsPage from "./pages/CategoryProductsPage";
import AllProductsPage from "./pages/AllProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import WishlistPage from "./pages/WishlistPage";
import PlaceholderPage from "./pages/PlaceholderPage";
import { useSiteSettings } from "./hooks/useSiteSettings";

const Layout = ({ children, settings }) => (
  <>
    <Navbar header={settings?.header} />
    <CategoryBar categoryLinks={settings?.hero?.categoryLinks} />
    {children}
    <MobileBottomNav />
    <Footer footer={settings?.footer} header={settings?.header} />
  </>
);

function App() {
  const { settings, loading } = useSiteSettings();

  // Update favicon and meta tags when settings load
  useEffect(() => {
    if (settings?.header?.faviconUrl) {
      // Update favicon
      const faviconElement = document.getElementById("favicon");
      if (faviconElement) {
        faviconElement.href = settings.header.faviconUrl;
      }

      // Also update og:image if available
      const ogImageElement = document.getElementById("og-image");
      if (ogImageElement) {
        ogImageElement.content = settings.header.faviconUrl;
      }
    }

    // Update page title
    if (settings?.header?.siteTitle) {
      document.title = settings.header.siteTitle;

      const ogTitleElement = document.getElementById("og-title");
      if (ogTitleElement) {
        ogTitleElement.content = settings.header.siteTitle;
      }
    }
  }, [settings]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Inter, sans-serif",
          color: "#6b7280",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 40,
              height: 40,
              border: "3px solid #e5e7eb",
              borderTopColor: "#00bfae",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 16px",
            }}
          />
          <p>Loading...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Use default settings if API fails
  const resolvedSettings = settings || {};

  return (
    <BrowserRouter>
      <Toaster
        position="bottom-right"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            style: {
              background: "#10b981",
            },
            iconTheme: {
              primary: "#fff",
              secondary: "#10b981",
            },
          },
          error: {
            style: {
              background: "#ef4444",
            },
            iconTheme: {
              primary: "#fff",
              secondary: "#ef4444",
            },
          },
        }}
      />
      <Layout settings={resolvedSettings}>
        <Routes>
          <Route path="/" element={<HomePage settings={resolvedSettings} />} />
          <Route path="/products" element={<AllProductsPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route
            path="/category/:categoryId/all"
            element={<CategoryProductsPage />}
          />
          <Route
            path="/categories"
            element={<PlaceholderPage title="All Categories" />}
          />
          <Route path="/cart" element={<PlaceholderPage title="Cart" />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/signin" element={<PlaceholderPage title="Sign In" />} />
          <Route
            path="*"
            element={<PlaceholderPage title="Page Not Found" />}
          />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
