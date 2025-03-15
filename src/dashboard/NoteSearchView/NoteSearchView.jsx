// src/dashboard/components/ViewNotePage/ViewNotePage.jsx
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { useViewNotePage } from './ViewNotePageLogic';
import './NoteSearchView.css'; // You'll need to create this CSS file

function ViewNotePage() {
  const {
    isLoading,
    error,
    noteData,
    content,
    exportLoading,
    exportType,
    contentRef,
    navigate,
    handleSaveAsPdf,
    handleSaveAsImage,
    handleSaveAsDocx,
    copyToClipboard
  } = useViewNotePage();

  if (isLoading && !noteData) {
    return (
      <div className="loading-container">
        <div className="spinner">
          <i className="bi bi-arrow-repeat"></i>
        </div>
        <p>Loading lesson note...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <i className="bi bi-exclamation-triangle"></i>
        <h3>Error</h3>
        <p>{error}</p>
        <button 
          className="action-btn primary" 
          onClick={() => navigate('/dashboard/search-notes')}
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="view-note-container">
      {/* Compact Header */}
      <div className="note-header-compact">
        <div className="header-top-row">
          <h1>{noteData?.topic || 'Lesson Note'}</h1>
          <button 
            className="action-btn back-btn" 
            onClick={() => navigate('/dashboard/search-notes')}
          >
            <i className="bi bi-arrow-left"></i>
            Back to Search
          </button>
        </div>
        
        <div className="note-meta-compact">
          <span><i className="bi bi-book"></i> {noteData?.subject}</span>
          <span><i className="bi bi-mortarboard"></i> {noteData?.class_}</span>
          <span><i className="bi bi-clock"></i> {noteData?.duration}</span>
          <span><i className="bi bi-calendar3"></i> {noteData?.date}</span>
          <span className="lesson-badge">
            <i className="bi bi-journal-text"></i>
            Lesson Note
          </span>
        </div>
      </div>

      {/* Note Content */}
      <div className="note-content-wrapper">
        <div className="note-content" ref={contentRef}>
          <div className="note-container">
            <div className="note-body">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="export-section">
        <div className="export-actions">
          <button
            className="copy-btn"
            onClick={() => copyToClipboard(content)}
          >
            <i className="bi bi-clipboard"></i>
            Copy to Clipboard
          </button>
          
          <button
            className="export-btn pdf-btn"
            onClick={handleSaveAsPdf}
            disabled={exportLoading}
          >
            <i className="bi bi-file-pdf"></i>
            Save as PDF
          </button>
          
          <button
            className="export-btn img-btn"
            onClick={handleSaveAsImage}
            disabled={exportLoading}
          >
            <i className="bi bi-file-image"></i>
            Save as Image
          </button>
          
          <button
            className="export-btn doc-btn"
            onClick={handleSaveAsDocx}
            disabled={exportLoading}
          >
            <i className="bi bi-file-earmark-word"></i>
            Save as Document
          </button>
        </div>
      </div>
      
      {/* Loading Indicator for Exports */}
      {exportLoading && (
        <div className="export-loading-overlay">
          <div className="export-loading-content">
            <i className="bi bi-arrow-repeat spinning"></i>
            <p>Exporting as {exportType}...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewNotePage;