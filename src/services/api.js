import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

export const getSiteSettings = () => api.get("/site-settings");
export const getProducts = (params = {}) => api.get("/products", { params });

// Wishlist API
export const addToWishlist = (productId, zones = [], plans = []) =>
  api.post("/wishlist", { productId, zones, plans });

export const getWishlist = () => api.get("/wishlist");

export const removeFromWishlist = (wishlistId) =>
  api.delete(`/wishlist/${wishlistId}`);

export const checkInWishlist = (productId) =>
  api.get(`/wishlist/check/${productId}`);

// Set auth token for wishlist requests
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};
