// src/components/VerifyEmailLogic.js
import { API_URL } from '../../config';
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";


export function useVerifyEmail() {
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

  // Check if user is authenticated, redirect if not
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      navigate("/sign-in");
    }
  }, [navigate]);

  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length <= 6) setCode(value);
  };

  const handleResendCode = async () => {
    setLoading(true);
    try {
      const email = localStorage.getItem("email");
      
      const response = await fetch(`${API_URL}/Auth/resend-verification`, {
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
      
      // Optional: Show success message with SweetAlert
      Swal.fire({
        title: 'Code Sent',
        text: `New verification code has been sent to your email.`,
        icon: 'success',
        confirmButtonText: 'OK'
      });
    } catch (err) {
      setError(err.message);
      
      // Optional: Show error with SweetAlert
      Swal.fire({
        title: 'Error',
        text: err.message,
        icon: 'error',
        confirmButtonText: 'OK'
      });
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
      
      const response = await fetch(`${API_URL}/Auth/verify-email`, {
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
        
        // Optional: Show success message with SweetAlert
        Swal.fire({
          title: 'Email Verified',
          text: 'Your email has been successfully verified!',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        }).then(() => {
          navigate("/sign-in");
        });
      }
    } catch (err) {
      // Error is already handled above
    } finally {
      setLoading(false);
    }
  };

  return {
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
  };
}