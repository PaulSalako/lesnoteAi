import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Login.css";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("https://localhost:7225/api/Auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.requiresVerification) {
          // Store email for verification page
          localStorage.setItem("email", data.email);
          navigate("/verify-email");
          return;
        }
        throw new Error(data.message || "Login failed");
      }

      if (data.success) {
        // Store token
        const token = data.token;
        if (rememberMe) {
          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(data.user));
        } else {
          sessionStorage.setItem("token", token);
          sessionStorage.setItem("user", JSON.stringify(data.user));
        }

        // Navigate to dashboard
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message || "An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      {/* Left Section - Form */}
      <div className="login-left">
        <div className="login-form-wrapper">
          <div className="brand-logo">
            <img src="/lesnotelogo1.png" alt="LesNote Logo" />
            <span>LesNoteAI</span>
          </div>
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                className={error ? 'error' : ''}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="password-input">
                <input
                  type={passwordVisible ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  className={error ? 'error' : ''}
                  required
                />
                <button 
                  type="button"
                  className="toggle-password"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                >
                  <i className={`bi bi-${passwordVisible ? 'eye-slash' : 'eye'}`}></i>
                </button>
              </div>
            </div>

            <div className="form-options">
              <label className="checkbox-wrapper">
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="checkmark"></span>
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="forgot-password">
                Forgot password?
              </Link>
            </div>

            <button 
              type="submit" 
              className="login-button"
              disabled={loading}
            >
              {loading ? (
                <span className="loading-spinner">
                  <i className="bi bi-arrow-clockwise"></i>
                </span>
              ) : (
                <>
                  Sign In
                  <i className="bi bi-arrow-right"></i>
                </>
              )}
            </button>

            <div className="signup-link">
              Don't have an account? <Link to="/sign-up">Sign up</Link>
            </div>
          </form>
        </div>
      </div>

      {/* Right Section - Illustration & Info */}
      <div className="login-right">
        <div className="login-right-content">
          <h1>Transform Your Lesson Planning</h1>
          <p>Access your AI-powered lesson planning assistant and create amazing lesson notes in minutes.</p>
          
          <div className="stats-list">
            <div className="stat-item">
              <span className="stat-number">3000+</span>
              <span className="stat-label">Active Teachers</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">50k+</span>
              <span className="stat-label">Lessons Created</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">98%</span>
              <span className="stat-label">Satisfaction Rate</span>
            </div>
          </div>

          <img 
            src="/result.svg" 
            alt="Teacher Planning" 
            className="login-illustration"
          />
        </div>
      </div>
    </div>
  );
}

export default Login;