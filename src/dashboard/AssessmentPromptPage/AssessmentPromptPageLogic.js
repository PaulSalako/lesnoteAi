// src/dashboard/components/AssessmentPromptPage/AssessmentPromptPageLogic.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function useAssessmentPrompt() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    subject: '',
    topic: '',
    class: '',
    assessmentType: 'Quiz', // Default value
    duration: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Check for premium user on component mount
  useEffect(() => {
    const checkUserPremiumStatus = async () => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        
        if (!token) {
          // If no token, redirect to login
          navigate('/sign-in');
          return;
        }
        
        // Using the dashboard/stats endpoint to check plan status
        const response = await fetch('https://localhost:7225/api/Dashboard/stats', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        
        const userData = await response.json();
        
        // Check if user is premium (plan === 1)
        if (userData.plan !== 1) {
          // Redirect non-premium users back to dashboard
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Error checking premium status:', error);
        // Redirect to dashboard on any error
        navigate('/dashboard');
      }
    };
    
    checkUserPremiumStatus();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      
      console.log("Using token:", token);
      
      const response = await fetch('https://localhost:7225/api/Assessments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subject: formData.subject,
          topic: formData.topic,
          class: formData.class,
          assessmentType: formData.assessmentType,
          duration: formData.duration,
          date: formData.date
        })
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        console.error('Error response:', responseData);
        throw new Error(responseData.message || 'Failed to create assessment');
      }
      
      console.log('Success response:', responseData);
      
      // Optional: Show success message
      if (typeof Swal !== 'undefined') {
        Swal.fire({
          title: 'Success!',
          text: 'Assessment is being generated...',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        }).then(() => {
          // Navigate to assessment view page with the assessment ID
          navigate(`/dashboard/lesson-assessment-chat/${responseData.data.assessmentId}`);
        });
      } else {
        // Navigate without SweetAlert
        navigate(`/dashboard/lesson-assessment-chat/${responseData.data.assessmentId}`);
      }
    } catch (error) {
      console.error('Error creating assessment:', error);
      setError(error.message || 'An error occurred while generating the assessment');
      
      // Optional: Show error with SweetAlert
      if (typeof Swal !== 'undefined') {
        Swal.fire({
          title: 'Error',
          text: error.message || 'An error occurred while generating the assessment',
          icon: 'error',
          confirmButtonText: 'Try Again'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Define assessment duration options
  const durationOptions = [10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 90, 120].map((minutes) => ({
    value: `${minutes} minutes`,
    label: `${minutes} minutes${
      minutes === 60 ? ' (1 hour)' : 
      minutes === 90 ? ' (1.5 hours)' : 
      minutes === 120 ? ' (2 hours)' : ''
    }`
  }));

  return {
    isLoading,
    error,
    formData,
    durationOptions,
    handleInputChange,
    handleSubmit
  };
}