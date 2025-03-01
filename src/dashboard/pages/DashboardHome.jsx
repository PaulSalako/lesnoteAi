import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardHome.css';
import AIChatSupport from '../components/AIChatSupport/AIChatSupport'; 

function DashboardHome() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    availableTokens: 0,
    totalNotes: 0,
    todayNotes: 0,
    totalLessonPlans: 0,
    totalAssessments: 0,
    userName: '',
    plan: 0 // 0 = free, 1 = premium
  });
  const [recentNotes, setRecentNotes] = useState([]);
  const [recentLessonPlans, setRecentLessonPlans] = useState([]);
  const [recentAssessments, setRecentAssessments] = useState([]);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
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

        // Only fetch recent data if user is premium
        if (statsData.plan === 1) {
          // Fetch recent lesson notes
          const notesResponse = await fetch('https://localhost:7225/api/Dashboard/recent-notes?limit=6', {
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
          
          // Fetch recent lesson plans
          const plansResponse = await fetch('https://localhost:7225/api/Dashboard/recent-lesson-plans?limit=6', {
            headers: headers,
            credentials: 'include'
          });

          if (!plansResponse.ok) {
            const errorData = await plansResponse.json();
            console.error('Lesson plans error:', errorData);
            // Don't throw error here, just log it to console - we still want to show the dashboard
            console.error('Failed to fetch recent lesson plans');
          } else {
            const plansData = await plansResponse.json();
            console.log('Lesson plans data:', plansData);
            setRecentLessonPlans(plansData);
          }
          
          // Fetch recent assessments
          const assessmentsResponse = await fetch('https://localhost:7225/api/Dashboard/recent-assessments?limit=6', {
            headers: headers,
            credentials: 'include'
          });

          if (!assessmentsResponse.ok) {
            const errorData = await assessmentsResponse.json();
            console.error('Assessments error:', errorData);
            // Don't throw error here, just log it to console - we still want to show the dashboard
            console.error('Failed to fetch recent assessments');
          } else {
            const assessmentsData = await assessmentsResponse.json();
            console.log('Assessments data:', assessmentsData);
            setRecentAssessments(assessmentsData);
          }
        }
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
      title: "Lesson Notes",
      value: stats.totalNotes || stats.totalLessonNotes || 0,
      icon: "bi-file-text",
      color: "purple"
    },
    {
      title: "Lesson Plans",
      value: stats.totalLessonPlans || 0,
      icon: "bi-journal-bookmark",
      color: "blue",
      premium: true
    },
    {
      title: "Assessments",
      value: stats.totalAssessments || 0,
      icon: "bi-clipboard-check",
      color: "red",
      premium: true
    }
  ];

  const handlePremiumFeatureClick = () => {
    setShowUpgradeModal(true);
  };

  if (loading) {
    return (
      <div className="dashboard-home">
        <div className="loading-state">
          <i className="bi bi-arrow-clockwise spinning"></i>
          <p>Loading your dashboard...</p>
        </div>
        
        {/* Add the AI Chat Support even during loading */}
        <AIChatSupport />
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
        
        {/* Add the AI Chat Support even during errors */}
        <AIChatSupport />
      </div>
    );
  }

  return (
    <div className="dashboard-home">
      {/* Welcome Section */}
      <div className="welcome-section">
        <h1>Welcome back, {stats.userName || 'User'}! 👋</h1>
        <p>Get started by creating new content or review your recent materials.</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        {activityCards.map((card, index) => (
          <div 
            key={index} 
            className={`stats-card ${card.color} ${card.premium && stats.plan === 0 ? 'premium-locked' : ''}`}
          >
            <div className="card-icon">
              <i className={`bi ${card.icon}`}></i>
              {card.premium && stats.plan === 0 && <i className="bi bi-lock premium-lock-icon"></i>}
            </div>
            <div className="card-content">
              <h3>{card.title}</h3>
              <p className="value">{card.value || 0}</p>
              {card.premium && stats.plan === 0 && <span className="premium-badge">Premium</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="action-section">
        <div className="action-buttons">
          <button 
            className="create-button"
            onClick={() => navigate('/dashboard/lesson-note')}
          >
            <i className="bi bi-file-text"></i>
            Create Lesson Note
          </button>
          
          <button 
            className={`create-button lesson-plan ${stats.plan === 0 ? 'premium-button' : ''}`}
            onClick={() => stats.plan === 0 ? handlePremiumFeatureClick() : navigate('/dashboard/lesson-plan')}
          >
            <i className="bi bi-journal-bookmark"></i>
            Create Lesson Plan
            {stats.plan === 0 && <i className="bi bi-star premium-icon"></i>}
          </button>
          
          <button 
            className={`create-button assessment ${stats.plan === 0 ? 'premium-button' : ''}`}
            onClick={() => stats.plan === 0 ? handlePremiumFeatureClick() : navigate('/dashboard/assessment')}
          >
            <i className="bi bi-clipboard-check"></i>
            Create Assessment
            {stats.plan === 0 && <i className="bi bi-star premium-icon"></i>}
          </button>
        </div>
      </div>

      {/* Recent Notes - Only show for premium users */}
      {stats.plan === 1 && (
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
                  onClick={() => navigate(`/dashboard/note-chat/${note.id}`)}
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
      )}

      {/* Show premium promo instead of recent notes for free users */}
      {stats.plan === 0 && (
        <div className="premium-promo-section">
          <div className="premium-promo-content">
            <div className="premium-icon">
              <i className="bi bi-star-fill"></i>
            </div>
            <h2>Upgrade to Premium</h2>
            <p>Get access to Lesson Plans, Assessments, and view your recent history!</p>
            <button 
              className="upgrade-button" 
              onClick={handlePremiumFeatureClick}
            >
              Upgrade Now
            </button>
          </div>
        </div>
      )}

      {/* Recent Lesson Plans - Only show for premium users */}
      {stats.plan === 1 && (
        <div className="recent-notes lesson-plans-section">
          <div className="section-header">
            <h2>Recent Lesson Plans</h2>
            <button 
              className="view-all-button"
              onClick={() => navigate('/dashboard/lesson-plans')}
            >
              View All
            </button>
          </div>

          <div className="notes-grid">
            {recentLessonPlans.length > 0 ? (
              recentLessonPlans.map(plan => (
                <div
                  key={plan.id}
                  className="note-card lesson-plan-card"
                  onClick={() => navigate(`/dashboard/lesson-plan-chat/${plan.id}`)}
                >
                  <div className="note-icon">
                    <i className="bi bi-journal-bookmark"></i>
                  </div>
                  <div className="note-details">
                    <h4>{plan.subject}</h4>
                    <p>{plan.topic}</p>
                    <span className="note-date">{plan.date}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <i className="bi bi-journal-bookmark"></i>
                <p>No recent lesson plans found</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Recent Assessments - Only show for premium users */}
      {stats.plan === 1 && (
        <div className="recent-notes assessments-section">
          <div className="section-header">
            <h2>Recent Assessments</h2>
            <button 
              className="view-all-button"
              onClick={() => navigate('/dashboard/assessments')}
            >
              View All
            </button>
          </div>

          <div className="notes-grid">
            {recentAssessments.length > 0 ? (
              recentAssessments.map(assessment => (
                <div
                  key={assessment.id}
                  className="note-card assessment-card"
                  onClick={() => navigate(`/dashboard/lesson-assessment-chat/${assessment.id}`)}
                >
                  <div className="note-icon">
                    <i className="bi bi-clipboard-check"></i>
                  </div>
                  <div className="note-details">
                    <h4>{assessment.subject}</h4>
                    <p>{assessment.topic}</p>
                    <div className="assessment-meta">
                      <span className="assessment-type">{assessment.assessmentType}</span>
                      <span className="note-date">{assessment.date}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <i className="bi bi-clipboard-check"></i>
                <p>No recent assessments found</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Add the AI Chat Support component */}
      <AIChatSupport isPremium={stats.plan === 1} />
      
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
    </div>
  );
}

export default DashboardHome;