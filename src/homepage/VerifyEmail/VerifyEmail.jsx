// src/components/VerifyEmail.jsx
import { Link } from "react-router-dom";
import { useVerifyEmail } from "./VerifyEmailLogic";
import "./VerifyEmail.css";

function VerifyEmail() {
  const {
    code,
    error,
    success,
    loading,
    attemptsLeft,
    isExpired,
    maxAttemptsReached,
    timeRemaining,
    handleCodeChange,
    handleResendCode,
    handleSubmit
  } = useVerifyEmail();

  return (
    <div className="verify-email-wrapper">
      <div className="verify-email-container">
        <Link to="/" className="brand-logo">
          <img src="/lesnotelogo1.png" alt="LesNote Logo" />
          <span>LesNoteAI</span>
        </Link>

        <div className="verify-email-content">
          {success ? (
            <div className="success-message">
              <i className="bi bi-check-circle"></i>
              <h3>Email Verified!</h3>
              <p>Your email has been successfully verified. Redirecting to login...</p>
            </div>
          ) : (
            <>
              <h2>Verify Your Email</h2>
              <p>Enter the 6-digit verification code sent to your email.</p>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <div className="verification-code-input">
                    <input
                      type="text"
                      value={code}
                      onChange={handleCodeChange}
                      placeholder="Enter 6-digit code"
                      maxLength="6"
                      className={`form-control ${error ? 'error' : ''}`}
                      required
                      disabled={maxAttemptsReached || isExpired}
                    />
                  </div>
                  {error && (
                    <div className={`error-message ${(maxAttemptsReached || isExpired) ? 'error-critical' : ''}`}>
                      {error}
                    </div>
                  )}
                  {!error && attemptsLeft < 3 && (
                    <div className="attempts-remaining">
                      {attemptsLeft} attempts remaining
                    </div>
                  )}
                </div>

                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={loading || code.length !== 6 || maxAttemptsReached || isExpired}
                >
                  {loading ? (
                    <i className="bi bi-arrow-clockwise loading-spinner"></i>
                  ) : (
                    "Verify Email"
                  )}
                </button>
              </form>

              <div className="resend-code">
                <p>
                  {(maxAttemptsReached || isExpired) 
                    ? "Request a new code to continue" 
                    : "Didn't receive the code?"}
                </p>
                <button 
                  onClick={handleResendCode} 
                  className="btn-link"
                  disabled={loading || timeRemaining}
                >
                  {timeRemaining 
                    ? `Wait ${timeRemaining.minutes}:${String(timeRemaining.seconds).padStart(2, '0')} for new code` 
                    : "Resend verification code"
                  }
                </button>
              </div>
            </>
          )}

          <div className="back-to-login">
            <Link to="/sign-up">
              <i className="bi bi-arrow-left"></i>
              Back to Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerifyEmail;