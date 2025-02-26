import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

function Navbar({ onMenuClick }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    plan: 0 // Default to free plan (0)
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
          plan: statsData.plan || 0
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
      navigate('/sign-in');
    }
  }, [token, navigate]);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate('/sign-in');
  };

  const getPlanName = (planNumber) => {
    return planNumber === 1 ? 'Premium' : 'Free';
  };

  const getPlanIcon = (planNumber) => {
    return planNumber === 1 ? 'bi-star-fill' : 'bi-star';
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
          <div className="plan-display">
            <div className="plan-badge">
              <i className={`bi ${getPlanIcon(userData.plan)}`}></i>
              <span>{getPlanName(userData.plan)} Plan</span>
            </div>
            {userData.plan === 0 && (
              <button 
                className="upgrade-btn"
                onClick={() => setIsPlanModalOpen(true)}
              >
                Upgrade
              </button>
            )}
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
                      <span className="plan-info-dropdown">
                        <i className={`bi ${getPlanIcon(userData.plan)}`}></i>
                        {getPlanName(userData.plan)} Plan
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="dropdown-items">
                  <button className="dropdown-item">
                    <i className="bi bi-person"></i>
                    Profile
                  </button>
                  {userData.plan === 0 && (
                    <button 
                      className="dropdown-item upgrade-item"
                      onClick={() => {
                        setIsProfileOpen(false);
                        setIsPlanModalOpen(true);
                      }}
                    >
                      <i className="bi bi-star"></i>
                      Upgrade to Premium
                    </button>
                  )}
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
      
      {/* We'll need to create a PlanUpgradeModal component later */}
      {isPlanModalOpen && (
        <PlanUpgradeModal 
          isOpen={isPlanModalOpen}
          onClose={() => setIsPlanModalOpen(false)}
          userEmail={userData.email}
        />
      )}
    </>
  );
}

// Placeholder for PlanUpgradeModal
// Replace this with your actual modal implementation
const PlanUpgradeModal = ({ isOpen, onClose, userEmail }) => {
  if (!isOpen) return null;
  
  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Upgrade to Premium</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <p>Upgrade your account to access premium features!</p>
          {/* Add your payment integration here */}
        </div>
        <div className="modal-footer">
          <button className="cancel-button" onClick={onClose}>Cancel</button>
          <button className="upgrade-button">Upgrade Now</button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;