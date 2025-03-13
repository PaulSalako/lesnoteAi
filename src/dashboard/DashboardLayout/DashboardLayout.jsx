// src/dashboard/DashboardLayout.jsx
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import Navbar from '../Navbar/Navbar';
import BuyTokensModal from '../BuyTokensModal/BuyTokensModal';
import './DashboardLayout.css';

function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="dashboard-container">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={toggleSidebar}
        chatHistory={chatHistory}
      />
      
      <div className={`dashboard-main ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <Navbar 
          onMenuClick={toggleSidebar}
          onBuyTokens={() => setIsTokenModalOpen(true)}
          userName="John Doe"
        />
        
        <div className="dashboard-content">
          <Outlet />
        </div>
      </div>

      <BuyTokensModal 
        isOpen={isTokenModalOpen}
        onClose={() => setIsTokenModalOpen(false)}
      />
    </div>
  );
}

export default DashboardLayout;