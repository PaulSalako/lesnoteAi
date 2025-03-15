// src/dashboard/components/NotePromptPage/NotePromptPage.jsx
import React from 'react';
import { NotePromptPageLogic } from './NotePromptPageLogic';
import './NotePromptPage.css';

function NotePromptPage() {
  const {
    isLoading,
    error,
    formData,
    classes,
    subjects,
    topics,
    lessonStructure,
    loadingClasses,
    loadingSubjects,
    loadingTopics,
    loadingStructure,
    getGroupedClasses,
    handleInputChange,
    handleSubmit,
    navigate
  } = NotePromptPageLogic();

  const groupedClasses = getGroupedClasses();

  return (
    <div className="prompt-container">
      <div className="prompt-header">
        <h1>Generate Lesson Note</h1>
        <p>Fill in the details below to create your lesson note</p>
      </div>

      <div className="prompt-content">
        {error && (
          <div className="error-message">
            <i className="bi bi-exclamation-triangle"></i> {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="prompt-form">
          <div className="form-grid">
            {/* Class Selection */}
            <div className="form-group">
              <label htmlFor="class">Class</label>
              {loadingClasses ? (
                <div className="select-loading">
                  <i className="bi bi-arrow-repeat spinning"></i> Loading classes...
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
                    <option disabled value="">No classes available</option>
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

            {/* Custom Topic option */}
            {topics.length === 0 && formData.subject && !loadingTopics && (
              <div className="form-group">
                <label htmlFor="customTopic">Custom Topic</label>
                <input
                  type="text"
                  id="customTopic"
                  name="topic"
                  value={formData.topic}
                  onChange={handleInputChange}
                  placeholder="Enter custom topic"
                  required={topics.length === 0 && formData.subject}
                  disabled={isLoading}
                />
                <div className="form-hint">
                  <i className="bi bi-info-circle"></i> No topics found for this subject. Enter a custom topic.
                </div>
              </div>
            )}

            {/* Structure Status Indicator */}
            {formData.topic && (
              <div className="form-group structure-status">
                {loadingStructure ? (
                  <div className="loading-structure">
                    <i className="bi bi-arrow-repeat spinning"></i> Loading lesson structure...
                  </div>
                ) : (
                  <div className={`structure-indicator ${lessonStructure ? 'has-structure' : 'no-structure'}`}>
                    <i className={`bi ${lessonStructure ? 'bi-check-circle-fill' : 'bi-info-circle'}`}></i>
                    {lessonStructure 
                      ? 'Lesson structure found! Your note will be based on this template.' 
                      : 'No specific structure found. A general template will be used.'}
                  </div>
                )}
              </div>
            )}

            {/* Week */}
            <div className="form-group">
              <label htmlFor="week">Week</label>
              <select
                id="week"
                name="week"
                value={formData.week}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              >
                <option value="">Select Week</option>
                {[...Array(14)].map((_, index) => (
                  <option key={index + 1} value={`Week ${index + 1}`}>
                    Week {index + 1}
                  </option>
                ))}
              </select>
            </div>

            {/* Duration */}
            <div className="form-group">
              <label htmlFor="duration">Duration</label>
              <select
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              >
                <option value="">Select Duration</option>
                {[10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60].map((minutes) => (
                  <option 
                    key={minutes} 
                    value={`${minutes} minutes`}
                  >
                    {minutes} minutes{minutes === 60 ? ' (1 hour)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div className="form-group">
              <label htmlFor="date">Date</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="generate-btn"
              disabled={isLoading || !formData.class || !formData.subject || !formData.topic}
            >
              {isLoading ? (
                <>
                  <span className="spinner">
                    <i className="bi bi-arrow-repeat"></i>
                  </span>
                  Generating...
                </>
              ) : (
                <>
                  <i className="bi bi-magic"></i>
                  Generate Lesson Note
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NotePromptPage;