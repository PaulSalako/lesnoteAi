import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BuyTokensModal from '../BuyTokensModal/BuyTokensModal';
import './Navbar.css';

function Navbar({ onMenuClick }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    tokens: 0
  });
  
  const navigate = useNavigate();
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const statsResponse = await fetch('https://localhost:7225/api/Dashboard/stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!statsResponse.ok) {
          throw new Error('Failed to fetch user data');
        }

        const statsData = await statsResponse.json();
        setUserData({
          name: statsData.userName || 'User',
          email: JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user'))?.Email || '',
          tokens: statsData.availableTokens || 0
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
        if (error.message.includes('unauthorized')) {
          handleLogout();
        }
      }
    };

    if (token) {
      fetchUserData();
    } else {
      navigate('/login');
    }
  }, [token, navigate]);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate('/login');
  };

  return (
    <>
      <nav className="dashboard-navbar">
        <div className="navbar-left">
          <div className="brand">
            <img src="/lesnotelogo1.png" alt="LesNote" className="brand-logo" />
            <span className="brand-name">LesNoteAI</span>
          </div>
          <button className="menu-button" onClick={onMenuClick}>
            <i className="bi bi-list"></i>
          </button>
        </div>

        <div className="navbar-right">
          <div className="token-display">
            <div className="token-count">
              <i className="bi bi-coin"></i>
              <span>{userData.tokens} tokens</span>
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
              <div className="profile-avatar">{userData.name?.charAt(0).toUpperCase()}</div>
              <span className="profile-name">{userData.name?.split(" ")[0].charAt(0).toUpperCase() + userData.name?.split(" ")[0].slice(1).toLowerCase()}</span>
              <i className={`bi bi-chevron-${isProfileOpen ? 'up' : 'down'}`}></i>
            </div>

            {isProfileOpen && (
              <div className="profile-dropdown">
                <div className="dropdown-header">
                  <div className="user-info">
                    <div className="user-avatar">{userData.name?.charAt(0)}</div>
                    <div className="user-details">
                      <span className="name">{userData.name}</span>
                      <span className="email">{userData.email}</span>
                      <span className="token-info-dropdown">
                        <i className="bi bi-coin"></i>
                        {userData.tokens} tokens available
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
        userEmail={userData.email}
      />
    </>
  );
}

export default Navbar;