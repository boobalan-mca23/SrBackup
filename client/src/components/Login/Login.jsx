import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaUser, FaLock } from "react-icons/fa";
import srlogo from "../../Assets/srlogo.png";
// import { BACKEND_SERVER_URL } from "../../Config/Config";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");
  if (token) {
    const role = localStorage.getItem("userRole");
    return <Navigate to={role === "admin" ? "/master" : "/goldsmith"} replace />;
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch('https://srbackup.onrender.com/api/auth/login', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.isActive === false) {
          setError(
            "Your account has been deactivated. Please contact an administrator."
          );
          return;
        }

        // Save user data
        localStorage.setItem("username", data.username);
        localStorage.setItem("token", data.token);
        localStorage.setItem("userRole", data.role);
        localStorage.setItem("goldsmithAccess", data.goldsmithAccess);
        localStorage.setItem("itemMasterAccess", data.itemMasterAccess);
        localStorage.setItem("sealMasterAccess", data.sealMasterAccess);
        localStorage.setItem("canCreateUser", data.canCreateUser);
        localStorage.setItem("isActive", data.isActive);

        setFormData({ username: "", password: "" });

        if (data.role === "admin") {
          navigate("/master");
        } else {
          navigate("/goldsmith");
        }
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="logo-section">
          <div className="logo-frame">
            <div className="logo-inner">
              <img src={srlogo} alt="SR Jewelry Logo" className="brand-logo" />
            </div>
          </div>

          <h1 className="brand-name">SR Jewelry</h1>
          <p className="brand-tagline">
            Timeless elegance, crafted to perfection
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="login-form"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            left: "80px",
          }}
        >
          <div className="form-group">
            <div className="input-wrapper">
              <FaUser className="input-icon" />
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                required
                className="form-input"
                autoComplete="off"
                style={{ outline: "none", boxShadow: "none" }}
              />
            </div>
          </div>

          <div className="form-group">
            <div className="input-wrapper">
              <FaLock className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                className="form-input"
                style={{ outline: "none", boxShadow: "none" }}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {error && <div className="error-message">{error}</div>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`login-btn ${loading ? "loading" : ""}`}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>Welcome back! Please sign in to continue</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
