import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/SignUp.css";

function SignUp() {
  const navigate = useNavigate();
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    email: "",
    password: ""
  });
  
  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    email: "",
    password: "",
    terms: ""
  });
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleTermsChange = (e) => {
    setAgreedToTerms(e.target.checked);
    // Clear terms error when checkbox is checked
    if (e.target.checked) {
      setErrors(prev => ({ ...prev, terms: "" }));
    }
  };

  const validateField = (name, value) => {
    const nameRegex = /^[a-zA-Z\s-]+$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/;
    
    switch (name) {
      case "firstName":
        if (!value.trim()) return "First name is required";
        if (!nameRegex.test(value)) return "First name can only contain letters, spaces, and hyphens";
        return "";
      case "lastName":
        if (!value.trim()) return "Last name is required";
        if (!nameRegex.test(value)) return "Last name can only contain letters, spaces, and hyphens";
        return "";
      case "middleName":
        if (value.trim() && !nameRegex.test(value)) 
          return "Middle name can only contain letters, spaces, and hyphens";
        return "";
      case "email":
        if (!value.trim()) return "Email is required";
        if (!emailRegex.test(value)) return "Invalid email format";
        return "";
      case "password":
        if (!value) return "Password is required";
        if (value.length < 8) return "Password must be at least 8 characters long";
        if (!passwordRegex.test(value)) 
          return "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character";
        return "";
      default:
        return "";
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;
    
    // Validate all required fields
    Object.keys(formData).forEach(field => {
      if (field !== 'middleName') {
        const error = validateField(field, formData[field]);
        if (error) {
          newErrors[field] = error;
          isValid = false;
        }
      }
    });
    
    // Validate middleName only if provided
    if (formData.middleName) {
      const error = validateField('middleName', formData.middleName);
      if (error) {
        newErrors.middleName = error;
        isValid = false;
      }
    }
    
    // Validate terms agreement
    if (!agreedToTerms) {
      newErrors.terms = "You must agree to the Terms of Service and Privacy Policy";
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const submitSignup = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("FirstName", formData.firstName.trim());
      formDataToSend.append("Surname", formData.lastName.trim());
      
      if (formData.middleName) {
        formDataToSend.append("MiddleName", formData.middleName.trim());
      }
      
      formDataToSend.append("Email", formData.email.trim().toLowerCase());
      formDataToSend.append("Password", formData.password);
      
      const response = await fetch("https://localhost:7225/api/Auth/Register", {
        method: "POST",
        body: formDataToSend
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        if (result.errors) {
          const newErrors = {};
          Object.entries(result.errors).forEach(([key, value]) => {
            const fieldName = key.charAt(0).toLowerCase() + key.slice(1);
            newErrors[fieldName] = value[0];
          });
          setErrors(prev => ({ ...prev, ...newErrors }));
          return;
        }
        
        if (result.message === "Email already exists") {
          setErrors(prev => ({
            ...prev,
            email: "This email is already registered"
          }));
          return;
        }
        
        throw new Error(result.message || "Registration failed");
      }
      
      if (result.success) {
        localStorage.setItem("userId", result.userId);
        localStorage.setItem("expiresAt", result.expiresAt);
        localStorage.setItem("email", formData.email.trim().toLowerCase());
        navigate("/verify-email");
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        general: error.message || "An error occurred during registration"
      }));
    } finally {
      setLoading(false);
    }
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