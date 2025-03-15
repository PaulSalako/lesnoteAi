import { API_URL } from '../../config';
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';



export function ManageUsersLogic() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Roles mapping
  const roleOptions = [
    { id: 1, name: 'Admin' },
    { id: 2, name: 'Staff' },
    { id: 3, name: 'User' }
  ];

  const token = localStorage.getItem('token') || sessionStorage.getItem('token');

  // Memoized filtered users to prevent unnecessary recalculations
  const filteredUsers = useMemo(() => {
    return users.filter(user =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${user.firstName} ${user.surname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.roleName && user.roleName.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [users, searchTerm]);

  // First check for token and redirect if not present
  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [navigate, token]);

  // Then check for admin privileges before showing any content
  useEffect(() => {
    const checkUserAdminAccess = async () => {
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
          // Remove the fetchUsers call from here to prevent double loading
        } else {
          // Redirect non-admin users immediately to dashboard
          navigate('/dashboard');
        }
      } catch (error) {
        // Don't show error, just redirect on any error
        navigate('/dashboard');
      }
    };
    
    if (token) {
      checkUserAdminAccess();
    }
  }, [navigate, token]);

  // Only fetch users when pagination changes AND user is confirmed admin
  useEffect(() => {
    if (token && isAdmin && currentPage) {
      fetchUsers(currentPage);
    }
  }, [currentPage, pageSize, token, isAdmin]);

  const fetchUsers = async (page) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/Admin/users?page=${page}&pageSize=${pageSize}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        // Try to parse error message
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch users');
      }

      const result = await response.json();
      
      // Set users
      setUsers(result.users);
      setTotalPages(result.pagination.totalPages);
      setTotalCount(result.pagination.totalCount);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Are you sure you want to delete this user? This action cannot be undone and will remove all their content.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });
    
    if (!result.isConfirmed) {
      return;
    }

    setDeletingUserId(userId);

    try {
      const response = await fetch(`${API_URL}/Admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        // Try to parse error message
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete user');
      }

      // Show success message
      Swal.fire({
        title: 'Deleted!',
        text: 'User deleted successfully',
        icon: 'success',
        confirmButtonText: 'OK'
      });
      
      // If it's the last item on the current page, go to previous page
      if (filteredUsers.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      } else {
        // Otherwise, just refresh the current page
        fetchUsers(currentPage);
      }

    } catch (error) {
      console.error('Error deleting user:', error);
      Swal.fire({
        title: 'Error',
        text: error.message || 'Failed to delete user. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setDeletingUserId(null);
    }
  };

  const handleRoleChange = async (userId, newRoleId) => {
    // Prevent changing your own role
    const currentUser = users.find(user => user.id === userId);
    if (currentUser && currentUser.roleName === "Admin") {
      Swal.fire({
        title: 'Not Allowed',
        text: 'You cannot change your own admin role.',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
      return;
    }

    setUpdatingUserId(userId);

    try {
      const response = await fetch(`${API_URL}/Admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ roleId: newRoleId })
      });

      if (!response.ok) {
        // Try to parse error message
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update user role');
      }

      // Show success message
      Swal.fire({
        title: 'Success',
        text: 'User role updated successfully',
        icon: 'success',
        confirmButtonText: 'OK'
      });
      
      // Refresh the current page
      fetchUsers(currentPage);

    } catch (error) {
      console.error('Error updating user role:', error);
      Swal.fire({
        title: 'Error',
        text: error.message || 'Failed to update user role. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setUpdatingUserId(null);
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

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return {
    loading,
    error,
    users,
    filteredUsers,
    searchTerm,
    deletingUserId,
    updatingUserId,
    isAdmin,
    currentPage,
    totalPages,
    pageSize,
    totalCount,
    roleOptions,
    navigate,
    fetchUsers,
    handleDelete,
    handleRoleChange,
    handlePageChange,
    handlePageSizeChange,
    handleSearchChange
  };
}