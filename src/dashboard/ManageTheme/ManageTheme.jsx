// src/components/ManageThemes.jsx
import { useManageThemes } from './ManageThemesLogic';
import './ManageTheme.css'; // You'll need to create this CSS file

function ManageThemes() {
  const {
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
  } = useManageThemes();

  // Early return pattern: If still checking access, show minimal loading state
  if (loading && themes.length === 0) {
    return (
      <div className="loading-state">
        <i className="bi bi-arrow-clockwise spinning"></i>
        <p>Loading themes...</p>
      </div>
    );
  }

  if (error && themes.length === 0) {
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
    <div className="themes-page">
      <header className="themes-header">
        <h1>Manage Themes</h1>
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

          <div className="search-group">
            <div className="search-input-wrapper">
              <input
                type="text"
                placeholder="Search themes..."
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
            <i className="bi bi-plus"></i> Add Themes
          </button>
        </div>
      </header>

      <main className="themes-content">
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
          {loading && themes.length > 0 && (
            <div className="loading-overlay">
              <i className="bi bi-arrow-clockwise spinning"></i>
            </div>
          )}

          <table className="themes-table">
            <thead>
              <tr>
                <th>S/N</th>
                <th>Theme Number</th>
                <th>Theme Name</th>
                <th>Class</th>
                <th>Subject</th>
                <th>Created By</th>
                <th>Created Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {themes.length > 0 ? (
                themes.map((theme, index) => (
                  <tr key={theme.id}>
                    <td>{((currentPage - 1) * pageSize) + index + 1}</td>
                    <td>{theme.themeNumber}</td>
                    <td>{theme.name}</td>
                    <td>{theme.className}</td>
                    <td>{theme.subjectName}</td>
                    <td>{theme.createdBy.name}</td>
                    <td>{new Date(theme.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="edit-button"
                          onClick={() => openEditModal(theme)}
                          title="Edit Theme"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        {isAdmin && (
                          <button 
                            className={`delete-button ${deletingThemeId === theme.id ? 'deleting' : ''}`}
                            onClick={() => handleDelete(theme.id)}
                            disabled={deletingThemeId === theme.id}
                            title="Delete Theme"
                          >
                            <i className={`bi ${deletingThemeId === theme.id ? 'bi-hourglass-split' : 'bi-trash'}`}></i>
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
                      <i className="bi bi-list-ol"></i>
                      <p>{searchTerm || filteredClass || filteredSubject ? 'No matches found' : 'No themes found'}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {themes.length > 0 && (
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

      {/* Add Themes Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal add-modal">
            <div className="modal-header">
              <h2>Add Themes</h2>
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
                    value={newThemeData.classId}
                    onChange={(e) => handleClassChange(e.target.value)}
                    className="modal-select"
                  >
                    <option value="" disabled>Select a class</option>
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
                <label htmlFor="subjectSelect">Select Subject</label>
                <div className="select-wrapper modal-select-wrapper">
                  <select
                    id="subjectSelect"
                    value={newThemeData.subjectId}
                    onChange={(e) => handleSubjectChange(e.target.value)}
                    className="modal-select"
                    disabled={!newThemeData.classId}
                  >
                    <option value="" disabled>Select a subject</option>
                    {subjects.length > 0 ? (
                      subjects.map(subject => (
                        <option key={subject.id} value={subject.id}>
                          {subject.name}
                        </option>
                      ))
                    ) : (
                      <option value="">
                        {newThemeData.classId ? "No subjects available" : "Select a class first"}
                      </option>
                    )}
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="startingThemeNumber">Starting Theme Number</label>
                <input
                  type="number"
                  id="startingThemeNumber"
                  min="1"
                  value={newThemeData.startingThemeNumber}
                  onChange={(e) => setNewThemeData({...newThemeData, startingThemeNumber: e.target.value})}
                  className="subject-count-input"
                />
                <p className="form-help-text">The first theme will be numbered {newThemeData.startingThemeNumber}, and each subsequent theme will be numbered in sequence.</p>
              </div>
              
              <div className="form-group">
                <label htmlFor="themeCount">Number of Themes</label>
                <input
                  type="number"
                  id="themeCount"
                  min="1"
                  max="20"
                  value={newThemeData.themeCount}
                  onChange={(e) => handleThemeCountChange(e.target.value)}
                  className="subject-count-input"
                />
              </div>
              
              <div className="theme-names-section">
                <h3>Theme Names</h3>
                {newThemeData.themeNames.map((themeName, index) => (
                  <div className="form-group theme-input-row" key={index}>
                    <label htmlFor={`theme-${index}`}>Theme {parseInt(newThemeData.startingThemeNumber) + index}</label>
                    <input
                      type="text"
                      id={`theme-${index}`}
                      value={themeName}
                      onChange={(e) => handleThemeNameChange(index, e.target.value)}
                      placeholder="Enter theme name"
                      className="theme-name-input"
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-button" onClick={closeAddModal}>
                Cancel
              </button>
              <button className="save-button" onClick={handleAddThemes}>
                Add Themes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Theme Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal edit-modal">
            <div className="modal-header">
              <h2>Edit Theme</h2>
              <button className="close-modal-button" onClick={closeEditModal}>
                <i className="bi bi-x"></i>
              </button>
            </div>
            <div className="modal-body">
              {formError && <div className="form-error-message">{formError}</div>}
              <div className="form-group">
                <label htmlFor="editThemeName">Theme Name</label>
                <input
                  type="text"
                  id="editThemeName"
                  value={newThemeData.name}
                  onChange={(e) => setNewThemeData({...newThemeData, name: e.target.value})}
                  placeholder="Enter theme name"
                  className="subject-name-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="editThemeNumber">Theme Number</label>
                <input
                  type="number"
                  id="editThemeNumber"
                  min="1"
                  value={newThemeData.themeNumber}
                  onChange={(e) => setNewThemeData({...newThemeData, themeNumber: e.target.value})}
                  className="subject-count-input"
                />
              </div>
              <div className="form-info">
                <p><strong>Class:</strong> {editingTheme?.className}</p>
                <p><strong>Subject:</strong> {editingTheme?.subjectName}</p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-button" onClick={closeEditModal}>
                Cancel
              </button>
              <button className="save-button" onClick={handleEditTheme}>
                Update Theme
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageThemes;