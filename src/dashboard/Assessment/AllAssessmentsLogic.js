// src/components/AllAssessmentsLogic.js
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

export function useAllAssessments() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingAssessmentId, setDeletingAssessmentId] = useState(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const token = localStorage.getItem('token') || sessionStorage.getItem('token');

  // Memoized filtered assessments to prevent unnecessary recalculations
  const filteredAssessments = useMemo(() => {
    return assessments.filter(assessment =>
      assessment.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assessment.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (assessment.assessmentType && assessment.assessmentType.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [assessments, searchTerm]);

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

  useEffect(() => {
    if (token) {
      fetchAssessments(currentPage);
    }
  }, [currentPage, pageSize, token]);

  const fetchAssessments = async (page) => {
    try {
      setLoading(true);
      const response = await fetch(`https://localhost:7225/api/Assessments?page=${page}&pageSize=${pageSize}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        // Try to parse error message
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch assessments');
      }

      const result = await response.json();
      
      // Set assessments
      setAssessments(result.data);
      setTotalPages(result.totalPages);
      setTotalCount(result.totalCount);
    } catch (error) {
      console.error('Error fetching assessments:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (assessmentId) => {
    const isConfirmed = window.confirm('Are you sure you want to delete this assessment? This action cannot be undone.');
    
    if (!isConfirmed) {
      return;
    }

    setDeletingAssessmentId(assessmentId);

    try {
      const response = await fetch(`https://localhost:7225/api/Assessments/${assessmentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        // Try to parse error message
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete assessment');
      }

      // Show success message
      Swal.fire({
        title: 'Success',
        text: 'Assessment deleted successfully',
        icon: 'success',
        confirmButtonText: 'OK'
      });
      
      // If it's the last item on the current page, go to previous page
      if (filteredAssessments.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      } else {
        // Otherwise, just refresh the current page
        fetchAssessments(currentPage);
      }

    } catch (error) {
      console.error('Error deleting assessment:', error);
      
      Swal.fire({
        title: 'Error',
        text: error.message || 'Failed to delete assessment. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setDeletingAssessmentId(null);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handlePageSizeChange = (event) => {
    const newSize = parseInt(event.target.value);
    setPageSize(newSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleRetry = () => {
    fetchAssessments(currentPage);
  };

  const navigateToCreateAssessment = () => {
    navigate('/dashboard/assessment');
  };

  const navigateToViewAssessment = (assessmentId) => {
    navigate(`/dashboard/lesson-assessment-chat/${assessmentId}`);
  };

  return {
    loading,
    error,
    filteredAssessments,
    searchTerm,
    currentPage,
    totalPages,
    pageSize,
    totalCount,
    deletingAssessmentId,
    handleSearch,
    handleDelete,
    handlePageChange,
    handlePageSizeChange,
    handleRetry,
    navigateToCreateAssessment,
    navigateToViewAssessment
  };
}