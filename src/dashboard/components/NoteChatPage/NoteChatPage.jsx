// src/dashboard/components/NoteChatPage/NoteChatPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './NoteChatPage.css';

function ChatPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [noteData, setNoteData] = useState(null);
  const [messages, setMessages] = useState([]);

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
      fetchLessonNote(); // This line was missing in the previous version
    }
  }, [id]);

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

  // Function to copy text to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(
      () => {
        // Show a temporary "Copied!" message
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
                    <button 
                      className="copy-btn"
                      onClick={() => copyToClipboard(message.content)}
                    >
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
  );
}

export default ChatPage;