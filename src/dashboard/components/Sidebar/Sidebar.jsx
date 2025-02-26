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

  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  
  // Check if we're on the dashboard home page
  const isHomePage = location.pathname === '/dashboard' || location.pathname === '/dashboard/';
  const isNotesPage = location.pathname === '/dashboard/notes';

  useEffect(() => {
    const fetchHistory = async () => {
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
  }, [token, navigate]);

  const filteredHistory = chatHistory
    .filter(item =>
      item.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.subject.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .slice(0, 3); // Limit to 3 items

  const handleHistoryItemClick = (id) => {
    navigate(`/dashboard/chat/${id}`);
  };

  const handleViewAll = () => {
    navigate('/dashboard/notes');
  };

  return (
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
          {/* New Note Button at the top */}
          <button 
            className="new-note-btn"
            onClick={() => navigate('/dashboard/new')}
          >
            <i className="bi bi-plus-lg"></i>
            New Lesson Note
          </button>
          
          {/* Home Navigation */}
          <button 
            className={`menu-item ${isHomePage ? 'active' : ''}`}
            onClick={() => navigate('/dashboard')}
          >
            <i className="bi bi-house-door"></i>
            <span>Home</span>
          </button>

          {/* Notes Navigation */}
          <button 
            className={`menu-item ${isNotesPage ? 'active' : ''}`}
            onClick={() => navigate('/dashboard/notes')}
          >
            <i className="bi bi-journal-text"></i>
            <span>All Notes</span>
          </button>
        </div>

        {/* History Section */}
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
                {/* {chatHistory.length > 3 && !searchTerm && (
                  <button 
                    className="view-all-notes"
                    onClick={handleViewAll}
                  >
                    View all {chatHistory.length} notes
                  </button>
                )} */}
              </>
            ) : (
              <div className="empty-history">
                <i className="bi bi-journal-text"></i>
                <p>{searchTerm ? 'No matches found' : 'No notes yet'}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;