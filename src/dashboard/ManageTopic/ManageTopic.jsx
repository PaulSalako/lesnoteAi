// src/components/ManageTopics.jsx
import { useManageTopics } from './ManageTopicsLogic';
import './ManageTopic.css';

function ManageTopics() {
  const {
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
  } = useManageTopics();

  // Early return pattern: If not admin or still checking, show minimal loading state
  if (!isAdmin) {
    return null; // Return nothing while checking access status or redirecting
  }

  if (loading && topics.length === 0) {
    return (
      <div className="loading-state">
        <i className="bi bi-arrow-clockwise spinning"></i>
        <p>Loading topics...</p>
      </div>
    );
  }

  if (error && topics.length === 0) {
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
    <div className="topics-page">
      <header className="topics-header">
        <h1>Manage Topics</h1>
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
          
          <div className="filter-group">
            <label>Filter by Subject:</label>
            <div className="select-wrapper">
              <select 
                value={filteredSubject} 
                onChange={(e) => handleSubjectFilter(e.target.value)}
                className="class-select"
                disabled={!filteredClass}
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
          
          <div className="filter-group">
            <label>Filter by Theme:</label>
            <div className="select-wrapper">
              <select 
                value={filteredTheme} 
                onChange={(e) => handleThemeFilter(e.target.value)}
                className="class-select"
                disabled={!filteredSubject}
              >
                <option value="">All Themes</option>
                {themes.map(theme => (
                  <option key={theme.id} value={theme.id}>
                    {theme.displayName || `Theme ${theme.themeNumber}: ${theme.name}`}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="search-group">
            <div className="search-input-wrapper">
              <input
                type="text"
                placeholder="Search topics..."
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
            <i className="bi bi-plus"></i> Add Topics
          </button>
        </div>
      </header>

      <main className="topics-content">
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
          {loading && topics.length > 0 && (
            <div className="loading-overlay">
              <i className="bi bi-arrow-clockwise spinning"></i>
            </div>
          )}

          <table className="topics-table">
            <thead>
              <tr>
                <th>S/N</th>
                <th>Topic</th>
                <th>Theme</th>
                <th>Subject</th>
                <th>Class</th>
                <th>Created By</th>
                <th>Created Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {topics.length > 0 ? (
                topics.map((topic, index) => (
                  <tr key={topic.id}>
                    <td>{((currentPage - 1) * pageSize) + index + 1}</td>
                    <td>{topic.name}</td>
                    <td>{topic.themeName || 'No Theme'}</td>
                    <td>{topic.subjectName}</td>
                    <td>{topic.className}</td>
                    <td>{topic.createdBy.name}</td>
                    <td>{new Date(topic.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="edit-button"
                          onClick={() => openEditModal(topic)}
                          title="Edit Topic"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        {isAdmin && (
                          <button 
                            className={`delete-button ${deletingTopicId === topic.id ? 'deleting' : ''}`}
                            onClick={() => handleDelete(topic.id)}
                            disabled={deletingTopicId === topic.id}
                            title="Delete Topic"
                          >
                            <i className={`bi ${deletingTopicId === topic.id ? 'bi-hourglass-split' : 'bi-trash'}`}></i>
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
                      <i className="bi bi-book"></i>
                      <p>{searchTerm || filteredClass || filteredSubject || filteredTheme ? 'No matches found' : 'No topics found'}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {topics.length > 0 && (
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

      {/* Add Topics Modal */}
      {showAddModal && (
        <div className="modal-overlay" style={{ zIndex: 1000 }}>
          <div className="modal add-modal" style={{ zIndex: 1001 }}>
            <div className="modal-header">
              <h2>Add Topics</h2>
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
                    value={newTopicData.classId}
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
                    value={newTopicData.subjectId}
                    onChange={(e) => handleSubjectChange(e.target.value)}
                    className="modal-select"
                    disabled={!newTopicData.classId || classSubjects.length === 0}
                  >
                    <option value="" disabled>Select a subject</option>
                    {classSubjects.length > 0 ? (
                      classSubjects.map(subject => (
                        <option key={subject.id} value={subject.id}>
                          {subject.name}
                        </option>
                      ))
                    ) : (
                      <option value="">
                        {newTopicData.classId ? "No subjects available for this class" : "Select a class first"}
                      </option>
                    )}
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="themeSelect">Select Theme (Optional)</label>
                <div className="select-wrapper modal-select-wrapper">
                  <select
                    id="themeSelect"
                    value={newTopicData.themeId}
                    onChange={(e) => handleThemeChange(e.target.value)}
                    className="modal-select"
                    disabled={!newTopicData.subjectId || subjectThemes.length === 0}
                  >
                    <option value="">No Theme</option>
                    {subjectThemes.length > 0 && subjectThemes.map(theme => (
                      <option key={theme.id} value={theme.id}>
                        {theme.displayName || `Theme ${theme.themeNumber}: ${theme.name}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="topicCount">Number of Topics</label>
                <input
                  type="number"
                  id="topicCount"
                  min="1"
                  max="20"
                  value={newTopicData.topicCount}
                  onChange={(e) => handleTopicCountChange(e.target.value)}
                  className="topic-count-input"
                />
              </div>
              
              <div className="topic-inputs">
                <h3>Topic Names</h3>
                {newTopicData.topicNames.map((topicName, index) => (
                  <div className="topic-input-row" key={index}>
                    <label htmlFor={`topic-${index}`}>Topic {index + 1}</label>
                    <input
                      type="text"
                      id={`topic-${index}`}
                      value={topicName}
                      onChange={(e) => handleTopicNameChange(index, e.target.value)}
                      placeholder="Enter topic name"
                      className="topic-name-input"
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-button" onClick={closeAddModal}>
                Cancel
              </button>
              <button className="save-button" onClick={handleAddTopics}>
                Add Topics
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Topic Modal */}
      {showEditModal && (
        <div className="modal-overlay" style={{ zIndex: 1000 }}>
          <div className="modal edit-modal" style={{ zIndex: 1001 }}>
            <div className="modal-header">
              <h2>Edit Topic</h2>
              <button className="close-modal-button" onClick={closeEditModal}>
                <i className="bi bi-x"></i>
              </button>
            </div>
            <div className="modal-body">
              {formError && <div className="form-error-message">{formError}</div>}
              <div className="form-group">
                <label htmlFor="editTopicName">Topic Name</label>
                <input
                  type="text"
                  id="editTopicName"
                  value={newTopicName}
                  onChange={(e) => setNewTopicName(e.target.value)}
                  placeholder="Enter topic name"
                  className="topic-name-input"
                />
              </div>
              <div className="form-info">
                <p><strong>Theme:</strong> {editingTopic?.themeName || 'No Theme'}</p>
                <p><strong>Subject:</strong> {editingTopic?.subjectName}</p>
                <p><strong>Class:</strong> {editingTopic?.className}</p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-button" onClick={closeEditModal}>
                Cancel
              </button>
              <button className="save-button" onClick={handleEditTopic}>
                Update Topic
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageTopics;