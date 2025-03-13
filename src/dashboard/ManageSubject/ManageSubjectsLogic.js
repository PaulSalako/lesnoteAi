// src/components/ManageSubjectsLogic.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function useManageSubjects() {
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
      navigate('/sign-in');
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
      
      Swal.fire({
        title: 'Success',
        text: result.message || 'Subjects created successfully',
        icon: 'success',
        confirmButtonText: 'OK'
      });
      
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
      
      Swal.fire({
        title: 'Error',
        text: error.message || 'Failed to create subjects. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
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
      Swal.fire({
        title: 'Success',
        text: 'Subject updated successfully',
        icon: 'success',
        confirmButtonText: 'OK'
      });
      
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
      
      Swal.fire({
        title: 'Error',
        text: error.message || 'Failed to update subject. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleDelete = async (subjectId) => {
    // Only admin can delete subjects
    if (!isAdmin) {
      Swal.fire({
        title: 'Permission Denied',
        text: 'Only administrators can delete subjects',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
      return;
    }
    
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone and may affect content using this subject.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });
    
    if (!result.isConfirmed) {
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
      Swal.fire({
        title: 'Deleted!',
        text: 'Subject deleted successfully',
        icon: 'success',
        confirmButtonText: 'OK'
      });
      
      // If it's the last item on the current page, go to previous page
      if (subjects.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      } else {
        // Refresh the current page
        fetchSubjects(currentPage);
      }

    } catch (error) {
      console.error('Error deleting subject:', error);
      
      Swal.fire({
        title: 'Error',
        text: error.message || 'Failed to delete subject. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
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

  const closeAddModal = () => {
    setShowAddModal(false);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingSubject(null);
    setNewSubjectName('');
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

  const handleSearchInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleRetry = () => {
    fetchSubjects(currentPage);
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
    loading,
    error,
    subjects,
    classes,
    searchTerm,
    filteredClass,
    deletingSubjectId,
    editingSubject,
    newSubjectName,
    isAdmin,
    currentPage,
    totalPages,
    pageSize,
    totalCount,
    showAddModal,
    showEditModal,
    newSubjectData,
    formError,
    getGroupedClasses,
    handleSubjectCountChange,
    handleSubjectNameChange,
    handlePageChange,
    handlePageSizeChange,
    handleSearch,
    handleSearchInputChange,
    handleClassFilter,
    openEditModal,
    openAddModal,
    closeAddModal,
    closeEditModal,
    handleAddSubjects,
    handleEditSubject,
    handleDelete,
    handleRetry
  };
}