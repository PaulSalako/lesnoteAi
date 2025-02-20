// src/pages/ForgotPassword.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { getState } from "../contexts/NoteContext";
import "../styles/ForgotPassword.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { handleForgotPassword } = getState();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await handleForgotPassword(email);
      if (success) {
        setIsEmailSent(true);
      }
    } catch (error) {
      console.error("Error sending reset email:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-password-wrapper">
      <div className="forgot-password-container">
        {/* Logo and Heading */}
        <div className="text-center mb-4">
          <Link to="/" className="brand-logo">
            <img src="/lesnotelogo1.png" alt="LesNote Logo" height="40" />
            <span>LesNoteAI</span>
          </Link>
        </div>

        <div className="forgot-password-content">
          <h2>Reset Password</h2>
          <p className="text-muted">
            Enter your email address and we'll send you a link to reset your password.
          </p>

          {isEmailSent ? (
            // Success Message
            <div className="success-message">
              <i className="bi bi-check-circle-fill"></i>
              <h3>Check your email</h3>
              <p>
                We have sent a password reset link to <strong>{email}</strong>
              </p>
              <div className="mt-4">
                <Link to="/login" className="btn btn-primary w-100">
                  Return to Login
                </Link>
                <button 
                  onClick={() => setIsEmailSent(false)} 
                  className="btn btn-link mt-2"
                >
                  Try a different email
                </button>
              </div>
            </div>
          ) : (
            // Reset Form
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="form-control"
                />
              </div>

              <button 
                type="submit" 
                className="submit-button"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="loading-spinner">
                    <i className="bi bi-arrow-repeat"></i>
                  </span>
                ) : (
                  "Send Reset Link"
                )}
              </button>

              <div className="back-to-login">
                <Link to="/login">
                  <i className="bi bi-arrow-left"></i> Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;