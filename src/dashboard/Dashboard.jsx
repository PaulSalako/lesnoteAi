// src/dashboard/Dashboard.jsx
import { useState } from 'react';
import Sidebar from './components/Sidebar/Sidebar';
import Navbar from './components/Navbar/Navbar';
import PromptPage from './components/PromptPage/PromptPage';
import ChatPage from './components/ChatPage/ChatPage';
import './Dashboard.css';

function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState('prompt'); // 'prompt' or 'chat'
  const [chatHistory, setChatHistory] = useState([]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleGenerateNote = (promptData) => {
    // Handle generating note and switching to chat page
    setCurrentPage('chat');
    // Add to history
    setChatHistory(prev => [...prev, {
      id: Date.now(),
      topic: promptData.topic,
      subject: promptData.subject,
      date: new Date().toLocaleDateString()
    }]);
  };

  return (
    <div className="dashboard-container">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={toggleSidebar}
        chatHistory={chatHistory}
        onHistoryItemClick={(id) => {
          // Handle loading historic chat
          setCurrentPage('chat');
        }}
      />
      
      <div className={`dashboard-main ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <Navbar 
          onMenuClick={toggleSidebar}
          userName="John Doe"
          userImage="/path-to-image.jpg"
        />
        
        <div className="dashboard-content">
          {currentPage === 'prompt' ? (
            <PromptPage onGenerate={handleGenerateNote} />
          ) : (
            <ChatPage 
              onNewPrompt={() => setCurrentPage('prompt')}
              onSaveAsPdf={() => {/* Handle PDF save */}}
              onSaveAsImage={() => {/* Handle image save */}}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;