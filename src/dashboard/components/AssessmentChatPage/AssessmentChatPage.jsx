// src/dashboard/components/AssessmentChatPage/AssessmentChatPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import './AssessmentChatPage.css';

function AssessmentChatPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assessmentData, setAssessmentData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [regenerating, setRegenerating] = useState(false);
  const [newMessage, setNewMessage] = useState('');

  // Fetch the assessment data when the component mounts
  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        
        if (!token) {
          throw new Error('Authentication token not found. Please log in again.');
        }
        
        console.log('Fetching Assessment. ID:', id);
        
        const response = await fetch(`https://localhost:7225/api/Assessments/${id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch assessment');
        }
        
        const responseData = await response.json();
        console.log('Fetched Assessment:', responseData);
        
        setAssessmentData(responseData);
        
        // Transform messages
        const transformedMessages = [
          {
            id: 'system-1',
            type: 'system',
            content: 'Your assessment has been generated.'
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
        console.error('Error fetching assessment:', error);
        setError(error.message || 'An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };
  
    if (id) {
      fetchAssessment(); 
    }
  }, [id]);

  const handleSaveAsPdf = async () => {
    try {
      // Implement PDF saving logic here
      console.log('Saving as PDF...');
      alert('PDF export functionality will be implemented in a future update.');
    } catch (error) {
      console.error('Error saving PDF:', error);
    }
  };

  const handleSaveAsImage = async () => {
    try {
      // Implement image saving logic here
      console.log('Saving as Image...');
      alert('Image export functionality will be implemented in a future update.');
    } catch (error) {
      console.error('Error saving image:', error);
    }
  };

  const handleRegenerateAssessment = async () => {
    try {
      setRegenerating(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      const response = await fetch(`https://localhost:7225/api/Assessments/regenerate/${id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ modifiedPrompt: '' }) // Empty for standard regeneration
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to regenerate assessment');
      }
      
      const data = await response.json();
      
      // Add the new message to the list
      setMessages(prev => [
        ...prev,
        {
          id: `system-${Date.now()}`,
          type: 'system',
          content: 'Assessment has been regenerated.'
        },
        {
          id: `ai-${Date.now()}`,
          type: 'ai',
          content: data.data.content
        }
      ]);
      
    } catch (error) {
      console.error('Error regenerating assessment:', error);
      setError(error.message || 'An error occurred while regenerating the assessment');
    } finally {
      setRegenerating(false);
    }
  };

  // Function to send a message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      setRegenerating(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      // Add user message immediately to UI
      const userMessageId = `user-${Date.now()}`;
      setMessages(prev => [
        ...prev,
        {
          id: userMessageId,
          type: 'user',
          content: newMessage
        }
      ]);
      
      // Clear input field
      setNewMessage('');
      
      // Send request to API
      const response = await fetch(`https://localhost:7225/api/Assessments/${id}/message`, {
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
      
      // Add AI response to the messages
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
      setRegenerating(false);
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
          onClick={() => navigate('/dashboard/lesson-assessment')}
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
            onClick={() => navigate('/dashboard/lesson-assessment')}
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
              <span className="spinner">
                <i className="bi bi-arrow-repeat"></i>
              </span>
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
          onClick={() => navigate('/dashboard/lesson-assessment')}
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