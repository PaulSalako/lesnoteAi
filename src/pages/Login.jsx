// src/pages/Login.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getState } from "../contexts/NoteContext";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import "../styles/Login.css";

function Login() {
  const { handleLogin } = getState();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await handleLogin(formData.email, formData.password);
    if (success) navigate("/dashboard");
  };

  const handleGoogleSuccess = async (response) => {
    const userData = jwtDecode(response.credential);
    const success = await handleGoogleLogin(userData);
    if (success) navigate("/dashboard");
  };

  const handleGoogleFailure = () => {
    alert("Google Login Failed. Try again!");
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

          <div className="login-header">
            <h2>Welcome Back!</h2>
            <p>Sign in to continue your journey</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
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

            <button type="submit" className="login-button">
              Sign In
              <i className="bi bi-arrow-right"></i>
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