import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import "../styles/ResetPassword.css";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: searchParams.get('email') || '',
    token: searchParams.get('token') || '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState({
    new: false,
    confirm: false
  });

  // Validate token presence
  useEffect(() => {
    if (!formData.token || !formData.email) {
      navigate('/forgot-password');
    }
  }, [formData.token, formData.email, navigate]);

  const validatePassword = (password) => {
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const requirements = [
      { met: hasMinLength, text: "At least 8 characters" },
      { met: hasUpperCase, text: "One uppercase letter" },
      { met: hasLowerCase, text: "One lowercase letter" },
      { met: hasNumbers, text: "One number" },
      { met: hasSpecialChar, text: "One special character" }
    ];

    return {
      isValid: requirements.every(req => req.met),
      requirements
    };
  };

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
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("https://localhost:7225/api/Auth/reset-password-with-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Token: formData.token,
          NewPassword: formData.newPassword,
          ConfirmNewPassword: formData.confirmPassword  // Add this line
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to reset password");
      }

      if (data.success) {
        navigate('/login', { 
          state: { message: 'Password reset successful. Please log in with your new password.' }
        });
      }
    } catch (err) {
      setError(err.message || 'An error occurred while resetting password');
    } finally {
      setLoading(false);
    }
};

  const { isValid: isPasswordValid, requirements } = validatePassword(formData.newPassword);

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