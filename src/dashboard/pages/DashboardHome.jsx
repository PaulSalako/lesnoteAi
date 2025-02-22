// src/dashboard/pages/DashboardHome.jsx
import { useNavigate } from 'react-router-dom';
import './DashboardHome.css';

function DashboardHome() {
  const navigate = useNavigate();

  // Mock data - replace with real data from your context/API
  const userName = "John Doe";
  const activityCards = [
    {
      title: "Available Tokens",
      value: "20",
      icon: "bi-coin",
      color: "purple"
    },
    {
      title: "Total Notes",
      value: "12",
      icon: "bi-file-text",
      color: "blue"
    },
    {
      title: "Today's Notes",
      value: "3",
      icon: "bi-calendar-check",
      color: "green"
    }
  ];

  const recentNotes = [
    {
      id: 1,
      subject: "Mathematics",
      topic: "Introduction to Algebra",
      date: "2024-02-22"
    },
    {
      id: 2,
      subject: "Physics",
      topic: "Newton's Laws of Motion",
      date: "2024-02-21"
    }
  ];

  return (
    <div className="dashboard-home">
      {/* Welcome Section */}
      <div className="welcome-section">
        <h1>Welcome back, {userName}! 👋</h1>
        <p>Get started by creating a new lesson note or review your recent notes.</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        {activityCards.map((card, index) => (
          <div key={index} className={`stats-card ${card.color}`}>
            <div className="card-icon">
              <i className={`bi ${card.icon}`}></i>
            </div>
            <div className="card-content">
              <h3>{card.title}</h3>
              <p className="value">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="action-section">
        <button 
          className="create-button"
          onClick={() => navigate('/dashboard/new')}
        >
          <i className="bi bi-plus-lg"></i>
          Create New Note
        </button>
      </div>

      {/* Recent Notes */}
      <div className="recent-notes">
        <div className="section-header">
          <h2>Recent Notes</h2>
          <button className="view-all-button">View All</button>
        </div>

        <div className="notes-grid">
          {recentNotes.length > 0 ? (
            recentNotes.map(note => (
              <div 
                key={note.id} 
                className="note-card"
                onClick={() => navigate(`/dashboard/chat/${note.id}`)}
              >
                <div className="note-icon">
                  <i className="bi bi-file-text"></i>
                </div>
                <div className="note-details">
                  <h4>{note.subject}</h4>
                  <p>{note.topic}</p>
                  <span className="note-date">{note.date}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <i className="bi bi-journal-text"></i>
              <p>No recent notes found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardHome;