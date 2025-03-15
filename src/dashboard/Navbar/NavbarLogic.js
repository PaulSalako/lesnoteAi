import { API_URL } from '../../config';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


export function NavbarLogic() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    plan: 0 // Default to free plan (0)
  });
  
  const navigate = useNavigate();
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch user profile data which should include email
        const profileResponse = await fetch(`${API_URL}/Dashboard/user-profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!profileResponse.ok) {
          throw new Error('Failed to fetch user profile');
        }
        
        const profileData = await profileResponse.json();
        
        // Fetch stats data for plan information
        const statsResponse = await fetch(`${API_URL}/Dashboard/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!statsResponse.ok) {
          throw new Error('Failed to fetch user stats');
        }
        
        const statsData = await statsResponse.json();
        
        // Combine data from both endpoints
        setUserData({
          name: statsData.userName || profileData.firstName + ' ' + profileData.surname || 'User',
          email: profileData.email || '', // Get email from profile endpoint
          plan: statsData.plan || 0
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
        if (error.message.includes('unauthorized')) {
          handleLogout();
        }
      }
    };
    
    if (token) {
      fetchUserData();
    } else {
      navigate('/sign-in');
    }
  }, [token, navigate]);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate('/sign-in');
  };

  const toggleProfileDropdown = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  const openPlanModal = () => {
    setIsPlanModalOpen(true);
    setIsProfileOpen(false);
  };

  const closePlanModal = () => {
    setIsPlanModalOpen(false);
  };

  const getPlanName = (planNumber) => {
    return planNumber === 1 ? 'Premium' : 'Free';
  };

  const getPlanIcon = (planNumber) => {
    return planNumber === 1 ? 'bi-star-fill' : 'bi-star';
  };

  return {
    isProfileOpen,
    isPlanModalOpen,
    userData,
    handleLogout,
    toggleProfileDropdown,
    openPlanModal,
    closePlanModal,
    getPlanName,
    getPlanIcon
  };
}