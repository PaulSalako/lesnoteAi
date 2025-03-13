// src/components/ManageLessonStructureLogic.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function useManageLessonStructure() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [structures, setStructures] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [themes, setThemes] = useState([]);
  const [topics, setTopics] = useState([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredClass, setFilteredClass] = useState('');
  const [filteredSubject, setFilteredSubject] = useState('');
  const [filteredTheme, setFilteredTheme] = useState('');
  const [filteredTopic, setFilteredTopic] = useState('');
  
  const [deletingStructureId, setDeletingStructureId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingStructure, setViewingStructure] = useState(null);
  const [editingStructure, setEditingStructure] = useState(null);
  const [formError, setFormError] = useState('');
  
  // Form data for creating/editing structure
  const [newStructureData, setNewStructureData] = useState({
    classId: '',
    subjectId: '',
    themeId: '',
    topicId: '',
    performanceObjectives: [''],
    contentItems: [''],
    teacherActivities: [''],
    studentActivities: [''],
    teachingMaterials: [''],
    evaluationItems: [''],
    assessmentItems: ['']
  });

  const token = localStorage.getItem('token') || sessionStorage.getItem('token');

  // First check for token and redirect if not present
  useEffect(() => {
    if (!token) {
      navigate('/sign-in');
    }
  }, [navigate, token]);

  // Then check for admin or staff privileges before showing any content
  useEffect(() => {
    const checkUserAccess = async () => {
      if (!token) return; // Skip if no token (handled by previous useEffect)
      
      try {
        const response = await fetch('https://localhost:7225/api/Dashboard/stats', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          // Don't show error, just redirect
          navigate('/dashboard');
          return;
        }
        
        const userData = await response.json();
        
        // Check if user is admin (roleId === 1) or staff (roleId === 2)
        if (userData.roleId === 1 || userData.roleId === 2) {
          setIsAdmin(userData.roleId === 1); // Only true for admin
        } else {
          // Redirect users without permissions immediately to dashboard
          navigate('/dashboard');
        }
      } catch (error) {
        // Don't show error, just redirect on any error
        navigate('/dashboard');
      }
    };
    
    if (token) {
      checkUserAccess();
    }
  }, [navigate, token]);

  // Fetch classes once on component mount
  useEffect(() => {
    if (token) {
      fetchClasses();
    }
  }, [token]);

  // Fetch structures when pagination, filter or search changes
  useEffect(() => {
    if (token) {
      fetchStructures(currentPage);
    }
  }, [currentPage, pageSize, filteredClass, filteredSubject, filteredTheme, filteredTopic, searchTerm, token]);

  // Fetch subjects when class filter changes
  useEffect(() => {
    if (token && filteredClass) {
      fetchSubjectsByClass(filteredClass);
    } else {
      setSubjects([]);
      setFilteredSubject('');
      setThemes([]);
      setFilteredTheme('');
      setTopics([]);
      setFilteredTopic('');
    }
  }, [filteredClass, token]);

  // Fetch themes when subject filter changes
  useEffect(() => {
    if (token && filteredSubject) {
      fetchThemesBySubject(filteredSubject);
    } else {
      setThemes([]);
      setFilteredTheme('');
      setTopics([]);
      setFilteredTopic('');
    }
  }, [filteredSubject, token]);

  // Fetch topics when theme filter changes
  useEffect(() => {
    if (token && filteredSubject) {
      fetchTopicsBySubject(filteredSubject, filteredTheme);
    } else {
      setTopics([]);
      setFilteredTopic('');
    }
  }, [filteredTheme, filteredSubject, token]);

  // Form-related useEffects for cascading dropdowns
  useEffect(() => {
    if (token && newStructureData.classId) {
      fetchSubjectsForClass(newStructureData.classId);
    }
  }, [newStructureData.classId, token]);
  
  useEffect(() => {
    if (token && newStructureData.subjectId) {
      fetchThemesForSubject(newStructureData.subjectId);
    } else {
      setNewStructureData(prev => ({ ...prev, themeId: '', topicId: '' }));
    }
  }, [newStructureData.subjectId, token]);
  
  useEffect(() => {
    if (token && newStructureData.subjectId) {
      fetchTopicsForSubject(newStructureData.subjectId, newStructureData.themeId);
    } else {
      setNewStructureData(prev => ({ ...prev, topicId: '' }));
    }
  }, [newStructureData.themeId, newStructureData.subjectId, token]);

  const fetchClasses = async () => {
    try {
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
      
      // Set default class for new structure form
      if (result.length > 0) {
        setNewStructureData(prev => ({ ...prev, classId: result[0].id }));
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchSubjectsByClass = async (classId) => {
    try {
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
    }
  };

  const fetchThemesBySubject = async (subjectId) => {
    try {
      const response = await fetch(`https://localhost:7225/api/Theme/by-subject/${subjectId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch themes');
      }
  
      const result = await response.json();
      setThemes(result);
    } catch (error) {
      console.error('Error fetching themes:', error);
    }
  };

  const fetchTopicsBySubject = async (subjectId, themeId = null) => {
    try {
      let url = `https://localhost:7225/api/Topic/by-subject/${subjectId}`;
      
      const response = await fetch(url, {
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
      
      // If theme ID is provided, filter topics for that theme
      const filteredTopics = themeId 
        ? result.filter(topic => topic.themeId === themeId)
        : result;
        
      setTopics(filteredTopics);
    } catch (error) {
      console.error('Error fetching topics:', error);
    }
  };
  
  const fetchSubjectsForClass = async (classId) => {
    try {
      const response = await fetch(`https://localhost:7225/api/Subject/by-class/${classId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch subjects for class');
      }
  
      const result = await response.json();
      setSubjects(result);
    } catch (error) {
      console.error('Error fetching subjects for class:', error);
    }
  };
  
  const fetchThemesForSubject = async (subjectId) => {
    try {
      const response = await fetch(`https://localhost:7225/api/Theme/by-subject/${subjectId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch themes for subject');
      }
  
      const result = await response.json();
      setThemes(result);
    } catch (error) {
      console.error('Error fetching themes for subject:', error);
    }
  };
  
  const fetchTopicsForSubject = async (subjectId, themeId = null) => {
    try {
      let url = `https://localhost:7225/api/Topic/by-subject/${subjectId}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch topics for subject');
      }
  
      const result = await response.json();
      setTopics(result);
    } catch (error) {
      console.error('Error fetching topics for subject:', error);
    }
  };

  const fetchStructures = async (page) => {
    try {
      setLoading(true);
      let url = `https://localhost:7225/api/LessonNoteStructure?page=${page}&pageSize=${pageSize}`;
      
      if (filteredClass) {
        url += `&classId=${filteredClass}`;
      }
      
      if (filteredSubject) {
        url += `&subjectId=${filteredSubject}`;
      }
      
      if (filteredTheme) {
        url += `&themeId=${filteredTheme}`;
      }
      
      if (filteredTopic) {
        url += `&topicId=${filteredTopic}`;
      }
      
      if (searchTerm) {
        url += `&search=${searchTerm}`;
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        // Try to parse error message
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch lesson structures');
      }
      const result = await response.json();
      
      // Set structures and pagination info
      setStructures(result.structures || []);
      setTotalPages(result.pagination.totalPages);
      setTotalCount(result.pagination.totalCount);
    } catch (error) {
      console.error('Error fetching lesson structures:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStructureDetails = async (structureId) => {
    try {
      setLoading(true);
      
      const response = await fetch(`https://localhost:7225/api/LessonNoteStructure/${structureId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        // Try to parse error message
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch structure details');
      }
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error fetching structure details:', error);
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleAddStructure = async () => {
    // Validate inputs
    if (!newStructureData.classId) {
      setFormError('Please select a class');
      return;
    }
    
    if (!newStructureData.subjectId) {
      setFormError('Please select a subject');
      return;
    }
    
    // Filter out empty items before submitting
    const dataToSubmit = {
      ...newStructureData,
      performanceObjectives: newStructureData.performanceObjectives.filter(item => item.trim() !== ''),
      contentItems: newStructureData.contentItems.filter(item => item.trim() !== ''),
      teacherActivities: newStructureData.teacherActivities.filter(item => item.trim() !== ''),
      studentActivities: newStructureData.studentActivities.filter(item => item.trim() !== ''),
      teachingMaterials: newStructureData.teachingMaterials.filter(item => item.trim() !== ''),
      evaluationItems: newStructureData.evaluationItems.filter(item => item.trim() !== ''),
      assessmentItems: newStructureData.assessmentItems.filter(item => item.trim() !== '')
    };
    
    // If no theme or topic selected, set to null explicitly
    if (!dataToSubmit.themeId) {
      dataToSubmit.themeId = null;
    }
    
    if (!dataToSubmit.topicId) {
      dataToSubmit.topicId = null;
    }
    try {
      const response = await fetch('https://localhost:7225/api/LessonNoteStructure', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSubmit)
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create lesson structure');
      }
      // Show success message
      const result = await response.json();
      
      Swal.fire({
        title: 'Success',
        text: result.message || 'Lesson note structure created successfully',
        icon: 'success',
        confirmButtonText: 'OK'
      });
      
      // Reset form and close modal
      resetStructureForm();
      setShowAddModal(false);
      
      // Refresh the first page
      setCurrentPage(1);
      fetchStructures(1);
    } catch (error) {
      console.error('Error creating lesson structure:', error);
      setFormError(error.message || 'Failed to create lesson structure. Please try again.');
      
      Swal.fire({
        title: 'Error',
        text: error.message || 'Failed to create lesson structure. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleEditStructure = async () => {
    if (!editingStructure) {
      return;
    }
    if (!newStructureData.classId) {
      setFormError('Please select a class');
      return;
    }
    
    if (!newStructureData.subjectId) {
      setFormError('Please select a subject');
      return;
    }
    
    // Filter out empty items before submitting
    const dataToSubmit = {
      performanceObjectives: newStructureData.performanceObjectives.filter(item => item.trim() !== ''),
      contentItems: newStructureData.contentItems.filter(item => item.trim() !== ''),
      teacherActivities: newStructureData.teacherActivities.filter(item => item.trim() !== ''),
      studentActivities: newStructureData.studentActivities.filter(item => item.trim() !== ''),
      teachingMaterials: newStructureData.teachingMaterials.filter(item => item.trim() !== ''),
      evaluationItems: newStructureData.evaluationItems.filter(item => item.trim() !== ''),
      assessmentItems: newStructureData.assessmentItems.filter(item => item.trim() !== '')
    };
    try {
      const response = await fetch(`https://localhost:7225/api/LessonNoteStructure/${editingStructure.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSubmit)
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update lesson structure');
      }
      // Show success message
      const result = await response.json();
      
      Swal.fire({
        title: 'Success',
        text: result.message || 'Lesson note structure updated successfully',
        icon: 'success',
        confirmButtonText: 'OK'
      });
      
      // Reset form and close modal
      setEditingStructure(null);
      resetStructureForm();
      setShowEditModal(false);
      
      // Refresh the current page
      fetchStructures(currentPage);
    } catch (error) {
      console.error('Error updating lesson structure:', error);
      setFormError(error.message || 'Failed to update lesson structure. Please try again.');
      
      Swal.fire({
        title: 'Error',
        text: error.message || 'Failed to update lesson structure. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleDelete = async (structureId) => {
    // Only admin can delete structures
    if (!isAdmin) {
      Swal.fire({
        title: 'Access Denied',
        text: 'Only administrators can delete lesson structures',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
      return;
    }
    
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone. Do you want to delete this lesson structure?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });
    
    if (!result.isConfirmed) {
      return;
    }
    
    setDeletingStructureId(structureId);
    
    try {
      const response = await fetch(`https://localhost:7225/api/LessonNoteStructure/${structureId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        // Try to parse error message
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete lesson structure');
      }
      
      // Show success message
      Swal.fire({
        title: 'Deleted!',
        text: 'Lesson structure has been deleted successfully.',
        icon: 'success',
        confirmButtonText: 'OK'
      });
      
      // If it's the last item on the current page, go to previous page
      if (structures.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      } else {
        // Otherwise, just refresh the current page
        fetchStructures(currentPage);
      }
    } catch (error) {
      console.error('Error deleting lesson structure:', error);
      
      Swal.fire({
        title: 'Error',
        text: error.message || 'Failed to delete lesson structure. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setDeletingStructureId(null);
    }
  };

  const openViewModal = async (structure) => {
    const details = await fetchStructureDetails(structure.id);
    if (details) {
      setViewingStructure(details);
      setShowViewModal(true);
    }
  };

  const openEditModal = async (structure) => {
    const details = await fetchStructureDetails(structure.id);
    if (details) {
      setEditingStructure(details);
      
      // Set form data with the structure details
      setNewStructureData({
        classId: details.classId,
        subjectId: details.subjectId,
        themeId: details.themeId || '',
        topicId: details.topicId || '',
        performanceObjectives: details.performanceObjectives?.length ? details.performanceObjectives : [''],
        contentItems: details.contentItems?.length ? details.contentItems : [''],
        teacherActivities: details.teacherActivities?.length ? details.teacherActivities : [''],
        studentActivities: details.studentActivities?.length ? details.studentActivities : [''],
        teachingMaterials: details.teachingMaterials?.length ? details.teachingMaterials : [''],
        evaluationItems: details.evaluationItems?.length ? details.evaluationItems : [''],
        assessmentItems: details.assessmentItems?.length ? details.assessmentItems : ['']
      });
      
      setFormError('');
      setShowEditModal(true);
    }
  };

  const openAddModal = () => {
    resetStructureForm();
    setFormError('');
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingStructure(null);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setViewingStructure(null);
  };

  const resetStructureForm = () => {
    // Initialize with an empty array for each section
    setNewStructureData({
      classId: classes.length > 0 ? classes[0].id : '',
      subjectId: subjects.length > 0 ? subjects[0].id : '',
      themeId: '',
      topicId: '',
      performanceObjectives: [''],
      contentItems: [''],
      teacherActivities: [''],
      studentActivities: [''],
      teachingMaterials: [''],
      evaluationItems: [''],
      assessmentItems: ['']
    });
  };

  const handleArrayItemChange = (section, index, value) => {
    const updatedArray = [...newStructureData[section]];
    updatedArray[index] = value;
    setNewStructureData({
      ...newStructureData,
      [section]: updatedArray
    });
  };

  const handleAddArrayItem = (section) => {
    setNewStructureData({
      ...newStructureData,
      [section]: [...newStructureData[section], '']
    });
  };

  const handleRemoveArrayItem = (section, index) => {
    if (newStructureData[section].length <= 1) {
      return; // Always keep at least one item
    }
    
    const updatedArray = [...newStructureData[section]];
    updatedArray.splice(index, 1);
    setNewStructureData({
      ...newStructureData,
      [section]: updatedArray
    });
  };

  const handleClassChange = (classId) => {
    setNewStructureData({
      ...newStructureData,
      classId,
      subjectId: '', // Reset subject when class changes
      themeId: '',   // Reset theme when class changes
      topicId: ''    // Reset topic when class changes
    });
  };
  
  const handleSubjectChange = (subjectId) => {
    setNewStructureData({
      ...newStructureData,
      subjectId,
      themeId: '', // Reset theme when subject changes
      topicId: ''  // Reset topic when subject changes
    });
  };
  
  const handleThemeChange = (themeId) => {
    setNewStructureData({
      ...newStructureData,
      themeId,
      topicId: '' // Reset topic when theme changes
    });
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handlePageSizeChange = (event) => {
    const newSize = parseInt(event.target.value);
    setPageSize(newSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const handleSearch = () => {
    setCurrentPage(1); // Reset to first page when searching
    fetchStructures(1);
  };

  const handleClassFilter = (classId) => {
    setFilteredClass(classId);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleSubjectFilter = (subjectId) => {
    setFilteredSubject(subjectId);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleThemeFilter = (themeId) => {
    setFilteredTheme(themeId);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleTopicFilter = (topicId) => {
    setFilteredTopic(topicId);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleSearchInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleRetry = () => {
    fetchStructures(currentPage);
  };

  return {
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
  };
}