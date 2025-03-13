// src/components/Login.jsx
import { Link } from "react-router-dom";
import { useLogin } from "./LoginLogic";
import "./Login.css";

function Login() {
  const {
    formData,
    errors,
    passwordVisible,
    rememberMe,
    loading,
    setPasswordVisible,
    setRememberMe,
    handleInputChange,
    handleSubmit
  } = useLogin();

  return (
    <div className="login-wrapper">
      {/* Left Section - Form */}
      <div className="login-left">
        <div className="login-form-wrapper">
          <div className="back-home-container">
            <Link to="/" className="back-home-button">
              <i className="bi bi-arrow-left"></i> Back to Home
            </Link>
          </div>
          
          <div className="brand-logo">
            <img src="/lesnotelogo1.png" alt="LesNote Logo" />
            <span>LesNoteAI</span>
          </div>

          <div className="login-header">
            <h2>Welcome Back</h2>
            <p>Sign in to continue your journey</p>
          </div>

          {errors.general && (
            <div className="error-banner">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                className={errors.email ? 'error' : ''}
              />
              {errors.email && (
                <span className="error-message">{errors.email}</span>
              )}
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
                  className={errors.password ? 'error' : ''}
                />
                <button 
                  type="button"
                  className="toggle-password"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                >
                  <i className={`bi bi-${passwordVisible ? 'eye' : 'eye-slash' }`}></i>
                </button>
              </div>
              {errors.password && (
                <span className="error-message">{errors.password}</span>
              )}
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
                  <i className="bi bi-arrow-clockwise" style={{animation: "spin 1s linear infinite"}}></i>
                ) : (
                  "Sign In"
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