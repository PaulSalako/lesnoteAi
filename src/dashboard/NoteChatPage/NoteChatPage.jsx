// src/dashboard/components/NoteChatPage/NoteChatPage.jsx
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { NoteChatPageLogic } from './NoteChatPageLogic';
import './NoteChatPage.css';

function NoteChatPage() {
  const {
    isLoading,
    error,
    noteData,
    messages,
    exportLoading,
    exportType,
    newMessage,
    contentRef,
    navigate,
    handleSaveAsPdf,
    handleSaveAsImage,
    handleSaveAsDocx,
    handleRegenerateResponse,
    handleSendMessage,
    copyToClipboard,
    setNewMessage
  } = NoteChatPageLogic();

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
          onClick={() => navigate('/dashboard/lesson-note')}
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
            onClick={() => navigate('/dashboard/lesson-note')}
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
            onClick={() => navigate('/dashboard/lesson-note')}
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

export default NoteChatPage;