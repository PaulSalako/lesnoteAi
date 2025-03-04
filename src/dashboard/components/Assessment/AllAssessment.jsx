import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './AllAssessment.css';

function AllAssessments() {
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
          navigate('/login');
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
      alert('Assessment deleted successfully');
      
      // If it's the last item on the current page, go to previous page
      if (filteredAssessments.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      } else {
        // Otherwise, just refresh the current page
        fetchAssessments(currentPage);
      }

    } catch (error) {
      console.error('Error deleting assessment:', error);
      alert(error.message || 'Failed to delete assessment. Please try again.');
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

  if (loading) {
    return (
      <div className="loading-state">
        <i className="bi bi-arrow-clockwise spinning"></i>
        <p>Loading assessments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        <i className="bi bi-exclamation-circle"></i>
        <p>{error}</p>
        <button onClick={() => fetchAssessments(currentPage)} className="retry-button">
          <i className="bi bi-arrow-clockwise"></i> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="assessments-page">
      <div className="assessments-header">
        <h1>My Assessments</h1>
        <div className="header-actions">
          <div className="search-bar">
            <i className="bi bi-search"></i>
            <input
              type="text"
              placeholder="Search assessments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            className="new-assessment-btn"
            onClick={() => navigate('/dashboard/assessment')}
          >
            <i className="bi bi-plus-lg"></i>
            New Assessment
          </button>
        </div>
      </div>

      <div className="assessments-table-container">
        <div className="table-controls">
          <div className="page-size-selector">
            <label>Show</label>
            <select value={pageSize} onChange={handlePageSizeChange}>
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <label>entries</label>
          </div>
        </div>

        <table className="assessments-table">
          <thead>
            <tr>
              <th>S/N</th>
              <th>Subject</th>
              <th>Topic</th>
              <th>Type</th>
              <th>Class</th>
              <th>Duration</th>
              <th>Created Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAssessments.length > 0 ? (
              filteredAssessments.map((assessment, index) => (
                <tr key={assessment.id}>
                  <td>{((currentPage - 1) * pageSize) + index + 1}</td>
                  <td>{assessment.subject}</td>
                  <td>{assessment.topic}</td>
                  <td>
                    <span className="assessment-type-badge">
                      {assessment.assessmentType}
                    </span>
                  </td>
                  <td>{assessment.class_}</td>
                  <td>{assessment.duration}</td>
                  <td>{new Date(assessment.createdAt).toLocaleDateString()}</td>
                  <td className="actions-cell">
                    <button 
                      className="view-btn"
                      onClick={() => navigate(`/dashboard/lesson-assessment-chat/${assessment.id}`)}
                    >
                      <i className="bi bi-eye"></i>
                    </button>
                    <button 
                      className={`delete-btn ${deletingAssessmentId === assessment.id ? 'deleting' : ''}`}
                      onClick={() => handleDelete(assessment.id)}
                      disabled={deletingAssessmentId === assessment.id}
                    >
                      <i className={`bi ${deletingAssessmentId === assessment.id ? 'bi-hourglass-split' : 'bi-trash'}`}></i>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="empty-state">
                  <i className="bi bi-clipboard-check"></i>
                  <p>{searchTerm ? 'No matches found' : 'No assessments yet'}</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {assessments.length > 0 && (
          <div className="pagination-controls">
            <div className="pagination-info">
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} entries
            </div>
            <div className="pagination-buttons">
              <button 
                onClick={() => handlePageChange(1)} 
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                <i className="bi bi-chevron-double-left"></i>
              </button>
              <button 
                onClick={() => handlePageChange(currentPage - 1)} 
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                <i className="bi bi-chevron-left"></i>
              </button>
              <span className="page-info">Page {currentPage} of {totalPages}</span>
              <button 
                onClick={() => handlePageChange(currentPage + 1)} 
                disabled={currentPage === totalPages}
                className="pagination-btn"
              >
                <i className="bi bi-chevron-right"></i>
              </button>
              <button 
                onClick={() => handlePageChange(totalPages)} 
                disabled={currentPage === totalPages}
                className="pagination-btn"
              >
                <i className="bi bi-chevron-double-right"></i>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AllAssessments;