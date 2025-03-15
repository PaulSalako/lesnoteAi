import React from 'react';
import { ManageNoteLogic } from './ManageNoteLogic';
import './ManageNote.css';

function ManageNote() {
  const {
    loading,
    error,
    filteredNotes,
    searchTerm,
    deletingNoteId,
    currentPage,
    totalPages,
    pageSize,
    totalCount,
    navigate,
    fetchNotes,
    handleDelete,
    handlePageChange,
    handlePageSizeChange,
    handleSearchInputChange
  } = ManageNoteLogic();

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
        <h1>Manage Notes</h1>
        <div className="header-actions">
          <div className="search-bar">
            <i className="bi bi-search"></i>
            <input
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={handleSearchInputChange}
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
              <th>Owner</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {console.log('Notes rendering:', {
              filteredNotes, 
              filteredNotesLength: filteredNotes.length, 
              searchTerm
            }) || filteredNotes.length > 0 ? (
              filteredNotes.map((note, index) => (
                <tr key={note.id}>
                  <td>{((currentPage - 1) * pageSize) + index + 1}</td>
                  <td>{note.subject}</td>
                  <td>{note.topic}</td>
                  <td>{new Date(note.date).toLocaleDateString()}</td>
                  <td>{note.isOwner ? 'You' : note.ownerName || 'User'}</td>
                  <td className="actions-cell">
                    <button 
                      className="view-btn"
                      onClick={() => navigate(`/dashboard/note-chat/${note.id}`)}
                    >
                      <i className="bi bi-eye"></i>
                    </button>
                    {/* Admin can delete any note */}
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
                <td colSpan="6" className="empty-state">
                  <i className="bi bi-journal-text"></i>
                  <p>{searchTerm ? 'No matches found' : 'No notes yet'}</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {filteredNotes.length > 0 && (
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

export default ManageNote;