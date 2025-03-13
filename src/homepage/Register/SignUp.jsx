// src/components/SignUp.jsx
import { Link } from "react-router-dom";
import { useSignUp } from "./SignUpLogic";
import "./SignUp.css";

function SignUp() {
  const {
    formData,
    errors,
    loading,
    passwordVisible,
    agreedToTerms,
    setPasswordVisible,
    handleInputChange,
    handleTermsChange,
    submitSignup
  } = useSignUp();

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
          
          {errors.general && (
            <div className="error-banner">
              {errors.general}
            </div>
          )}
          
          <form onSubmit={submitSignup} className="signup-form">
            <div className="form-row">
              <div className="form-group">
                <label>First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="John"
                  className={errors.firstName ? 'error' : ''}
                />
                {errors.firstName && (
                  <span className="error-message">{errors.firstName}</span>
                )}
              </div>
              
              <div className="form-group">
                <label>Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Doe"
                  className={errors.lastName ? 'error' : ''}
                />
                {errors.lastName && (
                  <span className="error-message">{errors.lastName}</span>
                )}
              </div>
            </div>
            
            <div className="form-group">
              <label>Middle Name (optional)</label>
              <input
                type="text"
                name="middleName"
                value={formData.middleName}
                onChange={handleInputChange}
                placeholder="Middle name"
                className={errors.middleName ? 'error' : ''}
              />
              {errors.middleName && (
                <span className="error-message">{errors.middleName}</span>
              )}
            </div>
            
            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="john@example.com"
                className={errors.email ? 'error' : ''}
              />
              {errors.email && (
                <span className="error-message">{errors.email}</span>
              )}
            </div>
            
            <div className="form-group">
              <label>Password *</label>
              <div className="password-input">
                <input
                  type={passwordVisible ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Create a secure password"
                  className={errors.password ? 'error' : ''}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                >
                  <i className={`bi bi-${passwordVisible ? 'eye' : 'eye-slash'}`}></i>
                </button>
              </div>
              {errors.password && (
                <span className="error-message">{errors.password}</span>
              )}
            </div>
            
            <div className="terms-check">
              <label className="checkbox-wrapper mb-4">
                <input 
                  type="checkbox"
                  id="terms"
                  checked={agreedToTerms}
                  onChange={handleTermsChange}
                />
                <span className="checkmark"></span>
                <span className="terms-text">
                  I agree to the <Link to="/terms">Terms of Service</Link> and{" "}
                  <Link to="/privacy">Privacy Policy</Link>
                </span>
              </label>
              {errors.terms && (
                <span className="error-message">{errors.terms}</span>
              )}
            </div>
            
            <button
              type="submit"
              className="signup-button"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account"}
              {!loading && <i className="bi bi-arrow-right"></i>}
            </button>
            
            <div className="login-link">
              Already have an account? <Link to="/sign-in">Sign in</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignUp;