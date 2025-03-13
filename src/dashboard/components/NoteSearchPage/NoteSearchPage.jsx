// src/dashboard/components/NoteSearchPage/NoteSearchPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './NoteSearchPage.css';
import NoteViewModal from './NoteViewModal';

function NoteSearchPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    subject: '',
    topic: '',
    class: ''
  });

  // State for dynamic dropdown options
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);

  // Loading states for dropdowns
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingTopics, setLoadingTopics] = useState(false);
  
  // Search results state
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [noResultsFound, setNoResultsFound] = useState(false);
  
  // Modal state
  const [selectedNote, setSelectedNote] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loadingNote, setLoadingNote] = useState(false);

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
  }, [formData.class]);

  // Fetch topics when subject changes
  useEffect(() => {
    if (formData.subject) {
      fetchTopics(formData.subject);
    } else {
      setTopics([]);
      setFormData(prev => ({ ...prev, topic: '' }));
    }
  }, [formData.subject]);

  // Fetch classes from API - Updated to get all classes, not just user's classes
  const fetchClasses = async () => {
    try {
      setLoadingClasses(true);
      // Change the endpoint to get all available classes, not just user-specific ones
      const response = await fetch('https://localhost:7225/api/Class/all', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        // Fallback to user-classes if all-classes endpoint doesn't exist
        const fallbackResponse = await fetch('https://localhost:7225/api/Class/user-classes', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!fallbackResponse.ok) {
          throw new Error('Failed to fetch classes');
        }
        
        const fallbackResult = await fallbackResponse.json();
        setClasses(fallbackResult);
        return;
      }

      const result = await response.json();
      setClasses(result);
    } catch (error) {
      console.error('Error fetching classes:', error);
      // Don't set global error, just handle locally
    } finally {
      setLoadingClasses(false);
    }
  };

  // Retry fetching classes
  const retryFetchClasses = () => {
    setLoadingClasses(true);
    fetchClasses();
  };

  // Fetch subjects for selected class - Updated to get all subjects
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
      setSubjects([]);
    } finally {
      setLoadingSubjects(false);
    }
  };

  // Retry fetching subjects
  const retryFetchSubjects = () => {
    if (formData.class) {
      setLoadingSubjects(true);
      fetchSubjects(formData.class);
    }
  };

  // Fetch topics for selected subject - Remains the same as all topics should be available
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
      setTopics([]);
    } finally {
      setLoadingTopics(false);
    }
  };

  // Retry fetching topics
  const retryFetchTopics = () => {
    if (formData.subject) {
      setLoadingTopics(true);
      fetchTopics(formData.subject);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setHasSearched(true);
    setNoResultsFound(false);
    
    try {
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      
      // Get the selected class, subject, and topic objects
      const selectedClass = classes.find(c => c.id === formData.class);
      const selectedSubject = subjects.find(s => s.id === formData.subject);
      const selectedTopic = topics.find(t => t.id === formData.topic);
      
      const searchData = {
        classId: selectedClass?.id,
        subjectId: selectedSubject?.id,
        topicId: selectedTopic?.id,
        className: selectedClass?.name,
        subjectName: selectedSubject?.name,
        topicName: selectedTopic?.name,
        // Add flag to search all notes, not just the user's notes
        searchAllNotes: true
      };
      
      console.log('Search parameters:', searchData);
      
      // Search for available notes - Updated to use a general search endpoint
      const response = await fetch('https://localhost:7225/api/LessonNotes/search-all', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(searchData)
      });
      
      // If search-all endpoint doesn't exist, fall back to regular search
      if (response.status === 404) {
        const fallbackResponse = await fetch('https://localhost:7225/api/LessonNotes/search', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(searchData)
        });
        
        if (!fallbackResponse.ok) {
          throw new Error('Failed to search for lesson notes');
        }
        
        const fallbackData = await fallbackResponse.json();
        
        if (fallbackData && fallbackData.length > 0) {
          setSearchResults(fallbackData);
          setNoResultsFound(false);
        } else {
          setSearchResults([]);
          setNoResultsFound(true);
        }
        return;
      }
      
      // Check for no results or error
      if (!response.ok) {
        throw new Error('Failed to search for lesson notes');
      }
      
      const responseData = await response.json();
      console.log('Search results:', responseData);
      
      // Set search results
      if (responseData && responseData.length > 0) {
        setSearchResults(responseData);
        setNoResultsFound(false);
      } else {
        setSearchResults([]);
        setNoResultsFound(true);
      }
    } catch (error) {
      console.error('Error searching for lesson notes:', error);
      setError(error.message || 'An error occurred while searching for lesson notes');
      setNoResultsFound(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle view note (opens modal)
  const handleViewNote = async (noteId) => {
    try {
      setLoadingNote(true);
      
      // Fetch the full note data
      const response = await fetch(`https://localhost:7225/api/LessonNotes/${noteId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch lesson note details');
      }
      
      const noteData = await response.json();
      
      // Format note content based on API response structure
      let content = '';
      if (noteData.content) {
        content = noteData.content;
      } else if (noteData.messages && noteData.messages.length > 0) {
        // Get the last AI message to display as content
        const aiMessages = noteData.messages.filter(
          msg => msg.role === 'assistant'
        );
        if (aiMessages.length > 0) {
          content = aiMessages[aiMessages.length - 1].content;
        }
      }
      
      // Set the note with content for modal
      setSelectedNote({
        ...noteData,
        content: content
      });
      
      // Show the modal
      setShowModal(true);
      
    } catch (error) {
      console.error('Error fetching note details:', error);
      alert('Failed to load note details. Please try again.');
    } finally {
      setLoadingNote(false);
    }
  };

  // Close the modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedNote(null);
  };

  // Handle request note
  const handleRequestNote = () => {
    // Get the selected class, subject, and topic objects
    const selectedClass = classes.find(c => c.id === formData.class);
    const selectedSubject = subjects.find(s => s.id === formData.subject);
    const selectedTopic = topics.find(t => t.id === formData.topic);
    
    navigate('/dashboard/request-note', { 
      state: { 
        searchParams: {
          classId: formData.class,
          className: selectedClass?.name,
          subjectId: formData.subject,
          subjectName: selectedSubject?.name,
          topicId: formData.topic,
          topicName: selectedTopic?.name
        } 
      }
    });
  };

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
                  {(
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