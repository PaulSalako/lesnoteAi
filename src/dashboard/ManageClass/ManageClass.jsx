// src/components/ManageClasses.jsx
import { useManageClasses } from './ManageClassLogic';
import './ManageClass.css';

function ManageClasses() {
  const {
    classes,
    loading,
    error,
    isAdmin,
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
  } = useManageClasses();

  // Early return pattern: If not admin/staff or still checking, show minimal loading state
  if (!isAdmin) {
    return null; // Return nothing while checking access status or redirecting
  }

  if (loading && classes.length === 0) {
    return (
      <div className="loading-state">
        <i className="bi bi-arrow-clockwise spinning"></i>
        <p>Loading classes...</p>
      </div>
    );
  }

  if (error && classes.length === 0) {
    return (
      <div className="error-state">
        <i className="bi bi-exclamation-circle"></i>
        <p>{error}</p>
        <button onClick={handleRetry} className="retry-button">
          <i className="bi bi-arrow-clockwise"></i> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="classes-page">
      <div className="classes-header">
        <h1>Manage Classes</h1>
        <div className="header-actions">
          <div className="search-bar">
            <i className="bi bi-search"></i>
            <input
              type="text"
              placeholder="Search classes..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <button className="add-class-btn" onClick={openAddModal}>
            <i className="bi bi-plus"></i> Add New Class
          </button>
        </div>
      </div>

      <div className="classes-table-container">
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

        {loading && classes.length > 0 && (
          <div className="table-loading-overlay">
            <i className="bi bi-arrow-clockwise spinning"></i>
          </div>
        )}

        <table className="classes-table">
          <thead>
            <tr>
              <th>S/N</th>
              <th>Class Name</th>
              <th>Created By</th>
              <th>Created Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {classes.length > 0 ? (
              classes.map((classItem, index) => (
                <tr key={classItem.id}>
                  <td>{((currentPage - 1) * pageSize) + index + 1}</td>
                  <td>{classItem.name}</td>
                  <td>{classItem.createdBy.name}</td>
                  <td>{new Date(classItem.createdAt).toLocaleDateString()}</td>
                  <td className="actions-cell">
                    <button 
                      className="edit-btn"
                      onClick={() => openEditModal(classItem)}
                    >
                      <i className="bi bi-pencil"></i>
                    </button>
                    {isAdmin && (
                      <button 
                        className={`delete-btn ${deletingClassId === classItem.id ? 'deleting' : ''}`}
                        onClick={() => handleDelete(classItem.id)}
                        disabled={deletingClassId === classItem.id}
                      >
                        <i className={`bi ${deletingClassId === classItem.id ? 'bi-hourglass-split' : 'bi-trash'}`}></i>
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="empty-state">
                  <i className="bi bi-stack"></i>
                  <p>{searchTerm ? 'No matches found' : 'No classes found'}</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {classes.length > 0 && (
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

      {/* Add Class Modal */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add New Class</h2>
              <button className="close-btn" onClick={closeAddModal}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="modal-body">
              {formError && <div className="form-error">{formError}</div>}
              <div className="form-group">
                <label htmlFor="className">Class Name</label>
                <input
                  type="text"
                  id="className"
                  value={newClass.name}
                  onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                  placeholder="e.g. Primary 1"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={closeAddModal}>Cancel</button>
              <button className="save-btn" onClick={handleAddClass}>Add Class</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Class Modal */}
      {showEditModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Class</h2>
              <button className="close-btn" onClick={closeEditModal}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="modal-body">
              {formError && <div className="form-error">{formError}</div>}
              <div className="form-group">
                <label htmlFor="editClassName">Class Name</label>
                <input
                  type="text"
                  id="editClassName"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="e.g. Primary 1"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={closeEditModal}>Cancel</button>
              <button className="save-btn" onClick={handleEditClass}>Update Class</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageClasses;