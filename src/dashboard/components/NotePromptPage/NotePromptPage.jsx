// src/dashboard/components/NotePromptPage/NotePromptPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './NotePromptPage.css';

function PromptPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    subject: '',
    topic: '',
    class: '',
    week: '',
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
      
      const response = await fetch('https://localhost:7225/api/LessonNotes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subject: formData.subject,
          topic: formData.topic,
          class: formData.class,
          week: formData.week,
          duration: formData.duration,
          date: formData.date
        })
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        console.error('Error response:', responseData);
        throw new Error(responseData.message || 'Failed to create lesson note');
      }
      
      console.log('Success response:', responseData);
      
      // Navigate to chat page with the note ID
      navigate(`/dashboard/note-chat/${responseData.data.noteId}`);
    } catch (error) {
      console.error('Error creating lesson note:', error);
      setError(error.message || 'An error occurred while generating the lesson note');
    } finally {
      setIsLoading(false);
    }
  };

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
                <optgroup label="Primary School">
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

export default PromptPage;