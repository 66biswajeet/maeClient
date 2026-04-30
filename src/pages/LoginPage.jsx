import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { api, addToCart, addToWishlist } from "../services/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import "./AuthPages.css";

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password)
      return setError("Please enter email and password");

    setLoading(true);
    try {
      const res = await api.post("/customers/login", {
        email: form.email,
        password: form.password,
      });
      if (res?.data?.token) {
        login(res.data.customer, res.data.token);
      } else {
        setError("Invalid response from server");
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card-left">
          <h2>Welcome back</h2>
          <p>Fast, secure access to MAE services.</p>
        </div>
        <div className="auth-card-right">
          <div className="auth-tabs">
            <Link to="/login" className="active">Login</Link>
            <Link to="/register">Register</Link>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Email</label>
              <input
                name="email"
                placeholder="you@company.com"
                value={form.email}
                onChange={handleChange}
                type="email"
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="password-input-wrapper">
                <input
                  name="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  type={showPassword ? "text" : "password"}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword((s) => !s)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button className="auth-submit-btn" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
          
          <div className="auth-footer">
            Don't have an account? <Link to="/register">Create one</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
