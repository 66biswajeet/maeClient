import React from "react";
import { Home, Heart, ShoppingCart, User, Phone } from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import "./Navbar.css";

const MobileBottomNav = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="mobile-bottom-nav">
      <Link
        to="/"
        className={`mobile-bottom-nav__item ${isActive("/") ? "active" : ""}`}
      >
        <Home size={20} />
        <span>Home</span>
      </Link>

      <Link
        to="/wishlist"
        className={`mobile-bottom-nav__item ${isActive("/wishlist") ? "active" : ""}`}
      >
        <Heart size={20} />
        <span>Wishlist</span>
        <span className="mobile-bottom-nav__badge">4</span>
      </Link>

      <Link
        to="/cart"
        className={`mobile-bottom-nav__item ${isActive("/cart") ? "active" : ""}`}
      >
        <ShoppingCart size={20} />
        <span>Cart</span>
        <span className="mobile-bottom-nav__badge">2</span>
      </Link>

      <Link
        to="/account"
        className={`mobile-bottom-nav__item ${isActive("/account") ? "active" : ""}`}
      >
        <User size={20} />
        <span>Account</span>
      </Link>

      <a href="tel:+12345678890" className="mobile-bottom-nav__item">
        <Phone size={20} />
        <span>Call</span>
      </a>
    </nav>
  );
};

export default MobileBottomNav;
