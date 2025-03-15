// src/components/ManageClassesLogic.js
import { API_URL } from '../../config';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


export function useManageClasses() {
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
      navigate('/sign-in');
    }
  }, [navigate, token]);

  // Check for admin privileges before showing any content
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
  }, [navigate, token]);

  // Only fetch classes when pagination changes AND user is confirmed admin/staff
  useEffect(() => {
    if (token && isAdmin && currentPage) {
      fetchClasses(currentPage);
    }
  }, [currentPage, pageSize, token, isAdmin, searchTerm]);

  const fetchClasses = async (page) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/Class?page=${page}&pageSize=${pageSize}&search=${searchTerm}`, {
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
      const response = await fetch(`${API_URL}/Class`, {
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
      Swal.fire({
        title: 'Success',
        text: 'Class created successfully',
        icon: 'success',
        confirmButtonText: 'OK'
      });
      
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
      
      Swal.fire({
        title: 'Error',
        text: error.message || 'Failed to create class. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleEditClass = async () => {
    if (!editingClass || !newClassName.trim()) {
      setFormError('Class name is required');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/Class/${editingClass.id}`, {
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
      Swal.fire({
        title: 'Success',
        text: 'Class updated successfully',
        icon: 'success',
        confirmButtonText: 'OK'
      });
      
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
      
      Swal.fire({
        title: 'Error',
        text: error.message || 'Failed to update class. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleDelete = async (classId) => {
    // Only admin can delete classes
    if (!isAdmin) {
      Swal.fire({
        title: 'Permission Denied',
        text: 'Only administrators can delete classes',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
      return;
    }
    
    // Confirm deletion with SweetAlert
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone and may affect content using this class.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });
    
    if (!result.isConfirmed) {
      return;
    }

    setDeletingClassId(classId);

    try {
      const response = await fetch(`${API_URL}/Class/${classId}`, {
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
      Swal.fire({
        title: 'Deleted!',
        text: 'Class has been deleted successfully',
        icon: 'success',
        confirmButtonText: 'OK'
      });
      
      // If it's the last item on the current page, go to previous page
      if (classes.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      } else {
        // Otherwise, just refresh the current page
        fetchClasses(currentPage);
      }

    } catch (error) {
      console.error('Error deleting class:', error);
      
      Swal.fire({
        title: 'Error',
        text: error.message || 'Failed to delete class. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
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

  const closeAddModal = () => {
    setShowAddModal(false);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
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

  const handleRetry = () => {
    fetchClasses(currentPage);
  };

  return {
    classes,
    loading,
    error,
    isAdmin,
    isStaff,
    currentPage,
    totalPages,
    pageSize,
    totalCount,
    searchTerm,
    deletingClassId,
    showAddModal,
    showEditModal,
    newClass,
    newClassName,
    formError,
    editingClass,
    handlePageChange,
    handlePageSizeChange,
    handleSearch,
    handleRetry,
    openAddModal,
    closeAddModal,
    openEditModal,
    closeEditModal,
    handleAddClass,
    handleEditClass,
    handleDelete,
    setNewClass,
    setNewClassName
  };
}