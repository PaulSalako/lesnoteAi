// src/dashboard/components/Navbar/Navbar.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BuyTokensModal from '../BuyTokensModal/BuyTokensModal';
import './Navbar.css';

function Navbar({ 
  onMenuClick, 
  userName = "John Doe",
  userEmail = "john.doe@example.com" // Add email prop with default value
}) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <>
      <nav className="dashboard-navbar">
        <div className="navbar-left">
          <div className="brand">
            {/* <img src="/lesnotelogo1.png" alt="LesNote" className="brand-logo" /> */}
            {/* <span className="brand-name">LesNoteAI</span> */}
          </div>
          <button className="menu-button" onClick={onMenuClick}>
            <i className="bi bi-list"></i>
          </button>
        </div>

        <div className="navbar-right">
          <div className="token-display">
            <div className="token-count">
              <i className="bi bi-coin"></i>
              <span>20 tokens</span>
            </div>
            <button 
              className="buy-more-btn"
              onClick={() => setIsTokenModalOpen(true)}
            >
              Buy More
            </button>
          </div>

          <div className="profile-section">
            <div 
              className="profile-button"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              <div className="profile-avatar">{userName.charAt(0)}</div>
              <span className="profile-name">{userName}</span>
              <i className={`bi bi-chevron-${isProfileOpen ? 'up' : 'down'}`}></i>
            </div>

            {isProfileOpen && (
              <div className="profile-dropdown">
                <div className="dropdown-header">
                  <div className="user-info">
                    <div className="user-avatar">{userName.charAt(0)}</div>
                    <div className="user-details">
                      <span className="name">{userName}</span>
                      <span className="role">Teacher</span>
                      <span className="token-info-dropdown">
                        <i className="bi bi-coin"></i>
                        20 tokens available
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="dropdown-items">
                  <button className="dropdown-item">
                    <i className="bi bi-person"></i>
                    Profile
                  </button>
                  <button 
                    className="dropdown-item"
                    onClick={() => {
                      setIsProfileOpen(false);
                      setIsTokenModalOpen(true);
                    }}
                  >
                    <i className="bi bi-coin"></i>
                    Buy Tokens
                  </button>
                  <button className="dropdown-item">
                    <i className="bi bi-gear"></i>
                    Settings
                  </button>
                  <hr className="dropdown-divider" />
                  <button className="dropdown-item text-danger" onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right"></i>
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      <BuyTokensModal 
        isOpen={isTokenModalOpen}
        onClose={() => setIsTokenModalOpen(false)}
        userEmail={userEmail} // Now properly defined through props
      />
    </>
  );
}

export default Navbar;