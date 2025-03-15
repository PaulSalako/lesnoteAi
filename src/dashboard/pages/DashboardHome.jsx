import React from 'react';
import { useDashboardHome } from './DashboardHomeLogic';
import AIChatSupport from '../AIChatSupport/AIChatSupport';
import './DashboardHome.css';

function DashboardHome() {
  const {
    loading,
    error,
    stats,
    recentNotes,
    showUpgradeModal,
    userStats,
    systemStats,
    userStatsCards,
    systemStatsCards,
    hasAdminAccess,
    hasStaffAccess,
    isRegularUser,
    navigate,
    handleRetry,
    setShowUpgradeModal
  } = useDashboardHome();

  // Regular User Dashboard View - SIMPLIFIED to welcome message only
  const RegularUserDashboard = () => {
    return (
      <div className="dashboard-home">
        {/* Welcome Section */}
        <div className="welcome-section">
          <h1>Welcome back, {stats.userName || 'User'}! 👋</h1>
          <p>
            You are logged in as <strong>{stats.roleName}</strong>. 
            Use the navigation menu to explore available lesson notes and other resources.
          </p>
        </div>
        
        {/* Add the AI Chat Support component */}
        <AIChatSupport isPremium={true} />
      </div>
    );
  };

  // Staff and Admin Dashboard View
  const StaffOrAdminDashboard = () => (
    <div className="dashboard-home">
      {/* Welcome Section */}
      <div className="welcome-section">
        <h1>Welcome back, {stats.userName || 'User'}! 👋</h1>
        <p>
          You are logged in as <strong>{stats.roleName}</strong>. 
          Get started by creating new content or review your recent materials.
        </p>
      </div>

      {/* System-wide Content Stats - Admin Only */}
      {hasAdminAccess() && (
        <>
          <div className="section-header system-stats-header">
            <h2>Platform Content Statistics</h2>
          </div>
          <div className="stats-grid">
            {systemStatsCards.map((card, index) => (
              <div 
                key={index} 
                className={`stats-card ${card.color}`}
              >
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
        </>
      )}

      {/* User Stats Cards - Admin Only */}
      {hasAdminAccess() && (
        <>
          <div className="section-header user-stats-header">
            <h2>User Statistics</h2>
            <button 
              className="view-all-button"
              onClick={() => navigate('manage-users')}
            >
              Manage Users
            </button>
          </div>
          <div className="stats-grid">
            {userStatsCards.map((card, index) => (
              <div 
                key={index} 
                className={`stats-card ${card.color}`}
              >
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
        </>
      )}

      {/* Quick Actions */}
      <div className="action-section">
        <div className="section-header">
          <h2>Quick Actions</h2>
        </div>
        <div className="action-buttons">
          <button 
            className="create-button"
            onClick={() => navigate('/dashboard/lesson-note')}
          >
            <i className="bi bi-file-text"></i>
            Create Lesson Note
          </button>
          
          {/* Admin-only buttons */}
          {hasAdminAccess() && (
            <>
              <button 
                className="create-button admin"
                onClick={() => navigate('manage-users')}
              >
                <i className="bi bi-people"></i>
                Manage Users
              </button>

              <button 
                className="create-button admin"
                onClick={() => navigate('manage-class')}
              >
                <i className="bi bi-building"></i>
                Manage Class
              </button>

              <button 
                className="create-button admin"
                onClick={() => navigate('manage-subject')}
              >
                <i className="bi bi-book"></i>
                Manage Subject
              </button>

              <button 
                className="create-button admin"
                onClick={() => navigate('manage-theme')}
              >
                <i className="bi bi-journal-text"></i>
                Manage Theme
              </button>

              <button 
                className="create-button admin"
                onClick={() => navigate('manage-topic')}
              >
                <i className="bi bi-journal-text"></i>
                Manage Topic
              </button>

              <button 
                className="create-button admin"
                onClick={() => navigate('manage-lesson-structure')}
              >
                <i className="bi bi-journal-text"></i>
                Manage Structure
              </button>

              <button 
                className="create-button admin"
                onClick={() => navigate('manage-note')}
              >
                <i className="bi bi-journal-text"></i>
                Manage Notes
              </button>
            </>
          )}
        </div>
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
      
      {/* Add the AI Chat Support component */}
      <AIChatSupport isPremium={true} />
    </div>
  );

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
            onClick={handleRetry} 
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

  // Render different dashboard based on user role
  return (
    <>
      {isRegularUser() ? <RegularUserDashboard /> : <StaffOrAdminDashboard />}
      
      {/* Role information modal - shown for all users */}
      {showUpgradeModal && (
        <div className="upgrade-modal-backdrop">
          <div className="upgrade-modal">
            <div className="upgrade-modal-header">
              <h3>Role Information</h3>
              <button onClick={() => setShowUpgradeModal(false)} className="close-modal">
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="upgrade-modal-body">
              <div className="role-icon-large">
                <i className="bi bi-person-badge"></i>
              </div>
              <h4>Your Role: {stats.roleName}</h4>
              <p>Your account has the following permissions:</p>
              <ul className="role-features-list">
                <li><i className="bi bi-check-circle"></i> Access Lesson Notes</li>
                <li><i className="bi bi-check-circle"></i> View Lesson Plans</li>
                <li><i className="bi bi-check-circle"></i> Access Assessments</li>
                {hasStaffAccess() && (
                  <li><i className="bi bi-check-circle"></i> Content Management</li>
                )}
                {hasAdminAccess() && (
                  <li><i className="bi bi-check-circle"></i> Full Admin Access</li>
                )}
              </ul>
            </div>
            <div className="upgrade-modal-footer">
              <button className="confirm-role" onClick={() => setShowUpgradeModal(false)}>
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default DashboardHome;