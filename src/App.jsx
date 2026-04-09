import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import CategoryBar from "./components/CategoryBar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import CategoryProductsPage from "./pages/CategoryProductsPage";
import AllProductsPage from "./pages/AllProductsPage";
import PlaceholderPage from "./pages/PlaceholderPage";
import { useSiteSettings } from "./hooks/useSiteSettings";

const Layout = ({ children, settings }) => (
  <>
    <Navbar header={settings?.header} />
    <CategoryBar categoryLinks={settings?.hero?.categoryLinks} />
    {children}
    <Footer footer={settings?.footer} header={settings?.header} />
  </>
);

function App() {
  const { settings, loading } = useSiteSettings();

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
      <Layout settings={resolvedSettings}>
        <Routes>
          <Route path="/" element={<HomePage settings={resolvedSettings} />} />
          <Route path="/products" element={<AllProductsPage />} />
          <Route
            path="/product/:id"
            element={<PlaceholderPage title="Product Detail" />}
          />
          <Route
            path="/category/:categoryId/all"
            element={<CategoryProductsPage />}
          />
          <Route
            path="/categories"
            element={<PlaceholderPage title="All Categories" />}
          />
          <Route path="/cart" element={<PlaceholderPage title="Cart" />} />
          <Route
            path="/wishlist"
            element={<PlaceholderPage title="Wishlist" />}
          />
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
