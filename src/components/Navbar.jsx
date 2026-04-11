import React, { useState } from "react";
import {
  Search,
  Phone,
  Heart,
  ShoppingCart,
  User,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useRootCategories } from "../hooks/useRootCategories";
import "./Navbar.css";

const Navbar = ({ header }) => {
  const [searchVal, setSearchVal] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});
  const navigate = useNavigate();
  const { categories, subcategoriesMap } = useRootCategories();

  const toggleCategory = (categoryId) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const handleCategoryClick = (categoryId) => {
    navigate(`/category/${categoryId}/all`);
    setMenuOpen(false);
  };

  const handleSubcategoryClick = (subcategoryId) => {
    navigate(`/category/${subcategoryId}/all`);
    setMenuOpen(false);
  };

  return (
    <>
      <header className="navbar">
        <div className="navbar__inner">
          {/* Mobile Hamburger */}
          <button
            className="navbar__hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Logo */}
          <a href="/" className="navbar__logo">
            {header?.logoUrl ? (
              <img src={header.logoUrl} alt="Make Audit Easy" />
            ) : (
              <span className="navbar__logo-text">
                <span className="logo-check">✓</span>
                <span className="logo-make">MAE</span>
              </span>
            )}
          </a>

          {/* Desktop Search */}
          <div className="navbar__search">
            <input
              type="text"
              placeholder="Search..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
            />
            <button className="search-btn">
              <Search size={16} />
            </button>
          </div>

          {/* Desktop Right actions */}
          <div className="navbar__actions">
            <div className="navbar__phone-section">
              <a href="tel:+12345678890" className="navbar__phone">
                <Phone size={16} />
                <span>{header?.topNavbarPhone || "+1-234-567890"}</span>
              </a>
            </div>

            <div className="navbar__icons">
              <a href="/wishlist" className="icon-btn">
                <Heart size={18} />
                <span className="badge">4</span>
              </a>
              <a href="/cart" className="icon-btn">
                <ShoppingCart size={18} />
                <span className="badge">2</span>
              </a>
            </div>

            <a href="/signin" className="navbar__signin">
              <User size={16} />
              <span>SignIn</span>
            </a>
          </div>

          {/* Mobile Search Icon */}
          <button className="navbar__mobile-search">
            <Search size={20} />
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {menuOpen && (
          <div className="navbar__mobile-menu">
            {/* Categories Section */}
            <div className="mobile-menu__section">
              <h3 className="mobile-menu__section-title">Categories</h3>
              <div className="mobile-menu__categories">
                {categories.map((category) => {
                  const subs = subcategoriesMap[category._id] || [];
                  const isExpanded = expandedCategories[category._id];

                  return (
                    <div
                      key={category._id}
                      className="mobile-menu__category-item"
                    >
                      <div className="mobile-menu__category-header">
                        <button
                          className="mobile-menu__category-name"
                          onClick={() => handleCategoryClick(category._id)}
                        >
                          {category.name}
                        </button>
                        {subs.length > 0 && (
                          <button
                            className={`mobile-menu__category-toggle ${isExpanded ? "expanded" : ""}`}
                            onClick={() => toggleCategory(category._id)}
                          >
                            <ChevronDown size={16} />
                          </button>
                        )}
                      </div>

                      {/* Subcategories Dropdown */}
                      {subs.length > 0 && isExpanded && (
                        <div className="mobile-menu__subcategories">
                          {subs.map((subcategory) => (
                            <button
                              key={subcategory._id}
                              className="mobile-menu__subcategory-item"
                              onClick={() =>
                                handleSubcategoryClick(subcategory._id)
                              }
                            >
                              <span className="subcategory-bullet">•</span>
                              <span>{subcategory.name}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Other Menu Items */}
            <div className="mobile-menu__section">
              <a href="/shop" className="mobile-menu-item">
                Shop
              </a>
              <a href="/about" className="mobile-menu-item">
                About Us
              </a>
              <a href="/contact" className="mobile-menu-item">
                Contact
              </a>
              <a href="/help" className="mobile-menu-item">
                Help & Support
              </a>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Navbar;
