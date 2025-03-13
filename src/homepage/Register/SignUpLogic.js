// src/components/SignUpLogic.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";


export function useSignUp() {
  const navigate = useNavigate();
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    email: "",
    password: ""
  });
  
  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    email: "",
    password: "",
    terms: "",
    general: ""
  });
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleTermsChange = (e) => {
    setAgreedToTerms(e.target.checked);
    // Clear terms error when checkbox is checked
    if (e.target.checked) {
      setErrors(prev => ({ ...prev, terms: "" }));
    }
  };

  const validateField = (name, value) => {
    const nameRegex = /^[a-zA-Z\s-]+$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/;
    
    switch (name) {
      case "firstName":
        if (!value.trim()) return "First name is required";
        if (!nameRegex.test(value)) return "First name can only contain letters, spaces, and hyphens";
        return "";
      case "lastName":
        if (!value.trim()) return "Last name is required";
        if (!nameRegex.test(value)) return "Last name can only contain letters, spaces, and hyphens";
        return "";
      case "middleName":
        if (value.trim() && !nameRegex.test(value)) 
          return "Middle name can only contain letters, spaces, and hyphens";
        return "";
      case "email":
        if (!value.trim()) return "Email is required";
        if (!emailRegex.test(value)) return "Invalid email format";
        return "";
      case "password":
        if (!value) return "Password is required";
        if (value.length < 8) return "Password must be at least 8 characters long";
        if (!passwordRegex.test(value)) 
          return "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character";
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
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;
    
    // Validate all required fields
    Object.keys(formData).forEach(field => {
      if (field !== 'middleName') {
        const error = validateField(field, formData[field]);
        if (error) {
          newErrors[field] = error;
          isValid = false;
        }
      }
    });
    
    // Validate middleName only if provided
    if (formData.middleName) {
      const error = validateField('middleName', formData.middleName);
      if (error) {
        newErrors.middleName = error;
        isValid = false;
      }
    }
    
    // Validate terms agreement
    if (!agreedToTerms) {
      newErrors.terms = "You must agree to the Terms of Service and Privacy Policy";
      isValid = false;
    }
    
    setErrors(prev => ({ ...prev, ...newErrors }));
    return isValid;
  };

  const submitSignup = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("FirstName", formData.firstName.trim());
      formDataToSend.append("Surname", formData.lastName.trim());
      
      if (formData.middleName) {
        formDataToSend.append("MiddleName", formData.middleName.trim());
      }
      
      formDataToSend.append("Email", formData.email.trim().toLowerCase());
      formDataToSend.append("Password", formData.password);
      
      const response = await fetch("https://localhost:7225/api/Auth/Register", {
        method: "POST",
        body: formDataToSend
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        if (result.errors) {
          const newErrors = {};
          Object.entries(result.errors).forEach(([key, value]) => {
            const fieldName = key.charAt(0).toLowerCase() + key.slice(1);
            newErrors[fieldName] = value[0];
          });
          setErrors(prev => ({ ...prev, ...newErrors }));
          return;
        }
        
        if (result.message === "Email already exists") {
          setErrors(prev => ({
            ...prev,
            email: "This email is already registered"
          }));
          
          // Optional: Show SweetAlert for email already exists
          Swal.fire({
            title: 'Account Already Exists',
            text: 'This email is already registered. Please sign in instead.',
            icon: 'warning',
            confirmButtonText: 'OK'
          });
          return;
        }
        
        throw new Error(result.message || "Registration failed");
      }
      
      if (result.success) {
        localStorage.setItem("userId", result.userId);
        localStorage.setItem("expiresAt", result.expiresAt);
        localStorage.setItem("email", formData.email.trim().toLowerCase());
        
        // Optional: Show success message with SweetAlert
        Swal.fire({
          title: 'Account Created!',
          text: 'Please check your email to verify your account.',
          icon: 'success',
          confirmButtonText: 'Continue'
        }).then(() => {
          navigate("/verify-email");
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        general: error.message || "An error occurred during registration"
      }));
      
      // Optional: Show error with SweetAlert
      Swal.fire({
        title: 'Registration Failed',
        text: error.message || "An error occurred during registration. Please try again.",
        icon: 'error',
        confirmButtonText: 'Try Again'
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    errors,
    loading,
    passwordVisible,
    agreedToTerms,
    setPasswordVisible,
    handleInputChange,
    handleTermsChange,
    submitSignup
  };
}