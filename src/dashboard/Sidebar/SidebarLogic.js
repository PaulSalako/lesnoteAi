import { API_URL } from '../../config';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';



export function useSidebar(isOpen, onToggle) {
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
        const response = await fetch(`${API_URL}/Dashboard/stats`, {
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

        const response = await fetch(`${API_URL}/Dashboard/recent-notes`, {
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
        } else {
          Swal.fire({
            title: 'Error',
            text: err.message || 'Failed to fetch recent notes',
            icon: 'error',
            confirmButtonText: 'OK'
          });
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

  const handleNavigate = (path) => {
    navigate(path);
  };

  return {
    isOpen,
    onToggle,
    isSearchOpen,
    setIsSearchOpen,
    searchTerm,
    setSearchTerm,
    loading,
    error,
    chatHistory,
    filteredHistory,
    userData,
    showUpgradeModal,
    setShowUpgradeModal,
    expandedCategories,
    isHomePage,
    isNotesPage,
    isLessonPlanPage,
    isAssessmentPage,
    isManageClassesPage,
    isManageSubjectsPage,
    isManageTopicsPage,
    isManageStructurePage,
    isSearchNotePage,
    isRegularUser,
    isAdmin,
    isStaffOrAdmin,
    location,
    navigate,
    handleHistoryItemClick,
    handleViewAll,
    handlePremiumFeatureClick,
    handleLogout,
    toggleCategory,
    handleNavigate
  };
}