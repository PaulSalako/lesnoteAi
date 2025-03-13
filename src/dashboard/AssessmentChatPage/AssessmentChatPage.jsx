// src/dashboard/components/AssessmentChatPage/AssessmentChatPage.jsx
import ReactMarkdown from 'react-markdown';
import { useAssessmentChat } from './AssessmentChatPageLogic';
import './AssessmentChatPage.css';

function AssessmentChatPage() {
  const {
    isLoading,
    error,
    assessmentData,
    messages,
    regenerating,
    newMessage,
    setNewMessage,
    handleSaveAsPdf,
    handleSaveAsImage,
    handleRegenerateAssessment,
    handleSendMessage,
    copyToClipboard,
    navigateToNewAssessment,
    navigateBack
  } = useAssessmentChat();

  if (isLoading && !assessmentData) {
    return (
      <div className="loading-container">
        <div className="spinner">
          <i className="bi bi-arrow-repeat"></i>
        </div>
        <p>Loading assessment...</p>
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
          onClick={navigateBack}
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="assessment-chat-container">
      {/* Assessment Header */}
      <div className="assessment-header">
        <div className="assessment-title">
          <h2>{assessmentData?.topic || 'Generated Assessment'}</h2>
          <span className="status-badge">
            <i className="bi bi-check-circle-fill"></i>
            Complete
          </span>
        </div>
        
        <div className="assessment-meta">
          <span><strong>Subject:</strong> {assessmentData?.subject}</span>
          <span><strong>Class:</strong> {assessmentData?.class_}</span>
          <span><strong>Type:</strong> {assessmentData?.assessmentType}</span>
          <span><strong>Duration:</strong> {assessmentData?.duration}</span>
          <span><strong>Date:</strong> {assessmentData?.date}</span>
        </div>
        
        <div className="assessment-actions">
          <button className="action-btn" onClick={handleSaveAsPdf}>
            <i className="bi bi-file-pdf"></i>
            Save as PDF
          </button>
          <button className="action-btn" onClick={handleSaveAsImage}>
            <i className="bi bi-image"></i>
            Save as Image
          </button>
          <button 
            className="action-btn primary" 
            onClick={navigateToNewAssessment}
          >
            <i className="bi bi-plus-lg"></i>
            New Assessment
          </button>
        </div>
      </div>

      {/* Assessment Messages */}
      <div className="assessment-messages">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`message ${message.type}`}
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
                    <button 
                      className="copy-btn"
                      onClick={() => copyToClipboard(message.content)}
                    >
                      <i className="bi bi-clipboard"></i>
                      Copy
                    </button>
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
      
      {/* Message Form */}
      <form onSubmit={handleSendMessage} className="message-form">
        <div className="input-container">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Ask a question about this assessment..."
            disabled={regenerating}
          />
          <button 
            type="submit" 
            disabled={regenerating || !newMessage.trim()}
          >
            <i className="bi bi-send"></i>
          </button>
        </div>
      </form>

      {/* Regenerate Section */}
      <div className="regenerate-section">
        <button 
          className="regenerate-btn"
          onClick={handleRegenerateAssessment}
          disabled={regenerating}
        >
          {regenerating ? (
            <>
              <i className="bi bi-arrow-repeat spinning"></i>
              Processing...
            </>
          ) : (
            <>
              <i className="bi bi-arrow-clockwise"></i>
              Regenerate Assessment
            </>
          )}
        </button>
        <button 
          className="modify-btn"
          onClick={navigateToNewAssessment}
          disabled={regenerating}
        >
          <i className="bi bi-pencil"></i>
          New Assessment
        </button>
      </div>
    </div>
  );
}

export default AssessmentChatPage;