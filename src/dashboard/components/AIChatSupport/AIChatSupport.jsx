// src/components/AIChatSupport.jsx
import { useState, useEffect, useRef } from 'react';
import './AIChatSupport.css';

function AIChatSupport() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      id: Date.now(), 
      type: 'ai', 
      text: 'Hello! I\'m your AI teaching assistant. How can I help you today?' 
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userName, setUserName] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [clearChatConfirm, setClearChatConfirm] = useState(false);
  const [clearChatLoading, setClearChatLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const CHAT_STORAGE_KEY = 'ai_chat_messages';
  const SESSION_STORAGE_KEY = 'ai_chat_session_id';
  const LAST_USER_KEY = 'last_logged_in_user';

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch user profile
  const fetchUserProfile = async (token) => {
    try {
      const response = await fetch('https://localhost:7225/api/Dashboard/user-profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Profile Fetch Response:', {
        status: response.status,
        statusText: response.statusText
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('Profile API Error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorBody
        });
        throw new Error('Failed to load user profile');
      }
      
      const userProfile = await response.json();
      console.log('User Profile:', userProfile);
      return userProfile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  };

  // Fetch chat history
  const fetchChatHistory = async (token) => {
    try {
      const response = await fetch('https://localhost:7225/api/AI/chat-history', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Chat History Fetch Response:', {
        status: response.status,
        statusText: response.statusText
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('Chat History API Error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorBody
        });
        throw new Error('Failed to load chat history');
      }
      
      const chatHistory = await response.json();
      console.log('Chat History:', chatHistory);
      return chatHistory;
    } catch (error) {
      console.error('Error fetching chat history:', error);
      throw error;
    }
  };

  // Load messages from local storage on component mount
  useEffect(() => {
    const storedSessionId = localStorage.getItem(SESSION_STORAGE_KEY);
    if (storedSessionId) {
      setSessionId(storedSessionId);
    }
    
    const storedMessages = localStorage.getItem(CHAT_STORAGE_KEY);
    if (storedMessages) {
      try {
        const parsedMessages = JSON.parse(storedMessages);
        if (Array.isArray(parsedMessages) && parsedMessages.length > 0) {
          setMessages(parsedMessages);
        }
      } catch (error) {
        console.error('Error parsing stored messages:', error);
      }
    }
  }, []);

  // Save messages to local storage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  // Handle session and chat history
  useEffect(() => {
    const checkSession = async () => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        
        if (!token) {
          // Clear everything if no token (user logged out)
          setUserName('');
          setSessionId('');
          localStorage.removeItem(CHAT_STORAGE_KEY);
          localStorage.removeItem(SESSION_STORAGE_KEY);
          
          const welcomeMessage = {
            id: Date.now(),
            type: 'ai',
            text: 'Hello! I\'m your AI teaching assistant. How can I help you today?'
          };
          setMessages([welcomeMessage]);
          return;
        }
        
        // Decode token to get user ID (assuming JWT)
        const tokenData = parseJwt(token);
        const currentSessionId = tokenData?.id || tokenData?.sub || '';
        
        // Store current session ID for persistence
        if (currentSessionId) {
          localStorage.setItem(SESSION_STORAGE_KEY, currentSessionId);
        }
        
        // Check if this is a new user or different user
        const lastLoggedInUser = localStorage.getItem(LAST_USER_KEY);
        const isNewUser = !lastLoggedInUser || lastLoggedInUser !== currentSessionId;
        
        try {
          // Fetch user profile
          const userProfile = await fetchUserProfile(token);
          const name = userProfile.firstName || 'User';
          setUserName(name);
          
          // If it's a new user or first login, load chat history
          if (isNewUser) {
            try {
              const chatHistory = await fetchChatHistory(token);
              
              if (chatHistory && chatHistory.length > 0) {
                // Transform messages to match our format
                const transformedMessages = chatHistory.map(msg => ({
                  id: msg.id || Date.now(),
                  type: msg.role === 'assistant' ? 'ai' : 'user',
                  text: msg.content
                }));
                
                // If no messages or just welcome message, set loaded history
                if (messages.length <= 1) {
                  setMessages(transformedMessages);
                  localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(transformedMessages));
                }
              }
              
              // Update last logged in user
              localStorage.setItem(LAST_USER_KEY, currentSessionId);
            } catch (historyError) {
              console.error('Failed to load chat history:', historyError);
            }
          }
          
          // Set personalized welcome if no messages
          if (messages.length === 0) {
            const welcomeMessage = {
              id: Date.now(),
              type: 'ai',
              text: `Hello ${name}! I'm your AI teaching assistant. How can I help you today?`
            };
            setMessages([welcomeMessage]);
          }
          
          // Update session ID
          setSessionId(currentSessionId);
        } catch (profileError) {
          console.error('Failed to fetch profile:', profileError);
          
          // Fallback to generic welcome message
          const welcomeMessage = {
            id: Date.now(),
            type: 'ai',
            text: 'Hello! I\'m your AI teaching assistant. How can I help you today?'
          };
          setMessages([welcomeMessage]);
        }
      } catch (error) {
        console.error('Error checking session:', error);
      }
    };
    
    // Helper function to parse JWT
    const parseJwt = (token) => {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(window.atob(base64));
      } catch (e) {
        return null;
      }
    };
    
    // Check session on component mount and token changes
    const tokenCheckInterval = setInterval(checkSession, 5000);
    checkSession(); // Check immediately on mount
    
    return () => clearInterval(tokenCheckInterval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    const userMessage = { id: Date.now(), type: 'user', text: newMessage };
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch('https://localhost:7225/api/AI/chat', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: newMessage })
      });
      
      if (!response.ok) {
        const errorBody = await response.text();
        console.error('Chat API Error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorBody
        });
        throw new Error('Failed to get response from AI');
      }
      
      const data = await response.json();
      
      setTimeout(() => {
        const aiResponse = { 
          id: Date.now(), 
          type: 'ai', 
          text: data.response || "I'm sorry, I couldn't process that request." 
        };
        
        setMessages(prev => [...prev, aiResponse]);
        setIsLoading(false);
        
        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify([...messages, userMessage, aiResponse]));
      }, 500);
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage = { 
        id: Date.now(), 
        type: 'ai', 
        text: "I'm having trouble connecting right now. Please try again later." 
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setIsLoading(false);
      
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify([...messages, userMessage, errorMessage]));
    }
  };

  // Function to clear chat history
  const handleClearChat = async () => {
    if (clearChatConfirm) {
      setClearChatLoading(true);
      
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        
        if (!token) {
          throw new Error('Authentication required');
        }
        
        const response = await fetch('https://localhost:7225/api/AI/delete-chat', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          const errorBody = await response.text();
          console.error('Clear Chat API Error:', {
            status: response.status,
            statusText: response.statusText,
            body: errorBody
          });
          throw new Error('Failed to clear chat history');
        }
        
        // Clear messages in state and local storage
        const welcomeMessage = {
          id: Date.now(),
          type: 'ai',
          text: `Chat history cleared. How can I help you today?`
        };
        
        setMessages([welcomeMessage]);
        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify([welcomeMessage]));
        setClearChatConfirm(false);
      } catch (error) {
        console.error('Error clearing chat history:', error);
        
        const errorMessage = { 
          id: Date.now(), 
          type: 'ai', 
          text: "I'm having trouble clearing chat history. Please try again later." 
        };
        
        setMessages(prev => [...prev, errorMessage]);
        setClearChatConfirm(false);
      } finally {
        setClearChatLoading(false);
      }
    } else {
      setClearChatConfirm(true);
      
      // Auto-cancel confirmation after 5 seconds
      setTimeout(() => {
        setClearChatConfirm(false);
      }, 5000);
    }
  };

  // Cancel clear chat confirmation
  const handleCancelClearChat = () => {
    setClearChatConfirm(false);
  };

  // Render method
  return (
    <>
      <button
        className={`chat-support-button ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? (
          <i className="bi bi-x-lg"></i>
        ) : (
          <i className="bi bi-chat-dots-fill"></i>
        )}
      </button>

      <div className={`chat-support-window ${isOpen ? 'open' : ''}`}>
        <div className="chat-support-header">
          <h3>AI Teaching Assistant</h3>
          <div className="header-actions">
            <button 
              className={`clear-chat-btn ${clearChatConfirm ? 'confirm' : ''} ${clearChatLoading ? 'loading' : ''}`}
              onClick={handleClearChat}
              disabled={clearChatLoading || messages.length <= 1}
              title="Clear chat history"
            >
              {clearChatLoading ? (
                <i className="bi bi-arrow-repeat spinning"></i>
              ) : clearChatConfirm ? (
                <i className="bi bi-check-lg"></i>
              ) : (
                <i className="bi bi-trash"></i>
              )}
            </button>
            {clearChatConfirm && (
              <button 
                className="cancel-clear-btn"
                onClick={handleCancelClearChat}
                title="Cancel"
              >
                <i className="bi bi-x"></i>
              </button>
            )}
            <button 
              className="chat-close-btn" 
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
            >
              <i className="bi bi-x"></i>
            </button>
          </div>
        </div>
        
        {clearChatConfirm && (
          <div className="clear-chat-confirm-banner">
            <i className="bi bi-exclamation-triangle"></i>
            <span>Are you sure you want to clear all chat history?</span>
          </div>
        )}
        
        <div className="chat-support-messages">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`chat-message ${message.type}`}
            >
              {message.type === 'ai' && (
                <div className="chat-avatar">
                  <i className="bi bi-robot"></i>
                </div>
              )}
              <div className="chat-bubble">
                {message.text}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="chat-message ai">
              <div className="chat-avatar">
                <i className="bi bi-robot"></i>
              </div>
              <div className="chat-bubble typing">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        <form className="chat-support-input" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Type your question here..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={isLoading || clearChatConfirm}
          />
          <button
            type="submit" 
            disabled={isLoading || !newMessage.trim() || clearChatConfirm}
          >
            <i className="bi bi-send"></i>
          </button>
        </form>
      </div>
    </>
  );
}

export default AIChatSupport;