// src/dashboard/components/NotePromptPage/NotePromptPageLogic.js
import { API_URL } from '../../config';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';



export function NotePromptPageLogic() {
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
      const response = await fetch(`${API_URL}/Class/all`, {
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
      Swal.fire({
        title: 'Error',
        text: 'Failed to load classes. Please refresh the page.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setLoadingClasses(false);
    }
  };

  // Fetch subjects for selected class
  const fetchSubjects = async (classId) => {
    try {
      setLoadingSubjects(true);
      const response = await fetch(`${API_URL}/Subject/by-class/${classId}`, {
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
      Swal.fire({
        title: 'Error',
        text: 'Failed to load subjects for the selected class.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setLoadingSubjects(false);
    }
  };

  // Fetch topics for selected subject
  const fetchTopics = async (subjectId) => {
    try {
      setLoadingTopics(true);
      const response = await fetch(`${API_URL}/Topic/by-subject/${subjectId}`, {
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
      Swal.fire({
        title: 'Error',
        text: 'Failed to load topics for the selected subject.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setLoadingTopics(false);
    }
  };

  // Fetch lesson structure for selected topic
  const fetchLessonStructure = async (topicId) => {
    try {
      setLoadingStructure(true);
      const response = await fetch(`${API_URL}/LessonNoteStructure/for-topic/${topicId}`, {
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
        const structureDetails = await fetch(`${API_URL}/LessonNoteStructure/${structures[0].id}`, {
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
      
      const response = await fetch(`${API_URL}/LessonNotes`, {
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
      
      // Show success message before navigating
      Swal.fire({
        title: 'Success!',
        text: 'Your lesson note is being generated',
        icon: 'success',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false
      }).then(() => {
        // Navigate to chat page with the note ID
        navigate(`/dashboard/note-chat/${responseData.data.noteId}`);
      });
    } catch (error) {
      console.error('Error creating lesson note:', error);
      setError(error.message || 'An error occurred while generating the lesson note');
      Swal.fire({
        title: 'Error',
        text: error.message || 'An error occurred while generating the lesson note',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getGroupedClasses = () => {
    // Primary Classes
    const primary = classes.filter(classItem => 
      classItem.name.toLowerCase().includes('primary') || classItem.name.match(/^p\d/i)
    );
    
    // JSS Classes
    const jss = classes.filter(classItem => 
      classItem.name.toLowerCase().includes('jss') || classItem.name.toLowerCase().includes('junior')
    );
    
    // SSS Classes
    const sss = classes.filter(classItem => 
      classItem.name.toLowerCase().includes('sss') || classItem.name.toLowerCase().includes('senior')
    );
    
    // Other Classes
    const other = classes.filter(classItem => 
      !classItem.name.toLowerCase().includes('primary') && 
      !classItem.name.match(/^p\d/i) &&
      !classItem.name.toLowerCase().includes('jss') && 
      !classItem.name.toLowerCase().includes('junior') &&
      !classItem.name.toLowerCase().includes('sss') && 
      !classItem.name.toLowerCase().includes('senior')
    );
    
    return { primary, jss, sss, other };
  };

  return {
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
  };
}