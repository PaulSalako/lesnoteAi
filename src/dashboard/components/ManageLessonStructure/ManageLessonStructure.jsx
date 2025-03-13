import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ManageLessonStructure.css';

function ManageLessonStructure() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [structures, setStructures] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [themes, setThemes] = useState([]);
  const [topics, setTopics] = useState([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredClass, setFilteredClass] = useState('');
  const [filteredSubject, setFilteredSubject] = useState('');
  const [filteredTheme, setFilteredTheme] = useState('');
  const [filteredTopic, setFilteredTopic] = useState('');
  
  const [deletingStructureId, setDeletingStructureId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingStructure, setViewingStructure] = useState(null);
  const [editingStructure, setEditingStructure] = useState(null);
  const [formError, setFormError] = useState('');
  
  // Form data for creating/editing structure
  const [newStructureData, setNewStructureData] = useState({
    classId: '',
    subjectId: '',
    themeId: '',
    topicId: '',
    performanceObjectives: [''],
    contentItems: [''],
    teacherActivities: [''],
    studentActivities: [''],
    teachingMaterials: [''],
    evaluationItems: [''],
    assessmentItems: ['']
  });

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
          setIsAdmin(userData.roleId === 1); // Only true for admin
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

  // Fetch structures when pagination, filter or search changes
  useEffect(() => {
    if (token) {
      fetchStructures(currentPage);
    }
  }, [currentPage, pageSize, filteredClass, filteredSubject, filteredTheme, filteredTopic, searchTerm, token]);

  // Fetch subjects when class filter changes
  useEffect(() => {
    if (token && filteredClass) {
      fetchSubjectsByClass(filteredClass);
    } else {
      setSubjects([]);
      setFilteredSubject('');
      setThemes([]);
      setFilteredTheme('');
      setTopics([]);
      setFilteredTopic('');
    }
  }, [filteredClass, token]);

  // Fetch themes when subject filter changes
  useEffect(() => {
    if (token && filteredSubject) {
      fetchThemesBySubject(filteredSubject);
    } else {
      setThemes([]);
      setFilteredTheme('');
      setTopics([]);
      setFilteredTopic('');
    }
  }, [filteredSubject, token]);

  // Fetch topics when theme filter changes
  useEffect(() => {
    if (token && filteredSubject) {
      fetchTopicsBySubject(filteredSubject, filteredTheme);
    } else {
      setTopics([]);
      setFilteredTopic('');
    }
  }, [filteredTheme, filteredSubject, token]);

  // Form-related useEffects for cascading dropdowns
  useEffect(() => {
    if (token && newStructureData.classId) {
      fetchSubjectsForClass(newStructureData.classId);
    }
  }, [newStructureData.classId, token]);
  
  useEffect(() => {
    if (token && newStructureData.subjectId) {
      fetchThemesForSubject(newStructureData.subjectId);
    } else {
      setNewStructureData(prev => ({ ...prev, themeId: '', topicId: '' }));
    }
  }, [newStructureData.subjectId, token]);
  
  useEffect(() => {
    if (token && newStructureData.subjectId) {
      fetchTopicsForSubject(newStructureData.subjectId, newStructureData.themeId);
    } else {
      setNewStructureData(prev => ({ ...prev, topicId: '' }));
    }
  }, [newStructureData.themeId, newStructureData.subjectId, token]);

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
      
      // Set default class for new structure form
      if (result.length > 0) {
        setNewStructureData(prev => ({ ...prev, classId: result[0].id }));
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
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchThemesBySubject = async (subjectId) => {
    try {
      const response = await fetch(`https://localhost:7225/api/Theme/by-subject/${subjectId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch themes');
      }
  
      const result = await response.json();
      setThemes(result);
    } catch (error) {
      console.error('Error fetching themes:', error);
    }
  };

  const fetchTopicsBySubject = async (subjectId, themeId = null) => {
    try {
      let url = `https://localhost:7225/api/Topic/by-subject/${subjectId}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch topics');
      }
  
      const result = await response.json();
      
      // If theme ID is provided, filter topics for that theme
      const filteredTopics = themeId 
        ? result.filter(topic => topic.themeId === themeId)
        : result;
        
      setTopics(filteredTopics);
    } catch (error) {
      console.error('Error fetching topics:', error);
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
      setSubjects(result);
    } catch (error) {
      console.error('Error fetching subjects for class:', error);
    }
  };
  
  const fetchThemesForSubject = async (subjectId) => {
    try {
      const response = await fetch(`https://localhost:7225/api/Theme/by-subject/${subjectId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch themes for subject');
      }
  
      const result = await response.json();
      setThemes(result);
    } catch (error) {
      console.error('Error fetching themes for subject:', error);
    }
  };
  
  const fetchTopicsForSubject = async (subjectId, themeId = null) => {
    try {
      let url = `https://localhost:7225/api/Topic/by-subject/${subjectId}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch topics for subject');
      }
  
      const result = await response.json();
      setTopics(result);
    } catch (error) {
      console.error('Error fetching topics for subject:', error);
    }
  };

  const fetchStructures = async (page) => {
    try {
      setLoading(true);
      let url = `https://localhost:7225/api/LessonNoteStructure?page=${page}&pageSize=${pageSize}`;
      
      if (filteredClass) {
        url += `&classId=${filteredClass}`;
      }
      
      if (filteredSubject) {
        url += `&subjectId=${filteredSubject}`;
      }
      
      if (filteredTheme) {
        url += `&themeId=${filteredTheme}`;
      }
      
      if (filteredTopic) {
        url += `&topicId=${filteredTopic}`;
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
        throw new Error(errorData.message || 'Failed to fetch lesson structures');
      }

      const result = await response.json();
      
      // Set structures and pagination info
      setStructures(result.structures || []);
      setTotalPages(result.pagination.totalPages);
      setTotalCount(result.pagination.totalCount);
    } catch (error) {
      console.error('Error fetching lesson structures:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStructureDetails = async (structureId) => {
    try {
      setLoading(true);
      
      const response = await fetch(`https://localhost:7225/api/LessonNoteStructure/${structureId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        // Try to parse error message
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch structure details');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error fetching structure details:', error);
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleAddStructure = async () => {
    // Validate inputs
    if (!newStructureData.classId) {
      setFormError('Please select a class');
      return;
    }
    
    if (!newStructureData.subjectId) {
      setFormError('Please select a subject');
      return;
    }
    
    // Filter out empty items before submitting
    const dataToSubmit = {
      ...newStructureData,
      performanceObjectives: newStructureData.performanceObjectives.filter(item => item.trim() !== ''),
      contentItems: newStructureData.contentItems.filter(item => item.trim() !== ''),
      teacherActivities: newStructureData.teacherActivities.filter(item => item.trim() !== ''),
      studentActivities: newStructureData.studentActivities.filter(item => item.trim() !== ''),
      teachingMaterials: newStructureData.teachingMaterials.filter(item => item.trim() !== ''),
      evaluationItems: newStructureData.evaluationItems.filter(item => item.trim() !== ''),
      assessmentItems: newStructureData.assessmentItems.filter(item => item.trim() !== '')
    };
    
    // If no theme or topic selected, set to null explicitly
    if (!dataToSubmit.themeId) {
      dataToSubmit.themeId = null;
    }
    
    if (!dataToSubmit.topicId) {
      dataToSubmit.topicId = null;
    }

    try {
      const response = await fetch('https://localhost:7225/api/LessonNoteStructure', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSubmit)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create lesson structure');
      }

      // Show success message
      const result = await response.json();
      alert(result.message || 'Lesson note structure created successfully');
      
      // Reset form and close modal
      resetStructureForm();
      setShowAddModal(false);
      
      // Refresh the first page
      setCurrentPage(1);
      fetchStructures(1);
    } catch (error) {
      console.error('Error creating lesson structure:', error);
      setFormError(error.message || 'Failed to create lesson structure. Please try again.');
    }
  };

  const handleEditStructure = async () => {
    if (!editingStructure) {
      return;
    }

    if (!newStructureData.classId) {
      setFormError('Please select a class');
      return;
    }
    
    if (!newStructureData.subjectId) {
      setFormError('Please select a subject');
      return;
    }
    
    // Filter out empty items before submitting
    const dataToSubmit = {
      performanceObjectives: newStructureData.performanceObjectives.filter(item => item.trim() !== ''),
      contentItems: newStructureData.contentItems.filter(item => item.trim() !== ''),
      teacherActivities: newStructureData.teacherActivities.filter(item => item.trim() !== ''),
      studentActivities: newStructureData.studentActivities.filter(item => item.trim() !== ''),
      teachingMaterials: newStructureData.teachingMaterials.filter(item => item.trim() !== ''),
      evaluationItems: newStructureData.evaluationItems.filter(item => item.trim() !== ''),
      assessmentItems: newStructureData.assessmentItems.filter(item => item.trim() !== '')
    };

    try {
      const response = await fetch(`https://localhost:7225/api/LessonNoteStructure/${editingStructure.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSubmit)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update lesson structure');
      }

      // Show success message
      const result = await response.json();
      alert(result.message || 'Lesson note structure updated successfully');
      
      // Reset form and close modal
      setEditingStructure(null);
      resetStructureForm();
      setShowEditModal(false);
      
      // Refresh the current page
      fetchStructures(currentPage);
    } catch (error) {
      console.error('Error updating lesson structure:', error);
      setFormError(error.message || 'Failed to update lesson structure. Please try again.');
    }
  };

  const handleDelete = async (structureId) => {
    // Only admin can delete structures
    if (!isAdmin) {
      alert('Only administrators can delete lesson structures');
      return;
    }
    
    const isConfirmed = window.confirm('Are you sure you want to delete this lesson note structure? This action cannot be undone.');
    
    if (!isConfirmed) {
      return;
    }

    setDeletingStructureId(structureId);

    try {
      const response = await fetch(`https://localhost:7225/api/LessonNoteStructure/${structureId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        // Try to parse error message
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete lesson structure');
      }

      // Show success message
      alert('Lesson structure deleted successfully');
      
      // If it's the last item on the current page, go to previous page
      if (structures.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      } else {
        // Otherwise, just refresh the current page
        fetchStructures(currentPage);
      }
    } catch (error) {
      console.error('Error deleting lesson structure:', error);
      alert(error.message || 'Failed to delete lesson structure. Please try again.');
    } finally {
      setDeletingStructureId(null);
    }
  };

  const openViewModal = async (structure) => {
    const details = await fetchStructureDetails(structure.id);
    if (details) {
      setViewingStructure(details);
      setShowViewModal(true);
    }
  };

  const openEditModal = async (structure) => {
    const details = await fetchStructureDetails(structure.id);
    if (details) {
      setEditingStructure(details);
      
      // Set form data with the structure details
      setNewStructureData({
        classId: details.classId,
        subjectId: details.subjectId,
        themeId: details.themeId || '',
        topicId: details.topicId || '',
        performanceObjectives: details.performanceObjectives?.length ? details.performanceObjectives : [''],
        contentItems: details.contentItems?.length ? details.contentItems : [''],
        teacherActivities: details.teacherActivities?.length ? details.teacherActivities : [''],
        studentActivities: details.studentActivities?.length ? details.studentActivities : [''],
        teachingMaterials: details.teachingMaterials?.length ? details.teachingMaterials : [''],
        evaluationItems: details.evaluationItems?.length ? details.evaluationItems : [''],
        assessmentItems: details.assessmentItems?.length ? details.assessmentItems : ['']
      });
      
      setFormError('');
      setShowEditModal(true);
    }
  };

  const openAddModal = () => {
    resetStructureForm();
    setFormError('');
    setShowAddModal(true);
  };

  const resetStructureForm = () => {
    // Initialize with an empty array for each section
    setNewStructureData({
      classId: classes.length > 0 ? classes[0].id : '',
      subjectId: subjects.length > 0 ? subjects[0].id : '',
      themeId: '',
      topicId: '',
      performanceObjectives: [''],
      contentItems: [''],
      teacherActivities: [''],
      studentActivities: [''],
      teachingMaterials: [''],
      evaluationItems: [''],
      assessmentItems: ['']
    });
  };

  const handleArrayItemChange = (section, index, value) => {
    const updatedArray = [...newStructureData[section]];
    updatedArray[index] = value;
    setNewStructureData({
      ...newStructureData,
      [section]: updatedArray
    });
  };

  const handleAddArrayItem = (section) => {
    setNewStructureData({
      ...newStructureData,
      [section]: [...newStructureData[section], '']
    });
  };

  const handleRemoveArrayItem = (section, index) => {
    if (newStructureData[section].length <= 1) {
      return; // Always keep at least one item
    }
    
    const updatedArray = [...newStructureData[section]];
    updatedArray.splice(index, 1);
    setNewStructureData({
      ...newStructureData,
      [section]: updatedArray
    });
  };

  const handleClassChange = (classId) => {
    setNewStructureData({
      ...newStructureData,
      classId,
      subjectId: '', // Reset subject when class changes
      themeId: '',   // Reset theme when class changes
      topicId: ''    // Reset topic when class changes
    });
  };
  
  const handleSubjectChange = (subjectId) => {
    setNewStructureData({
      ...newStructureData,
      subjectId,
      themeId: '', // Reset theme when subject changes
      topicId: ''  // Reset topic when subject changes
    });
  };
  
  const handleThemeChange = (themeId) => {
    setNewStructureData({
      ...newStructureData,
      themeId,
      topicId: '' // Reset topic when theme changes
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
    fetchStructures(1);
  };

  const handleClassFilter = (classId) => {
    setFilteredClass(classId);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleSubjectFilter = (subjectId) => {
    setFilteredSubject(subjectId);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleThemeFilter = (themeId) => {
    setFilteredTheme(themeId);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleTopicFilter = (topicId) => {
    setFilteredTopic(topicId);
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Early return pattern: If still checking access, show minimal loading state
  if (loading && structures.length === 0) {
    return (
      <div className="loading-state">
        <i className="bi bi-arrow-clockwise spinning"></i>
        <p>Loading lesson structures...</p>
      </div>
    );
  }

  if (error && structures.length === 0) {
    return (
      <div className="error-state">
        <i className="bi bi-exclamation-circle"></i>
        <p>{error}</p>
        <button onClick={() => fetchStructures(currentPage)} className="retry-button">
          <i className="bi bi-arrow-clockwise"></i> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="structures-page">
      <header className="structures-header">
        <h1>Manage Lesson Structures</h1>
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

          {filteredSubject && (
            <div className="filter-group">
              <label>Filter by Theme:</label>
              <div className="select-wrapper">
                <select 
                  value={filteredTheme} 
                  onChange={(e) => handleThemeFilter(e.target.value)}
                  className="theme-select"
                >
                  <option value="">All Themes</option>
                  {themes.map(theme => (
                    <option key={theme.id} value={theme.id}>
                      {theme.displayName || `Theme ${theme.themeNumber}: ${theme.name}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {filteredSubject && (
            <div className="filter-group">
              <label>Filter by Topic:</label>
              <div className="select-wrapper">
                <select 
                  value={filteredTopic} 
                  onChange={(e) => handleTopicFilter(e.target.value)}
                  className="topic-select"
                >
                  <option value="">All Topics</option>
                  {topics.map(topic => (
                    <option key={topic.id} value={topic.id}>
                      {topic.name}
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
                placeholder="Search structures..."
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
            <i className="bi bi-plus"></i> Add Structure
          </button>
        </div>
      </header>

      <main className="structures-content">
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
          {loading && structures.length > 0 && (
            <div className="loading-overlay">
              <i className="bi bi-arrow-clockwise spinning"></i>
            </div>
          )}

          <table className="structures-table">
            <thead>
              <tr>
                <th>S/N</th>
                <th>Class</th>
                <th>Subject</th>
                <th>Theme</th>
                <th>Topic</th>
                <th>Created By</th>
                <th>Created Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {structures.length > 0 ? (
                structures.map((structure, index) => (
                  <tr key={structure.id}>
                    <td>{((currentPage - 1) * pageSize) + index + 1}</td>
                    <td>{structure.className}</td>
                    <td>{structure.subjectName}</td>
                    <td>{structure.themeName || 'N/A'}</td>
                    <td>{structure.topicName || 'N/A'}</td>
                    <td>{structure.createdBy.name}</td>
                    <td>{new Date(structure.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="view-button"
                          onClick={() => openViewModal(structure)}
                          title="View Structure"
                        >
                          <i className="bi bi-eye"></i>
                        </button>
                        <button 
                          className="edit-button"
                          onClick={() => openEditModal(structure)}
                          title="Edit Structure"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        {isAdmin && (
                          <button 
                            className={`delete-button ${deletingStructureId === structure.id ? 'deleting' : ''}`}
                            onClick={() => handleDelete(structure.id)}
                            disabled={deletingStructureId === structure.id}
                            title="Delete Structure"
                          >
                            <i className={`bi ${deletingStructureId === structure.id ? 'bi-hourglass-split' : 'bi-trash'}`}></i>
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
                      <i className="bi bi-file-earmark-text"></i>
                      <p>{searchTerm || filteredClass || filteredSubject || filteredTheme || filteredTopic ? 'No matches found' : 'No lesson structures found'}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {structures.length > 0 && (
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

      {/* View Structure Modal */}
      {showViewModal && viewingStructure && (
        <div className="modal-overlay" style={{ zIndex: 1000 }}>
          <div className="modal view-modal" style={{ zIndex: 1001 }}>
            <div className="modal-header">
              <h2>View Lesson Structure</h2>
              <button className="close-modal-button" onClick={() => setShowViewModal(false)}>
                <i className="bi bi-x"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="structure-details">
                <div className="structure-metadata">
                  <div className="metadata-item">
                    <span className="metadata-label">Class:</span>
                    <span className="metadata-value">{viewingStructure.className}</span>
                  </div>
                  <div className="metadata-item">
                    <span className="metadata-label">Subject:</span>
                    <span className="metadata-value">{viewingStructure.subjectName}</span>
                  </div>
                  {viewingStructure.themeName && (
                    <div className="metadata-item">
                      <span className="metadata-label">Theme:</span>
                      <span className="metadata-value">{viewingStructure.themeName}</span>
                    </div>
                  )}
                  {viewingStructure.topicName && (
                    <div className="metadata-item">
                      <span className="metadata-label">Topic:</span>
                      <span className="metadata-value">{viewingStructure.topicName}</span>
                    </div>
                  )}
                </div>
                
                <div className="structure-sections">
                  {viewingStructure.performanceObjectives?.length > 0 && (
                    <div className="structure-section">
                      <h4>Performance Objectives</h4>
                      <ol>
                        {viewingStructure.performanceObjectives.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                  
                  {viewingStructure.contentItems?.length > 0 && (
                    <div className="structure-section">
                      <h4>Content</h4>
                      <ol>
                        {viewingStructure.contentItems.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                  
                  {viewingStructure.teacherActivities?.length > 0 && (
                    <div className="structure-section">
                      <h4>Teacher's Activities</h4>
                      <ol>
                        {viewingStructure.teacherActivities.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                  
                  {viewingStructure.studentActivities?.length > 0 && (
                    <div className="structure-section">
                      <h4>Student's Activities</h4>
                      <ol>
                        {viewingStructure.studentActivities.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                  
                  {viewingStructure.teachingMaterials?.length > 0 && (
                    <div className="structure-section">
                      <h4>Teaching & Learning Materials (TLMs)</h4>
                      <ol>
                        {viewingStructure.teachingMaterials.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                  
                  {viewingStructure.evaluationItems?.length > 0 && (
                    <div className="structure-section">
                      <h4>Evaluation</h4>
                      <ol>
                        {viewingStructure.evaluationItems.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {viewingStructure.assessmentItems?.length > 0 && (
                    <div className="structure-section">
                      <h4>Assessment</h4>
                      <ol>
                        {viewingStructure.assessmentItems.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="edit-structure-button" onClick={() => {
                setShowViewModal(false);
                openEditModal(viewingStructure);
              }}>
                <i className="bi bi-pencil"></i> Edit Structure
              </button>
              <button className="close-button" onClick={() => setShowViewModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Structure Modal */}
      {(showAddModal || showEditModal) && (
        <div className="modal-overlay" style={{ zIndex: 1000 }}>
          <div className="modal structure-modal" style={{ zIndex: 1001 }}>
            <div className="modal-header">
              <h2>{showAddModal ? 'Add New Lesson Structure' : 'Edit Lesson Structure'}</h2>
              <button className="close-modal-button" onClick={() => {
                showAddModal ? setShowAddModal(false) : setShowEditModal(false);
              }}>
                <i className="bi bi-x"></i>
              </button>
            </div>
            <div className="modal-body">
              {formError && <div className="form-error-message">{formError}</div>}
              
              {showAddModal && (
                <div className="form-section">
                  <h3>Select Scope</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="classSelect">Class</label>
                      <div className="select-wrapper form-select-wrapper">
                        <select
                          id="classSelect"
                          value={newStructureData.classId}
                          onChange={(e) => handleClassChange(e.target.value)}
                          className="form-select"
                          disabled={showEditModal}
                        >
                          {classes.map(classItem => (
                            <option key={classItem.id} value={classItem.id}>
                              {classItem.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="subjectSelect">Subject</label>
                      <div className="select-wrapper form-select-wrapper">
                        <select
                          id="subjectSelect"
                          value={newStructureData.subjectId}
                          onChange={(e) => handleSubjectChange(e.target.value)}
                          className="form-select"
                          disabled={showEditModal || !newStructureData.classId}
                        >
                          {subjects.length > 0 ? (
                            subjects.map(subject => (
                              <option key={subject.id} value={subject.id}>
                                {subject.name}
                              </option>
                            ))
                          ) : (
                            <option value="">Select a class first</option>
                          )}
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="themeSelect">Theme</label>
                      <div className="select-wrapper form-select-wrapper">
                        <select
                          id="themeSelect"
                          value={newStructureData.themeId}
                          onChange={(e) => handleThemeChange(e.target.value)}
                          className="form-select"
                          disabled={showEditModal || !newStructureData.subjectId}
                        >
                          <option value="">No Theme (Subject Level)</option>
                          {themes.length > 0 && themes.map(theme => (
                            <option key={theme.id} value={theme.id}>
                              {theme.displayName || `Theme ${theme.themeNumber}: ${theme.name}`}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="topicSelect">Topic</label>
                      <div className="select-wrapper form-select-wrapper">
                        <select
                          id="topicSelect"
                          value={newStructureData.topicId}
                          onChange={(e) => setNewStructureData({...newStructureData, topicId: e.target.value})}
                          className="form-select"
                          disabled={showEditModal || !newStructureData.subjectId}
                        >
                          <option value="">{newStructureData.themeId ? "No Topic (Theme Level)" : "No Topic (Subject Level)"}</option>
                          {topics.length > 0 && topics.map(topic => (
                            <option key={topic.id} value={topic.id}>
                              {topic.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="structure-sections">
                <div className="structure-section-group">
                  <h3>Performance Objectives</h3>
                  {newStructureData.performanceObjectives.map((objective, index) => (
                    <div className="array-input-row" key={index}>
                      <span className="array-item-number">{index + 1}.</span>
                      <input
                        type="text"
                        value={objective}
                        onChange={(e) => handleArrayItemChange('performanceObjectives', index, e.target.value)}
                        placeholder="Enter performance objective"
                        className="array-item-input"
                      />
                      <button
                        className="array-item-remove"
                        onClick={() => handleRemoveArrayItem('performanceObjectives', index)}
                        title="Remove this item"
                      >
                        <i className="bi bi-dash-circle"></i>
                      </button>
                    </div>
                  ))}
                  <button 
                    className="add-array-item" 
                    onClick={() => handleAddArrayItem('performanceObjectives')}
                  >
                    <i className="bi bi-plus-circle"></i> Add Objective
                  </button>
                </div>
                
                <div className="structure-section-group">
                  <h3>Content</h3>
                  {newStructureData.contentItems.map((content, index) => (
                    <div className="array-input-row" key={index}>
                      <span className="array-item-number">{index + 1}.</span>
                      <input
                        type="text"
                        value={content}
                        onChange={(e) => handleArrayItemChange('contentItems', index, e.target.value)}
                        placeholder="Enter content item"
                        className="array-item-input"
                      />
                      <button
                        className="array-item-remove"
                        onClick={() => handleRemoveArrayItem('contentItems', index)}
                        title="Remove this item"
                      >
                        <i className="bi bi-dash-circle"></i>
                      </button>
                    </div>
                  ))}
                  <button 
                    className="add-array-item" 
                    onClick={() => handleAddArrayItem('contentItems')}
                  >
                    <i className="bi bi-plus-circle"></i> Add Content Item
                  </button>
                </div>
                
                <div className="structure-section-group">
                  <h3>Teacher's Activities</h3>
                  {newStructureData.teacherActivities.map((activity, index) => (
                    <div className="array-input-row" key={index}>
                      <span className="array-item-number">{index + 1}.</span>
                      <input
                        type="text"
                        value={activity}
                        onChange={(e) => handleArrayItemChange('teacherActivities', index, e.target.value)}
                        placeholder="Enter teacher activity"
                        className="array-item-input"
                      />
                      <button
                        className="array-item-remove"
                        onClick={() => handleRemoveArrayItem('teacherActivities', index)}
                        title="Remove this item"
                      >
                        <i className="bi bi-dash-circle"></i>
                      </button>
                    </div>
                  ))}
                  <button 
                    className="add-array-item" 
                    onClick={() => handleAddArrayItem('teacherActivities')}
                  >
                    <i className="bi bi-plus-circle"></i> Add Teacher Activity
                  </button>
                </div>
                
                <div className="structure-section-group">
                  <h3>Student's Activities</h3>
                  {newStructureData.studentActivities.map((activity, index) => (
                    <div className="array-input-row" key={index}>
                      <span className="array-item-number">{index + 1}.</span>
                      <input
                        type="text"
                        value={activity}
                        onChange={(e) => handleArrayItemChange('studentActivities', index, e.target.value)}
                        placeholder="Enter student activity"
                        className="array-item-input"
                      />
                      <button
                        className="array-item-remove"
                        onClick={() => handleRemoveArrayItem('studentActivities', index)}
                        title="Remove this item"
                      >
                        <i className="bi bi-dash-circle"></i>
                      </button>
                    </div>
                  ))}
                  <button 
                    className="add-array-item" 
                    onClick={() => handleAddArrayItem('studentActivities')}
                  >
                    <i className="bi bi-plus-circle"></i> Add Student Activity
                  </button>
                </div>
                
                <div className="structure-section-group">
                  <h3>Teaching & Learning Materials (TLMs)</h3>
                  {newStructureData.teachingMaterials.map((material, index) => (
                    <div className="array-input-row" key={index}>
                      <span className="array-item-number">{index + 1}.</span>
                      <input
                        type="text"
                        value={material}
                        onChange={(e) => handleArrayItemChange('teachingMaterials', index, e.target.value)}
                        placeholder="Enter teaching material"
                        className="array-item-input"
                      />
                      <button
                        className="array-item-remove"
                        onClick={() => handleRemoveArrayItem('teachingMaterials', index)}
                        title="Remove this item"
                      >
                        <i className="bi bi-dash-circle"></i>
                      </button>
                    </div>
                  ))}
                  <button 
                    className="add-array-item" 
                    onClick={() => handleAddArrayItem('teachingMaterials')}
                  >
                    <i className="bi bi-plus-circle"></i> Add Teaching Material
                  </button>
                </div>
                
                <div className="structure-section-group">
                  <h3>Evaluation</h3>
                  {newStructureData.evaluationItems.map((item, index) => (
                    <div className="array-input-row" key={index}>
                      <span className="array-item-number">{index + 1}.</span>
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => handleArrayItemChange('evaluationItems', index, e.target.value)}
                        placeholder="Enter evaluation item"
                        className="array-item-input"
                      />
                      <button
                        className="array-item-remove"
                        onClick={() => handleRemoveArrayItem('evaluationItems', index)}
                        title="Remove this item"
                      >
                        <i className="bi bi-dash-circle"></i>
                      </button>
                    </div>
                  ))}
                  <button 
                    className="add-array-item" 
                    onClick={() => handleAddArrayItem('evaluationItems')}
                  >
                    <i className="bi bi-plus-circle"></i> Add Evaluation Item
                  </button>
                </div>

                <div className="structure-section-group">
                  <h3>Assessment</h3>
                  {newStructureData.assessmentItems.map((item, index) => (
                    <div className="array-input-row" key={index}>
                      <span className="array-item-number">{index + 1}.</span>
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => handleArrayItemChange('assessmentItems', index, e.target.value)}
                        placeholder="Enter assessment item"
                        className="array-item-input"
                      />
                      <button
                        className="array-item-remove"
                        onClick={() => handleRemoveArrayItem('assessmentItems', index)}
                        title="Remove this item"
                      >
                        <i className="bi bi-dash-circle"></i>
                      </button>
                    </div>
                  ))}
                  <button 
                    className="add-array-item" 
                    onClick={() => handleAddArrayItem('assessmentItems')}
                  >
                    <i className="bi bi-plus-circle"></i> Add Assessment Item
                  </button>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-button" onClick={() => {
                showAddModal ? setShowAddModal(false) : setShowEditModal(false);
              }}>
                Cancel
              </button>
              <button 
                className="save-button" 
                onClick={showAddModal ? handleAddStructure : handleEditStructure}
              >
                {showAddModal ? 'Create Structure' : 'Update Structure'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageLessonStructure;