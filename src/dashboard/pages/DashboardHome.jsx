import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardHome.css';

function DashboardHome() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    availableTokens: 0,
    totalNotes: 0,
    todayNotes: 0,
    userName: ''
  });
  const [recentNotes, setRecentNotes] = useState([]);
  
  // Get user info from storage
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
    
        console.log('Token being sent:', token);
    
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };
    
        console.log('Headers:', headers);
    
        // Fetch stats
        const statsResponse = await fetch('https://localhost:7225/api/Dashboard/stats', {
          headers: headers,
          credentials: 'include'
        });
    
        if (!statsResponse.ok) {
          const errorData = await statsResponse.json();
          console.error('Stats error:', errorData);
          throw new Error(errorData.message || 'Failed to fetch dashboard stats');
        }
    
        const statsData = await statsResponse.json();
        console.log('Stats data:', statsData);
        setStats(statsData);

        // Fetch recent notes
        const notesResponse = await fetch('https://localhost:7225/api/Dashboard/recent-notes', {
          headers: headers,
          credentials: 'include'
        });

        if (!notesResponse.ok) {
          const errorData = await notesResponse.json();
          console.error('Notes error:', errorData);
          throw new Error(errorData.message || 'Failed to fetch recent notes');
        }

        const notesData = await notesResponse.json();
        console.log('Notes data:', notesData);
        setRecentNotes(notesData);
    
      } catch (err) {
        console.error('Full error:', err);
        setError(err.message);
        if (err.message.includes('unauthorized') || err.message.includes('User not found')) {
          localStorage.clear();
          sessionStorage.clear();
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    if (!token) {
      navigate('/login');
      return;
    }

    fetchDashboardData();
  }, [token, navigate]);

  const activityCards = [
    {
      title: "Available Tokens",
      value: stats.availableTokens,
      icon: "bi-coin",
      color: "purple"
    },
    {
      title: "Total Notes",
      value: stats.totalNotes,
      icon: "bi-file-text",
      color: "blue"
    },
    {
      title: "Today's Notes",
      value: stats.todayNotes,
      icon: "bi-calendar-check",
      color: "green"
    }
  ];

  if (loading) {
    return (
      <div className="dashboard-home">
        <div className="loading-state">
          <i className="bi bi-arrow-clockwise spinning"></i>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-home">
        <div className="error-state">
          <i className="bi bi-exclamation-circle"></i>
          <p>Error: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="retry-button"
          >
            <i className="bi bi-arrow-clockwise"></i> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-home">
      {/* Welcome Section */}
      <div className="welcome-section">
        <h1>Welcome back, {stats.userName || 'User'}! 👋</h1>
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
              <p className="value">{card.value || 0}</p>
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
          <button 
            className="view-all-button"
            onClick={() => navigate('/dashboard/notes')}
          >
            View All
          </button>
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