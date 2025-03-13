// src/components/ManageSubjects.jsx
import { useManageSubjects } from './ManageSubjectsLogic';
import './ManageSubject.css';

function ManageSubjects() {
  const {
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
  } = useManageSubjects();

  // Early return pattern: If not admin or still checking, show minimal loading state
  if (!isAdmin) {
    return null; // Return nothing while checking access status or redirecting
  }

  if (loading && subjects.length === 0) {
    return (
      <div className="loading-state">
        <i className="bi bi-arrow-clockwise spinning"></i>
        <p>Loading subjects...</p>
      </div>
    );
  }

  if (error && subjects.length === 0) {
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

  const groupedClasses = getGroupedClasses();

  return (
    <div className="subjects-page">
      <header className="subjects-header">
        <h1>Manage Subjects</h1>
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
          <div className="search-group">
            <div className="search-input-wrapper">
              <input
                type="text"
                placeholder="Search subjects..."
                value={searchTerm}
                onChange={handleSearchInputChange}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="search-input"
              />
              <button className="search-button" onClick={handleSearch}>
                <i className="bi bi-search"></i>
              </button>
            </div>
          </div>
          <button className="add-button" onClick={openAddModal}>
            <i className="bi bi-plus"></i> Add Subjects
          </button>
        </div>
      </header>

      <main className="subjects-content">
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
          {loading && subjects.length > 0 && (
            <div className="loading-overlay">
              <i className="bi bi-arrow-clockwise spinning"></i>
            </div>
          )}

          <table className="subjects-table">
            <thead>
              <tr>
                <th>S/N</th>
                <th>Subject Name</th>
                <th>Class</th>
                <th>Created By</th>
                <th>Created Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subjects.length > 0 ? (
                subjects.map((subject, index) => (
                  <tr key={subject.id}>
                    <td>{((currentPage - 1) * pageSize) + index + 1}</td>
                    <td>{subject.name}</td>
                    <td>{subject.className}</td>
                    <td>{subject.createdBy.name}</td>
                    <td>{new Date(subject.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="edit-button"
                          onClick={() => openEditModal(subject)}
                          title="Edit Subject"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        {isAdmin && (
                          <button 
                            className={`delete-button ${deletingSubjectId === subject.id ? 'deleting' : ''}`}
                            onClick={() => handleDelete(subject.id)}
                            disabled={deletingSubjectId === subject.id}
                            title="Delete Subject"
                          >
                            <i className={`bi ${deletingSubjectId === subject.id ? 'bi-hourglass-split' : 'bi-trash'}`}></i>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="empty-state">
                    <div className="empty-content">
                      <i className="bi bi-book"></i>
                      <p>{searchTerm || filteredClass ? 'No matches found' : 'No subjects found'}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {subjects.length > 0 && (
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

      {/* Add Subjects Modal - Fixed positioning */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal add-modal">
            <div className="modal-header">
              <h2>Add Subjects</h2>
              <button className="close-modal-button" onClick={closeAddModal}>
                <i className="bi bi-x"></i>
              </button>
            </div>
            <div className="modal-body">
              {formError && <div className="form-error-message">{formError}</div>}
              
              <div className="form-group">
                <label htmlFor="classSelect">Select Class</label>
                <div className="select-wrapper modal-select-wrapper">
                  <select
                    id="classSelect"
                    value={newSubjectData.classId}
                    onChange={(e) => setNewSubjectData({...newSubjectData, classId: e.target.value})}
                    className="modal-select"
                  >
                    {classes.length > 0 ? (
                      <>
                        {/* Primary Classes */}
                        {groupedClasses.primary.length > 0 && (
                          <optgroup label="Primary Classes">
                            {groupedClasses.primary.map(classItem => (
                              <option key={classItem.id} value={classItem.id}>
                                {classItem.name}
                              </option>
                            ))}
                          </optgroup>
                        )}
                        
                        {/* JSS Classes */}
                        {groupedClasses.jss.length > 0 && (
                          <optgroup label="Junior Secondary School">
                            {groupedClasses.jss.map(classItem => (
                              <option key={classItem.id} value={classItem.id}>
                                {classItem.name}
                              </option>
                            ))}
                          </optgroup>
                        )}
                        
                        {/* SSS Classes */}
                        {groupedClasses.sss.length > 0 && (
                          <optgroup label="Senior Secondary School">
                            {groupedClasses.sss.map(classItem => (
                              <option key={classItem.id} value={classItem.id}>
                                {classItem.name}
                              </option>
                            ))}
                          </optgroup>
                        )}
                        
                        {/* Other Classes (if any) */}
                        {groupedClasses.other.length > 0 && (
                          <optgroup label="Other Classes">
                            {groupedClasses.other.map(classItem => (
                              <option key={classItem.id} value={classItem.id}>
                                {classItem.name}
                              </option>
                            ))}
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
                <label htmlFor="subjectCount">Number of Subjects</label>
                <input
                  type="number"
                  id="subjectCount"
                  min="1"
                  max="20"
                  value={newSubjectData.subjectCount}
                  onChange={(e) => handleSubjectCountChange(e.target.value)}
                  className="subject-count-input"
                />
              </div>
              
              <div className="subject-names-section">
                <h3>Subject Names</h3>
                {newSubjectData.subjectNames.map((subjectName, index) => (
                  <div className="form-group subject-input-row" key={index}>
                    <label htmlFor={`subject-${index}`}>Subject {index + 1}</label>
                    <input
                      type="text"
                      id={`subject-${index}`}
                      value={subjectName}
                      onChange={(e) => handleSubjectNameChange(index, e.target.value)}
                      placeholder="Enter subject name"
                      className="subject-name-input"
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-button" onClick={closeAddModal}>
                Cancel
              </button>
              <button className="save-button" onClick={handleAddSubjects}>
                Add Subjects
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Subject Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal edit-modal">
            <div className="modal-header">
              <h2>Edit Subject</h2>
              <button className="close-modal-button" onClick={closeEditModal}>
                <i className="bi bi-x"></i>
              </button>
            </div>
            <div className="modal-body">
              {formError && <div className="form-error-message">{formError}</div>}
              <div className="form-group">
                <label htmlFor="editSubjectName">Subject Name</label>
                <input
                  type="text"
                  id="editSubjectName"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  placeholder="Enter subject name"
                  className="subject-name-input"
                />
              </div>
              <div className="form-info">
                <p><strong>Class:</strong> {editingSubject?.className}</p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-button" onClick={closeEditModal}>
                Cancel
              </button>
              <button className="save-button" onClick={handleEditSubject}>
                Update Subject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageSubjects;