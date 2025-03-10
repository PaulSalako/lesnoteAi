import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ManageTopic.css';

function ManageTopics() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [topics, setTopics] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredClass, setFilteredClass] = useState('');
  const [filteredSubject, setFilteredSubject] = useState('');
  const [deletingTopicId, setDeletingTopicId] = useState(null);
  const [editingTopic, setEditingTopic] = useState(null);
  const [newTopicName, setNewTopicName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newTopicData, setNewTopicData] = useState({
    classId: '',
    subjectId: '',
    topicCount: 1,
    topicNames: ['']
  });
  const [formError, setFormError] = useState('');
  const [classSubjects, setClassSubjects] = useState([]);

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

  // Fetch topics when pagination, filter or search changes
  useEffect(() => {
    if (token && isAdmin) {
      fetchTopics(currentPage);
    }
  }, [currentPage, pageSize, filteredClass, filteredSubject, token, isAdmin]);

  // Fetch subjects when class filter changes
  useEffect(() => {
    if (token && isAdmin && filteredClass) {
      fetchSubjectsByClass(filteredClass);
    } else {
      setSubjects([]);
      setFilteredSubject('');
    }
  }, [filteredClass, token, isAdmin]);

  // Fetch subjects for the selected class in add modal
  useEffect(() => {
    if (token && isAdmin && newTopicData.classId) {
      fetchSubjectsForClass(newTopicData.classId);
    }
  }, [newTopicData.classId, token, isAdmin]);

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
      
      // Set default class for new topic form if classes exist
      if (result.length > 0) {
        setNewTopicData(prev => ({ ...prev, classId: result[0].id }));
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchSubjectsByClass = async (classId) => {
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
      
      // Reset subject filter when class changes
      setFilteredSubject('');
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchSubjectsForClass = async (classId) => {
    try {
      const response = await fetch(`https://localhost:7225/api/Subject/by-class/${classId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch subjects for class');
      }

      const result = await response.json();
      setClassSubjects(result);
      
      // Set default subject for new topic form if subjects exist
      if (result.length > 0) {
        setNewTopicData(prev => ({ ...prev, subjectId: result[0].id }));
      } else {
        setNewTopicData(prev => ({ ...prev, subjectId: '' }));
      }
    } catch (error) {
      console.error('Error fetching subjects for class:', error);
    }
  };

  const fetchTopics = async (page) => {
    try {
      setLoading(true);
      let url = `https://localhost:7225/api/Topic?page=${page}&pageSize=${pageSize}`;
      
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
        throw new Error(errorData.message || 'Failed to fetch topics');
      }

      const result = await response.json();
      
      // Set topics
      setTopics(result.topics);
      setTotalPages(result.pagination.totalPages);
      setTotalCount(result.pagination.totalCount);
    } catch (error) {
      console.error('Error fetching topics:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTopics = async () => {
    // Validate inputs
    if (!newTopicData.classId) {
      setFormError('Please select a class');
      return;
    }
    
    if (!newTopicData.subjectId) {
      setFormError('Please select a subject');
      return;
    }

    // Filter out empty topic names
    const topicNames = newTopicData.topicNames.filter(name => name.trim() !== '');
    
    if (topicNames.length === 0) {
      setFormError('At least one topic name is required');
      return;
    }

    try {
      const response = await fetch('https://localhost:7225/api/Topic/batch', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          classId: newTopicData.classId,
          subjectId: newTopicData.subjectId,
          topicNames: topicNames
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Special handling for existing topics
        if (errorData.existingTopics && errorData.existingTopics.length > 0) {
          setFormError(`The following topics already exist: ${errorData.existingTopics.join(', ')}`);
          return;
        }
        
        throw new Error(errorData.message || 'Failed to create topics');
      }

      // Show success message
      const result = await response.json();
      alert(result.message || 'Topics created successfully');
      
      // Reset form and close modal
      setNewTopicData({
        classId: classes.length > 0 ? classes[0].id : '',
        subjectId: '',
        topicCount: 1,
        topicNames: ['']
      });
      setFormError('');
      setShowAddModal(false);
      
      // Refresh the first page with the applied filters
      setCurrentPage(1);
      fetchTopics(1);

    } catch (error) {
      console.error('Error creating topics:', error);
      setFormError(error.message || 'Failed to create topics. Please try again.');
    }
  };

  const handleEditTopic = async () => {
    if (!editingTopic || !newTopicName.trim()) {
      setFormError('Topic name is required');
      return;
    }

    try {
      const response = await fetch(`https://localhost:7225/api/Topic/${editingTopic.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: newTopicName.trim() })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update topic');
      }

      // Show success message
      alert('Topic updated successfully');
      
      // Reset form and close modal
      setEditingTopic(null);
      setNewTopicName('');
      setFormError('');
      setShowEditModal(false);
      
      // Refresh the current page
      fetchTopics(currentPage);

    } catch (error) {
      console.error('Error updating topic:', error);
      setFormError(error.message || 'Failed to update topic. Please try again.');
    }
  };

  const handleDelete = async (topicId) => {
    // Only admin can delete topics
    if (!isAdmin) {
      alert('Only administrators can delete topics');
      return;
    }
    
    const isConfirmed = window.confirm('Are you sure you want to delete this topic? This action cannot be undone and may affect content using this topic.');
    
    if (!isConfirmed) {
      return;
    }

    setDeletingTopicId(topicId);

    try {
      const response = await fetch(`https://localhost:7225/api/Topic/${topicId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        // Try to parse error message
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete topic');
      }

      // Show success message
      alert('Topic deleted successfully');
      
      // If it's the last item on the current page, go to previous page
      if (topics.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      } else {
        // Otherwise, just refresh the current page
        fetchTopics(currentPage);
      }

    } catch (error) {
      console.error('Error deleting topic:', error);
      alert(error.message || 'Failed to delete topic. Please try again.');
    } finally {
      setDeletingTopicId(null);
    }
  };

  const openEditModal = (topic) => {
    setEditingTopic(topic);
    setNewTopicName(topic.name);
    setFormError('');
    setShowEditModal(true);
  };

  const openAddModal = () => {
    // Reset the form
    setNewTopicData({
      classId: classes.length > 0 ? classes[0].id : '',
      subjectId: classSubjects.length > 0 ? classSubjects[0].id : '',
      topicCount: 1,
      topicNames: ['']
    });
    setFormError('');
    setShowAddModal(true);
    
    // Fetch subjects for the selected class
    if (classes.length > 0) {
      fetchSubjectsForClass(classes[0].id);
    }
  };

  const handleTopicCountChange = (count) => {
    // Convert string to number and ensure it's at least 1
    const newCount = Math.max(1, parseInt(count) || 1);
    
    // Update topic names array size
    const currentNames = [...newTopicData.topicNames];
    const newNames = Array(newCount).fill('').map((_, i) => currentNames[i] || '');
    
    setNewTopicData({
      ...newTopicData,
      topicCount: newCount,
      topicNames: newNames
    });
  };

  const handleTopicNameChange = (index, value) => {
    const updatedNames = [...newTopicData.topicNames];
    updatedNames[index] = value;
    setNewTopicData({
      ...newTopicData,
      topicNames: updatedNames
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
    fetchTopics(1);
  };

  const handleClassFilter = (classId) => {
    setFilteredClass(classId);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleSubjectFilter = (subjectId) => {
    setFilteredSubject(subjectId);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleClassChange = (classId) => {
    setNewTopicData({
      ...newTopicData,
      classId,
      subjectId: '' // Reset subject when class changes
    });
  };

  // Early return pattern: If not admin or still checking, show minimal loading state
  if (!isAdmin) {
    return null; // Return nothing while checking access status or redirecting
  }

  if (loading && topics.length === 0) {
    return (
      <div className="loading-state">
        <i className="bi bi-arrow-clockwise spinning"></i>
        <p>Loading topics...</p>
      </div>
    );
  }

  if (error && topics.length === 0) {
    return (
      <div className="error-state">
        <i className="bi bi-exclamation-circle"></i>
        <p>{error}</p>
        <button onClick={() => fetchTopics(currentPage)} className="retry-button">
          <i className="bi bi-arrow-clockwise"></i> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="topics-page">
      <div className="topics-header">
        <h1>Manage Topics</h1>
        <div className="header-actions">
          <div className="filter-controls">
            <div className="filter-group">
              <label>Filter by Class:</label>
              <select 
                value={filteredClass} 
                onChange={(e) => handleClassFilter(e.target.value)}
                className="filter-select"
              >
                <option value="">All Classes</option>
                {classes.map(classItem => (
                  <option key={classItem.id} value={classItem.id}>
                    {classItem.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label>Filter by Subject:</label>
              <select 
                value={filteredSubject} 
                onChange={(e) => handleSubjectFilter(e.target.value)}
                className="filter-select"
                disabled={!filteredClass}
              >
                <option value="">All Subjects</option>
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button className="search-btn" onClick={handleSearch}>
                <i className="bi bi-search"></i>
              </button>
            </div>
          </div>
          <button className="add-topic-btn" onClick={openAddModal}>
            <i className="bi bi-plus"></i> Add Topics
          </button>
        </div>
      </div>

      <div className="topics-table-container">
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

        {loading && topics.length > 0 && (
          <div className="table-loading-overlay">
            <i className="bi bi-arrow-clockwise spinning"></i>
          </div>
        )}

        <table className="topics-table">
          <thead>
            <tr>
              <th>S/N</th>
              <th>Topic</th>
              <th>Subject</th>
              <th>Class</th>
              <th>Created By</th>
              <th>Created Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {topics.length > 0 ? (
              topics.map((topic, index) => (
                <tr key={topic.id}>
                  <td>{((currentPage - 1) * pageSize) + index + 1}</td>
                  <td>{topic.name}</td>
                  <td>{topic.subjectName}</td>
                  <td>{topic.className}</td>
                  <td>{topic.createdBy.name}</td>
                  <td>{new Date(topic.createdAt).toLocaleDateString()}</td>
                  <td className="actions-cell">
                    <button 
                      className="edit-btn"
                      onClick={() => openEditModal(topic)}
                    >
                      <i className="bi bi-pencil"></i>
                    </button>
                    {isAdmin && (
                      <button 
                        className={`delete-btn ${deletingTopicId === topic.id ? 'deleting' : ''}`}
                        onClick={() => handleDelete(topic.id)}
                        disabled={deletingTopicId === topic.id}
                      >
                        <i className={`bi ${deletingTopicId === topic.id ? 'bi-hourglass-split' : 'bi-trash'}`}></i>
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="empty-state">
                  <i className="bi bi-book"></i>
                  <p>{searchTerm || filteredClass || filteredSubject ? 'No matches found' : 'No topics found'}</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {topics.length > 0 && (
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

      {/* Add Topics Modal */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal-content modal-lg">
            <div className="modal-header">
              <h2>Add Topics</h2>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="modal-body">
              {formError && <div className="form-error">{formError}</div>}
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="classSelect">Select Class</label>
                  <div className="select-wrapper modal-select-wrapper">
                    <select
                      id="classSelect"
                      value={newTopicData.classId}
                      onChange={(e) => handleClassChange(e.target.value)}
                      className="class-select"
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
                  <select
                    id="subjectSelect"
                    value={newTopicData.subjectId}
                    onChange={(e) => setNewTopicData({...newTopicData, subjectId: e.target.value})}
                    className="subject-select"
                    disabled={classSubjects.length === 0}
                  >
                    {classSubjects.length > 0 ? (
                      classSubjects.map(subject => (
                        <option key={subject.id} value={subject.id}>
                          {subject.name}
                        </option>
                      ))
                    ) : (
                      <option value="">No subjects available for this class</option>
                    )}
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="topicCount">Number of Topics to Add</label>
                <input
                  type="number"
                  id="topicCount"
                  min="1"
                  max="20"
                  value={newTopicData.topicCount}
                  onChange={(e) => handleTopicCountChange(e.target.value)}
                  className="topic-count-input"
                />
              </div>
              
              <div className="topic-inputs">
                <h3>Enter Topic Names</h3>
                {newTopicData.topicNames.map((topicName, index) => (
                  <div className="topic-input-row" key={index}>
                    <label htmlFor={`topic-${index}`}>Topic {index + 1}</label>
                    <input
                      type="text"
                      id={`topic-${index}`}
                      value={topicName}
                      onChange={(e) => handleTopicNameChange(index, e.target.value)}
                      placeholder="Enter topic name"
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="save-btn" onClick={handleAddTopics}>Add Topics</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Topic Modal */}
      {showEditModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Topic</h2>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="modal-body">
              {formError && <div className="form-error">{formError}</div>}
              <div className="form-group">
                <label htmlFor="editTopicName">Topic Name</label>
                <input
                  type="text"
                  id="editTopicName"
                  value={newTopicName}
                  onChange={(e) => setNewTopicName(e.target.value)}
                  placeholder="Enter topic name"
                />
              </div>
              <div className="form-info">
                <p><strong>Subject:</strong> {editingTopic?.subjectName}</p>
                <p><strong>Class:</strong> {editingTopic?.className}</p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowEditModal(false)}>Cancel</button>
              <button className="save-btn" onClick={handleEditTopic}>Update Topic</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageTopics;