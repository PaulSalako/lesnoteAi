import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ManageTheme.css'; // We'll create this CSS file similar to ManageSubject.css

function ManageThemes() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [themes, setThemes] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredClass, setFilteredClass] = useState('');
  const [filteredSubject, setFilteredSubject] = useState('');
  const [deletingThemeId, setDeletingThemeId] = useState(null);
  const [editingTheme, setEditingTheme] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newThemeData, setNewThemeData] = useState({
    classId: '',
    subjectId: '',
    themeCount: 1,
    startingThemeNumber: 1,
    themeNames: ['']
  });
  const [formError, setFormError] = useState('');

  const token = localStorage.getItem('token') || sessionStorage.getItem('token');

  // First check for token and redirect if not present
  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [navigate, token]);

  // Then check for admin or staff privileges before showing any content
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
        if (userData.roleId === 1 || userData.roleId === 2) {
          setIsAdmin(userData.roleId === 1); // Only true for admins
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
    if (token) {
      fetchClasses();
    }
  }, [token]);

  // Fetch themes when pagination, filter or search changes
  useEffect(() => {
    if (token) {
      fetchThemes(currentPage);
    }
  }, [currentPage, pageSize, filteredClass, filteredSubject, searchTerm, token]);

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
      
      // Set default class for new theme form
      if (result.length > 0) {
        setNewThemeData(prev => ({ 
          ...prev, 
          classId: result[0].id,
          themeCount: 1,
          startingThemeNumber: 1,
          themeNames: ['']
        }));
        // Fetch subjects for this class
        fetchSubjectsForClass(result[0].id);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchSubjectsForClass = async (classId) => {
    if (!classId) return;
    
    try {
      const response = await fetch(`https://localhost:7225/api/Subject/by-class/${classId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch subjects');
      }
  
      const result = await response.json();
      setSubjects(result);
      
      // Set default subject for new theme form if available
      if (result.length > 0) {
        setNewThemeData(prev => ({ ...prev, subjectId: result[0].id }));
      } else {
        setNewThemeData(prev => ({ ...prev, subjectId: '' }));
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setSubjects([]);
    }
  };

  const fetchThemes = async (page) => {
    try {
      setLoading(true);
      let url = `https://localhost:7225/api/Theme?page=${page}&pageSize=${pageSize}`;
      
      if (filteredClass) {
        url += `&classId=${filteredClass}`;
      }
      
      if (filteredSubject) {
        url += `&subjectId=${filteredSubject}`;
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
        throw new Error(errorData.message || 'Failed to fetch themes');
      }

      const result = await response.json();
      
      // Set themes
      setThemes(result.themes);
      setTotalPages(result.pagination.totalPages);
      setTotalCount(result.pagination.totalCount);
    } catch (error) {
      console.error('Error fetching themes:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddThemes = async () => {
    // Validate inputs
    if (!newThemeData.classId) {
      setFormError('Please select a class');
      return;
    }

    if (!newThemeData.subjectId) {
      setFormError('Please select a subject');
      return;
    }

    // Filter out empty theme names
    const themeNames = newThemeData.themeNames.filter(name => name.trim() !== '');
    
    if (themeNames.length === 0) {
      setFormError('At least one theme name is required');
      return;
    }

    if (!newThemeData.startingThemeNumber || newThemeData.startingThemeNumber < 1) {
      setFormError('Starting theme number must be at least 1');
      return;
    }

    try {
      // Create a batch of themes
      const requests = themeNames.map((themeName, index) => {
        const themeNumber = parseInt(newThemeData.startingThemeNumber) + index;
        return fetch('https://localhost:7225/api/Theme', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: themeName.trim(),
            themeNumber: themeNumber,
            classId: newThemeData.classId,
            subjectId: newThemeData.subjectId
          })
        });
      });

      // Execute all requests
      const responses = await Promise.allSettled(requests);
      
      // Check for failed requests
      const failedRequests = responses.filter(r => r.status === 'rejected' || !r.value.ok);
      
      if (failedRequests.length > 0) {
        // Get error messages from failed requests
        const errorMessages = await Promise.all(
          failedRequests.map(async (r) => {
            if (r.status === 'rejected') return r.reason.message;
            try {
              const errorData = await r.value.json();
              return errorData.message || 'Unknown error';
            } catch {
              return 'Failed to parse error';
            }
          })
        );
        
        throw new Error(`Some themes could not be created: ${errorMessages.join(', ')}`);
      }

      // Show success message
      alert(`${themeNames.length} theme(s) created successfully`);
      
      // Reset form and close modal
      setNewThemeData({
        classId: classes.length > 0 ? classes[0].id : '',
        subjectId: subjects.length > 0 ? subjects[0].id : '',
        themeCount: 1,
        startingThemeNumber: 1,
        themeNames: ['']
      });
      setFormError('');
      setShowAddModal(false);
      
      // Refresh the first page
      setCurrentPage(1);
      fetchThemes(1);

    } catch (error) {
      console.error('Error creating themes:', error);
      setFormError(error.message || 'Failed to create themes. Please try again.');
    }
  };

  const handleEditTheme = async () => {
    if (!editingTheme) {
      return;
    }

    if (!newThemeData.name || newThemeData.name.trim() === '') {
      setFormError('Theme name is required');
      return;
    }

    if (!newThemeData.themeNumber || newThemeData.themeNumber < 1) {
      setFormError('Theme number must be at least 1');
      return;
    }

    try {
      const response = await fetch(`https://localhost:7225/api/Theme/${editingTheme.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newThemeData.name.trim(),
          themeNumber: parseInt(newThemeData.themeNumber)
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update theme');
      }

      // Show success message
      alert('Theme updated successfully');
      
      // Reset form and close modal
      setEditingTheme(null);
      setFormError('');
      setShowEditModal(false);
      
      // Refresh the current page
      fetchThemes(currentPage);

    } catch (error) {
      console.error('Error updating theme:', error);
      setFormError(error.message || 'Failed to update theme. Please try again.');
    }
  };

  const handleDelete = async (themeId) => {
    // Only admin can delete themes
    if (!isAdmin) {
      alert('Only administrators can delete themes');
      return;
    }
    
    const isConfirmed = window.confirm('Are you sure you want to delete this theme? This action cannot be undone and may affect topics using this theme.');
    
    if (!isConfirmed) {
      return;
    }

    setDeletingThemeId(themeId);

    try {
      const response = await fetch(`https://localhost:7225/api/Theme/${themeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        // Try to parse error message
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete theme');
      }

      // Show success message
      alert('Theme deleted successfully');
      
      // If it's the last item on the current page, go to previous page
      if (themes.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      } else {
        // Otherwise, just refresh the current page
        fetchThemes(currentPage);
      }

    } catch (error) {
      console.error('Error deleting theme:', error);
      alert(error.message || 'Failed to delete theme. Please try again.');
    } finally {
      setDeletingThemeId(null);
    }
  };

  const openEditModal = (theme) => {
    setEditingTheme(theme);
    setNewThemeData({
      name: theme.name,
      themeNumber: theme.themeNumber,
      classId: theme.classId,
      subjectId: theme.subjectId
    });
    setFormError('');
    setShowEditModal(true);
  };

  const openAddModal = () => {
    setNewThemeData({
      classId: classes.length > 0 ? classes[0].id : '',
      subjectId: subjects.length > 0 ? subjects[0].id : '',
      themeCount: 1,
      startingThemeNumber: 1,
      themeNames: ['']
    });
    setFormError('');
    setShowAddModal(true);
  };
  
  const handleThemeCountChange = (count) => {
    // Convert string to number and ensure it's at least 1
    const newCount = Math.max(1, parseInt(count) || 1);
    
    // Update theme names array size
    const currentNames = [...newThemeData.themeNames];
    const newNames = Array(newCount).fill('').map((_, i) => currentNames[i] || '');
    
    setNewThemeData({
      ...newThemeData,
      themeCount: newCount,
      themeNames: newNames
    });
  };

  const handleThemeNameChange = (index, value) => {
    const updatedNames = [...newThemeData.themeNames];
    updatedNames[index] = value;
    setNewThemeData({
      ...newThemeData,
      themeNames: updatedNames
    });
  };

  const handleClassChange = (classId) => {
    setNewThemeData(prev => ({ ...prev, classId, subjectId: '' }));
    fetchSubjectsForClass(classId);
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
    fetchThemes(1);
  };

  const handleClassFilter = (classId) => {
    setFilteredClass(classId);
    setFilteredSubject(''); // Reset subject filter when class changes
    setCurrentPage(1); // Reset to first page when filtering
    
    // If a class is selected, fetch subjects for that class
    if (classId) {
      fetchSubjectsForClass(classId);
    } else {
      setSubjects([]);
    }
  };

  const handleSubjectFilter = (subjectId) => {
    setFilteredSubject(subjectId);
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Early return pattern: If still checking access, show minimal loading state
  if (loading && themes.length === 0) {
    return (
      <div className="loading-state">
        <i className="bi bi-arrow-clockwise spinning"></i>
        <p>Loading themes...</p>
      </div>
    );
  }

  if (error && themes.length === 0) {
    return (
      <div className="error-state">
        <i className="bi bi-exclamation-circle"></i>
        <p>{error}</p>
        <button onClick={() => fetchThemes(currentPage)} className="retry-button">
          <i className="bi bi-arrow-clockwise"></i> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="themes-page">
      <header className="themes-header">
        <h1>Manage Themes</h1>
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

          {filteredClass && (
            <div className="filter-group">
              <label>Filter by Subject:</label>
              <div className="select-wrapper">
                <select 
                  value={filteredSubject} 
                  onChange={(e) => handleSubjectFilter(e.target.value)}
                  className="subject-select"
                >
                  <option value="">All Subjects</option>
                  {subjects.map(subject => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="search-group">
            <div className="search-input-wrapper">
              <input
                type="text"
                placeholder="Search themes..."
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
            <i className="bi bi-plus"></i> Add Themes
          </button>
        </div>
      </header>

      <main className="themes-content">
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
          {loading && themes.length > 0 && (
            <div className="loading-overlay">
              <i className="bi bi-arrow-clockwise spinning"></i>
            </div>
          )}

          <table className="themes-table">
            <thead>
              <tr>
                <th>S/N</th>
                <th>Theme Number</th>
                <th>Theme Name</th>
                <th>Class</th>
                <th>Subject</th>
                <th>Created By</th>
                <th>Created Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {themes.length > 0 ? (
                themes.map((theme, index) => (
                  <tr key={theme.id}>
                    <td>{((currentPage - 1) * pageSize) + index + 1}</td>
                    <td>{theme.themeNumber}</td>
                    <td>{theme.name}</td>
                    <td>{theme.className}</td>
                    <td>{theme.subjectName}</td>
                    <td>{theme.createdBy.name}</td>
                    <td>{new Date(theme.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="edit-button"
                          onClick={() => openEditModal(theme)}
                          title="Edit Theme"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        {isAdmin && (
                          <button 
                            className={`delete-button ${deletingThemeId === theme.id ? 'deleting' : ''}`}
                            onClick={() => handleDelete(theme.id)}
                            disabled={deletingThemeId === theme.id}
                            title="Delete Theme"
                          >
                            <i className={`bi ${deletingThemeId === theme.id ? 'bi-hourglass-split' : 'bi-trash'}`}></i>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="empty-state">
                    <div className="empty-content">
                      <i className="bi bi-list-ol"></i>
                      <p>{searchTerm || filteredClass || filteredSubject ? 'No matches found' : 'No themes found'}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {themes.length > 0 && (
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

      {/* Add Themes Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal add-modal">
            <div className="modal-header">
              <h2>Add Themes</h2>
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
                    value={newThemeData.classId}
                    onChange={(e) => handleClassChange(e.target.value)}
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
                <label htmlFor="subjectSelect">Select Subject</label>
                <div className="select-wrapper modal-select-wrapper">
                  <select
                    id="subjectSelect"
                    value={newThemeData.subjectId}
                    onChange={(e) => setNewThemeData({...newThemeData, subjectId: e.target.value})}
                    className="modal-select"
                  >
                    {subjects.length > 0 ? (
                      subjects.map(subject => (
                        <option key={subject.id} value={subject.id}>
                          {subject.name}
                        </option>
                      ))
                    ) : (
                      <option value="">No subjects available</option>
                    )}
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="startingThemeNumber">Starting Theme Number</label>
                <input
                  type="number"
                  id="startingThemeNumber"
                  min="1"
                  value={newThemeData.startingThemeNumber}
                  onChange={(e) => setNewThemeData({...newThemeData, startingThemeNumber: e.target.value})}
                  className="subject-count-input"
                />
                <p className="form-help-text">The first theme will be numbered {newThemeData.startingThemeNumber}, and each subsequent theme will be numbered in sequence.</p>
              </div>
              
              <div className="form-group">
                <label htmlFor="themeCount">Number of Themes</label>
                <input
                  type="number"
                  id="themeCount"
                  min="1"
                  max="20"
                  value={newThemeData.themeCount}
                  onChange={(e) => handleThemeCountChange(e.target.value)}
                  className="subject-count-input"
                />
              </div>
              
              <div className="theme-names-section">
                <h3>Theme Names</h3>
                {newThemeData.themeNames.map((themeName, index) => (
                  <div className="form-group theme-input-row" key={index}>
                    <label htmlFor={`theme-${index}`}>Theme {parseInt(newThemeData.startingThemeNumber) + index}</label>
                    <input
                      type="text"
                      id={`theme-${index}`}
                      value={themeName}
                      onChange={(e) => handleThemeNameChange(index, e.target.value)}
                      placeholder="Enter theme name"
                      className="theme-name-input"
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-button" onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
              <button className="save-button" onClick={handleAddThemes}>
                Add Themes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Theme Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal edit-modal">
            <div className="modal-header">
              <h2>Edit Theme</h2>
              <button className="close-modal-button" onClick={() => setShowEditModal(false)}>
                <i className="bi bi-x"></i>
              </button>
            </div>
            <div className="modal-body">
              {formError && <div className="form-error-message">{formError}</div>}
              <div className="form-group">
                <label htmlFor="editThemeName">Theme Name</label>
                <input
                  type="text"
                  id="editThemeName"
                  value={newThemeData.name}
                  onChange={(e) => setNewThemeData({...newThemeData, name: e.target.value})}
                  placeholder="Enter theme name"
                  className="subject-name-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="editThemeNumber">Theme Number</label>
                <input
                  type="number"
                  id="editThemeNumber"
                  min="1"
                  value={newThemeData.themeNumber}
                  onChange={(e) => setNewThemeData({...newThemeData, themeNumber: e.target.value})}
                  className="subject-count-input"
                />
              </div>
              <div className="form-info">
                <p><strong>Class:</strong> {editingTheme?.className}</p>
                <p><strong>Subject:</strong> {editingTheme?.subjectName}</p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-button" onClick={() => setShowEditModal(false)}>
                Cancel
              </button>
              <button className="save-button" onClick={handleEditTheme}>
                Update Theme
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageThemes;