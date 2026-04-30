import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api, addToCart, addToWishlist } from "../services/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import "./AuthPages.css";

const RegisterPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({
    email: "",
    phone: "",
    companySize: "",
    password: "",
    confirmPassword: "",
  });

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const passwordStrength = (pwd) => {
    let score = 0;
    if (!pwd) return score;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword)
      return setError("Passwords do not match");
    if (!form.email || !form.password)
      return setError("Please fill required fields");

    setLoading(true);
    try {
      const name = form.email.split("@")[0];
      const payload = {
        name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        companyName: `Company (size: ${form.companySize || "n/a"})`,
      };

      const res = await api.post("/customers/register", payload);
      if (res?.data?.token) {
        login(res.data.customer, res.data.token);
      } else {
        setError("Registration successful! Please login.");
        navigate("/login");
      }
    } catch (err) {
      setError(
        err?.response?.data?.message || err.message || "Registration failed",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card-left">
          <h2>Create an account</h2>
          <p>Join MAE to simplify your audit processes.</p>
        </div>
        <div className="auth-card-right">
          <div className="auth-tabs">
            <Link to="/login">Login</Link>
            <Link to="/register" className="active">Register</Link>
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
              <label>Phone</label>
              <input
                name="phone"
                placeholder="Optional: +91 98765 43210"
                value={form.phone}
                onChange={handleChange}
                type="tel"
              />
            </div>

            <div className="form-group">
              <label>Company size</label>
              <input
                name="companySize"
                placeholder="Number of employees"
                value={form.companySize}
                onChange={handleChange}
                type="number"
                min="1"
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="password-input-wrapper">
                <input
                  name="password"
                  placeholder="Create a strong password"
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
              <div className="pwd-strength">
                <div className={`pwd-bar s${passwordStrength(form.password)}`}></div>
                <div className="pwd-label">
                  {form.password && ["Very weak", "Weak", "Fair", "Good", "Strong"][passwordStrength(form.password)]}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <div className="password-input-wrapper">
                <input
                  name="confirmPassword"
                  placeholder="Repeat password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  type={showConfirm ? "text" : "password"}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowConfirm((s) => !s)}
                >
                  {showConfirm ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button className="auth-submit-btn" type="submit" disabled={loading}>
              {loading ? "Registering..." : "Create account"}
            </button>
          </form>

          <div className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
