// src/components/AIChatSupport.jsx
import { useAIChatSupport } from './AIChatSupportLogic';
import './AIChatSupport.css';

function AIChatSupport() {
  const {
    isOpen,
    setIsOpen,
    messages,
    newMessage,
    setNewMessage,
    isLoading,
    clearChatConfirm,
    clearChatLoading,
    messagesEndRef,
    handleSubmit,
    handleClearChat,
    handleCancelClearChat
  } = useAIChatSupport();

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