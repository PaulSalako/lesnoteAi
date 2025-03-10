import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ManageClass.css';

function ManageClasses() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [classes, setClasses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingClassId, setDeletingClassId] = useState(null);
  const [editingClass, setEditingClass] = useState(null);
  const [newClassName, setNewClassName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isStaff, setIsStaff] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newClass, setNewClass] = useState({ name: '' });
  const [formError, setFormError] = useState('');

  const token = localStorage.getItem('token') || sessionStorage.getItem('token');

  // First check for token and redirect if not present
  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [navigate, token]);

  // Check for admin privileges before showing any content
  useEffect(() => {
    const checkUserAccess = async () => {
      if (!token) return; // Skip if no token (handled by previous useEffect)
      
      try {
        const response = await fetch('https://localhost:7225/api/Dashboard/stats', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          // Don't show error, just redirect
          navigate('/dashboard');
          return;
        }
        
        const userData = await response.json();
        
        // Check if user is admin (roleId === 1) or staff (roleId === 2)
        if (userData.roleId === 1) {
          setIsAdmin(true);
          // Don't fetch classes here - will be handled by the next useEffect
        } else {
          // Redirect users without permissions immediately to dashboard
          navigate('/dashboard');
        }
      } catch (error) {
        // Don't show error, just redirect on any error
        navigate('/dashboard');
      }
    };
    
    if (token) {
      checkUserAccess();
    }
  }, [navigate, token]); // Removed currentPage dependency

  // Only fetch classes when pagination changes AND user is confirmed admin/staff
  useEffect(() => {
    if (token && isAdmin && currentPage) {
      fetchClasses(currentPage);
    }
  }, [currentPage, pageSize, token, isAdmin, searchTerm]);

  const fetchClasses = async (page) => {
    try {
      setLoading(true);
      const response = await fetch(`https://localhost:7225/api/Class?page=${page}&pageSize=${pageSize}&search=${searchTerm}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        // Try to parse error message
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch classes');
      }

      const result = await response.json();
      
      // Set classes
      setClasses(result.classes);
      setTotalPages(result.pagination.totalPages);
      setTotalCount(result.pagination.totalCount);
    } catch (error) {
      console.error('Error fetching classes:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClass = async () => {
    if (!newClass.name.trim()) {
      setFormError('Class name is required');
      return;
    }

    try {
      const response = await fetch('https://localhost:7225/api/Class', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: newClass.name.trim() })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create class');
      }

      // Show success message
      alert('Class created successfully');
      
      // Reset form and close modal
      setNewClass({ name: '' });
      setFormError('');
      setShowAddModal(false);
      
      // Refresh the first page
      setCurrentPage(1);
      fetchClasses(1);

    } catch (error) {
      console.error('Error creating class:', error);
      setFormError(error.message || 'Failed to create class. Please try again.');
    }
  };

  const handleEditClass = async () => {
    if (!editingClass || !newClassName.trim()) {
      setFormError('Class name is required');
      return;
    }

    try {
      const response = await fetch(`https://localhost:7225/api/Class/${editingClass.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: newClassName.trim() })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update class');
      }

      // Show success message
      alert('Class updated successfully');
      
      // Reset form and close modal
      setEditingClass(null);
      setNewClassName('');
      setFormError('');
      setShowEditModal(false);
      
      // Refresh the current page
      fetchClasses(currentPage);

    } catch (error) {
      console.error('Error updating class:', error);
      setFormError(error.message || 'Failed to update class. Please try again.');
    }
  };

  const handleDelete = async (classId) => {
    // Only admin can delete classes
    if (!isAdmin) {
      alert('Only administrators can delete classes');
      return;
    }
    
    const isConfirmed = window.confirm('Are you sure you want to delete this class? This action cannot be undone and may affect content using this class.');
    
    if (!isConfirmed) {
      return;
    }

    setDeletingClassId(classId);

    try {
      const response = await fetch(`https://localhost:7225/api/Class/${classId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        // Try to parse error message
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete class');
      }

      // Show success message
      alert('Class deleted successfully');
      
      // If it's the last item on the current page, go to previous page
      if (classes.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      } else {
        // Otherwise, just refresh the current page
        fetchClasses(currentPage);
      }

    } catch (error) {
      console.error('Error deleting class:', error);
      alert(error.message || 'Failed to delete class. Please try again.');
    } finally {
      setDeletingClassId(null);
    }
  };

  const openEditModal = (classItem) => {
    setEditingClass(classItem);
    setNewClassName(classItem.name);
    setFormError('');
    setShowEditModal(true);
  };

  const openAddModal = () => {
    setNewClass({ name: '' });
    setFormError('');
    setShowAddModal(true);
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
    // Reset to first page when searching
    setCurrentPage(1);
  };

  // Early return pattern: If not admin/staff or still checking, show minimal loading state
  if (!isAdmin) {
    return null; // Return nothing while checking access status or redirecting
  }

  if (loading && classes.length === 0) {
    return (
      <div className="loading-state">
        <i className="bi bi-arrow-clockwise spinning"></i>
        <p>Loading classes...</p>
      </div>
    );
  }

  if (error && classes.length === 0) {
    return (
      <div className="error-state">
        <i className="bi bi-exclamation-circle"></i>
        <p>{error}</p>
        <button onClick={() => fetchClasses(currentPage)} className="retry-button">
          <i className="bi bi-arrow-clockwise"></i> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="classes-page">
      <div className="classes-header">
        <h1>Manage Classes</h1>
        <div className="header-actions">
          <div className="search-bar">
            <i className="bi bi-search"></i>
            <input
              type="text"
              placeholder="Search classes..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <button className="add-class-btn" onClick={openAddModal}>
            <i className="bi bi-plus"></i> Add New Class
          </button>
        </div>
      </div>

      <div className="classes-table-container">
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

        {loading && classes.length > 0 && (
          <div className="table-loading-overlay">
            <i className="bi bi-arrow-clockwise spinning"></i>
          </div>
        )}

        <table className="classes-table">
          <thead>
            <tr>
              <th>S/N</th>
              <th>Class Name</th>
              <th>Created By</th>
              <th>Created Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {classes.length > 0 ? (
              classes.map((classItem, index) => (
                <tr key={classItem.id}>
                  <td>{((currentPage - 1) * pageSize) + index + 1}</td>
                  <td>{classItem.name}</td>
                  <td>{classItem.createdBy.name}</td>
                  <td>{new Date(classItem.createdAt).toLocaleDateString()}</td>
                  <td className="actions-cell">
                    <button 
                      className="edit-btn"
                      onClick={() => openEditModal(classItem)}
                    >
                      <i className="bi bi-pencil"></i>
                    </button>
                    {isAdmin && (
                      <button 
                        className={`delete-btn ${deletingClassId === classItem.id ? 'deleting' : ''}`}
                        onClick={() => handleDelete(classItem.id)}
                        disabled={deletingClassId === classItem.id}
                      >
                        <i className={`bi ${deletingClassId === classItem.id ? 'bi-hourglass-split' : 'bi-trash'}`}></i>
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="empty-state">
                  <i className="bi bi-stack"></i>
                  <p>{searchTerm ? 'No matches found' : 'No classes found'}</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {classes.length > 0 && (
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

      {/* Add Class Modal */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add New Class</h2>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="modal-body">
              {formError && <div className="form-error">{formError}</div>}
              <div className="form-group">
                <label htmlFor="className">Class Name</label>
                <input
                  type="text"
                  id="className"
                  value={newClass.name}
                  onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                  placeholder="e.g. Primary 1"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="save-btn" onClick={handleAddClass}>Add Class</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Class Modal */}
      {showEditModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Class</h2>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="modal-body">
              {formError && <div className="form-error">{formError}</div>}
              <div className="form-group">
                <label htmlFor="editClassName">Class Name</label>
                <input
                  type="text"
                  id="editClassName"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="e.g. Primary 1"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowEditModal(false)}>Cancel</button>
              <button className="save-btn" onClick={handleEditClass}>Update Class</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageClasses;