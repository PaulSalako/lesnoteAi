// src/dashboard/components/AssessmentPromptPage/AssessmentPromptPage.jsx
import { useAssessmentPrompt } from './AssessmentPromptPageLogic';
import './AssessmentPromptPage.css';

function AssessmentPromptPage() {
  const {
    isLoading,
    error,
    formData,
    durationOptions,
    handleInputChange,
    handleSubmit
  } = useAssessmentPrompt();

  return (
    <div className="prompt-container">
      <div className="prompt-header">
        <h1>Generate Assessment</h1>
        <p>Fill in the details below to create your assessment</p>
      </div>

      <div className="prompt-content">
        {error && (
          <div className="error-message">
            <i className="bi bi-exclamation-triangle"></i> {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="prompt-form">
          <div className="form-grid">
            {/* Subject */}
            <div className="form-group">
              <label htmlFor="subject">Subject</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                placeholder="e.g., Mathematics"
                required
                disabled={isLoading}
              />
            </div>

            {/* Topic */}
            <div className="form-group">
              <label htmlFor="topic">Topic</label>
              <input
                type="text"
                id="topic"
                name="topic"
                value={formData.topic}
                onChange={handleInputChange}
                placeholder="e.g., Introduction to Algebra"
                required
                disabled={isLoading}
              />
            </div>

            {/* Class */}
            <div className="form-group">
              <label htmlFor="class">Class</label>
              <select
                id="class"
                name="class"
                value={formData.class}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              >
                <option value="">Select Class</option>
                <optgroup label="Primary">
                  <option value="Primary 1">Primary 1</option>
                  <option value="Primary 2">Primary 2</option>
                  <option value="Primary 3">Primary 3</option>
                  <option value="Primary 4">Primary 4</option>
                  <option value="Primary 5">Primary 5</option>
                  <option value="Primary 6">Primary 6</option>
                </optgroup>
                <optgroup label="Junior Secondary">
                  <option value="JSS 1">JSS 1</option>
                  <option value="JSS 2">JSS 2</option>
                  <option value="JSS 3">JSS 3</option>
                </optgroup>
                <optgroup label="Senior Secondary">
                  <option value="SS 1">SS 1</option>
                  <option value="SS 2">SS 2</option>
                  <option value="SS 3">SS 3</option>
                </optgroup>
              </select>
            </div>

            {/* Assessment Type */}
            <div className="form-group">
              <label htmlFor="assessmentType">Assessment Type</label>
              <select
                id="assessmentType"
                name="assessmentType"
                value={formData.assessmentType}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              >
                <option value="">Select Assessment Type</option>
                <option value="Quiz">Quiz</option>
                <option value="Test">Test</option>
                <option value="Exam">Exam</option>
                <option value="Assignment">Assignment</option>
                <option value="Project">Project</option>
                <option value="Practical">Practical</option>
                <option value="Oral Presentation">Oral Presentation</option>
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
                {durationOptions.map((option) => (
                  <option 
                    key={option.value} 
                    value={option.value}
                  >
                    {option.label}
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
              className="generate-btn assessment-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <i className="bi bi-arrow-repeat spinning"></i>
                  Generating...
                </>
              ) : (
                <>
                  <i className="bi bi-magic"></i>
                  Generate Assessment
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AssessmentPromptPage;