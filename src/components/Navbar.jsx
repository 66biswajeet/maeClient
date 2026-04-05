import React, { useState } from "react";
import { Search, Phone, Heart, ShoppingCart, User } from "lucide-react";
import "./Navbar.css";

const Navbar = ({ header }) => {
  const [searchVal, setSearchVal] = useState("");

  return (
    <header className="navbar">
      <div className="navbar__inner">
        {/* Logo */}
        <a href="/" className="navbar__logo">
          {header?.logoUrl ? (
            <img src={header.logoUrl} alt="Make Audit Easy" />
          ) : (
            <span className="navbar__logo-text">
              <span className="logo-check">✓</span>
              <span className="logo-make">MAKE AUDIT </span>
              <span className="logo-easy">EASY</span>
            </span>
          )}
        </a>

        {/* Search */}
        <div className="navbar__search">
          <input
            type="text"
            placeholder="Search Frameworks or auditors..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
          />
          <button className="search-btn">
            <Search size={18} />
          </button>
        </div>

        {/* Right actions */}
        <div className="navbar__actions">
          <a href="tel:+12345678890" className="navbar__phone">
            <Phone size={18} />
            <span>{header?.topNavbarPhone || "+1 (234) 567-890"}</span>
          </a>

          <div className="navbar__icons">
            <a href="/wishlist" className="icon-btn">
              <Heart size={20} />
              <span className="badge">4</span>
            </a>
            <a href="/cart" className="icon-btn">
              <ShoppingCart size={20} />
              <span className="badge">2</span>
            </a>
          </div>

          <a href="/signin" className="navbar__signin">
            <span>SignIn</span>
            <User size={18} />
          </a>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
