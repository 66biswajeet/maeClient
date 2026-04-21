import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import {
  addToWishlist as addToWishlistAPI,
  getWishlist as getWishlistAPI,
  removeFromWishlist as removeFromWishlistAPI,
  checkInWishlist as checkInWishlistAPI,
} from "../services/api";

export const useWishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch all wishlist items
  const fetchWishlist = useCallback(async () => {
    const token = localStorage.getItem("mae_token");
    if (!token) {
      setWishlist([]);
      return;
    }

    setLoading(true);
    try {
      const res = await getWishlistAPI();
      setWishlist(res.data.wishlist || []);
      setError("");
    } catch (err) {
      console.error("Fetch wishlist error:", err);
      setError(err?.response?.data?.message || "Failed to fetch wishlist");
    } finally {
      setLoading(false);
    }
  }, []);

  // Add to wishlist
  const addToWishlist = useCallback(
    async (productId, zones = [], plans = [], cities = []) => {
      const token = localStorage.getItem("mae_token");
      if (!token) {
        toast.error("Please login to add to wishlist");
        setError("Please login to add to wishlist");
        return { success: false, message: "Not logged in" };
      }

      try {
        const res = await addToWishlistAPI(productId, zones, plans, cities);
        // Update or add to wishlist
        setWishlist((prev) => {
          const existing = prev.findIndex(
            (item) => item.product?._id === productId,
          );
          if (existing >= 0) {
            const updated = [...prev];
            updated[existing] = res.data.wishlist;
            toast.success("✅ Wishlist updated");
            return updated;
          }
          toast.success("❤️ Added to wishlist");
          return [res.data.wishlist, ...prev];
        });
        setError("");
        return { success: true, message: "Added to wishlist" };
      } catch (err) {
        const msg =
          err?.response?.data?.message || err.message || "Failed to add";
        toast.error(msg);
        setError(msg);
        return { success: false, message: msg };
      }
    },
    [],
  );

  // Remove from wishlist
  const removeFromWishlist = useCallback(async (wishlistId) => {
    try {
      await removeFromWishlistAPI(wishlistId);
      setWishlist((prev) => prev.filter((item) => item._id !== wishlistId));
      toast.success("🗑️ Removed from wishlist");
      setError("");
      return { success: true };
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to remove";
      toast.error(msg);
      setError(msg);
      return { success: false, message: msg };
    }
  }, []);

  // Check if product in wishlist
  const isInWishlist = useCallback(
    (productId) => {
      return wishlist.some((item) => item.product?._id === productId);
    },
    [wishlist],
  );

  // Get wishlist item by product
  const getWishlistItem = useCallback(
    (productId) => {
      return wishlist.find((item) => item.product?._id === productId);
    },
    [wishlist],
  );

  return {
    wishlist,
    loading,
    error,
    fetchWishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    getWishlistItem,
  };
};
