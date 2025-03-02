import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AllNotes.css';

function AllNotes() {
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
        const response = await fetch('https://localhost:7225/api/Dashboard/stats', {
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
    fetchNotes(currentPage);
  }, [currentPage, pageSize]);

  const fetchNotes = async (page) => {
    try {
      setLoading(true);
      const response = await fetch(`https://localhost:7225/api/Dashboard/all-notes?page=${page}&pageSize=${pageSize}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notes');
      }

      const result = await response.json();
      setNotes(result.data);
      setTotalPages(result.totalPages);
      setTotalCount(result.totalCount);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (noteId) => {
    const isConfirmed = window.confirm('Are you sure you want to delete this note? This action cannot be undone.');
    
    if (!isConfirmed) {
      return;
    }

    setDeletingNoteId(noteId);

    try {
      const response = await fetch(`https://localhost:7225/api/Dashboard/delete-note/${noteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete note');
      }

      // Show success message
      alert('Note deleted successfully');
      
      // If it's the last item on the current page, go to previous page
      if (filteredNotes.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      } else {
        // Otherwise, just refresh the current page
        fetchNotes(currentPage);
      }

    } catch (error) {
      console.error('Error deleting note:', error);
      alert(error.message || 'Failed to delete note. Please try again.');
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

  const filteredNotes = notes.filter(note =>
    note.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="loading-state">
        <i className="bi bi-arrow-clockwise spinning"></i>
        <p>Loading notes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        <i className="bi bi-exclamation-circle"></i>
        <p>{error}</p>
        <button onClick={() => fetchNotes(currentPage)} className="retry-button">
          <i className="bi bi-arrow-clockwise"></i> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="notes-page">
      <div className="notes-header">
        <h1>My Notes</h1>
        <div className="header-actions">
          <div className="search-bar">
            <i className="bi bi-search"></i>
            <input
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            className="new-note-btn"
            onClick={() => navigate('/dashboard/new')}
          >
            <i className="bi bi-plus-lg"></i>
            New Note
          </button>
        </div>
      </div>

      <div className="notes-table-container">
        <div className="table-controls">
          <div className="page-size-selector">
            <label>Show</label>
            <select value={pageSize} onChange={handlePageSizeChange}>
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <label>entries</label>
          </div>
        </div>

        <table className="notes-table">
          <thead>
            <tr>
              <th>S/N</th>
              <th>Subject</th>
              <th>Topic</th>
              <th>Created Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredNotes.length > 0 ? (
              filteredNotes.map((note, index) => (
                <tr key={note.id}>
                  <td>{((currentPage - 1) * pageSize) + index + 1}</td>
                  <td>{note.subject}</td>
                  <td>{note.topic}</td>
                  <td>{new Date(note.date).toLocaleDateString()}</td>
                  <td className="actions-cell">
                    <button 
                      className="view-btn"
                      onClick={() => navigate(`/dashboard/note-chat/${note.id}`)}
                    >
                      <i className="bi bi-eye"></i>
                    </button>
                    <button 
                      className={`delete-btn ${deletingNoteId === note.id ? 'deleting' : ''}`}
                      onClick={() => handleDelete(note.id)}
                      disabled={deletingNoteId === note.id}
                    >
                      <i className={`bi ${deletingNoteId === note.id ? 'bi-hourglass-split' : 'bi-trash'}`}></i>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="empty-state">
                  <i className="bi bi-journal-text"></i>
                  <p>{searchTerm ? 'No matches found' : 'No notes yet'}</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {notes.length > 0 && (
          <div className="pagination-controls">
            <div className="pagination-info">
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} entries
            </div>
            <div className="pagination-buttons">
              <button 
                onClick={() => handlePageChange(1)} 
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                <i className="bi bi-chevron-double-left"></i>
              </button>
              <button 
                onClick={() => handlePageChange(currentPage - 1)} 
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                <i className="bi bi-chevron-left"></i>
              </button>
              <span className="page-info">Page {currentPage} of {totalPages}</span>
              <button 
                onClick={() => handlePageChange(currentPage + 1)} 
                disabled={currentPage === totalPages}
                className="pagination-btn"
              >
                <i className="bi bi-chevron-right"></i>
              </button>
              <button 
                onClick={() => handlePageChange(totalPages)} 
                disabled={currentPage === totalPages}
                className="pagination-btn"
              >
                <i className="bi bi-chevron-double-right"></i>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AllNotes;