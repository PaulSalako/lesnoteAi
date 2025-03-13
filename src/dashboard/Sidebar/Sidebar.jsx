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
    plan: 0, // Default to free plan
    roleId: 3 // Default to regular user
  });
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  // Dropdown states
  const [expandedCategories, setExpandedCategories] = useState({
    create: true,
    browse: false,
    manage: false // Added for management section
  });

  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  
  // Check active page
  const isHomePage = location.pathname === '/dashboard' || location.pathname === '/dashboard/';
  const isNotesPage = location.pathname.includes('/notes');
  const isLessonPlanPage = location.pathname.includes('/lesson-plan');
  const isAssessmentPage = location.pathname.includes('/assessment');
  const isManageClassesPage = location.pathname.includes('/manage-class');
  const isManageSubjectsPage = location.pathname.includes('/manage-subject');
  const isManageTopicsPage = location.pathname.includes('/manage-topic');
  const isManageStructurePage = location.pathname.includes('/manage-lesson-structure');
  const isSearchNotePage = location.pathname.includes('/note-search');

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
          plan: data.plan || 0,
          roleId: data.roleId || 3
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
      // Only fetch history for admin/staff users, not regular users
      if (userData.roleId === 3) return;
      
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
  }, [token, navigate, userData.roleId]);

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
    if (userData.roleId === 3) { // Regular user
      setShowUpgradeModal(true);
    } else { // Admin or Staff user
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

  // Check if the user is a regular user
  const isRegularUser = userData.roleId === 3;
  
  // Check if the user is an admin
  const isAdmin = userData.roleId === 1;
  
  // Check if user is staff or admin (not a regular user)
  const isStaffOrAdmin = userData.roleId === 1 || userData.roleId === 2;

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

            {/* For Regular Users - Only show Search Notes */}
            {isRegularUser && (
              <button 
                className={`menu-item ${isSearchNotePage ? 'active' : ''}`}
                onClick={() => navigate('/dashboard/note-search')}
              >
                <i className="bi bi-search"></i>
                <span>Search Notes</span>
              </button>
            )}

            {/* Create Category - Only for Staff and Admin */}
            {isStaffOrAdmin && (
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
                    
                    {/* <button 
                      className={`menu-item ${isLessonPlanPage ? 'active' : ''}`}
                      onClick={() => navigate('/dashboard/lesson-plan')}
                    >
                      <i className="bi bi-book"></i>
                      <span>Lesson Plan</span>
                    </button>

                    <button 
                      className={`menu-item ${isAssessmentPage ? 'active' : ''}`}
                      onClick={() => navigate('/dashboard/lesson-assessment')}
                    >
                      <i className="bi bi-check-square"></i>
                      <span>Assessment</span>
                    </button> */}
                  </div>
                )}
              </div>
            )}

            {/* Browse Category - Only for Staff and Admin */}
            {isStaffOrAdmin && (
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
                      className={`menu-item ${location.pathname.includes('/notes') ? 'active' : ''}`}
                      onClick={() => navigate('/dashboard/notes')}
                    >
                      <i className="bi bi-journal-text"></i>
                      <span>Lesson Notes</span>
                    </button>

                    {/* <button 
                      className={`menu-item ${location.pathname.includes('/lesson-plans') ? 'active' : ''}`}
                      onClick={() => navigate('/dashboard/lesson-plans')}
                    >
                      <i className="bi bi-file-earmark-text"></i>
                      <span>Lesson Plans</span>
                    </button>

                    <button 
                      className={`menu-item ${location.pathname.includes('/assessments') ? 'active' : ''}`}
                      onClick={() => navigate('/dashboard/assessments')}
                    >
                      <i className="bi bi-card-checklist"></i>
                      <span>Assessments</span>
                    </button> */}
                  </div>
                )}
              </div>
            )}

            {/* Management Category - Only visible to admin users */}
            {isAdmin && (
              <div className="sidebar-category">
                <div 
                  className="category-header" 
                  onClick={() => toggleCategory('manage')}
                >
                  <div className="category-title">
                    <i className="bi bi-gear"></i>
                    <span>Management</span>
                  </div>
                  <i className={`bi bi-chevron-${expandedCategories.manage ? 'down' : 'right'}`}></i>
                </div>
                
                {expandedCategories.manage && (
                  <div className="category-content">
                    <button 
                      className={`menu-item ${isManageClassesPage ? 'active' : ''}`}
                      onClick={() => navigate('/dashboard/manage-class')}
                    >
                      <i className="bi bi-buildings"></i>
                      <span>Manage Classes</span>
                    </button>

                    <button 
                      className={`menu-item ${isManageSubjectsPage ? 'active' : ''}`}
                      onClick={() => navigate('/dashboard/manage-subject')}
                    >
                      <i className="bi bi-book"></i>
                      <span>Manage Subjects</span>
                    </button>

                    <button 
                      className={`menu-item ${isManageTopicsPage ? 'active' : ''}`}
                      onClick={() => navigate('/dashboard/manage-topic')}
                    >
                      <i className="bi bi-list-check"></i>
                      <span>Manage Topics</span>
                    </button>
                    
                    <button 
                      className={`menu-item ${isManageStructurePage ? 'active' : ''}`}
                      onClick={() => navigate('/dashboard/manage-lesson-structure')}
                    >
                      <i className="bi bi-diagram-3"></i>
                      <span>Manage Structure</span>
                    </button>
                    
                    <button 
                      className={`menu-item ${location.pathname.includes('/manage-users') ? 'active' : ''}`}
                      onClick={() => navigate('/dashboard/manage-users')}
                    >
                      <i className="bi bi-people"></i>
                      <span>Manage Users</span>
                    </button>

                    <button 
                      className={`menu-item ${location.pathname.includes('/manage-theme') ? 'active' : ''}`}
                      onClick={() => navigate('/dashboard/manage-theme')}
                    >
                      <i className="bi bi-palette"></i>
                      <span>Manage Theme</span>
                    </button>
                    
                    <button 
                      className={`menu-item ${location.pathname.includes('/manage-note') ? 'active' : ''}`}
                      onClick={() => navigate('/dashboard/manage-note')}
                    >
                      <i className="bi bi-journal-text"></i>
                      <span>Manage Notes</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Recent Notes - Only for Staff and Admin */}
          {isStaffOrAdmin && (
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

          {/* Info banner for regular users */}
          {isRegularUser && (
            <div className="info-banner">
              <i className="bi bi-info-circle"></i>
              <p>Use the Search Notes option to find and access available lesson notes.</p>
            </div>
          )}
        </div>
      </aside>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="upgrade-modal-backdrop">
          <div className="upgrade-modal">
            <div className="upgrade-modal-header">
              <h3>Feature Restricted</h3>
              <button onClick={() => setShowUpgradeModal(false)} className="close-modal">
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="upgrade-modal-body">
              <div className="premium-icon-large">
                <i className="bi bi-shield-lock"></i>
              </div>
              <h4>Access Restricted</h4>
              <p>This feature is only available to staff and admin users.</p>
            </div>
            <div className="upgrade-modal-footer">
              <button className="confirm-upgrade" onClick={() => setShowUpgradeModal(false)}>
                OK, I Understand
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Sidebar;