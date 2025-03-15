// src/components/ManageThemesLogic.js
import { API_URL } from '../../config';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


export function useManageThemes() {
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

  const fetchSubjectsForClass = async (classId) => {
    if (!classId) return;
    
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
      
      // No longer setting default subject
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setSubjects([]);
    }
  };

  const fetchThemes = async (page) => {
    try {
      setLoading(true);
      let url = `${API_URL}/Theme?page=${page}&pageSize=${pageSize}`;
      
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
        return fetch(`${API_URL}/Theme`, {
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
      Swal.fire({
        title: 'Success',
        text: `${themeNames.length} theme(s) created successfully`,
        icon: 'success',
        confirmButtonText: 'OK'
      });
      
      // Reset form and close modal
      setNewThemeData({
        classId: '',
        subjectId: '',
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
      
      Swal.fire({
        title: 'Error',
        text: error.message || 'Failed to create themes. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
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
      const response = await fetch(`${API_URL}/Theme/${editingTheme.id}`, {
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
      Swal.fire({
        title: 'Success',
        text: 'Theme updated successfully',
        icon: 'success',
        confirmButtonText: 'OK'
      });
      
      // Reset form and close modal
      setEditingTheme(null);
      setFormError('');
      setShowEditModal(false);
      
      // Refresh the current page
      fetchThemes(currentPage);

    } catch (error) {
      console.error('Error updating theme:', error);
      setFormError(error.message || 'Failed to update theme. Please try again.');
      
      Swal.fire({
        title: 'Error',
        text: error.message || 'Failed to update theme. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleDelete = async (themeId) => {
    // Only admin can delete themes
    if (!isAdmin) {
      Swal.fire({
        title: 'Permission Denied',
        text: 'Only administrators can delete themes',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
      return;
    }
    
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone and may affect topics using this theme.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });
    
    if (!result.isConfirmed) {
      return;
    }

    setDeletingThemeId(themeId);

    try {
      const response = await fetch(`${API_URL}/Theme/${themeId}`, {
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
      Swal.fire({
        title: 'Deleted!',
        text: 'Theme deleted successfully',
        icon: 'success',
        confirmButtonText: 'OK'
      });
      
      // If it's the last item on the current page, go to previous page
      if (themes.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      } else {
        // Otherwise, just refresh the current page
        fetchThemes(currentPage);
      }

    } catch (error) {
      console.error('Error deleting theme:', error);
      
      Swal.fire({
        title: 'Error',
        text: error.message || 'Failed to delete theme. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
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
      classId: '',  // Initialize with empty string for placeholder
      subjectId: '', // Initialize with empty string for placeholder
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
  
  const handleSubjectChange = (subjectId) => {
    setNewThemeData(prev => ({ ...prev, subjectId }));
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

  const handleSearchInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleRetry = () => {
    fetchThemes(currentPage);
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

  // Close modals
  const closeAddModal = () => {
    setShowAddModal(false);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingTheme(null);
  };

  return {
    // States
    loading,
    error,
    themes,
    classes,
    subjects,
    searchTerm,
    filteredClass,
    filteredSubject,
    deletingThemeId,
    editingTheme,
    isAdmin,
    currentPage,
    totalPages,
    pageSize,
    totalCount,
    showAddModal,
    showEditModal,
    newThemeData,
    formError,
    
    // Functions
    getGroupedClasses,
    handleClassChange,
    handleSubjectChange,
    handleThemeCountChange,
    handleThemeNameChange,
    handlePageChange,
    handlePageSizeChange,
    handleSearch,
    handleSearchInputChange,
    handleClassFilter,
    handleSubjectFilter,
    openEditModal,
    openAddModal,
    closeAddModal,
    closeEditModal,
    handleAddThemes,
    handleEditTheme,
    handleDelete,
    handleRetry,
    setNewThemeData
  };
}