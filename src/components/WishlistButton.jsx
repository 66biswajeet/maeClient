import React, { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { useWishlist } from "../hooks/useWishlist";
import "./WishlistButton.css";

const WishlistButton = ({ productId, zones = [], plans = [], cities = [], onToggle }) => {
  const { addToWishlist, removeFromWishlist, isInWishlist, getWishlistItem } =
    useWishlist();
  const [inWishlist, setInWishlist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setInWishlist(isInWishlist(productId));
  }, [productId, isInWishlist]);

  const handleToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    setIsLoading(true);
    try {
      if (inWishlist) {
        const item = getWishlistItem(productId);
        if (item) {
          await removeFromWishlist(item._id);
          setInWishlist(false);
        }
      } else {
        // Ensure zones, plans, and cities are arrays
        const zonesArray = Array.isArray(zones) ? zones : zones ? [zones] : [];
        const plansArray = Array.isArray(plans) ? plans : plans ? [plans] : [];
        const citiesArray = Array.isArray(cities) ? cities : cities ? [cities] : [];

        const result = await addToWishlist(productId, zonesArray, plansArray, citiesArray);
        if (result.success) {
          setInWishlist(true);
        }
      }
      onToggle && onToggle(!inWishlist);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      className={`wishlist-btn ${inWishlist ? "active" : ""} ${isLoading ? "loading" : ""}`}
      onClick={handleToggle}
      disabled={isLoading}
      aria-label="Toggle wishlist"
    >
      <Heart size={20} fill={inWishlist ? "currentColor" : "none"} />
    </button>
  );
};

export default WishlistButton;
