import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { setAuthToken, addToCart, addToWishlist } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('mae_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('mae_token');
    if (token) {
      setAuthToken(token);
    }
    setLoading(false);
  }, []);

  // Handle pending actions after login
  useEffect(() => {
    if (user) {
      const executePendingAction = async () => {
        const actionStr = localStorage.getItem("mae_pending_action");
        if (!actionStr) return;

        try {
          const action = JSON.parse(actionStr);
          if (action.type === "ADD_TO_CART") {
            await addToCart(action.payload);
            toast.success("Added to cart automatically!");
          } else if (action.type === "ADD_TO_WISHLIST") {
            const { productId, zones, plans, cities } = action.payload;
            await addToWishlist(productId, zones, plans, cities);
            toast.success("Added to wishlist automatically!");
          }
        } catch (err) {
          console.error("Failed to execute pending action:", err);
        } finally {
          localStorage.removeItem("mae_pending_action");
        }
      };
      executePendingAction();
    }
  }, [user]);

  const login = (userData, token) => {
    localStorage.setItem('mae_token', token);
    localStorage.setItem('mae_user', JSON.stringify(userData));
    setAuthToken(token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('mae_token');
    localStorage.removeItem('mae_user');
    setAuthToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
