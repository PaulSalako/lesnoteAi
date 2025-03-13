import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./VerifyEmail.css";

function VerifyEmail() {
  const [code, setCode] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [isExpired, setIsExpired] = useState(false);
  const [maxAttemptsReached, setMaxAttemptsReached] = useState(false);
  const [cooldown, setCooldown] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const navigate = useNavigate();

  // Timer effect for cooldown
  useEffect(() => {
    let timer;
    if (cooldown) {
      timer = setInterval(() => {
        const now = new Date().getTime();
        const end = new Date(cooldown.cooldownEnds).getTime();
        const remaining = Math.max(0, end - now);

        if (remaining === 0) {
          setTimeRemaining(null);
          setCooldown(null);
          clearInterval(timer);
        } else {
          const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
          setTimeRemaining({ minutes, seconds });
        }
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [cooldown]);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      navigate("/sign-in");
    }
  }, [navigate]);

  const handleResendCode = async () => {
    setLoading(true);
    try {
      const email = localStorage.getItem("email"); // Add this to your registration flow
      
      const response = await fetch("https://localhost:7225/api/Auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.cooldownDetails) {
          setCooldown(data.cooldownDetails);
          throw new Error(`Please wait ${data.cooldownDetails.humanReadableTime} before requesting a new code`);
        }
        throw new Error(data.message || "Failed to resend code");
      }

      // Reset states when new code is sent
      setIsExpired(false);
      setMaxAttemptsReached(false);
      setAttemptsLeft(3);
      setCode("");
      setError(`New verification code has been sent. Next resend available in ${data.nextResend.availableIn}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (code.length !== 6) {
      setError("Verification code must be 6 digits");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const userId = localStorage.getItem("userId");
      
      const response = await fetch("https://localhost:7225/api/Auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          verificationCode: code
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.isExpired) {
          setIsExpired(true);
          setError("Verification code has expired. Please request a new code.");
          setCode("");
        } else if (data.maxAttemptsReached) {
          setMaxAttemptsReached(true);
          setError("Maximum attempts reached. Please request a new code.");
          setCode("");
        } else if (data.attemptsRemaining !== undefined) {
          setAttemptsLeft(data.attemptsRemaining);
          setError(`Incorrect code. ${data.attemptsRemaining} attempts remaining.`);
          setCode("");
        } else {
          setError(data.message || "Verification failed");
        }
        throw new Error(data.message);
      }

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate("/sign-in");
        }, 2000);
      }
    } catch (err) {
      // Error is already handled above
    } finally {
      setLoading(false);
    }
  };

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
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        if (value.length <= 6) setCode(value);
                      }}
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
                    <span className="loading-spinner">
                      <i className="bi bi-arrow-clockwise"></i>
                    </span>
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
                  disabled={loading || cooldown}
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
            <Link to="/register">
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