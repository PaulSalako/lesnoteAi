import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './ManageUsers.css';

function ManageUsers() {
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
      const response = await fetch(`https://localhost:7225/api/Admin/users?page=${page}&pageSize=${pageSize}`, {
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
    const isConfirmed = window.confirm('Are you sure you want to delete this user? This action cannot be undone and will remove all their content.');
    
    if (!isConfirmed) {
      return;
    }

    setDeletingUserId(userId);

    try {
      const response = await fetch(`https://localhost:7225/api/Admin/users/${userId}`, {
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
      alert('User deleted successfully');
      
      // If it's the last item on the current page, go to previous page
      if (filteredUsers.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      } else {
        // Otherwise, just refresh the current page
        fetchUsers(currentPage);
      }

    } catch (error) {
      console.error('Error deleting user:', error);
      alert(error.message || 'Failed to delete user. Please try again.');
    } finally {
      setDeletingUserId(null);
    }
  };

  const handleRoleChange = async (userId, newRoleId) => {
    // Prevent changing your own role
    const currentUser = users.find(user => user.id === userId);
    if (currentUser && currentUser.roleName === "Admin") {
      alert("You cannot change your own admin role.");
      return;
    }

    setUpdatingUserId(userId);

    try {
      const response = await fetch(`https://localhost:7225/api/Admin/users/${userId}/role`, {
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
      alert('User role updated successfully');
      
      // Refresh the current page
      fetchUsers(currentPage);

    } catch (error) {
      console.error('Error updating user role:', error);
      alert(error.message || 'Failed to update user role. Please try again.');
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

  // Early return pattern: If not admin or still checking, show minimal loading state
  if (!isAdmin) {
    return null; // Return nothing while checking admin status or redirecting
  }

  if (loading) {
    return (
      <div className="loading-state">
        <i className="bi bi-arrow-clockwise spinning"></i>
        <p>Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        <i className="bi bi-exclamation-circle"></i>
        <p>{error}</p>
        <button onClick={() => fetchUsers(currentPage)} className="retry-button">
          <i className="bi bi-arrow-clockwise"></i> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="users-page">
      <div className="users-header">
        <h1>Manage Users</h1>
        <div className="header-actions">
          <div className="search-bar">
            <i className="bi bi-search"></i>
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="users-table-container">
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

        <table className="users-table">
          <thead>
            <tr>
              <th>S/N</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Email Verified</th>
              <th>Created Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user, index) => (
                <tr key={user.id}>
                  <td>{((currentPage - 1) * pageSize) + index + 1}</td>
                  <td>{`${user.firstName} ${user.surname}`}</td>
                  <td>{user.email}</td>
                  <td>
                    <div className="role-selector">
                      <select
                        value={user.roleId}
                        onChange={(e) => handleRoleChange(user.id, parseInt(e.target.value))}
                        disabled={updatingUserId === user.id}
                        className={user.roleName === "Admin" ? "admin-role" : user.roleName === "Staff" ? "staff-role" : "user-role"}
                      >
                        {roleOptions.map(role => (
                          <option key={role.id} value={role.id}>{role.name}</option>
                        ))}
                      </select>
                      {updatingUserId === user.id && (
                        <i className="bi bi-arrow-clockwise spinning role-spinner"></i>
                      )}
                    </div>
                  </td>
                  <td className="verified-cell">
                    {user.isEmailVerified ? (
                      <span className="verified"><i className="bi bi-check-circle-fill"></i> Verified</span>
                    ) : (
                      <span className="not-verified"><i className="bi bi-x-circle-fill"></i> Not Verified</span>
                    )}
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="actions-cell">
                    <button 
                      className={`delete-btn ${deletingUserId === user.id ? 'deleting' : ''}`}
                      onClick={() => handleDelete(user.id)}
                      disabled={deletingUserId === user.id || user.roleName === "Admin"}
                      title={user.roleName === "Admin" ? "Cannot delete admin users" : "Delete user"}
                    >
                      <i className={`bi ${deletingUserId === user.id ? 'bi-hourglass-split' : 'bi-trash'}`}></i>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="empty-state">
                  <i className="bi bi-people"></i>
                  <p>{searchTerm ? 'No matches found' : 'No users found'}</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {users.length > 0 && (
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
    </div>
  );
}

export default ManageUsers;