// src/dashboard/components/NotePromptPage/NotePromptPage.jsx
import { useState, useEffect } from 'react';
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

  // State for dynamic dropdown options
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [lessonStructure, setLessonStructure] = useState(null);

  // Loading states for dropdowns
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [loadingStructure, setLoadingStructure] = useState(false);

  const token = localStorage.getItem('token') || sessionStorage.getItem('token');

  // Fetch classes on component mount
  useEffect(() => {
    fetchClasses();
  }, []);

  // Fetch subjects when class changes
  useEffect(() => {
    if (formData.class) {
      fetchSubjects(formData.class);
    } else {
      setSubjects([]);
      setFormData(prev => ({ ...prev, subject: '' }));
    }
    // Clear lesson structure when class changes
    setLessonStructure(null);
  }, [formData.class]);

  // Fetch topics when subject changes
  useEffect(() => {
    if (formData.subject) {
      fetchTopics(formData.subject);
    } else {
      setTopics([]);
      setFormData(prev => ({ ...prev, topic: '' }));
    }
    // Clear lesson structure when subject changes
    setLessonStructure(null);
  }, [formData.subject]);

  // Fetch lesson structure when topic changes
  useEffect(() => {
    if (formData.topic) {
      fetchLessonStructure(formData.topic);
    } else {
      setLessonStructure(null);
    }
  }, [formData.topic]);

  // Fetch classes from API
  const fetchClasses = async () => {
    try {
      setLoadingClasses(true);
      const response = await fetch('https://localhost:7225/api/Class/all', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch classes');
      }

      const result = await response.json();
      setClasses(result);
    } catch (error) {
      console.error('Error fetching classes:', error);
      setError('Failed to load classes. Please refresh the page.');
    } finally {
      setLoadingClasses(false);
    }
  };

  // Fetch subjects for selected class
  const fetchSubjects = async (classId) => {
    try {
      setLoadingSubjects(true);
      const response = await fetch(`https://localhost:7225/api/Subject/by-class/${classId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch subjects');
      }

      const result = await response.json();
      setSubjects(result);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setError('Failed to load subjects for the selected class.');
    } finally {
      setLoadingSubjects(false);
    }
  };

  // Fetch topics for selected subject
  const fetchTopics = async (subjectId) => {
    try {
      setLoadingTopics(true);
      const response = await fetch(`https://localhost:7225/api/Topic/by-subject/${subjectId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch topics');
      }

      const result = await response.json();
      setTopics(result);
    } catch (error) {
      console.error('Error fetching topics:', error);
      setError('Failed to load topics for the selected subject.');
    } finally {
      setLoadingTopics(false);
    }
  };

  // Fetch lesson structure for selected topic
  const fetchLessonStructure = async (topicId) => {
    try {
      setLoadingStructure(true);
      const response = await fetch(`https://localhost:7225/api/LessonNoteStructure/for-topic/${topicId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch lesson structure');
      }

      const structures = await response.json();
      
      // If structures are found, use the first one (most specific one)
      if (structures && structures.length > 0) {
        // Fetch the full structure details
        const structureDetails = await fetch(`https://localhost:7225/api/LessonNoteStructure/${structures[0].id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!structureDetails.ok) {
          throw new Error('Failed to fetch structure details');
        }
        
        const details = await structureDetails.json();
        setLessonStructure(details);
      } else {
        setLessonStructure(null);
      }
    } catch (error) {
      console.error('Error fetching lesson structure:', error);
      // Not showing error to user as this is optional
      setLessonStructure(null);
    } finally {
      setLoadingStructure(false);
    }
  };

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
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      
      // Get the selected class, subject, and topic objects
      const selectedClass = classes.find(c => c.id === formData.class);
      const selectedSubject = subjects.find(s => s.id === formData.subject);
      const selectedTopic = topics.find(t => t.id === formData.topic);
      
      const requestData = {
        classId: selectedClass?.id || formData.class,
        subjectId: selectedSubject?.id || formData.subject,
        topicId: selectedTopic?.id || formData.topic,
        className: selectedClass?.name || formData.class,
        subjectName: selectedSubject?.name || formData.subject,
        topicName: selectedTopic?.name || formData.topic,
        structureId: lessonStructure?.id || null,
        week: formData.week,
        duration: formData.duration,
        date: formData.date
      };
      
      const response = await fetch('https://localhost:7225/api/LessonNotes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
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
                      <optgroup label="Primary Classes">
                        {classes
                          .filter(classItem => classItem.name.toLowerCase().includes('primary') || classItem.name.match(/^p\d/i))
                          .map(classItem => (
                            <option key={classItem.id} value={classItem.id}>
                              {classItem.name}
                            </option>
                          ))
                        }
                      </optgroup>
                      
                      {/* JSS Classes */}
                      <optgroup label="Junior Secondary School">
                        {classes
                          .filter(classItem => classItem.name.toLowerCase().includes('jss') || classItem.name.toLowerCase().includes('junior'))
                          .map(classItem => (
                            <option key={classItem.id} value={classItem.id}>
                              {classItem.name}
                            </option>
                          ))
                        }
                      </optgroup>
                      
                      {/* SSS Classes */}
                      <optgroup label="Senior Secondary School">
                        {classes
                          .filter(classItem => classItem.name.toLowerCase().includes('sss') || classItem.name.toLowerCase().includes('senior'))
                          .map(classItem => (
                            <option key={classItem.id} value={classItem.id}>
                              {classItem.name}
                            </option>
                          ))
                        }
                      </optgroup>
                      
                      {/* Other Classes (if any) */}
                      {classes.filter(classItem => 
                        !classItem.name.toLowerCase().includes('primary') && 
                        !classItem.name.match(/^p\d/i) &&
                        !classItem.name.toLowerCase().includes('jss') && 
                        !classItem.name.toLowerCase().includes('junior') &&
                        !classItem.name.toLowerCase().includes('sss') && 
                        !classItem.name.toLowerCase().includes('senior')
                      ).length > 0 && (
                        <optgroup label="Other Classes">
                          {classes
                            .filter(classItem => 
                              !classItem.name.toLowerCase().includes('primary') && 
                              !classItem.name.match(/^p\d/i) &&
                              !classItem.name.toLowerCase().includes('jss') && 
                              !classItem.name.toLowerCase().includes('junior') &&
                              !classItem.name.toLowerCase().includes('sss') && 
                              !classItem.name.toLowerCase().includes('senior')
                            )
                            .map(classItem => (
                              <option key={classItem.id} value={classItem.id}>
                                {classItem.name}
                              </option>
                            ))
                          }
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

export default PromptPage;