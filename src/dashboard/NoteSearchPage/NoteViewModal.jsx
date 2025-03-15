// src/dashboard/components/NoteSearchPage/NoteViewModal.jsx
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { useNoteViewModal } from './NoteViewModalLogic';

function NoteViewModal({ note, onClose }) {
  const {
    exportLoading,
    exportType,
    contentRef,
    handleSaveAsPdf,
    handleSaveAsImage,
    handleSaveAsDocx,
    copyToClipboard
  } = useNoteViewModal(note, onClose);
  
  if (!note) return null;

  return (
    <div className="modal-overlay">
      <div className="note-modal">
        {/* Modal Header */}
        <div className="modal-header">
          <div className="header-top-row">
            <h1>{note?.topic || note?.topicName || 'Lesson Note'}</h1>
            <button 
              className="close-btn" 
              onClick={onClose}
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
          
          <div className="note-meta-compact">
            <span><i className="bi bi-book"></i> {note?.subject || note?.subjectName}</span>
            <span><i className="bi bi-mortarboard"></i> {note?.class_ || note?.className || note?.class}</span>
            <span><i className="bi bi-clock"></i> {note?.duration}</span>
            <span><i className="bi bi-calendar3"></i> {note?.date}</span>
            <span className="lesson-badge">
              <i className="bi bi-journal-text"></i>
              Lesson Note
            </span>
          </div>
        </div>

        {/* Note Content */}
        <div className="modal-content-wrapper">
          <div className="note-content" ref={contentRef}>
            <div className="note-container">
              <div className="note-body">
                <ReactMarkdown>{note.content}</ReactMarkdown>
              </div>
            </div>
          </div>
        </div>

        {/* Export Options */}
        <div className="modal-footer">
          <div className="export-actions">
            <button
              className="copy-btn"
              onClick={() => copyToClipboard(note.content)}
            >
              <i className="bi bi-clipboard"></i>
              Copy
            </button>
            
            <button
              className="export-btn pdf-btn"
              onClick={handleSaveAsPdf}
              disabled={exportLoading}
            >
              <i className="bi bi-file-pdf"></i>
              PDF
            </button>
            
            <button
              className="export-btn img-btn"
              onClick={handleSaveAsImage}
              disabled={exportLoading}
            >
              <i className="bi bi-file-image"></i>
              Image
            </button>
            
            <button
              className="export-btn doc-btn"
              onClick={handleSaveAsDocx}
              disabled={exportLoading}
            >
              <i className="bi bi-file-earmark-word"></i>
              Document
            </button>
            
            <button
              className="close-modal-btn"
              onClick={onClose}
            >
              <i className="bi bi-x-circle"></i>
              Close
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
    </div>
  );
}

export default NoteViewModal;