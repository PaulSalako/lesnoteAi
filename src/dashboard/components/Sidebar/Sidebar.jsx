import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';

function Sidebar({ isOpen, onToggle }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [userData, setUserData] = useState({
    userName: '',
    plan: 0 // Default to free plan
  });
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  // Dropdown states
  const [expandedCategories, setExpandedCategories] = useState({
    create: true,
    browse: false
  });

  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  
  // Check active page
  const isHomePage = location.pathname === '/dashboard' || location.pathname === '/dashboard/';
  const isNotesPage = location.pathname.includes('/notes');
  const isLessonPlanPage = location.pathname.includes('/lesson-plan');
  const isAssessmentPage = location.pathname.includes('/assessment');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('https://localhost:7225/api/Dashboard/stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        setUserData({
          userName: data.userName || 'User',
          plan: data.plan || 0
        });
      } catch (err) {
        console.error('Error fetching user data:', err);
        if (err.message.includes('unauthorized')) {
          handleLogout();
        }
      }
    };

    if (token) {
      fetchUserData();
    }
  }, [token]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (userData.plan === 0) return; // Don't fetch history for free users
      
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('https://localhost:7225/api/Dashboard/recent-notes', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch notes');
        }

        const data = await response.json();
        setChatHistory(data);
      } catch (err) {
        console.error('Error fetching history:', err);
        setError(err.message);
        if (err.message.includes('unauthorized')) {
          localStorage.clear();
          sessionStorage.clear();
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchHistory();
    }
  }, [token, navigate, userData.plan]);

  const filteredHistory = chatHistory
    .filter(item =>
      item.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.subject.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .slice(0, 3); // Limit to 3 items

  const handleHistoryItemClick = (id) => {
    navigate(`/dashboard/note-chat/${id}`);
  };

  const handleViewAll = () => {
    navigate('/dashboard/notes');
  };

  const handlePremiumFeatureClick = (feature) => {
    if (userData.plan === 0) { // Free user
      setShowUpgradeModal(true);
    } else { // Premium user
      // Navigate to the feature
      navigate(`/dashboard/${feature}`);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate('/login');
  };

  const toggleCategory = (category) => {
    setExpandedCategories({
      ...expandedCategories,
      [category]: !expandedCategories[category]
    });
  };

  return (
    <>
      <aside className={`dashboard-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-area">
            <img src="/lesnotelogo1.png" alt="LesNote Logo" className="logo" />
            <span className="logo-text">LesNoteAI</span>
          </div>
          <button className="close-sidebar" onClick={onToggle}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <div className="sidebar-content">
          {/* Navigation Menu */}
          <div className="sidebar-menu">
            {/* Home Navigation */}
            <button 
              className={`menu-item ${isHomePage ? 'active' : ''}`}
              onClick={() => navigate('/dashboard')}
            >
              <i className="bi bi-house-door"></i>
              <span>Home</span>
            </button>

            {/* Create Category */}
            <div className="sidebar-category">
              <div 
                className="category-header" 
                onClick={() => toggleCategory('create')}
              >
                <div className="category-title">
                  <i className="bi bi-plus-square"></i>
                  <span>Create</span>
                </div>
                <i className={`bi bi-chevron-${expandedCategories.create ? 'down' : 'right'}`}></i>
              </div>
              
              {expandedCategories.create && (
                <div className="category-content">
                  <button 
                    className="new-note-btn"
                    onClick={() => navigate('/dashboard/lesson-note')}
                  >
                    <i className="bi bi-plus-lg"></i>
                    Lesson Note
                  </button>
                  
                  <button 
                    className={`menu-item ${isLessonPlanPage ? 'active' : ''} ${userData.plan === 0 ? 'premium-feature' : ''}`}
                    onClick={() => handlePremiumFeatureClick('lesson-plan')}
                  >
                    <i className="bi bi-book"></i>
                    <span>Lesson Plan</span>
                    {userData.plan === 0 && <i className="bi bi-star premium-icon"></i>}
                  </button>

                  <button 
                    className={`menu-item ${isAssessmentPage ? 'active' : ''} ${userData.plan === 0 ? 'premium-feature' : ''}`}
                    onClick={() => handlePremiumFeatureClick('lesson-assessment')}
                  >
                    <i className="bi bi-check-square"></i>
                    <span>Assessment</span>
                    {userData.plan === 0 && <i className="bi bi-star premium-icon"></i>}
                  </button>
                </div>
              )}
            </div>

            {/* Browse Category */}
            <div className="sidebar-category">
              <div 
                className="category-header" 
                onClick={() => toggleCategory('browse')}
              >
                <div className="category-title">
                  <i className="bi bi-folder2-open"></i>
                  <span>Browse</span>
                </div>
                <i className={`bi bi-chevron-${expandedCategories.browse ? 'down' : 'right'}`}></i>
              </div>
              
              {expandedCategories.browse && (
                <div className="category-content">
                  <button 
                    className={`menu-item ${location.pathname.includes('/notes') ? 'active' : ''} ${userData.plan === 0 ? 'premium-feature' : ''}`}
                    onClick={() => handlePremiumFeatureClick('notes')}
                  >
                    <i className="bi bi-journal-text"></i>
                    <span>Lesson Notes</span>
                    {userData.plan === 0 && <i className="bi bi-star premium-icon"></i>}
                  </button>

                  <button 
                    className={`menu-item ${location.pathname.includes('/lesson-plans') ? 'active' : ''} ${userData.plan === 0 ? 'premium-feature' : ''}`}
                    onClick={() => handlePremiumFeatureClick('lesson-plans')}
                  >
                    <i className="bi bi-file-earmark-text"></i>
                    <span>Lesson Plans</span>
                    {userData.plan === 0 && <i className="bi bi-star premium-icon"></i>}
                  </button>

                  <button 
                    className={`menu-item ${location.pathname.includes('/assessments') ? 'active' : ''} ${userData.plan === 0 ? 'premium-feature' : ''}`}
                    onClick={() => handlePremiumFeatureClick('assessments')}
                  >
                    <i className="bi bi-card-checklist"></i>
                    <span>Assessments</span>
                    {userData.plan === 0 && <i className="bi bi-star premium-icon"></i>}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Recent Notes - Only for Premium Users */}
          {userData.plan === 1 && (
            <div className="history-section">
              <div className="section-header">
                <h3>Recent Notes</h3>
                <div className="header-actions">
                  <button
                    className="search-toggle"
                    onClick={() => setIsSearchOpen(!isSearchOpen)}
                  >
                    <i className="bi bi-search"></i>
                  </button>
                  {chatHistory.length > 3 && (
                    <button
                      className="view-all-btn"
                      onClick={handleViewAll}
                    >
                      View All
                    </button>
                  )}
                </div>
              </div>

              {isSearchOpen && (
                <div className="search-bar">
                  <input
                    type="text"
                    placeholder="Search notes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              )}

              <div className="history-list">
                {loading ? (
                  <div className="loading-state">
                    <i className="bi bi-arrow-clockwise spinning"></i>
                    <p>Loading notes...</p>
                  </div>
                ) : error ? (
                  <div className="error-state">
                    <i className="bi bi-exclamation-circle"></i>
                    <p>{error}</p>
                  </div>
                ) : filteredHistory.length > 0 ? (
                  <>
                    {filteredHistory.map(item => (
                      <div
                        key={item.id}
                        className="history-item"
                        onClick={() => handleHistoryItemClick(item.id)}
                      >
                        <div className="history-item-icon">
                          <i className="bi bi-file-text"></i>
                        </div>
                        <div className="history-item-content">
                          <h4>{item.topic}</h4>
                          <div className="history-item-meta">
                            <span>{item.subject}</span>
                            <span>•</span>
                            <span>{item.date}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="empty-history">
                    <i className="bi bi-journal-text"></i>
                    <p>{searchTerm ? 'No matches found' : 'No notes yet'}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Premium Banner for Free Users */}
          {userData.plan === 0 && (
            <div className="premium-banner">
              <div className="premium-banner-icon">
                <i className="bi bi-star-fill"></i>
              </div>
              <div className="premium-banner-content">
                <h4>Upgrade to Premium</h4>
                <p>Access all features and resources!</p>
                <button 
                  className="premium-banner-btn"
                  onClick={() => setShowUpgradeModal(true)}
                >
                  Upgrade Now
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="upgrade-modal-backdrop">
          <div className="upgrade-modal">
            <div className="upgrade-modal-header">
              <h3>Upgrade to Premium</h3>
              <button onClick={() => setShowUpgradeModal(false)} className="close-modal">
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="upgrade-modal-body">
              <div className="premium-icon-large">
                <i className="bi bi-star-fill"></i>
              </div>
              <h4>Premium Feature</h4>
              <p>This feature is available exclusively for premium users. Upgrade your plan to access:</p>
              <ul className="premium-features-list">
                <li><i className="bi bi-check-circle"></i> Create Lesson Plans</li>
                <li><i className="bi bi-check-circle"></i> Create Assessments</li>
                <li><i className="bi bi-check-circle"></i> View All Your Resources</li>
                <li><i className="bi bi-check-circle"></i> Advanced AI-Powered Tools</li>
              </ul>
            </div>
            <div className="upgrade-modal-footer">
              <button className="cancel-upgrade" onClick={() => setShowUpgradeModal(false)}>
                Maybe Later
              </button>
              <button className="confirm-upgrade">
                Upgrade Now
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Sidebar;