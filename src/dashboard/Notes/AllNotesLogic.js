import { API_URL } from '../../config';
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';



export function AllNotesLogic() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notes, setNotes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingNoteId, setDeletingNoteId] = useState(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const token = localStorage.getItem('token') || sessionStorage.getItem('token');

  // Memoized filtered notes to prevent unnecessary recalculations
  const filteredNotes = useMemo(() => {
    return notes.filter(note =>
      note.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.subject.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [notes, searchTerm]);

  // Check for premium user on component mount
  useEffect(() => {
    const checkUserPremiumStatus = async () => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        
        if (!token) {
          // If no token, redirect to login
          navigate('/login');
          return;
        }
        
        // Using the dashboard/stats endpoint to check plan status
        const response = await fetch(`${API_URL}/Dashboard/stats`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        
        const userData = await response.json();
        
        // Check if user is premium (plan === 1)
        if (userData.plan !== 1) {
          // Redirect non-premium users back to dashboard
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Error checking premium status:', error);
        // Redirect to dashboard on any error
        navigate('/dashboard');
      }
    };
    
    checkUserPremiumStatus();
  }, [navigate]);

  useEffect(() => {
    if (token) {
      fetchNotes(currentPage);
    }
  }, [currentPage, pageSize, token]);

  // Log notes after they're set to help diagnose rendering issue
  useEffect(() => {
    console.log('Current notes:', notes);
    console.log('Filtered notes:', filteredNotes);
  }, [notes, filteredNotes]);

  const fetchNotes = async (page) => {
    try {
      setLoading(true);
      // Log token for debugging
      console.log('Fetching notes with token:', token);
      console.log('Page:', page, 'Page Size:', pageSize);

      const response = await fetch(`${API_URL}/LessonNotes?page=${page}&pageSize=${pageSize}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        // Log the full error response
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error('Failed to fetch notes');
      }

      const result = await response.json();
      
      // DEBUGGING: Log the full result object
      console.log('FULL Fetched notes result:', JSON.stringify(result, null, 2));

      // Log the specific properties of the result
      console.log('Result properties:', {
        hasData: !!result.data,
        dataLength: result.data ? result.data.length : 'No data',
        dataType: typeof result.data
      });

      // Robust data setting with additional checks
      const notesData = result.data && Array.isArray(result.data) 
        ? result.data.map(note => ({
            ...note,
            date: note.createdAt // Use createdAt as the date if date is not present
          }))
        : [];

      setNotes(notesData);
      setTotalPages(result.totalPages || 1);
      setTotalCount(result.totalCount || 0);

      // Additional logging
      console.log('Notes set:', notesData);
    } catch (error) {
      console.error('Error in fetchNotes:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (noteId) => {
    // Use SweetAlert2 instead of window.confirm
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Are you sure you want to delete this note? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });
    
    if (!result.isConfirmed) {
      return;
    }

    setDeletingNoteId(noteId);

    try {
      const response = await fetch(`${API_URL}/LessonNotes/${noteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        // Try to parse error message if possible
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete note');
      }

      // Show success message with SweetAlert2
      Swal.fire({
        title: 'Deleted!',
        text: 'Note deleted successfully',
        icon: 'success',
        confirmButtonText: 'OK'
      });
      
      // If it's the last item on the current page, go to previous page
      if (filteredNotes.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      } else {
        // Otherwise, just refresh the current page
        fetchNotes(currentPage);
      }

    } catch (error) {
      console.error('Error deleting note:', error);
      // Show error message with SweetAlert2
      Swal.fire({
        title: 'Error',
        text: error.message || 'Failed to delete note. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setDeletingNoteId(null);
    }
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

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleRetry = () => {
    fetchNotes(currentPage);
  };

  return {
    loading,
    error,
    notes,
    filteredNotes,
    searchTerm,
    deletingNoteId,
    currentPage,
    totalPages,
    pageSize,
    totalCount,
    navigate,
    handleDelete,
    handlePageChange,
    handlePageSizeChange,
    handleSearchChange,
    handleRetry
  };
}