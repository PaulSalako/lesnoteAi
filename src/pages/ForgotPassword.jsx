import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/ForgotPassword.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("https://localhost:7225/api/Auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send reset email");
      }

      if (data.success) {
        setIsEmailSent(true);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError(error.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTryAgain = () => {
    setIsEmailSent(false);
    setError(null);
    setEmail("");
  };

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
                <Link to="/login" className="primary-button">
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;