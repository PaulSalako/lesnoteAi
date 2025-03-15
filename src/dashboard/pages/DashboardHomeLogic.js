import { API_URL } from '../../config';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';



export function useDashboardHome() {
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
    roleName: 'User', // Default role name
    classes: [] // Added classes array
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
      allContent: 0
    },
    today: {
      lessonNotes: 0,
      allContent: 0
    }
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
        const statsResponse = await fetch(`${API_URL}/Dashboard/stats`, {
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
        const roleResponse = await fetch(`${API_URL}/Roles/${statsData.roleId || userInfo.roleId}`, {
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
          const userStatsResponse = await fetch(`${API_URL}/Admin/user-stats`, {
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
          const contentStatsResponse = await fetch(`${API_URL}/Admin/content-stats`, {
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
          const notesResponse = await fetch(`${API_URL}/Dashboard/recent-notes?limit=6`, {
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
          const plansResponse = await fetch(`${API_URL}/Dashboard/recent-lesson-plans?limit=6`, {
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
          const assessmentsResponse = await fetch(`${API_URL}/Dashboard/recent-assessments?limit=6`, {
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
        } else {
          Swal.fire({
            title: 'Error',
            text: err.message || 'An error occurred loading your dashboard',
            icon: 'error',
            confirmButtonText: 'OK'
          });
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

  // Retry loading dashboard data
  const handleRetry = () => {
    window.location.reload();
  };

  // Toggle upgrade modal
  const toggleUpgradeModal = () => {
    setShowUpgradeModal(!showUpgradeModal);
  };

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
      title: "Total Classes",
      value: stats.classes ? stats.classes.length : 0,
      icon: "bi-building",
      color: "blue"
    },
    {
      title: "Today's Content",
      value: systemStats.today.lessonNotes,
      icon: "bi-calendar-check",
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

  return {
    loading,
    error,
    stats,
    recentNotes,
    recentLessonPlans,
    recentAssessments,
    showUpgradeModal,
    userStats,
    systemStats,
    contentStatsCards,
    userStatsCards,
    systemStatsCards,
    todayStatsCards,
    hasAdminAccess,
    hasStaffAccess,
    isRegularUser,
    navigate,
    handleRetry,
    toggleUpgradeModal,
    setShowUpgradeModal
  };
}