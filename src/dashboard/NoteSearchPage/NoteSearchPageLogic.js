// src/dashboard/components/NoteSearchPage/NoteSearchPage.jsx
import React from 'react';
import { useNoteSearchPage } from './NoteSearchPageLogic';
import NoteViewModal from './NoteViewModal';
import './NoteSearchPage.css';


function NoteSearchPage() {
  const {
    isLoading,
    error,
    formData,
    classes,
    subjects,
    topics,
    loadingClasses,
    loadingSubjects,
    loadingTopics,
    searchResults,
    hasSearched,
    noResultsFound,
    selectedNote,
    showModal,
    loadingNote,
    getGroupedClasses,
    handleInputChange,
    handleSearch,
    handleViewNote,
    handleCloseModal,
    handleRequestNote,
    retryFetchClasses,
    retryFetchSubjects,
    retryFetchTopics,
    navigate
  } = useNoteSearchPage();

  const groupedClasses = getGroupedClasses();

  return (
    <div className="prompt-container">
      <div className="prompt-header">
        <h1>Find Lesson Notes</h1>
        <p>Search our database of lesson notes by class, subject, and topic</p>
      </div>

      <div className="prompt-content">
        {error && (
          <div className="error-message">
            <i className="bi bi-exclamation-triangle"></i> {error}
          </div>
        )}
        
        <form onSubmit={handleSearch} className="prompt-form">
          <div className="form-grid">
            {/* Class Selection */}
            <div className="form-group">
              <label htmlFor="class">Class</label>
              {loadingClasses ? (
                <div className="select-loading">
                  <i className="bi bi-arrow-repeat spinning"></i> Loading classes...
                </div>
              ) : classes.length === 0 ? (
                <div className="dropdown-not-available">
                  <p>No classes available</p>
                  <button 
                    type="button"
                    className="retry-button" 
                    onClick={retryFetchClasses}
                    disabled={loadingClasses}
                  >
                    <i className={`bi ${loadingClasses ? 'bi-arrow-repeat spinning' : 'bi-arrow-clockwise'}`}></i> 
                    {loadingClasses ? 'Retrying...' : 'Retry'}
                  </button>
                </div>
              ) : (
                <select
                  id="class"
                  name="class"
                  value={formData.class}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                  className={classes.length === 0 ? 'empty-select' : ''}
                >
                  <option value="">Select Class</option>
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
                </select>
              )}
            </div>

            {/* Subject Selection */}
            <div className="form-group">
              <label htmlFor="subject">Subject</label>
              {loadingSubjects ? (
                <div className="select-loading">
                  <i className="bi bi-arrow-repeat spinning"></i> Loading subjects...
                </div>
              ) : formData.class && subjects.length === 0 ? (
                <div className="dropdown-not-available">
                  <p>No subjects available for this class</p>
                  <button 
                    type="button"
                    className="retry-button" 
                    onClick={retryFetchSubjects}
                    disabled={loadingSubjects}
                  >
                    <i className={`bi ${loadingSubjects ? 'bi-arrow-repeat spinning' : 'bi-arrow-clockwise'}`}></i> 
                    {loadingSubjects ? 'Retrying...' : 'Retry'}
                  </button>
                </div>
              ) : (
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading || !formData.class || subjects.length === 0}
                  className={!formData.class || subjects.length === 0 ? 'empty-select' : ''}
                >
                  <option value="">Select Subject</option>
                  {subjects.length > 0 ? (
                    subjects.map(subject => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))
                  ) : (
                    <option disabled value="">
                      {formData.class ? 'No subjects available for this class' : 'Select a class first'}
                    </option>
                  )}
                </select>
              )}
            </div>

            {/* Topic Selection */}
            <div className="form-group">
              <label htmlFor="topic">Topic</label>
              {loadingTopics ? (
                <div className="select-loading">
                  <i className="bi bi-arrow-repeat spinning"></i> Loading topics...
                </div>
              ) : formData.subject && topics.length === 0 ? (
                <div className="dropdown-not-available">
                  <p>No topics available for this subject</p>
                  <button 
                    type="button"
                    className="retry-button" 
                    onClick={retryFetchTopics}
                    disabled={loadingTopics}
                  >
                    <i className={`bi ${loadingTopics ? 'bi-arrow-repeat spinning' : 'bi-arrow-clockwise'}`}></i> 
                    {loadingTopics ? 'Retrying...' : 'Retry'}
                  </button>
                </div>
              ) : (
                <select
                  id="topic"
                  name="topic"
                  value={formData.topic}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading || !formData.subject || topics.length === 0}
                  className={!formData.subject || topics.length === 0 ? 'empty-select' : ''}
                >
                  <option value="">Select Topic</option>
                  {topics.length > 0 ? (
                    topics.map(topic => (
                      <option key={topic.id} value={topic.id}>
                        {topic.name}
                      </option>
                    ))
                  ) : (
                    <option disabled value="">
                      {formData.subject ? 'No topics available for this subject' : 'Select a subject first'}
                    </option>
                  )}
                </select>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="search-btn"
              disabled={isLoading || !formData.class || !formData.subject || !formData.topic || topics.length === 0}
            >
              {isLoading ? (
                <>
                  <span className="spinner">
                    <i className="bi bi-arrow-repeat spinning"></i>
                  </span>
                  Searching...
                </>
              ) : (
                <>
                  <i className="bi bi-search"></i>
                  Search Lesson Notes
                </>
              )}
            </button>
          </div>
        </form>

        {/* Search Results Section */}
        {hasSearched && (
          <div className="search-results-section">
            <h2 className="results-heading">Search Results</h2>
            
            {noResultsFound ? (
              <div className="no-results-found">
                <div className="empty-state">
                  <i className="bi bi-info-circle large-icon"></i>
                  <h3>No Lesson Notes Found</h3>
                  <p>We couldn't find any lesson notes matching your search criteria.</p>
                  
                  <div className="no-results-actions">
                    <button 
                      type="button"
                      className="request-note-btn"
                      onClick={handleRequestNote}
                    >
                      <i className="bi bi-plus-circle"></i>
                      Request This Lesson Note
                    </button>
                    
                    <p className="or-separator">or</p>
                    
                    <button 
                      type="button"
                      className="browse-all-btn"
                      onClick={() => navigate('/dashboard/browse-notes')}
                    >
                      <i className="bi bi-grid"></i>
                      Browse All Available Notes
                    </button>
                  </div>
                </div>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="results-grid">
                {searchResults.map(note => (
                  <div 
                    key={note.id} 
                    className="note-card"
                    onClick={() => handleViewNote(note.id)}
                  >
                    <div className="note-icon">
                      <i className="bi bi-file-earmark-text"></i>
                    </div>
                    <div className="note-content">
                      <h3 className="note-subject">{note.subject || note.subjectName}</h3>
                      <p className="note-topic">{note.topic || note.topicName}</p>
                      <div className="note-meta">
                        <span className="note-class">
                          <i className="bi bi-mortarboard"></i> 
                          {note.className || note.class_ || note.class}
                        </span>
                        <span className="note-date">
                          <i className="bi bi-calendar3"></i> 
                          {note.date}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        )}
      </div>
      
      {/* Note Loading Overlay */}
      {loadingNote && (
        <div className="loading-overlay">
          <div className="loading-content">
            <i className="bi bi-arrow-repeat spinning"></i>
            <p>Loading lesson note...</p>
          </div>
        </div>
      )}
      
      {/* Note View Modal */}
      {showModal && selectedNote && (
        <NoteViewModal 
          note={selectedNote}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}

export default NoteSearchPage;