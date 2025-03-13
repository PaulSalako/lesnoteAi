// src/dashboard/components/NoteChatPage/NoteChatPage.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';
import './NoteChatPage.css';

function ChatPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [noteData, setNoteData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportType, setExportType] = useState(null);
  const [newMessage, setNewMessage] = useState('');
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
        console.log('Using Token:', token.substring(0, 10) + '...');
        
        const response = await fetch(`https://localhost:7225/api/LessonNotes/${id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Response Status:', response.status);
        
        const responseData = await response.json();
        
        if (!response.ok) {
          console.error('Error response:', responseData);
          throw new Error(responseData.message || 'Failed to fetch lesson note');
        }
        
        console.log('Fetched Lesson Note:', responseData);
        
        setNoteData(responseData);
        
        // Transform messages
        const transformedMessages = [
          {
            id: 'system-1',
            type: 'system',
            content: 'Your lesson note has been generated.'
          }
        ];
        
        // Add content or messages
        if (responseData.messages && responseData.messages.length > 0) {
          responseData.messages.forEach(msg => {
            transformedMessages.push({
              id: msg.id,
              type: msg.role === 'assistant' ? 'ai' : 'user',
              content: msg.content
            });
          });
        } else if (responseData.content) {
          transformedMessages.push({
            id: 'ai-response',
            type: 'ai',
            content: responseData.content
          });
        }
        
        setMessages(transformedMessages);
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
  const handleSaveAsPdf = async (content) => {
    try {
      setExportLoading(true);
      setExportType('PDF');
      
      const title = noteData?.topic || 'Lesson Note';
      const element = content ? document.getElementById(content) : contentRef.current;
      
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

  const handleSaveAsImage = async (content) => {
    try {
      setExportLoading(true);
      setExportType('Image');
      
      const title = noteData?.topic || 'Lesson Note';
      const element = content ? document.getElementById(content) : contentRef.current;
      
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

  const handleSaveAsDocx = async (content) => {
    try {
      setExportLoading(true);
      setExportType('Document');
      
      const title = noteData?.topic || 'Lesson Note';
      const contentText = content 
        ? document.getElementById(content).innerText 
        : contentRef.current.innerText;
      
      if (!contentText) {
        throw new Error('Content text not found');
      }
      
      // Create a simple text document
      // In a real implementation, you'd use a library like docx.js to create proper DOCX files
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

  const handleRegenerateResponse = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      const response = await fetch(`https://localhost:7225/api/LessonNotes/regenerate/${id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ modifiedPrompt: '' }) // Empty for standard regeneration
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to regenerate lesson note');
      }
      
      const data = await response.json();
      
      // Add the new message to the list
      setMessages(prev => [
        ...prev,
        {
          id: `system-${Date.now()}`,
          type: 'system',
          content: 'Lesson note has been regenerated.'
        },
        {
          id: `ai-${Date.now()}`,
          type: 'ai',
          content: data.data.content
        }
      ]);
      
    } catch (error) {
      console.error('Error regenerating response:', error);
      setError(error.message || 'An error occurred while regenerating the lesson note');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to send a message to the AI
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      // Add user message to the UI immediately
      const userMessageId = `user-${Date.now()}`;
      setMessages(prev => [
        ...prev,
        {
          id: userMessageId,
          type: 'user',
          content: newMessage
        }
      ]);
      
      // Clear the input field
      setNewMessage('');
      
      // Send message to the API
      const response = await fetch(`https://localhost:7225/api/LessonNotes/${id}/message`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: newMessage })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send message');
      }
      
      const data = await response.json();
      
      // Add AI response to messages
      setMessages(prev => [
        ...prev,
        {
          id: data.data.aiMessage.id,
          type: 'ai',
          content: data.data.aiMessage.content
        }
      ]);
      
    } catch (error) {
      console.error('Error sending message:', error);
      setError(error.message || 'An error occurred while sending your message');
    } finally {
      setIsLoading(false);
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
          onClick={() => navigate('/dashboard/new')}
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="chat-container">
      {/* Chat Header */}
      <div className="chat-header">
        <div className="chat-title">
          <h2>{noteData?.topic || 'Generated Lesson Note'}</h2>
          <span className="status-badge">
            <i className="bi bi-check-circle-fill"></i>
            Complete
          </span>
        </div>
        
        <div className="chat-meta">
          <span><strong>Subject:</strong> {noteData?.subject}</span>
          <span><strong>Class:</strong> {noteData?.class_}</span>
          <span><strong>Duration:</strong> {noteData?.duration}</span>
          <span><strong>Date:</strong> {noteData?.date}</span>
        </div>
        
        <div className="chat-actions">
          <button 
            className="action-btn primary" 
            onClick={() => navigate('/dashboard/new')}
          >
            <i className="bi bi-plus-lg"></i>
            New Note
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="chat-messages" ref={contentRef}>
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`message ${message.type}`}
            id={`message-${message.id}`}
          >
            {message.type === 'ai' && (
              <div className="message-avatar">
                <i className="bi bi-robot"></i>
              </div>
            )}
            
            {message.type === 'user' && (
              <div className="message-avatar user-avatar">
                <i className="bi bi-person"></i>
              </div>
            )}
            
            <div className="message-content">
              {message.type === 'system' ? (
                <div className="system-message">
                  <i className="bi bi-info-circle"></i>
                  {message.content}
                </div>
              ) : message.type === 'user' ? (
                <div className="user-message">
                  {message.content}
                </div>
              ) : (
                <div className="ai-response">
                  <div className="response-header">
                    <span>AI Response</span>
                    <div className="response-actions">
                      <button 
                        className="copy-btn"
                        onClick={() => copyToClipboard(message.content)}
                      >
                        <i className="bi bi-clipboard"></i>
                        Copy
                      </button>
                      
                      {/* Export Options */}
                      <div className="export-dropdown">
                        <button className="export-btn">
                          <i className="bi bi-download"></i>
                          Export
                        </button>
                        <div className="export-dropdown-menu">
                          <button
                            onClick={() => handleSaveAsPdf(`message-${message.id}`)}
                            disabled={exportLoading}
                            className="export-option"
                          >
                            <i className="bi bi-file-pdf"></i>
                            PDF
                          </button>
                          <button
                            onClick={() => handleSaveAsImage(`message-${message.id}`)}
                            disabled={exportLoading}
                            className="export-option"
                          >
                            <i className="bi bi-file-image"></i>
                            Image
                          </button>
                          <button
                            onClick={() => handleSaveAsDocx(`message-${message.id}`)}
                            disabled={exportLoading}
                            className="export-option"
                          >
                            <i className="bi bi-file-earmark-word"></i>
                            Document
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="response-content markdown-content">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="message-form">
        <div className="input-container">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Ask a question about this lesson note..."
            disabled={isLoading}
          />
          <button 
            type="submit" 
            disabled={isLoading || !newMessage.trim()}
          >
            <i className="bi bi-send"></i>
          </button>
        </div>
      </form>

      {/* Regenerate Section with Export Options */}
      <div className="regenerate-section">
        {/* Export All Section */}
        <div className="export-all-section">
          <div className="export-all-dropdown">
            <button className="export-all-btn">
              <i className="bi bi-download"></i>
              Export All
            </button>
            <div className="export-all-menu">
              <button
                onClick={() => handleSaveAsPdf()}
                disabled={exportLoading}
                className="export-all-option"
              >
                <i className="bi bi-file-pdf"></i>
                Save as PDF
              </button>
              <button
                onClick={() => handleSaveAsImage()}
                disabled={exportLoading}
                className="export-all-option"
              >
                <i className="bi bi-file-image"></i>
                Save as Image
              </button>
              <button
                onClick={() => handleSaveAsDocx()}
                disabled={exportLoading}
                className="export-all-option"
              >
                <i className="bi bi-file-earmark-word"></i>
                Save as Document
              </button>
            </div>
          </div>
        </div>
        
        {/* Regenerate Buttons */}
        <div className="regenerate-buttons">
          <button 
            className="regenerate-btn"
            onClick={handleRegenerateResponse}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner">
                  <i className="bi bi-arrow-repeat"></i>
                </span>
                Processing...
              </>
            ) : (
              <>
                <i className="bi bi-arrow-clockwise"></i>
                Regenerate Response
              </>
            )}
          </button>
          <button 
            className="modify-btn"
            onClick={() => navigate('/dashboard/new')}
            disabled={isLoading}
          >
            <i className="bi bi-pencil"></i>
            New Prompt
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

export default ChatPage;