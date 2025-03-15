// src/components/ResetPasswordLogic.js
import { API_URL } from '../../config';
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";


export function useResetPassword() {
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
      const response = await fetch(`${API_URL}/Auth/reset-password-with-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Token: formData.token,
          NewPassword: formData.newPassword,
          ConfirmNewPassword: formData.confirmPassword
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to reset password");
      }

      if (data.success) {
        // Optional: Show success message with SweetAlert
        Swal.fire({
          title: 'Password Reset Successful',
          text: 'You can now log in with your new password',
          icon: 'success',
          confirmButtonText: 'Go to Login'
        }).then(() => {
          navigate('/sign-in', { 
            state: { message: 'Password reset successful. Please log in with your new password.' }
          });
        });
      }
    } catch (err) {
      setError(err.message || 'An error occurred while resetting password');
      
      // Optional: Show error with SweetAlert
      Swal.fire({
        title: 'Password Reset Failed',
        text: err.message || 'An error occurred while resetting password',
        icon: 'error',
        confirmButtonText: 'Try Again'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const passwordValidation = validatePassword(formData.newPassword);

  return {
    formData,
    error,
    isLoading,
    passwordVisible,
    passwordValidation,
    setPasswordVisible,
    handleInputChange,
    handleSubmit
  };
}