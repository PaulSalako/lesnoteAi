// src/dashboard/components/NoteSearchPage/NoteViewModal.jsx
import { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';

function NoteViewModal({ note, onClose }) {
  const [exportLoading, setExportLoading] = useState(false);
  const [exportType, setExportType] = useState(null);
  const contentRef = useRef(null);
  
  if (!note) return null;

  // Export functions
  const handleSaveAsPdf = async () => {
    try {
      setExportLoading(true);
      setExportType('PDF');
      
      const title = note?.topic || note?.topicName || 'Lesson Note';
      const element = contentRef.current;
      
      if (!element) {
        throw new Error('Content element not found');
      }
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Add title
      pdf.setFontSize(16);
      pdf.text(title, 20, 20);
      
      // Add metadata
      pdf.setFontSize(10);
      pdf.text(`Subject: ${note?.subject || note?.subjectName || 'N/A'}`, 20, 30);
      pdf.text(`Class: ${note?.class_ || note?.className || note?.class || 'N/A'}`, 20, 35);
      pdf.text(`Duration: ${note?.duration || 'N/A'}`, 20, 40);
      pdf.text(`Date: ${note?.date || 'N/A'}`, 20, 45);
      
      // Add content image
      const imgWidth = 170;
      const imgHeight = canvas.height * imgWidth / canvas.width;
      pdf.addImage(imgData, 'PNG', 20, 50, imgWidth, imgHeight);
      
      // Save the PDF
      pdf.save(`${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);
      
      alert('PDF saved successfully!');
    } catch (error) {
      console.error('Error saving PDF:', error);
      alert('Failed to save as PDF. Please try again.');
    } finally {
      setExportLoading(false);
      setExportType(null);
    }
  };

  const handleSaveAsImage = async () => {
    try {
      setExportLoading(true);
      setExportType('Image');
      
      const title = note?.topic || note?.topicName || 'Lesson Note';
      const element = contentRef.current;
      
      if (!element) {
        throw new Error('Content element not found');
      }
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false
      });
      
      canvas.toBlob((blob) => {
        saveAs(blob, `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`);
        alert('Image saved successfully!');
      });
    } catch (error) {
      console.error('Error saving image:', error);
      alert('Failed to save as image. Please try again.');
    } finally {
      setExportLoading(false);
      setExportType(null);
    }
  };

  const handleSaveAsDocx = async () => {
    try {
      setExportLoading(true);
      setExportType('Document');
      
      const title = note?.topic || note?.topicName || 'Lesson Note';
      const contentText = contentRef.current.innerText;
      
      if (!contentText) {
        throw new Error('Content text not found');
      }
      
      // Create a simple text document
      const metadata = `
Title: ${title}
Subject: ${note?.subject || note?.subjectName || 'N/A'}
Class: ${note?.class_ || note?.className || note?.class || 'N/A'}
Duration: ${note?.duration || 'N/A'}
Date: ${note?.date || 'N/A'}

`;
      
      const blob = new Blob([metadata + contentText], { type: 'text/plain' });
      saveAs(blob, `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`);
      
      alert('Document saved successfully! (Note: This is a text file. For proper DOCX support, please integrate docx.js library)');
    } catch (error) {
      console.error('Error saving document:', error);
      alert('Failed to save as document. Please try again.');
    } finally {
      setExportLoading(false);
      setExportType(null);
    }
  };

  // Function to copy text to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(
      () => {
        alert('Copied to clipboard!');
      },
      (err) => {
        console.error('Could not copy text: ', err);
      }
    );
  };

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