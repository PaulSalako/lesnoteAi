// src/components/ForgotPassword.jsx
import { Link } from "react-router-dom";
import { useForgotPassword } from "./ForgotPasswordLogic";
import "./ForgotPassword.css";

function ForgotPassword() {
  // Get all the logic and state from our custom hook
  const {
    email,
    setEmail,
    isEmailSent,
    isLoading,
    error,
    setError,
    handleSubmit,
    handleTryAgain
  } = useForgotPassword();

  return (
    <div className="forgot-password-wrapper">
      <div className="forgot-password-container">
        <Link to="/" className="brand-logo">
          <img src="/lesnotelogo1.png" alt="LesNote Logo" height="40" />
          <span>LesNoteAI</span>
        </Link>

        <div className="forgot-password-content">
          {isEmailSent ? (
            <div className="success-message">
              <i className="bi bi-check-circle-fill"></i>
              <h3>Check Your Email</h3>
              <p>
                If an account exists for <strong>{email}</strong>, you will receive password reset instructions.
              </p>
              <p className="small-text">
                Please check your spam folder if you don't see the email in your inbox.
              </p>
              <div className="action-buttons">
                <Link to="/sign-in" className="primary-button">
                  Return to Login
                </Link>
              </div>
            </div>
          ) : (
            <>
              <h2>Reset Password</h2>
              <p>
                Enter your email address and we'll send you instructions to reset your password.
              </p>

              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError(null);
                    }}
                    placeholder="Enter your email"
                    required
                    className={`form-control ${error ? 'error' : ''}`}
                  />
                </div>

                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={isLoading || !email.trim()}
                >
                  {isLoading ? (
                    <i className="bi bi-arrow-repeat loading-spinner"></i>
                  ) : (
                    "Send Reset Link"
                  )}
                </button>

                <div className="back-to-login">
                  <Link to="/sign-in">
                    <i className="bi bi-arrow-left"></i> Back to Login
                  </Link>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;