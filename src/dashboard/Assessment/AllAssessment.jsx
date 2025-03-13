// src/components/AllAssessments.jsx
import { useAllAssessments } from './AllAssessmentsLogic';
import './AllAssessment.css';

function AllAssessments() {
  const {
    loading,
    error,
    filteredAssessments,
    searchTerm,
    currentPage,
    totalPages,
    pageSize,
    totalCount,
    deletingAssessmentId,
    handleSearch,
    handleDelete,
    handlePageChange,
    handlePageSizeChange,
    handleRetry,
    navigateToCreateAssessment,
    navigateToViewAssessment
  } = useAllAssessments();

  if (loading) {
    return (
      <div className="loading-state">
        <i className="bi bi-arrow-clockwise spinning"></i>
        <p>Loading assessments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        <i className="bi bi-exclamation-circle"></i>
        <p>{error}</p>
        <button onClick={handleRetry} className="retry-button">
          <i className="bi bi-arrow-clockwise"></i> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="assessments-page">
      <div className="assessments-header">
        <h1>My Assessments</h1>
        <div className="header-actions">
          <div className="search-bar">
            <i className="bi bi-search"></i>
            <input
              type="text"
              placeholder="Search assessments..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <button 
            className="new-assessment-btn"
            onClick={navigateToCreateAssessment}
          >
            <i className="bi bi-plus-lg"></i>
            New Assessment
          </button>
        </div>
      </div>

      <div className="assessments-table-container">
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

        <table className="assessments-table">
          <thead>
            <tr>
              <th>S/N</th>
              <th>Subject</th>
              <th>Topic</th>
              <th>Type</th>
              <th>Class</th>
              <th>Duration</th>
              <th>Created Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAssessments.length > 0 ? (
              filteredAssessments.map((assessment, index) => (
                <tr key={assessment.id}>
                  <td>{((currentPage - 1) * pageSize) + index + 1}</td>
                  <td>{assessment.subject}</td>
                  <td>{assessment.topic}</td>
                  <td>
                    <span className="assessment-type-badge">
                      {assessment.assessmentType}
                    </span>
                  </td>
                  <td>{assessment.class_}</td>
                  <td>{assessment.duration}</td>
                  <td>{new Date(assessment.createdAt).toLocaleDateString()}</td>
                  <td className="actions-cell">
                    <button 
                      className="view-btn"
                      onClick={() => navigateToViewAssessment(assessment.id)}
                    >
                      <i className="bi bi-eye"></i>
                    </button>
                    <button 
                      className={`delete-btn ${deletingAssessmentId === assessment.id ? 'deleting' : ''}`}
                      onClick={() => handleDelete(assessment.id)}
                      disabled={deletingAssessmentId === assessment.id}
                    >
                      <i className={`bi ${deletingAssessmentId === assessment.id ? 'bi-hourglass-split' : 'bi-trash'}`}></i>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="empty-state">
                  <i className="bi bi-clipboard-check"></i>
                  <p>{searchTerm ? 'No matches found' : 'No assessments yet'}</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {filteredAssessments.length > 0 && (
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

export default AllAssessments;