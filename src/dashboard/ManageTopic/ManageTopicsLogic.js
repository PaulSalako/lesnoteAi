// src/components/ManageTopicsLogic.js
import { API_URL } from '../../config';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


export function useManageTopics() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [topics, setTopics] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [themes, setThemes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredClass, setFilteredClass] = useState('');
  const [filteredSubject, setFilteredSubject] = useState('');
  const [filteredTheme, setFilteredTheme] = useState('');
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
    themeId: '',
    topicCount: 1,
    topicNames: ['']
  });
  const [formError, setFormError] = useState('');
  const [classSubjects, setClassSubjects] = useState([]);
  const [subjectThemes, setSubjectThemes] = useState([]);

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
        const response = await fetch(`${API_URL}/Dashboard/stats`, {
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
  }, [currentPage, pageSize, filteredClass, filteredSubject, filteredTheme, searchTerm, token, isAdmin]);

  // Fetch subjects when class filter changes
  useEffect(() => {
    if (token && isAdmin && filteredClass) {
      fetchSubjectsByClass(filteredClass);
    } else {
      setSubjects([]);
      setFilteredSubject('');
      setThemes([]);
      setFilteredTheme('');
    }
  }, [filteredClass, token, isAdmin]);

  // Fetch themes when subject filter changes
  useEffect(() => {
    if (token && isAdmin && filteredSubject) {
      fetchThemesBySubject(filteredSubject);
    } else {
      setThemes([]);
      setFilteredTheme('');
    }
  }, [filteredSubject, token, isAdmin]);

  // Fetch subjects for the selected class in add modal
  useEffect(() => {
    if (token && isAdmin && newTopicData.classId) {
      fetchSubjectsForClass(newTopicData.classId);
    }
  }, [newTopicData.classId, token, isAdmin]);

  // Fetch themes for the selected subject in add modal
  useEffect(() => {
    if (token && isAdmin && newTopicData.subjectId) {
      fetchThemesForSubject(newTopicData.subjectId);
    }
  }, [newTopicData.subjectId, token, isAdmin]);

  const fetchClasses = async () => {
    try {
      const response = await fetch(`${API_URL}/Class/all`, {
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
      
      // No longer setting default class here
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchSubjectsByClass = async (classId) => {
    try {
      const response = await fetch(`${API_URL}/Subject/by-class/${classId}`, {
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
      
      // Reset subject and theme filters when class changes
      setFilteredSubject('');
      setFilteredTheme('');
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchThemesBySubject = async (subjectId) => {
    try {
      const response = await fetch(`${API_URL}/Theme/by-subject/${subjectId}`, {
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
      
      // Reset theme filter when subject changes
      setFilteredTheme('');
    } catch (error) {
      console.error('Error fetching themes:', error);
    }
  };

  const fetchSubjectsForClass = async (classId) => {
    try {
      const response = await fetch(`${API_URL}/Subject/by-class/${classId}`, {
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
      
      // Clear subject selection when changing class
      setNewTopicData(prev => ({ 
        ...prev, 
        subjectId: '',
        themeId: ''
      }));
      
      // Reset themes when class changes
      setSubjectThemes([]);
    } catch (error) {
      console.error('Error fetching subjects for class:', error);
    }
  };

  const fetchThemesForSubject = async (subjectId) => {
    try {
      const response = await fetch(`${API_URL}/Theme/by-subject/${subjectId}`, {
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
      setSubjectThemes(result);
      
      // Clear theme selection when changing subject
      setNewTopicData(prev => ({ ...prev, themeId: '' }));
    } catch (error) {
      console.error('Error fetching themes for subject:', error);
    }
  };

  const fetchTopics = async (page) => {
    try {
      setLoading(true);
      let url = `${API_URL}/Topic?page=${page}&pageSize=${pageSize}`;
      
      if (filteredClass) {
        url += `&classId=${filteredClass}`;
      }
      
      if (filteredSubject) {
        url += `&subjectId=${filteredSubject}`;
      }
      
      if (filteredTheme) {
        url += `&themeId=${filteredTheme}`;
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
      const response = await fetch(`${API_URL}/Topic/batch`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          classId: newTopicData.classId,
          subjectId: newTopicData.subjectId,
          themeId: newTopicData.themeId || null, // Make it optional
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
      
      Swal.fire({
        title: 'Success',
        text: result.message || 'Topics created successfully',
        icon: 'success',
        confirmButtonText: 'OK'
      });
      
      // Reset form and close modal
      setNewTopicData({
        classId: '',
        subjectId: '',
        themeId: '',
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
      
      Swal.fire({
        title: 'Error',
        text: error.message || 'Failed to create topics. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleEditTopic = async () => {
    if (!editingTopic || !newTopicName.trim()) {
      setFormError('Topic name is required');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/Topic/${editingTopic.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          name: newTopicName.trim(),
          themeId: editingTopic.themeId // Maintain the current theme
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update topic');
      }

      // Show success message
      Swal.fire({
        title: 'Success',
        text: 'Topic updated successfully',
        icon: 'success',
        confirmButtonText: 'OK'
      });
      
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
      
      Swal.fire({
        title: 'Error',
        text: error.message || 'Failed to update topic. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleDelete = async (topicId) => {
    // Only admin can delete topics
    if (!isAdmin) {
      Swal.fire({
        title: 'Permission Denied',
        text: 'Only administrators can delete topics',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
      return;
    }
    
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone and may affect content using this topic.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });
    
    if (!result.isConfirmed) {
      return;
    }

    setDeletingTopicId(topicId);

    try {
      const response = await fetch(`${API_URL}/Topic/${topicId}`, {
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
      Swal.fire({
        title: 'Deleted!',
        text: 'Topic deleted successfully',
        icon: 'success',
        confirmButtonText: 'OK'
      });
      
      // If it's the last item on the current page, go to previous page
      if (topics.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      } else {
        // Otherwise, just refresh the current page
        fetchTopics(currentPage);
      }

    } catch (error) {
      console.error('Error deleting topic:', error);
      
      Swal.fire({
        title: 'Error',
        text: error.message || 'Failed to delete topic. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
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
    // Reset the form with empty selections
    setNewTopicData({
      classId: '',
      subjectId: '',
      themeId: '',
      topicCount: 1,
      topicNames: ['']
    });
    setFormError('');
    setShowAddModal(true);
    
    // Clear subject and theme dropdowns
    setClassSubjects([]);
    setSubjectThemes([]);
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

  const handleThemeFilter = (themeId) => {
    setFilteredTheme(themeId);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleClassChange = (classId) => {
    setNewTopicData({
      ...newTopicData,
      classId,
      subjectId: '', // Reset subject when class changes
      themeId: ''    // Reset theme when class changes
    });
  };

  const handleSubjectChange = (subjectId) => {
    setNewTopicData({
      ...newTopicData,
      subjectId,
      themeId: '' // Reset theme when subject changes
    });
  };
  
  const handleThemeChange = (themeId) => {
    setNewTopicData({
      ...newTopicData,
      themeId
    });
  };
  
  const closeAddModal = () => {
    setShowAddModal(false);
  };
  
  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingTopic(null);
    setNewTopicName('');
  };
  
  const handleSearchInputChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleRetry = () => {
    fetchTopics(currentPage);
  };
  
  // Function to group classes by type
  const getGroupedClasses = () => {
    if (!classes.length) return {};
    
    const grouped = {
      primary: classes.filter(classItem => 
        classItem.name.toLowerCase().includes('primary') || classItem.name.match(/^p\d/i)
      ),
      jss: classes.filter(classItem => 
        classItem.name.toLowerCase().includes('jss') || classItem.name.toLowerCase().includes('junior')
      ),
      sss: classes.filter(classItem => 
        classItem.name.toLowerCase().includes('sss') || classItem.name.toLowerCase().includes('senior')
      )
    };
    
    // Other classes
    grouped.other = classes.filter(classItem => 
      !grouped.primary.includes(classItem) && 
      !grouped.jss.includes(classItem) && 
      !grouped.sss.includes(classItem)
    );
    
    return grouped;
  };

  return {
    // States
    loading,
    error,
    topics,
    classes,
    subjects,
    themes,
    searchTerm,
    filteredClass,
    filteredSubject,
    filteredTheme,
    deletingTopicId,
    editingTopic,
    newTopicName,
    isAdmin,
    currentPage,
    totalPages,
    pageSize,
    totalCount,
    showAddModal,
    showEditModal,
    newTopicData,
    formError,
    classSubjects,
    subjectThemes,
    
    // Functions
    getGroupedClasses,
    handleClassChange,
    handleSubjectChange,
    handleThemeChange,
    handleTopicCountChange,
    handleTopicNameChange,
    handlePageChange,
    handlePageSizeChange,
    handleSearch,
    handleSearchInputChange,
    handleClassFilter,
    handleSubjectFilter,
    handleThemeFilter,
    openEditModal,
    openAddModal,
    closeAddModal,
    closeEditModal,
    handleAddTopics,
    handleEditTopic,
    handleDelete,
    handleRetry,
    setNewTopicName
  };
}