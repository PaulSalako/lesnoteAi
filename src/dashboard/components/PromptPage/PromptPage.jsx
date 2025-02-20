// src/dashboard/components/PromptPage/PromptPage.jsx
import { useState } from 'react';
import './PromptPage.css';

function PromptPage({ onGenerate }) {
  const [formData, setFormData] = useState({
    subject: '',
    topic: '',
    class: '',
    week: '',
    duration: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [isLoading, setIsLoading] = useState(false);

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
    try {
      await onGenerate(formData);
    } catch (error) {
      console.error('Error generating note:', error);
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
              />
            </div>

            {/* Week */}
            <div className="form-group">
              <label htmlFor="week">Week</label>
              <input
                type="text"
                id="week"
                name="week"
                value={formData.week}
                onChange={handleInputChange}
                placeholder="e.g., Week 1"
                required
              />
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

        
        {/* <div className="templates-section">
          <h3>Quick Templates</h3>
          <div className="template-grid">
            <div className="template-card">
              <i className="bi bi-file-text"></i>
              <span>Basic Template</span>
            </div>
            <div className="template-card">
              <i className="bi bi-graph-up"></i>
              <span>Interactive</span>
            </div>
            <div className="template-card">
              <i className="bi bi-trophy"></i>
              <span>Advanced</span>
            </div>
          </div>
        </div> */}

      </div>
    </div>
  );
}

export default PromptPage;