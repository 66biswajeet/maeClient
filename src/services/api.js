import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

// Response interceptor to handle expired tokens (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear auth data and redirect to login
      localStorage.removeItem("mae_token");
      localStorage.removeItem("mae_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export const getSiteSettings = () => api.get("/site-settings");
export const getProducts = (params = {}) => api.get("/products", { params });

// Wishlist API
export const addToWishlist = (productId, zones = [], plans = [], cities = []) =>
  api.post("/wishlist", { productId, zones, plans, cities });

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

// Cart API
export const addToCart = (payload) => api.post("/cart", payload);
export const getCart = () => api.get("/cart");
export const updateCartItem = (id, data) => api.patch(`/cart/${id}`, data);
export const removeCartItem = (id) => api.delete(`/cart/${id}`);
export const clearCart = () => api.delete("/cart");
export const createOrder = (payload) => api.post("/orders", payload); // legacy – kept for reference

// Booking API (customer-facing – replaces createOrder at checkout)
export const createBooking = (payload) => api.post("/bookings/place", payload);

// Customer Profile API (customer-protected)
export const getMyProfile = () => api.get("/customers/me");
export const updateMyProfile = (data) => api.patch("/customers/me", data);
export const getMyOrders = (customerId) =>
  api.get("/orders/my", { params: { customerId } });
export const getMyBookings = (customerId) =>
  api.get("/bookings", { params: { customer: customerId, limit: 50 } });
