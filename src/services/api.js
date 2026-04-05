import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

export const getSiteSettings = () => api.get("/site-settings");
export const getProducts = (params = {}) => api.get("/products", { params });
