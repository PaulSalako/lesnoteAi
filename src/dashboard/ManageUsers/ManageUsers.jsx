import React from 'react';
import { ManageUsersLogic } from './ManageUsersLogic';
import './ManageUsers.css';

function ManageUsers() {
  const {
    loading,
    error,
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
    fetchUsers,
    handleDelete,
    handleRoleChange,
    handlePageChange,
    handlePageSizeChange,
    handleSearchChange
  } = ManageUsersLogic();

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
              onChange={handleSearchChange}
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

        {filteredUsers.length > 0 && (
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