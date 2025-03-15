// src/components/LoginLogic.js
import { API_URL } from '../../config';
import { useState } from "react";
import { useNavigate } from "react-router-dom";



export function useLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    general: ""
  });
  
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  // Validate email format
  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  // Validate form fields
  const validateField = (name, value) => {
    switch (name) {
      case "email":
        if (!value.trim()) return "Email is required";
        if (!validateEmail(value)) return "Invalid email format";
        return "";
      case "password":
        if (!value) return "Password is required";
        if (value.length < 6) return "Password must be at least 6 characters";
        return "";
      default:
        return "";
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    setErrors(prev => ({
      ...prev,
      [name]: "",
      general: ""
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;
    
    // Check each field
    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });
    
    setErrors(prev => ({ ...prev, ...newErrors }));
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // First check if the form is valid
    if (!validateForm()) {
      return; // Stop if validation fails
    }
    
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/Auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.requiresVerification) {
          // Store email for verification page
          localStorage.setItem("email", data.email);
          
          Swal.fire({
            title: 'Email Verification Required',
            text: 'Please verify your email before logging in',
            icon: 'info',
            confirmButtonText: 'Verify Now'
          }).then(() => {
            navigate("/verify-email");
          });
          return;
        }
        
        // Handle specific error cases
        if (data.message === "Invalid credentials") {
          setErrors(prev => ({
            ...prev,
            general: "Invalid email or password"
          }));
          return;
        }
        
        throw new Error(data.message || "Login failed");
      }

      if (data.success) {
        // Store token and user data based on remember me option
        const token = data.token;
        if (rememberMe) {
          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(data.user));
        } else {
          sessionStorage.setItem("token", token);
          sessionStorage.setItem("user", JSON.stringify(data.user));
        }

        // Show success message
        Swal.fire({
          title: 'Login Successful!',
          text: 'Welcome back to LesNoteAI',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        }).then(() => {
          // Navigate to dashboard
          navigate("/dashboard");
        });
      }
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        general: error.message || "An error occurred during login"
      }));
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    errors,
    passwordVisible,
    rememberMe,
    loading,
    setPasswordVisible,
    setRememberMe,
    handleInputChange,
    handleSubmit
  };
}