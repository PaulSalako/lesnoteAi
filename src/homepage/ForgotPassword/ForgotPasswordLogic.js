// src/components/ForgotPasswordLogic.js
import { useState } from "react";

export function useForgotPassword() {
  const [email, setEmail] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Validate email format
  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    
    if (!validateEmail(email.trim())) {
      setError("Please enter a valid email address");
      return;
    }
    
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
        
        // Optional: Show SweetAlert notification
        Swal.fire({
          title: 'Email Sent',
          text: 'Check your inbox for password reset instructions',
          icon: 'success',
          confirmButtonText: 'OK'
        });
      } else {
        setError(data.message || "There was a problem sending the reset email");
      }
    } catch (error) {
      setError(error.message || "An error occurred. Please try again.");
      
      // Optional: Show SweetAlert error notification
      Swal.fire({
        title: 'Error',
        text: error.message || "An error occurred. Please try again.",
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTryAgain = () => {
    setIsEmailSent(false);
    setError(null);
    setEmail("");
  };

  return {
    email,
    setEmail,
    isEmailSent,
    isLoading,
    error,
    setError,
    handleSubmit,
    handleTryAgain
  };
}