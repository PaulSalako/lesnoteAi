// src/pages/SignUp.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getState } from "../contexts/NoteContext";
import "../styles/SignUp.css";

function SignUp() {
  const { handleSignup } = getState();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: ""
  });
  const [passwordVisible, setPasswordVisible] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const submitSignup = async (e) => {
    e.preventDefault();
    const success = await handleSignup(formData.email, formData.password);
    if (success) navigate("/verify");
  };

  return (
    <div className="signup-wrapper">
      {/* Left Section - Illustration & Info */}
      <div className="signup-left">
        <div className="signup-left-content">
          <div className="brand-logo">
            <img src="/lesnotelogo1.png" alt="LesNote Logo" />
            <span>LesNoteAI</span>
          </div>
          <h1>Start Creating Amazing Lesson Notes</h1>
          <p>Join thousands of teachers who trust LesNoteAI for their lesson planning needs.</p>
          
          <div className="feature-list">
            <div className="feature-item">
              <i className="bi bi-clock-history"></i>
              <span>Save 3+ hours per lesson plan</span>
            </div>
            <div className="feature-item">
              <i className="bi bi-shield-check"></i>
              <span>AI-powered professional templates</span>
            </div>
            <div className="feature-item">
              <i className="bi bi-lightning-charge"></i>
              <span>Generate notes in minutes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section - Sign Up Form */}
      <div className="signup-right">
        <div className="signup-form-wrapper">
          <div className="signup-header">
            <h2>Create Account</h2>
            <p>Begin your journey to easier lesson planning</p>
          </div>

          <button className="google-signup">
            <img src="/google-icon.png" alt="Google" />
            Continue with Google
          </button>

          <div className="separator">
            <span>or continue with email</span>
          </div>

          <form onSubmit={submitSignup}>
            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="John"
                  required
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="john@example.com"
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
                  placeholder="Create a secure password"
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

            <div className="terms-check">
              <label className="checkbox-wrapper">
                <input type="checkbox" required />
                <span className="checkmark"></span>
                <span className="terms-text">
                  I agree to the <Link to="/terms">Terms of Service</Link> and <Link to="/privacy">Privacy Policy</Link>
                </span>
              </label>
            </div>

            <button type="submit" className="signup-button">
              Create Account
              <i className="bi bi-arrow-right"></i>
            </button>

            <div className="login-link">
              Already have an account? <Link to="/login">Sign in</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignUp;