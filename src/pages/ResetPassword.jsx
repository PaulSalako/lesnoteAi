// src/pages/ResetPassword.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { getState } from "../contexts/NoteContext";
import "../styles/ResetPassword.css";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleResetPassword } = getState();
  
  const [formData, setFormData] = useState({
    email: searchParams.get('email') || '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Password validation states
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [passwordStrength, setPasswordStrength] = useState({
    isStrong: false,
    message: ''
  });

  useEffect(() => {
    // Check if passwords match
    if (formData.confirmPassword) {
      setPasswordMatch(formData.newPassword === formData.confirmPassword);
    }

    // Check password strength
    if (formData.newPassword) {
      const hasMinLength = formData.newPassword.length >= 8;
      const hasUpperCase = /[A-Z]/.test(formData.newPassword);
      const hasLowerCase = /[a-z]/.test(formData.newPassword);
      const hasNumbers = /\d/.test(formData.newPassword);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword);

      const isStrong = hasMinLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
      
      setPasswordStrength({
        isStrong,
        message: isStrong ? '' : 'Password must contain at least 8 characters, including uppercase, lowercase, numbers, and special characters'
      });
    }
  }, [formData.newPassword, formData.confirmPassword]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!passwordMatch) {
      setError('Passwords do not match');
      return;
    }

    if (!passwordStrength.isStrong) {
      setError(passwordStrength.message);
      return;
    }

    setIsLoading(true);
    try {
      const success = await handleResetPassword(formData.email, formData.newPassword);
      if (success) {
        navigate('/login', { state: { message: 'Password reset successful. Please log in with your new password.' } });
      } else {
        setError('Failed to reset password. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="reset-password-wrapper">
      <div className="reset-password-container">
        {/* Logo and Heading */}
        <div className="text-center mb-4">
          <Link to="/" className="brand-logo">
            <img src="/lesnotelogo1.png" alt="LesNote Logo" height="40" />
            <span>LesNoteAI</span>
          </Link>
        </div>

        <div className="reset-password-content">
          <h2>Reset Your Password</h2>
          <p className="subtitle">Create a new password for your account</p>

          <form onSubmit={handleSubmit}>
            {/* Email Display - Non-editable */}
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                value={formData.email}
                className="form-control"
                disabled
                readOnly
              />
            </div>

            {/* New Password */}
            <div className="form-group">
              <label>New Password</label>
              <div className="password-input">
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className={`form-control ${!passwordStrength.isStrong && formData.newPassword ? 'is-invalid' : ''}`}
                  placeholder="Enter new password"
                  required
                />
              </div>
              {!passwordStrength.isStrong && formData.newPassword && (
                <div className="password-strength-message">{passwordStrength.message}</div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label>Confirm Password</label>
              <div className="password-input">
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`form-control ${!passwordMatch && formData.confirmPassword ? 'is-invalid' : ''}`}
                  placeholder="Confirm new password"
                  required
                />
              </div>
              {!passwordMatch && formData.confirmPassword && (
                <div className="password-match-message">Passwords do not match</div>
              )}
            </div>

            {error && <div className="error-message">{error}</div>}

            <button 
              type="submit" 
              className="submit-button"
              disabled={isLoading || !passwordMatch || !passwordStrength.isStrong}
            >
              {isLoading ? (
                <span className="loading-spinner">
                  <i className="bi bi-arrow-repeat"></i>
                </span>
              ) : (
                "Reset Password"
              )}
            </button>

            <div className="back-to-login">
              <Link to="/login">
                <i className="bi bi-arrow-left"></i> Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;