// src/components/ResetPassword.jsx
import { Link } from "react-router-dom";
import { useResetPassword } from "./ResetPasswordLogic";
import "./ResetPassword.css";

function ResetPassword() {
  const {
    formData,
    error,
    isLoading,
    passwordVisible,
    passwordValidation,
    setPasswordVisible,
    handleInputChange,
    handleSubmit
  } = useResetPassword();

  const { isValid: isPasswordValid, requirements } = passwordValidation;

  return (
    <div className="reset-password-wrapper">
      <div className="reset-password-container">
        <Link to="/" className="brand-logo">
          <img src="/lesnotelogo1.png" alt="LesNote Logo" height="40" />
          <span>LesNoteAI</span>
        </Link>

        <div className="reset-password-content">
          <h2>Reset Your Password</h2>
          <p className="subtitle">Create a new password for your account</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={formData.email}
                className="form-control"
                disabled
                readOnly
              />
            </div>

            <div className="form-group">
              <label>New Password</label>
              <div className="password-input">
                <input
                  type={passwordVisible.new ? "text" : "password"}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="Enter new password"
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setPasswordVisible(prev => ({ ...prev, new: !prev.new }))}
                >
                  <i className={`bi bi-${passwordVisible.new ? 'eye-slash' : 'eye'}`}></i>
                </button>
              </div>
              
              <div className="password-requirements">
                {requirements.map((req, index) => (
                  <div 
                    key={index} 
                    className={`requirement ${req.met ? 'met' : ''}`}
                  >
                    <i className={`bi bi-${req.met ? 'check-circle-fill' : 'circle'}`}></i>
                    {req.text}
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <div className="password-input">
                <input
                  type={passwordVisible.confirm ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="Confirm new password"
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setPasswordVisible(prev => ({ ...prev, confirm: !prev.confirm }))}
                >
                  <i className={`bi bi-${passwordVisible.confirm ? 'eye-slash' : 'eye'}`}></i>
                </button>
              </div>
              {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                <div className="password-match-message">Passwords do not match</div>
              )}
            </div>

            {error && <div className="error-message">{error}</div>}

            <button 
              type="submit" 
              className="submit-button"
              disabled={isLoading || !isPasswordValid || formData.newPassword !== formData.confirmPassword}
            >
              {isLoading ? (
                <i className="bi bi-arrow-repeat loading-spinner"></i>
              ) : (
                "Reset Password"
              )}
            </button>

            <div className="back-to-login">
              <Link to="/sign-in">
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