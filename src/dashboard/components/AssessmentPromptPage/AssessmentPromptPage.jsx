// src/dashboard/components/AssessmentPromptPage/AssessmentPromptPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AssessmentPromptPage.css';

function AssessmentPromptPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    subject: '',
    topic: '',
    class: '',
    assessmentType: 'Quiz', // Default value
    duration: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      
      console.log("Using token:", token);
      
      const response = await fetch('https://localhost:7225/api/Assessments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subject: formData.subject,
          topic: formData.topic,
          class: formData.class,
          assessmentType: formData.assessmentType,
          duration: formData.duration,
          date: formData.date
        })
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        console.error('Error response:', responseData);
        throw new Error(responseData.message || 'Failed to create assessment');
      }
      
      console.log('Success response:', responseData);
      
      // Navigate to assessment view page with the assessment ID
      navigate(`/dashboard/lesson-assessment-chat/${responseData.data.assessmentId}`);
    } catch (error) {
      console.error('Error creating assessment:', error);
      setError(error.message || 'An error occurred while generating the assessment');
    } finally {
      setIsLoading(false);
    }
  };

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
              <input
                type="text"
                id="class"
                name="class"
                value={formData.class}
                onChange={handleInputChange}
                placeholder="e.g., JSS 1"
                required
                disabled={isLoading}
              />
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
                <option value="Quiz">Quiz</option>
                <option value="Test">Test</option>
                <option value="Exam">Exam</option>
                <option value="Assignment">Assignment</option>
                <option value="Project">Project</option>
              </select>
            </div>

            {/* Duration */}
            <div className="form-group">
              <label htmlFor="duration">Duration</label>
              <input
                type="text"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                placeholder="e.g., 40 minutes"
                required
                disabled={isLoading}
              />
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
                  <span className="spinner">
                    <i className="bi bi-arrow-repeat"></i>
                  </span>
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