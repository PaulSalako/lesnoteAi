// src/dashboard/components/Sidebar/Sidebar.jsx
import { useState } from 'react';
import './Sidebar.css';

function Sidebar({ isOpen, onToggle, chatHistory = [], onHistoryItemClick }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHistory = chatHistory.filter(item => 
    item.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <button className="new-note-btn">
            <i className="bi bi-plus-lg"></i>
            New Lesson Note
          </button>

          {/* <div className="menu-section">
            <div className="menu-header">
              <span>Quick Links</span>
            </div>
            <ul className="menu-items">
              <li className="active">
                <i className="bi bi-house"></i>
                <span>Home</span>
              </li>
              <li>
                <i className="bi bi-files"></i>
                <span>My Notes</span>
              </li>
              <li>
                <i className="bi bi-star"></i>
                <span>Favorites</span>
              </li>
              <li>
                <i className="bi bi-trash"></i>
                <span>Trash</span>
              </li>
            </ul>
          </div> */}
        </div>

        {/* History Section */}
        <div className="history-section">
          <div className="section-header">
            <h3>Recent Notes</h3>
            <button 
              className="search-toggle"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <i className="bi bi-search"></i>
            </button>
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
            {filteredHistory.length > 0 ? (
              filteredHistory.map(item => (
                <div 
                  key={item.id}
                  className="history-item"
                  onClick={() => onHistoryItemClick(item.id)}
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
              ))
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