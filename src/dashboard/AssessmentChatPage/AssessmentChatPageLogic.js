// src/dashboard/components/AssessmentChatPage/AssessmentChatPageLogic.js
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export function useAssessmentChat() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assessmentData, setAssessmentData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [regenerating, setRegenerating] = useState(false);
  const [newMessage, setNewMessage] = useState('');

  // Check for premium user on component mount
  useEffect(() => {
    const checkUserPremiumStatus = async () => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        
        if (!token) {
          // If no token, redirect to login
          navigate('/sign-in');
          return;
        }
        
        // Using the dashboard/stats endpoint to check plan status
        const response = await fetch('https://localhost:7225/api/Dashboard/stats', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        
        const userData = await response.json();
        
        // Check if user is premium (plan === 1)
        if (userData.plan !== 1) {
          // Redirect non-premium users back to dashboard
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Error checking premium status:', error);
        // Redirect to dashboard on any error
        navigate('/dashboard');
      }
    };
    
    checkUserPremiumStatus();
  }, [navigate]);

  // Fetch the assessment data when the component mounts
  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        
        if (!token) {
          throw new Error('Authentication token not found. Please log in again.');
        }
        
        console.log('Fetching Assessment. ID:', id);
        
        const response = await fetch(`https://localhost:7225/api/Assessments/${id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch assessment');
        }
        
        const responseData = await response.json();
        console.log('Fetched Assessment:', responseData);
        
        setAssessmentData(responseData);
        
        // Transform messages
        const transformedMessages = [
          {
            id: 'system-1',
            type: 'system',
            content: 'Your assessment has been generated.'
          }
        ];
        
        // Add content or messages
        if (responseData.messages && responseData.messages.length > 0) {
          responseData.messages.forEach(msg => {
            transformedMessages.push({
              id: msg.id,
              type: msg.role === 'assistant' ? 'ai' : 'user',
              content: msg.content
            });
          });
        } else if (responseData.content) {
          transformedMessages.push({
            id: 'ai-response',
            type: 'ai',
            content: responseData.content
          });
        }
        
        setMessages(transformedMessages);
      } catch (error) {
        console.error('Error fetching assessment:', error);
        setError(error.message || 'An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };
  
    if (id) {
      fetchAssessment(); 
    }
  }, [id]);

  const handleSaveAsPdf = async () => {
    try {
      // Implement PDF saving logic here
      console.log('Saving as PDF...');
      
      Swal.fire({
        title: 'Feature Coming Soon',
        text: 'PDF export functionality will be implemented in a future update.',
        icon: 'info',
        confirmButtonText: 'OK'
      });
    } catch (error) {
      console.error('Error saving PDF:', error);
    }
  };

  const handleSaveAsImage = async () => {
    try {
      // Implement image saving logic here
      console.log('Saving as Image...');
      
      Swal.fire({
        title: 'Feature Coming Soon',
        text: 'Image export functionality will be implemented in a future update.',
        icon: 'info',
        confirmButtonText: 'OK'
      });
    } catch (error) {
      console.error('Error saving image:', error);
    }
  };

  const handleRegenerateAssessment = async () => {
    try {
      setRegenerating(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      const response = await fetch(`https://localhost:7225/api/Assessments/regenerate/${id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ modifiedPrompt: '' }) // Empty for standard regeneration
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to regenerate assessment');
      }
      
      const data = await response.json();
      
      // Add the new message to the list
      setMessages(prev => [
        ...prev,
        {
          id: `system-${Date.now()}`,
          type: 'system',
          content: 'Assessment has been regenerated.'
        },
        {
          id: `ai-${Date.now()}`,
          type: 'ai',
          content: data.data.content
        }
      ]);
      
      Swal.fire({
        title: 'Success',
        text: 'Assessment has been regenerated successfully',
        icon: 'success',
        confirmButtonText: 'OK'
      });
      
    } catch (error) {
      console.error('Error regenerating assessment:', error);
      setError(error.message || 'An error occurred while regenerating the assessment');
      
      Swal.fire({
        title: 'Error',
        text: error.message || 'An error occurred while regenerating the assessment',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setRegenerating(false);
    }
  };

  // Function to send a message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      setRegenerating(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      // Add user message immediately to UI
      const userMessageId = `user-${Date.now()}`;
      setMessages(prev => [
        ...prev,
        {
          id: userMessageId,
          type: 'user',
          content: newMessage
        }
      ]);
      
      // Clear input field
      setNewMessage('');
      
      // Send request to API
      const response = await fetch(`https://localhost:7225/api/Assessments/${id}/message`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: newMessage })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send message');
      }
      
      const data = await response.json();
      
      // Add AI response to the messages
      setMessages(prev => [
        ...prev,
        {
          id: data.data.aiMessage.id,
          type: 'ai',
          content: data.data.aiMessage.content
        }
      ]);
    } catch (error) {
      console.error('Error sending message:', error);
      setError(error.message || 'An error occurred while sending your message');
      
      Swal.fire({
        title: 'Error',
        text: error.message || 'An error occurred while sending your message',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setRegenerating(false);
    }
  };

  // Function to copy text to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(
      () => {
        Swal.fire({
          title: 'Copied!',
          text: 'Text copied to clipboard',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      },
      (err) => {
        console.error('Could not copy text: ', err);
        Swal.fire({
          title: 'Error',
          text: 'Could not copy text to clipboard',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    );
  };

  // Navigation functions
  const navigateToNewAssessment = () => {
    navigate('/dashboard/lesson-assessment');
  };

  const navigateBack = () => {
    navigate('/dashboard/lesson-assessment');
  };

  return {
    isLoading,
    error,
    assessmentData,
    messages,
    regenerating,
    newMessage,
    setNewMessage,
    handleSaveAsPdf,
    handleSaveAsImage,
    handleRegenerateAssessment,
    handleSendMessage,
    copyToClipboard,
    navigateToNewAssessment,
    navigateBack
  };
}