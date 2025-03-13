// src/components/ManageLessonStructure.jsx
import { useManageLessonStructure } from './ManageLessonStructureLogic';
import './ManageLessonStructure.css';

function ManageLessonStructure() {
  const {
    // States
    loading,
    error,
    structures,
    classes,
    subjects,
    themes,
    topics,
    searchTerm,
    filteredClass,
    filteredSubject,
    filteredTheme,
    filteredTopic,
    deletingStructureId,
    isAdmin,
    currentPage,
    totalPages,
    pageSize,
    totalCount,
    showAddModal,
    showEditModal,
    showViewModal,
    viewingStructure,
    editingStructure,
    formError,
    newStructureData,
    
    // Handlers
    handleArrayItemChange,
    handleAddArrayItem,
    handleRemoveArrayItem,
    handleClassChange,
    handleSubjectChange,
    handleThemeChange,
    handlePageChange,
    handlePageSizeChange,
    handleSearch,
    handleClassFilter,
    handleSubjectFilter,
    handleThemeFilter,
    handleTopicFilter,
    handleSearchInputChange,
    handleRetry,
    
    // Modal controls
    openViewModal,
    openEditModal,
    openAddModal,
    closeAddModal,
    closeEditModal,
    closeViewModal,
    
    // Form submission
    handleAddStructure,
    handleEditStructure,
    handleDelete
  } = useManageLessonStructure();

  // Early return pattern: If still checking access, show minimal loading state
  if (loading && structures.length === 0) {
    return (
      <div className="loading-state">
        <i className="bi bi-arrow-clockwise spinning"></i>
        <p>Loading lesson structures...</p>
      </div>
    );
  }

  if (error && structures.length === 0) {
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
    <div className="structures-page">
      <header className="structures-header">
        <h1>Manage Lesson Structures</h1>
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
          {filteredSubject && (
            <div className="filter-group">
              <label>Filter by Theme:</label>
              <div className="select-wrapper">
                <select 
                  value={filteredTheme} 
                  onChange={(e) => handleThemeFilter(e.target.value)}
                  className="theme-select"
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
          )}
          {filteredSubject && (
            <div className="filter-group">
              <label>Filter by Topic:</label>
              <div className="select-wrapper">
                <select 
                  value={filteredTopic} 
                  onChange={(e) => handleTopicFilter(e.target.value)}
                  className="topic-select"
                >
                  <option value="">All Topics</option>
                  {topics.map(topic => (
                    <option key={topic.id} value={topic.id}>
                      {topic.name}
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
                placeholder="Search structures..."
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
            <i className="bi bi-plus"></i> Add Structure
          </button>
        </div>
      </header>
      <main className="structures-content">
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
          {loading && structures.length > 0 && (
            <div className="loading-overlay">
              <i className="bi bi-arrow-clockwise spinning"></i>
            </div>
          )}
          <table className="structures-table">
            <thead>
              <tr>
                <th>S/N</th>
                <th>Class</th>
                <th>Subject</th>
                <th>Theme</th>
                <th>Topic</th>
                <th>Created By</th>
                <th>Created Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {structures.length > 0 ? (
                structures.map((structure, index) => (
                  <tr key={structure.id}>
                    <td>{((currentPage - 1) * pageSize) + index + 1}</td>
                    <td>{structure.className}</td>
                    <td>{structure.subjectName}</td>
                    <td>{structure.themeName || 'N/A'}</td>
                    <td>{structure.topicName || 'N/A'}</td>
                    <td>{structure.createdBy.name}</td>
                    <td>{new Date(structure.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="view-button"
                          onClick={() => openViewModal(structure)}
                          title="View Structure"
                        >
                          <i className="bi bi-eye"></i>
                        </button>
                        <button 
                          className="edit-button"
                          onClick={() => openEditModal(structure)}
                          title="Edit Structure"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        {isAdmin && (
                          <button 
                            className={`delete-button ${deletingStructureId === structure.id ? 'deleting' : ''}`}
                            onClick={() => handleDelete(structure.id)}
                            disabled={deletingStructureId === structure.id}
                            title="Delete Structure"
                          >
                            <i className={`bi ${deletingStructureId === structure.id ? 'bi-hourglass-split' : 'bi-trash'}`}></i>
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
                      <i className="bi bi-file-earmark-text"></i>
                      <p>{searchTerm || filteredClass || filteredSubject || filteredTheme || filteredTopic ? 'No matches found' : 'No lesson structures found'}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {structures.length > 0 && (
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
      {/* View Structure Modal */}
      {showViewModal && viewingStructure && (
        <div className="modal-overlay" style={{ zIndex: 1000 }}>
          <div className="modal view-modal" style={{ zIndex: 1001 }}>
            <div className="modal-header">
              <h2>View Lesson Structure</h2>
              <button className="close-modal-button" onClick={closeViewModal}>
                <i className="bi bi-x"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="structure-details">
                <div className="structure-metadata">
                  <div className="metadata-item">
                    <span className="metadata-label">Class:</span>
                    <span className="metadata-value">{viewingStructure.className}</span>
                  </div>
                  <div className="metadata-item">
                    <span className="metadata-label">Subject:</span>
                    <span className="metadata-value">{viewingStructure.subjectName}</span>
                  </div>
                  {viewingStructure.themeName && (
                    <div className="metadata-item">
                      <span className="metadata-label">Theme:</span>
                      <span className="metadata-value">{viewingStructure.themeName}</span>
                    </div>
                  )}
                  {viewingStructure.topicName && (
                    <div className="metadata-item">
                      <span className="metadata-label">Topic:</span>
                      <span className="metadata-value">{viewingStructure.topicName}</span>
                    </div>
                  )}
                </div>
                
                <div className="structure-sections">
                  {viewingStructure.performanceObjectives?.length > 0 && (
                    <div className="structure-section">
                      <h4>Performance Objectives</h4>
                      <ol>
                        {viewingStructure.performanceObjectives.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                  
                  {viewingStructure.contentItems?.length > 0 && (
                    <div className="structure-section">
                      <h4>Content</h4>
                      <ol>
                        {viewingStructure.contentItems.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                  
                  {viewingStructure.teacherActivities?.length > 0 && (
                    <div className="structure-section">
                      <h4>Teacher's Activities</h4>
                      <ol>
                        {viewingStructure.teacherActivities.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                  
                  {viewingStructure.studentActivities?.length > 0 && (
                    <div className="structure-section">
                      <h4>Student's Activities</h4>
                      <ol>
                        {viewingStructure.studentActivities.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                  
                  {viewingStructure.teachingMaterials?.length > 0 && (
                    <div className="structure-section">
                      <h4>Teaching & Learning Materials (TLMs)</h4>
                      <ol>
                        {viewingStructure.teachingMaterials.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                  
                  {viewingStructure.evaluationItems?.length > 0 && (
                    <div className="structure-section">
                      <h4>Evaluation</h4>
                      <ol>
                        {viewingStructure.evaluationItems.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                  {viewingStructure.assessmentItems?.length > 0 && (
                    <div className="structure-section">
                      <h4>Assessment</h4>
                      <ol>
                        {viewingStructure.assessmentItems.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="edit-structure-button" onClick={() => {
                closeViewModal();
                openEditModal(viewingStructure);
              }}>
                <i className="bi bi-pencil"></i> Edit Structure
              </button>
              <button className="close-button" onClick={closeViewModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Add/Edit Structure Modal */}
      {(showAddModal || showEditModal) && (
        <div className="modal-overlay" style={{ zIndex: 1000 }}>
          <div className="modal structure-modal" style={{ zIndex: 1001 }}>
            <div className="modal-header">
              <h2>{showAddModal ? 'Add New Lesson Structure' : 'Edit Lesson Structure'}</h2>
              <button className="close-modal-button" onClick={() => {
                showAddModal ? closeAddModal() : closeEditModal();
              }}>
                <i className="bi bi-x"></i>
              </button>
            </div>
            <div className="modal-body">
              {formError && <div className="form-error-message">{formError}</div>}
              
              {showAddModal && (
                <div className="form-section">
                  <h3>Select Scope</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="classSelect">Class</label>
                      <div className="select-wrapper form-select-wrapper">
                        <select
                          id="classSelect"
                          value={newStructureData.classId}
                          onChange={(e) => handleClassChange(e.target.value)}
                          className="form-select"
                          disabled={showEditModal}
                        >
                          {classes.map(classItem => (
                            <option key={classItem.id} value={classItem.id}>
                              {classItem.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="subjectSelect">Subject</label>
                      <div className="select-wrapper form-select-wrapper">
                        <select
                          id="subjectSelect"
                          value={newStructureData.subjectId}
                          onChange={(e) => handleSubjectChange(e.target.value)}
                          className="form-select"
                          disabled={showEditModal || !newStructureData.classId}
                        >
                          {subjects.length > 0 ? (
                            subjects.map(subject => (
                              <option key={subject.id} value={subject.id}>
                                {subject.name}
                              </option>
                            ))
                          ) : (
                            <option value="">Select a class first</option>
                          )}
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="themeSelect">Theme</label>
                      <div className="select-wrapper form-select-wrapper">
                        <select
                          id="themeSelect"
                          value={newStructureData.themeId}
                          onChange={(e) => handleThemeChange(e.target.value)}
                          className="form-select"
                          disabled={showEditModal || !newStructureData.subjectId}
                        >
                          <option value="">No Theme (Subject Level)</option>
                          {themes.length > 0 && themes.map(theme => (
                            <option key={theme.id} value={theme.id}>
                              {theme.displayName || `Theme ${theme.themeNumber}: ${theme.name}`}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="topicSelect">Topic</label>
                      <div className="select-wrapper form-select-wrapper">
                        <select
                          id="topicSelect"
                          value={newStructureData.topicId}
                          onChange={(e) => setNewStructureData({...newStructureData, topicId: e.target.value})}
                          className="form-select"
                          disabled={showEditModal || !newStructureData.subjectId}
                        >
                          <option value="">{newStructureData.themeId ? "No Topic (Theme Level)" : "No Topic (Subject Level)"}</option>
                          {topics.length > 0 && topics.map(topic => (
                            <option key={topic.id} value={topic.id}>
                              {topic.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="structure-sections">
                <div className="structure-section-group">
                  <h3>Performance Objectives</h3>
                  {newStructureData.performanceObjectives.map((objective, index) => (
                    <div className="array-input-row" key={index}>
                      <span className="array-item-number">{index + 1}.</span>
                      <input
                        type="text"
                        value={objective}
                        onChange={(e) => handleArrayItemChange('performanceObjectives', index, e.target.value)}
                        placeholder="Enter performance objective"
                        className="array-item-input"
                      />
                      <button
                        className="array-item-remove"
                        onClick={() => handleRemoveArrayItem('performanceObjectives', index)}
                        title="Remove this item"
                      >
                        <i className="bi bi-dash-circle"></i>
                      </button>
                    </div>
                  ))}
                  <button 
                    className="add-array-item" 
                    onClick={() => handleAddArrayItem('performanceObjectives')}
                  >
                    <i className="bi bi-plus-circle"></i> Add Objective
                  </button>
                </div>
                
                <div className="structure-section-group">
                  <h3>Content</h3>
                  {newStructureData.contentItems.map((content, index) => (
                    <div className="array-input-row" key={index}>
                      <span className="array-item-number">{index + 1}.</span>
                      <input
                        type="text"
                        value={content}
                        onChange={(e) => handleArrayItemChange('contentItems', index, e.target.value)}
                        placeholder="Enter content item"
                        className="array-item-input"
                      />
                      <button
                        className="array-item-remove"
                        onClick={() => handleRemoveArrayItem('contentItems', index)}
                        title="Remove this item"
                      >
                        <i className="bi bi-dash-circle"></i>
                      </button>
                    </div>
                  ))}
                  <button 
                    className="add-array-item" 
                    onClick={() => handleAddArrayItem('contentItems')}
                  >
                    <i className="bi bi-plus-circle"></i> Add Content Item
                  </button>
                </div>
                
                <div className="structure-section-group">
                  <h3>Teacher's Activities</h3>
                  {newStructureData.teacherActivities.map((activity, index) => (
                    <div className="array-input-row" key={index}>
                      <span className="array-item-number">{index + 1}.</span>
                      <input
                        type="text"
                        value={activity}
                        onChange={(e) => handleArrayItemChange('teacherActivities', index, e.target.value)}
                        placeholder="Enter teacher activity"
                        className="array-item-input"
                      />
                      <button
                        className="array-item-remove"
                        onClick={() => handleRemoveArrayItem('teacherActivities', index)}
                        title="Remove this item"
                      >
                        <i className="bi bi-dash-circle"></i>
                      </button>
                    </div>
                  ))}
                  <button 
                    className="add-array-item" 
                    onClick={() => handleAddArrayItem('teacherActivities')}
                  >
                    <i className="bi bi-plus-circle"></i> Add Teacher Activity
                  </button>
                </div>
                
                <div className="structure-section-group">
                  <h3>Student's Activities</h3>
                  {newStructureData.studentActivities.map((activity, index) => (
                    <div className="array-input-row" key={index}>
                      <span className="array-item-number">{index + 1}.</span>
                      <input
                        type="text"
                        value={activity}
                        onChange={(e) => handleArrayItemChange('studentActivities', index, e.target.value)}
                        placeholder="Enter student activity"
                        className="array-item-input"
                      />
                      <button
                        className="array-item-remove"
                        onClick={() => handleRemoveArrayItem('studentActivities', index)}
                        title="Remove this item"
                      >
                        <i className="bi bi-dash-circle"></i>
                      </button>
                    </div>
                  ))}
                  <button 
                    className="add-array-item" 
                    onClick={() => handleAddArrayItem('studentActivities')}
                  >
                    <i className="bi bi-plus-circle"></i> Add Student Activity
                  </button>
                </div>
                
                <div className="structure-section-group">
                  <h3>Teaching & Learning Materials (TLMs)</h3>
                  {newStructureData.teachingMaterials.map((material, index) => (
                    <div className="array-input-row" key={index}>
                      <span className="array-item-number">{index + 1}.</span>
                      <input
                        type="text"
                        value={material}
                        onChange={(e) => handleArrayItemChange('teachingMaterials', index, e.target.value)}
                        placeholder="Enter teaching material"
                        className="array-item-input"
                      />
                      <button
                        className="array-item-remove"
                        onClick={() => handleRemoveArrayItem('teachingMaterials', index)}
                        title="Remove this item"
                      >
                        <i className="bi bi-dash-circle"></i>
                      </button>
                    </div>
                  ))}
                  <button 
                    className="add-array-item" 
                    onClick={() => handleAddArrayItem('teachingMaterials')}
                  >
                    <i className="bi bi-plus-circle"></i> Add Teaching Material
                  </button>
                </div>
                
                <div className="structure-section-group">
                  <h3>Evaluation</h3>
                  {newStructureData.evaluationItems.map((item, index) => (
                    <div className="array-input-row" key={index}>
                      <span className="array-item-number">{index + 1}.</span>
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => handleArrayItemChange('evaluationItems', index, e.target.value)}
                        placeholder="Enter evaluation item"
                        className="array-item-input"
                      />
                      <button
                        className="array-item-remove"
                        onClick={() => handleRemoveArrayItem('evaluationItems', index)}
                        title="Remove this item"
                      >
                        <i className="bi bi-dash-circle"></i>
                      </button>
                    </div>
                  ))}
                  <button 
                    className="add-array-item" 
                    onClick={() => handleAddArrayItem('evaluationItems')}
                  >
                    <i className="bi bi-plus-circle"></i> Add Evaluation Item
                  </button>
                </div>
                <div className="structure-section-group">
                  <h3>Assessment</h3>
                  {newStructureData.assessmentItems.map((item, index) => (
                    <div className="array-input-row" key={index}>
                      <span className="array-item-number">{index + 1}.</span>
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => handleArrayItemChange('assessmentItems', index, e.target.value)}
                        placeholder="Enter assessment item"
                        className="array-item-input"
                      />
                      <button
                        className="array-item-remove"
                        onClick={() => handleRemoveArrayItem('assessmentItems', index)}
                        title="Remove this item"
                      >
                        <i className="bi bi-dash-circle"></i>
                      </button>
                    </div>
                  ))}
                  <button 
                    className="add-array-item" 
                    onClick={() => handleAddArrayItem('assessmentItems')}
                  >
                    <i className="bi bi-plus-circle"></i> Add Assessment Item
                  </button>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-button" onClick={() => {
                showAddModal ? closeAddModal() : closeEditModal();
              }}>
                Cancel
              </button>
              <button 
                className="save-button" 
                onClick={showAddModal ? handleAddStructure : handleEditStructure}
              >
                {showAddModal ? 'Create Structure' : 'Update Structure'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageLessonStructure;