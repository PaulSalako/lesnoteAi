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
    roleId: 3, // Default to regular user (3)
    roleName: 'User' // Default role name
  });
  const [recentNotes, setRecentNotes] = useState([]);
  const [recentLessonPlans, setRecentLessonPlans] = useState([]);
  const [recentAssessments, setRecentAssessments] = useState([]);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  // User statistics for admin dashboard
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    adminUsers: 0,
    staffUsers: 0,
    regularUsers: 0
  });
  
  // System-wide content statistics for admin dashboard
  const [systemStats, setSystemStats] = useState({
    totals: {
      lessonNotes: 0,
      lessonPlans: 0,
      assessments: 0,
      allContent: 0
    },
    today: {
      lessonNotes: 0,
      lessonPlans: 0,
      assessments: 0,
      allContent: 0
    }
  });
  
  // Form state for regular users
  const [formData, setFormData] = useState({
    class: '',
    subject: '',
    topic: ''
  });
  
  // Get user info from storage
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  const userInfo = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');

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
        
        // Fetch role name based on roleId
        const roleResponse = await fetch(`https://localhost:7225/api/Roles/${statsData.roleId || userInfo.roleId}`, {
          headers: headers,
          credentials: 'include'
        });
        
        let roleName = 'User'; // Default
        
        if (roleResponse.ok) {
          const roleData = await roleResponse.json();
          roleName = roleData.name;
        }
        
        // Update stats with role information
        setStats({
          ...statsData,
          roleId: statsData.roleId || userInfo.roleId || 3,
          roleName: roleName
        });

        // Fetch admin-specific data if user is an admin (roleId === 1)
        if (statsData.roleId === 1) {
          // Fetch user statistics
          const userStatsResponse = await fetch('https://localhost:7225/api/Admin/user-stats', {
            headers: headers,
            credentials: 'include'
          });

          if (userStatsResponse.ok) {
            const userStatsData = await userStatsResponse.json();
            setUserStats({
              totalUsers: userStatsData.totalUsers || 0,
              adminUsers: userStatsData.adminUsers || 0,
              staffUsers: userStatsData.staffUsers || 0,
              regularUsers: userStatsData.regularUsers || 0
            });
          } else {
            console.error('Failed to fetch user statistics');
          }
          
          // Fetch system-wide content statistics
          const contentStatsResponse = await fetch('https://localhost:7225/api/Admin/content-stats', {
            headers: headers,
            credentials: 'include'
          });
          
          if (contentStatsResponse.ok) {
            const contentStatsData = await contentStatsResponse.json();
            setSystemStats(contentStatsData);
          } else {
            console.error('Failed to fetch system-wide content statistics');
          }
        }

        // Only fetch recent content for Staff and Admin roles
        if (statsData.roleId !== 3) {
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
  }, [token, navigate, userInfo.roleId]);

  // Personal content statistics cards
  const contentStatsCards = [
    {
      title: "My Lesson Notes",
      value: stats.totalNotes || stats.totalLessonNotes || 0,
      icon: "bi-file-text",
      color: "purple"
    },
    {
      title: "My Lesson Plans",
      value: stats.totalLessonPlans || 0,
      icon: "bi-journal-bookmark",
      color: "blue"
    },
    {
      title: "My Assessments",
      value: stats.totalAssessments || 0,
      icon: "bi-clipboard-check",
      color: "red"
    },
    {
      title: "My Total Resources",
      value: (stats.totalNotes || stats.totalLessonNotes || 0) + 
             (stats.totalLessonPlans || 0) + 
             (stats.totalAssessments || 0),
      icon: "bi-collection-fill",
      color: "green"
    }
  ];

  // User statistics cards for admin dashboard
  const userStatsCards = [
    {
      title: "Total Users",
      value: userStats.totalUsers,
      icon: "bi-people-fill",
      color: "green"
    },
    {
      title: "Admin Users",
      value: userStats.adminUsers,
      icon: "bi-shield-lock-fill",
      color: "gold"
    },
    {
      title: "Staff Users",
      value: userStats.staffUsers,
      icon: "bi-person-badge-fill",
      color: "cyan"
    },
    {
      title: "Regular Users",
      value: userStats.regularUsers,
      icon: "bi-person-fill",
      color: "indigo"
    }
  ];

  // System-wide content statistics cards for admin dashboard
  const systemStatsCards = [
    {
      title: "All Lesson Notes",
      value: systemStats.totals.lessonNotes,
      icon: "bi-files",
      color: "purple"
    },
    {
      title: "All Lesson Plans",
      value: systemStats.totals.lessonPlans,
      icon: "bi-journals",
      color: "blue"
    },
    {
      title: "All Assessments",
      value: systemStats.totals.assessments,
      icon: "bi-clipboard2-check",
      color: "red"
    },
    {
      title: "Total Platform Content",
      value: systemStats.totals.allContent,
      icon: "bi-database-fill",
      color: "green"
    }
  ];

  // Today's statistics cards
  const todayStatsCards = [
    {
      title: "My Notes Today",
      value: stats.todayNotes || stats.todayLessonNotes || 0,
      icon: "bi-file-earmark-plus",
      color: "purple"
    },
    {
      title: "My Plans Today",
      value: stats.todayLessonPlans || 0,
      icon: "bi-journal-plus",
      color: "blue"
    },
    {
      title: "My Assessments Today",
      value: stats.todayAssessments || 0,
      icon: "bi-clipboard-plus",
      color: "red"
    },
    {
      title: "My Today's Total",
      value: (stats.todayNotes || stats.todayLessonNotes || 0) + 
             (stats.todayLessonPlans || 0) + 
             (stats.todayAssessments || 0),
      icon: "bi-calendar-check",
      color: "green"
    }
  ];

  // Today's system-wide stats for admin
  const systemTodayStatsCards = [
    {
      title: "All Notes Today",
      value: systemStats.today.lessonNotes,
      icon: "bi-file-earmark-plus",
      color: "purple"
    },
    {
      title: "All Plans Today",
      value: systemStats.today.lessonPlans,
      icon: "bi-journal-plus",
      color: "blue"
    },
    {
      title: "All Assessments Today",
      value: systemStats.today.assessments,
      icon: "bi-clipboard-plus",
      color: "red"
    },
    {
      title: "Total Platform Activity Today",
      value: systemStats.today.allContent,
      icon: "bi-activity",
      color: "green"
    }
  ];

  // This is no longer needed as all users are Premium
  const handlePremiumFeatureClick = () => {
    // We still show the modal for historical reasons if needed
    setShowUpgradeModal(true);
  };

  // Handle form input changes for regular users
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle search form submission for regular users
  const handleSearch = (e) => {
    e.preventDefault();
    // Navigate to search results or process the search
    navigate('/dashboard/search-results', { state: { searchParams: formData } });
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

  // Function to determine if user has access to admin features
  const hasAdminAccess = () => {
    return stats.roleId === 1; // Admin role
  };

  // Function to determine if user has access to staff features
  const hasStaffAccess = () => {
    return stats.roleId === 1 || stats.roleId === 2; // Admin or Staff role
  };

  // Function to determine if the user is a regular user
  const isRegularUser = () => {
    return stats.roleId === 3; // User role
  };

  // Regular User Dashboard View
  const RegularUserDashboard = () => (
    <div className="dashboard-home">
      {/* Welcome Section */}
      <div className="welcome-section">
        <h1>Welcome back, {stats.userName || 'User'}! 👋</h1>
        <p>
          You are logged in as <strong>{stats.roleName}</strong>. 
          Use the form below to create lessons and assessments.
        </p>
      </div>

      {/* Search Form for Regular Users */}
      <div className="user-search-form">
        <h2>Create Lesson Notes</h2>
        <form onSubmit={handleSearch}>
          <div className="form-group">
            <label htmlFor="class">Class/Grade Level</label>
            <select 
              id="class" 
              name="class" 
              value={formData.class} 
              onChange={handleInputChange}
              required
            >
              <option value="">Select a class</option>
              <option value="preschool">Preschool</option>
              <option value="kindergarten">Kindergarten</option>
              <option value="1">Grade 1</option>
              <option value="2">Grade 2</option>
              <option value="3">Grade 3</option>
              <option value="4">Grade 4</option>
              <option value="5">Grade 5</option>
              <option value="6">Grade 6</option>
              <option value="7">Grade 7</option>
              <option value="8">Grade 8</option>
              <option value="9">Grade 9</option>
              <option value="10">Grade 10</option>
              <option value="11">Grade 11</option>
              <option value="12">Grade 12</option>
              <option value="college">College/University</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="subject">Subject</label>
            <select 
              id="subject" 
              name="subject" 
              value={formData.subject} 
              onChange={handleInputChange}
              required
            >
              <option value="">Select a subject</option>
              <option value="math">Mathematics</option>
              <option value="science">Science</option>
              <option value="english">English</option>
              <option value="history">History</option>
              <option value="geography">Geography</option>
              <option value="art">Art</option>
              <option value="music">Music</option>
              <option value="pe">Physical Education</option>
              <option value="computer">Computer Science</option>
              <option value="foreign">Foreign Languages</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="topic">Topic</label>
            <input 
              type="text" 
              id="topic" 
              name="topic" 
              value={formData.topic} 
              onChange={handleInputChange}
              placeholder="Enter a topic"
              required
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="search-button">
              <i className="bi bi-search"></i> Create Lesson
            </button>
          </div>
        </form>
      </div>
      
      {/* Add the AI Chat Support component */}
      <AIChatSupport isPremium={true} />
    </div>
  );

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
        
        {/* Admin-specific message */}
        {/* {hasAdminAccess() && (
          <div className="admin-banner">
            <i className="bi bi-shield-lock"></i>
            <p>You have administrator privileges. Access the admin panel to manage users and system settings.</p>
            <button 
              className="admin-button"
              onClick={() => navigate('/admin/dashboard')}
            >
              Admin Panel
            </button>
          </div>
        )} */}
        
        {/* Staff-specific message */}
        {/* {stats.roleId === 2 && (
          <div className="staff-banner">
            <i className="bi bi-person-badge"></i>
            <p>You have staff privileges. You can manage content and support users.</p>
          </div>
        )} */}
      </div>

      {/* Personal Content Statistics Section */}
      {/* <div className="section-header stats-section-header">
        <h2>My Content Statistics</h2>
      </div>
      <div className="stats-grid">
        {contentStatsCards.map((card, index) => (
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
      </div> */}

      {/* Today's Personal Activity Section */}
      {/* <div className="section-header today-stats-header">
        <h2>My Today's Activity</h2>
      </div>
      <div className="stats-grid">
        {todayStatsCards.map((card, index) => (
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
      </div> */}

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

      {/* System-wide Today's Activity - Admin Only */}
      {/* {hasAdminAccess() && (
        <>
          <div className="section-header system-today-stats-header">
            <h2>Platform Today's Activity</h2>
          </div>
          <div className="stats-grid">
            {systemTodayStatsCards.map((card, index) => (
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
      )} */}

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
          
          <button 
            className="create-button lesson-plan"
            onClick={() => navigate('/dashboard/lesson-plan')}
          >
            <i className="bi bi-journal-bookmark"></i>
            Create Lesson Plan
          </button>
          
          <button 
            className="create-button assessment"
            onClick={() => navigate('/dashboard/assessment')}
          >
            <i className="bi bi-clipboard-check"></i>
            Create Assessment
          </button>
          
          {/* Admin-only button */}
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
                onClick={() => navigate('manage-topic')}
              >
                <i className="bi bi-journal-text"></i>
                Manage Topic
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

          
          {/* Staff-level button */}
          {/* {hasStaffAccess() && (
            <button 
              className="create-button staff"
              onClick={() => navigate('/dashboard/content-management')}
            >
              <i className="bi bi-collection"></i>
              Manage Content
            </button>
          )} */}
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

      {/* Recent Lesson Plans */}
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
      
      {/* Recent Assessments */}
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
      
      {/* Add the AI Chat Support component */}
      <AIChatSupport isPremium={true} />
    </div>
  );

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
                <li><i className="bi bi-check-circle"></i> Create Lesson Notes</li>
                <li><i className="bi bi-check-circle"></i> Create Lesson Plans</li>
                <li><i className="bi bi-check-circle"></i> Create Assessments</li>
                <li><i className="bi bi-check-circle"></i> Access to All Resources</li>
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