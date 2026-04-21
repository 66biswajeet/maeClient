import React, { useEffect, useState } from "react";
import { api } from "../services/api";
import "./AuthModal.css";

const AuthModal = ({ isOpen, onClose, onAuthSuccess }) => {
  const [mode, setMode] = useState("login");
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

  useEffect(() => {
    if (!isOpen) {
      setMode("login");
      setForm({
        email: "",
        phone: "",
        companySize: "",
        password: "",
        confirmPassword: "",
      });
      setError("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submitRegister = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword)
      return setError("Passwords do not match");
    if (!form.email || !form.password)
      return setError("Please fill required fields");

    setLoading(true);
    try {
      // backend expects name, email, password, phone, companyName
      const name = form.email.split("@")[0];
      const payload = {
        name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        companyName: `Company (size: ${form.companySize || "n/a"})`,
      };

      const res = await api.post("/customers/register", payload);
      // store token + user
      if (res?.data?.token) {
        localStorage.setItem("mae_token", res.data.token);
        localStorage.setItem(
          "mae_user",
          JSON.stringify(res.data.customer || null),
        );
      }
      onAuthSuccess && onAuthSuccess(res.data);
      onClose();
    } catch (err) {
      setError(
        err?.response?.data?.message || err.message || "Registration failed",
      );
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = (pwd) => {
    let score = 0;
    if (!pwd) return score;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score; // 0-4
  };

  const submitLogin = async (e) => {
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
        localStorage.setItem("mae_token", res.data.token);
        localStorage.setItem(
          "mae_user",
          JSON.stringify(res.data.customer || null),
        );
      }
      onAuthSuccess && onAuthSuccess(res.data);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="authmodal-overlay" onMouseDown={onClose}>
      <div className="authmodal" onMouseDown={(e) => e.stopPropagation()}>
        <button
          className="authmodal-close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        <div className="authmodal-left">
          <h2>{mode === "login" ? "Welcome back" : "Create an account"}</h2>
          <p className="authmodal-sub">Fast, secure access to MAE services.</p>
        </div>

        <div className="authmodal-right">
          <div className="authmodal-tabs">
            <button
              className={mode === "login" ? "active" : ""}
              onClick={() => setMode("login")}
            >
              Login
            </button>
            <button
              className={mode === "register" ? "active" : ""}
              onClick={() => setMode("register")}
            >
              Register
            </button>
          </div>

          {error && <div className="authmodal-error">{error}</div>}

          {mode === "login" ? (
            <form onSubmit={submitLogin} className="authmodal-form">
              <label>Email</label>
              <input
                name="email"
                placeholder="you@company.com"
                value={form.email}
                onChange={handleChange}
                type="email"
                required
              />

              <label>Password</label>
              <div style={{ position: "relative" }}>
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
                  className="password-toggle"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              <button className="btn primary" type="submit" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>
          ) : (
            <form onSubmit={submitRegister} className="authmodal-form">
              <label>Email</label>
              <input
                name="email"
                placeholder="you@company.com"
                value={form.email}
                onChange={handleChange}
                type="email"
                required
              />

              <label>Phone</label>
              <input
                name="phone"
                placeholder="Optional: +91 98765 43210"
                value={form.phone}
                onChange={handleChange}
                type="tel"
              />

              <label>Company size (number of employees)</label>
              <input
                name="companySize"
                placeholder="e.g. 25"
                value={form.companySize}
                onChange={handleChange}
                type="number"
                min="1"
              />

              <label>Password</label>
              <div style={{ position: "relative" }}>
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
                  className="password-toggle"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              <div className="pwd-strength">
                <div
                  className={`pwd-bar s${passwordStrength(form.password)}`}
                ></div>
                <div className="pwd-label">
                  {form.password
                    ? ["Very weak", "Weak", "Fair", "Good", "Strong"][
                        passwordStrength(form.password)
                      ]
                    : ""}
                </div>
              </div>

              <label>Confirm password</label>
              <div style={{ position: "relative" }}>
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
                  className="password-toggle"
                  onClick={() => setShowConfirm((s) => !s)}
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirm ? "Hide" : "Show"}
                </button>
              </div>

              <button
                className="btn primary full"
                type="submit"
                disabled={loading}
              >
                {loading ? "Registering..." : "Create account"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
