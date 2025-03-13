// src/dashboard/components/ViewNotePage/ViewNotePage.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';
import './NoteSearchView.css'; // You'll need to create this CSS file

function ViewNotePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [noteData, setNoteData] = useState(null);
  const [content, setContent] = useState('');
  const [exportLoading, setExportLoading] = useState(false);
  const [exportType, setExportType] = useState(null);
  const contentRef = useRef(null);

  // Fetch the lesson note data when the component mounts
  useEffect(() => {
    const fetchLessonNote = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        
        if (!token) {
          throw new Error('Authentication token not found. Please log in again.');
        }
        
        console.log('Fetching Lesson Note. ID:', id);
        
        const response = await fetch(`https://localhost:7225/api/LessonNotes/${id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const responseData = await response.json();
        
        if (!response.ok) {
          console.error('Error response:', responseData);
          throw new Error(responseData.message || 'Failed to fetch lesson note');
        }
        
        console.log('Fetched Lesson Note:', responseData);
        
        setNoteData(responseData);
        
        // Set content based on the response structure
        if (responseData.content) {
          setContent(responseData.content);
        } else if (responseData.messages && responseData.messages.length > 0) {
          // Get the last AI message to display as content
          const aiMessages = responseData.messages.filter(
            msg => msg.role === 'assistant'
          );
          if (aiMessages.length > 0) {
            setContent(aiMessages[aiMessages.length - 1].content);
          }
        }
      } catch (error) {
        console.error('Detailed error fetching lesson note:', error);
        setError(error.message || 'An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };
  
    if (id) {
      fetchLessonNote();
    }
  }, [id]);

  // Export functions
  const handleSaveAsPdf = async () => {
    try {
      setExportLoading(true);
      setExportType('PDF');
      
      const title = noteData?.topic || 'Lesson Note';
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
      pdf.text(`Subject: ${noteData?.subject || 'N/A'}`, 20, 30);
      pdf.text(`Class: ${noteData?.class_ || 'N/A'}`, 20, 35);
      pdf.text(`Duration: ${noteData?.duration || 'N/A'}`, 20, 40);
      pdf.text(`Date: ${noteData?.date || 'N/A'}`, 20, 45);
      
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
      
      const title = noteData?.topic || 'Lesson Note';
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
      
      const title = noteData?.topic || 'Lesson Note';
      const contentText = contentRef.current.innerText;
      
      if (!contentText) {
        throw new Error('Content text not found');
      }
      
      // Create a simple text document
      const metadata = `
Title: ${title}
Subject: ${noteData?.subject || 'N/A'}
Class: ${noteData?.class_ || 'N/A'}
Duration: ${noteData?.duration || 'N/A'}
Date: ${noteData?.date || 'N/A'}

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