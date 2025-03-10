import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ManageSubject.css';

function ManageSubjects() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredClass, setFilteredClass] = useState('');
  const [deletingSubjectId, setDeletingSubjectId] = useState(null);
  const [editingSubject, setEditingSubject] = useState(null);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newSubjectData, setNewSubjectData] = useState({
    classId: '',
    subjectCount: 1,
    subjectNames: ['']
  });
  const [formError, setFormError] = useState('');

  const token = localStorage.getItem('token') || sessionStorage.getItem('token');

  // First check for token and redirect if not present
  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [navigate, token]);

  // Then check for admin privileges before showing any content
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
        
        // Check if user is admin (roleId === 1)
        if (userData.roleId === 1) {
          setIsAdmin(true);
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
  }, [navigate, token]);

  // Fetch classes once on component mount
  useEffect(() => {
    if (token && isAdmin) {
      fetchClasses();
    }
  }, [token, isAdmin]);

  // Fetch subjects when pagination, filter or search changes
  useEffect(() => {
    if (token && isAdmin) {
      fetchSubjects(currentPage);
    }
  }, [currentPage, pageSize, filteredClass, token, isAdmin]);

  const fetchClasses = async () => {
    try {
      const response = await fetch('https://localhost:7225/api/Class/all', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch classes');
      }
  
      const result = await response.json();
      setClasses(result);
      
      // Set default class for new subject form
      if (result.length > 0) {
        setNewSubjectData(prev => ({ ...prev, classId: result[0].id }));
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchSubjects = async (page) => {
    try {
      setLoading(true);
      let url = `https://localhost:7225/api/Subject?page=${page}&pageSize=${pageSize}`;
      
      if (filteredClass) {
        url += `&classId=${filteredClass}`;
      }
      
      if (searchTerm) {
        url += `&search=${searchTerm}`;
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        // Try to parse error message
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch subjects');
      }

      const result = await response.json();
      
      // Set subjects
      setSubjects(result.subjects);
      setTotalPages(result.pagination.totalPages);
      setTotalCount(result.pagination.totalCount);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubjects = async () => {
    // Validate inputs
    if (!newSubjectData.classId) {
      setFormError('Please select a class');
      return;
    }

    // Filter out empty subject names
    const subjectNames = newSubjectData.subjectNames.filter(name => name.trim() !== '');
    
    if (subjectNames.length === 0) {
      setFormError('At least one subject name is required');
      return;
    }

    try {
      const response = await fetch('https://localhost:7225/api/Subject/batch', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          classId: newSubjectData.classId,
          subjectNames: subjectNames
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Special handling for existing subjects
        if (errorData.existingSubjects && errorData.existingSubjects.length > 0) {
          setFormError(`The following subjects already exist: ${errorData.existingSubjects.join(', ')}`);
          return;
        }
        
        throw new Error(errorData.message || 'Failed to create subjects');
      }

      // Show success message
      const result = await response.json();
      alert(result.message || 'Subjects created successfully');
      
      // Reset form and close modal
      setNewSubjectData({
        classId: classes.length > 0 ? classes[0].id : '',
        subjectCount: 1,
        subjectNames: ['']
      });
      setFormError('');
      setShowAddModal(false);
      
      // Refresh the first page
      setCurrentPage(1);
      fetchSubjects(1);

    } catch (error) {
      console.error('Error creating subjects:', error);
      setFormError(error.message || 'Failed to create subjects. Please try again.');
    }
  };

  const handleEditSubject = async () => {
    if (!editingSubject || !newSubjectName.trim()) {
      setFormError('Subject name is required');
      return;
    }

    try {
      const response = await fetch(`https://localhost:7225/api/Subject/${editingSubject.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: newSubjectName.trim() })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update subject');
      }

      // Show success message
      alert('Subject updated successfully');
      
      // Reset form and close modal
      setEditingSubject(null);
      setNewSubjectName('');
      setFormError('');
      setShowEditModal(false);
      
      // Refresh the current page
      fetchSubjects(currentPage);

    } catch (error) {
      console.error('Error updating subject:', error);
      setFormError(error.message || 'Failed to update subject. Please try again.');
    }
  };

  const handleDelete = async (subjectId) => {
    // Only admin can delete subjects
    if (!isAdmin) {
      alert('Only administrators can delete subjects');
      return;
    }
    
    const isConfirmed = window.confirm('Are you sure you want to delete this subject? This action cannot be undone and may affect content using this subject.');
    
    if (!isConfirmed) {
      return;
    }

    setDeletingSubjectId(subjectId);

    try {
      const response = await fetch(`https://localhost:7225/api/Subject/${subjectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        // Try to parse error message
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete subject');
      }

      // Show success message
      alert('Subject deleted successfully');
      
      // If it's the last item on the current page, go to previous page
      if (subjects.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      } else {
        // Otherwise, just refresh the current page
        fetchSubjects(currentPage);
      }

    } catch (error) {
      console.error('Error deleting subject:', error);
      alert(error.message || 'Failed to delete subject. Please try again.');
    } finally {
      setDeletingSubjectId(null);
    }
  };

  const openEditModal = (subject) => {
    setEditingSubject(subject);
    setNewSubjectName(subject.name);
    setFormError('');
    setShowEditModal(true);
  };

  const openAddModal = () => {
    setNewSubjectData({
      classId: classes.length > 0 ? classes[0].id : '',
      subjectCount: 1,
      subjectNames: ['']
    });
    setFormError('');
    setShowAddModal(true);
  };

  const handleSubjectCountChange = (count) => {
    // Convert string to number and ensure it's at least 1
    const newCount = Math.max(1, parseInt(count) || 1);
    
    // Update subject names array size
    const currentNames = [...newSubjectData.subjectNames];
    const newNames = Array(newCount).fill('').map((_, i) => currentNames[i] || '');
    
    setNewSubjectData({
      ...newSubjectData,
      subjectCount: newCount,
      subjectNames: newNames
    });
  };

  const handleSubjectNameChange = (index, value) => {
    const updatedNames = [...newSubjectData.subjectNames];
    updatedNames[index] = value;
    setNewSubjectData({
      ...newSubjectData,
      subjectNames: updatedNames
    });
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

  const handleSearch = () => {
    setCurrentPage(1); // Reset to first page when searching
    fetchSubjects(1);
  };

  const handleClassFilter = (classId) => {
    setFilteredClass(classId);
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Early return pattern: If not admin or still checking, show minimal loading state
  if (!isAdmin) {
    return null; // Return nothing while checking access status or redirecting
  }

  if (loading && subjects.length === 0) {
    return (
      <div className="loading-state">
        <i className="bi bi-arrow-clockwise spinning"></i>
        <p>Loading subjects...</p>
      </div>
    );
  }

  if (error && subjects.length === 0) {
    return (
      <div className="error-state">
        <i className="bi bi-exclamation-circle"></i>
        <p>{error}</p>
        <button onClick={() => fetchSubjects(currentPage)} className="retry-button">
          <i className="bi bi-arrow-clockwise"></i> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="subjects-page">
      <header className="subjects-header">
        <h1>Manage Subjects</h1>
        <div className="header-controls">
          <div className="filter-group">
            <label>Filter by Class:</label>
            <div className="select-wrapper">
              <select 
                value={filteredClass} 
                onChange={(e) => handleClassFilter(e.target.value)}
                className="class-select"
              >
                <option value="">All Classes</option>
                {classes.map(classItem => (
                  <option key={classItem.id} value={classItem.id}>
                    {classItem.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="search-group">
            <div className="search-input-wrapper">
              <input
                type="text"
                placeholder="Search subjects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="search-input"
              />
              <button className="search-button" onClick={handleSearch}>
                <i className="bi bi-search"></i>
              </button>
            </div>
          </div>
          <button className="add-button" onClick={openAddModal}>
            <i className="bi bi-plus"></i> Add Subjects
          </button>
        </div>
      </header>

      <main className="subjects-content">
        <div className="table-controls">
          <div className="entries-selector">
            <label>Show</label>
            <div className="select-wrapper entries-select-wrapper">
              <select value={pageSize} onChange={handlePageSizeChange} className="entries-select">
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
            <label>entries</label>
          </div>
        </div>

        <div className="table-container">
          {loading && subjects.length > 0 && (
            <div className="loading-overlay">
              <i className="bi bi-arrow-clockwise spinning"></i>
            </div>
          )}

          <table className="subjects-table">
            <thead>
              <tr>
                <th>S/N</th>
                <th>Subject Name</th>
                <th>Class</th>
                <th>Created By</th>
                <th>Created Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subjects.length > 0 ? (
                subjects.map((subject, index) => (
                  <tr key={subject.id}>
                    <td>{((currentPage - 1) * pageSize) + index + 1}</td>
                    <td>{subject.name}</td>
                    <td>{subject.className}</td>
                    <td>{subject.createdBy.name}</td>
                    <td>{new Date(subject.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="edit-button"
                          onClick={() => openEditModal(subject)}
                          title="Edit Subject"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        {isAdmin && (
                          <button 
                            className={`delete-button ${deletingSubjectId === subject.id ? 'deleting' : ''}`}
                            onClick={() => handleDelete(subject.id)}
                            disabled={deletingSubjectId === subject.id}
                            title="Delete Subject"
                          >
                            <i className={`bi ${deletingSubjectId === subject.id ? 'bi-hourglass-split' : 'bi-trash'}`}></i>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="empty-state">
                    <div className="empty-content">
                      <i className="bi bi-book"></i>
                      <p>{searchTerm || filteredClass ? 'No matches found' : 'No subjects found'}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {subjects.length > 0 && (
          <div className="pagination">
            <div className="pagination-info">
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} entries
            </div>
            <div className="pagination-controls">
              <button 
                onClick={() => handlePageChange(1)} 
                disabled={currentPage === 1}
                className="pagination-button"
                title="First Page"
              >
                <i className="bi bi-chevron-double-left"></i>
              </button>
              <button 
                onClick={() => handlePageChange(currentPage - 1)} 
                disabled={currentPage === 1}
                className="pagination-button"
                title="Previous Page"
              >
                <i className="bi bi-chevron-left"></i>
              </button>
              <span className="page-indicator">Page {currentPage} of {totalPages}</span>
              <button 
                onClick={() => handlePageChange(currentPage + 1)} 
                disabled={currentPage === totalPages}
                className="pagination-button"
                title="Next Page"
              >
                <i className="bi bi-chevron-right"></i>
              </button>
              <button 
                onClick={() => handlePageChange(totalPages)} 
                disabled={currentPage === totalPages}
                className="pagination-button"
                title="Last Page"
              >
                <i className="bi bi-chevron-double-right"></i>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Add Subjects Modal - Fixed positioning */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal add-modal">
            <div className="modal-header">
              <h2>Add Subjects</h2>
              <button className="close-modal-button" onClick={() => setShowAddModal(false)}>
                <i className="bi bi-x"></i>
              </button>
            </div>
            <div className="modal-body">
              {formError && <div className="form-error-message">{formError}</div>}
              
              <div className="form-group">
                <label htmlFor="classSelect">Select Class</label>
                <div className="select-wrapper modal-select-wrapper">
                  <select
                    id="classSelect"
                    value={newSubjectData.classId}
                    onChange={(e) => setNewSubjectData({...newSubjectData, classId: e.target.value})}
                    className="modal-select"
                  >
                    {classes.length > 0 ? (
                      <>
                        {/* Primary Classes */}
                        <optgroup label="Primary Classes">
                          {classes
                            .filter(classItem => classItem.name.toLowerCase().includes('primary') || classItem.name.match(/^p\d/i))
                            .map(classItem => (
                              <option key={classItem.id} value={classItem.id}>
                                {classItem.name}
                              </option>
                            ))
                          }
                        </optgroup>
                        
                        {/* JSS Classes */}
                        <optgroup label="Junior Secondary School">
                          {classes
                            .filter(classItem => classItem.name.toLowerCase().includes('jss') || classItem.name.toLowerCase().includes('junior'))
                            .map(classItem => (
                              <option key={classItem.id} value={classItem.id}>
                                {classItem.name}
                              </option>
                            ))
                          }
                        </optgroup>
                        
                        {/* SSS Classes */}
                        <optgroup label="Senior Secondary School">
                          {classes
                            .filter(classItem => classItem.name.toLowerCase().includes('sss') || classItem.name.toLowerCase().includes('senior'))
                            .map(classItem => (
                              <option key={classItem.id} value={classItem.id}>
                                {classItem.name}
                              </option>
                            ))
                          }
                        </optgroup>
                        
                        {/* Other Classes (if any) */}
                        {classes.filter(classItem => 
                          !classItem.name.toLowerCase().includes('primary') && 
                          !classItem.name.match(/^p\d/i) &&
                          !classItem.name.toLowerCase().includes('jss') && 
                          !classItem.name.toLowerCase().includes('junior') &&
                          !classItem.name.toLowerCase().includes('sss') && 
                          !classItem.name.toLowerCase().includes('senior')
                        ).length > 0 && (
                          <optgroup label="Other Classes">
                            {classes
                              .filter(classItem => 
                                !classItem.name.toLowerCase().includes('primary') && 
                                !classItem.name.match(/^p\d/i) &&
                                !classItem.name.toLowerCase().includes('jss') && 
                                !classItem.name.toLowerCase().includes('junior') &&
                                !classItem.name.toLowerCase().includes('sss') && 
                                !classItem.name.toLowerCase().includes('senior')
                              )
                              .map(classItem => (
                                <option key={classItem.id} value={classItem.id}>
                                  {classItem.name}
                                </option>
                              ))
                            }
                          </optgroup>
                        )}
                      </>
                    ) : (
                      <option value="">No classes available</option>
                    )}
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="subjectCount">Number of Subjects</label>
                <input
                  type="number"
                  id="subjectCount"
                  min="1"
                  max="20"
                  value={newSubjectData.subjectCount}
                  onChange={(e) => handleSubjectCountChange(e.target.value)}
                  className="subject-count-input"
                />
              </div>
              
              <div className="subject-names-section">
                <h3>Subject Names</h3>
                {newSubjectData.subjectNames.map((subjectName, index) => (
                  <div className="form-group subject-input-row" key={index}>
                    <label htmlFor={`subject-${index}`}>Subject {index + 1}</label>
                    <input
                      type="text"
                      id={`subject-${index}`}
                      value={subjectName}
                      onChange={(e) => handleSubjectNameChange(index, e.target.value)}
                      placeholder="Enter subject name"
                      className="subject-name-input"
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-button" onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
              <button className="save-button" onClick={handleAddSubjects}>
                Add Subjects
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Subject Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal edit-modal">
            <div className="modal-header">
              <h2>Edit Subject</h2>
              <button className="close-modal-button" onClick={() => setShowEditModal(false)}>
                <i className="bi bi-x"></i>
              </button>
            </div>
            <div className="modal-body">
              {formError && <div className="form-error-message">{formError}</div>}
              <div className="form-group">
                <label htmlFor="editSubjectName">Subject Name</label>
                <input
                  type="text"
                  id="editSubjectName"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  placeholder="Enter subject name"
                  className="subject-name-input"
                />
              </div>
              <div className="form-info">
                <p><strong>Class:</strong> {editingSubject?.className}</p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-button" onClick={() => setShowEditModal(false)}>
                Cancel
              </button>
              <button className="save-button" onClick={handleEditSubject}>
                Update Subject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageSubjects;