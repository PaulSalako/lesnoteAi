// src/dashboard/components/NoteChatPage/NoteChatPage.jsx
import { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import './AssessmentChatPage.css';

function ChatPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const noteData = location.state?.noteData;

  const [messages, setMessages] = useState([
    // Example message structure
    {
      id: 1,
      type: 'system',
      content: 'Your lesson note has been generated.'
    },
    {
      id: 2,
      type: 'ai',
      content: `Subject: Mathematics
Topic: Introduction to Algebra
Class: JSS 1
Duration: 40 minutes

Objectives:
1. Students will understand basic algebraic concepts
2. Students will be able to identify variables and constants
3. Students will solve simple algebraic expressions

Materials Needed:
- Whiteboard and markers
- Student workbooks
- Basic calculators

Introduction:
Begin the lesson by explaining that algebra is a branch of mathematics that uses letters and symbols to represent numbers...`
    }
  ]);

  const handleSaveAsPdf = async () => {
    try {
      // Implement PDF saving logic here
      console.log('Saving as PDF...');
    } catch (error) {
      console.error('Error saving PDF:', error);
    }
  };

  const handleSaveAsImage = async () => {
    try {
      // Implement image saving logic here
      console.log('Saving as Image...');
    } catch (error) {
      console.error('Error saving image:', error);
    }
  };

  return (
    <div className="chat-container">
      {/* Chat Header */}
      <div className="chat-header">
        <div className="chat-title">
          <h2>Generated Lesson Note</h2>
          <span className="status-badge">
            <i className="bi bi-check-circle-fill"></i>
            Complete
          </span>
        </div>
        
        <div className="chat-actions">
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
            onClick={() => navigate('/dashboard/new')}
          >
            <i className="bi bi-plus-lg"></i>
            New Note
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="chat-messages">
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
            
            <div className="message-content">
              {message.type === 'system' ? (
                <div className="system-message">
                  <i className="bi bi-info-circle"></i>
                  {message.content}
                </div>
              ) : (
                <div className="ai-response">
                  <div className="response-header">
                    <span>AI Response</span>
                    <button className="copy-btn">
                      <i className="bi bi-clipboard"></i>
                      Copy
                    </button>
                  </div>
                  <pre className="response-content">
                    {message.content}
                  </pre>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Regenerate Section */}
      <div className="regenerate-section">
        <button className="regenerate-btn">
          <i className="bi bi-arrow-clockwise"></i>
          Regenerate Response
        </button>
        <button 
          className="modify-btn"
          onClick={() => navigate('/dashboard/new')}
        >
          <i className="bi bi-pencil"></i>
          Modify Prompt
        </button>
      </div>
    </div>
  );
}

export default ChatPage;