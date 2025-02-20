import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

function Navbar({ onMenuClick, userName = "John Doe", balance = "100.00" }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Add your logout logic here
    navigate('/login');
  };

  return (
    <nav className="dashboard-navbar">
      <div className="navbar-left">
        <button className="menu-button" onClick={onMenuClick}>
          <i className="bi bi-list"></i>
        </button>
      </div>
      
      <div className="navbar-center" style={{ fontWeight: 'bold', fontSize: '1rem', color: '#8a2be2' }}>
        <span className="balance">Balance: {balance} tokens</span>
      </div>
      
      <div className="navbar-right">
        <div className="profile-section">
          <div 
            className="profile-trigger"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            <div className="user-avatar">
              {userName.charAt(0)}
            </div>
            <span className="user-name">{userName}</span>
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
                  </div>
                </div>
              </div>
              
              <div className="dropdown-items">
                <button className="dropdown-item">
                  <i className="bi bi-person"></i>
                  Profile
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
  );
}

export default Navbar;
