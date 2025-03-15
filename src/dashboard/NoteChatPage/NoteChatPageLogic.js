// src/dashboard/components/NoteChatPage/useNoteChatPage.js
import { API_URL } from '../../config';
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';


export function NoteChatPageLogic() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [noteData, setNoteData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportType, setExportType] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const contentRef = useRef(null);

  // Fetch the lesson note data when the component mounts
  useEffect(() => {
    const fetchLessonNote = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        
        if (!token) {
          throw new Error('Authentication token not found. Please log in again.');
        }
        
        console.log('Fetching Lesson Note. ID:', id);
        console.log('Using Token:', token.substring(0, 10) + '...');
        
        const response = await fetch(`${API_URL}/LessonNotes/${id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Response Status:', response.status);
        
        const responseData = await response.json();
        
        if (!response.ok) {
          console.error('Error response:', responseData);
          throw new Error(responseData.message || 'Failed to fetch lesson note');
        }
        
        console.log('Fetched Lesson Note:', responseData);
        
        setNoteData(responseData);
        
        // Transform messages
        const transformedMessages = [
          {
            id: 'system-1',
            type: 'system',
            content: 'Your lesson note has been generated.'
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
        console.error('Detailed error fetching lesson note:', error);
        setError(error.message || 'An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };
  
    if (id) {
      fetchLessonNote();
    }
  }, [id]);

  // Export functions
  const handleSaveAsPdf = async (content) => {
    try {
      setExportLoading(true);
      setExportType('PDF');
      
      const title = noteData?.topic || 'Lesson Note';
      const element = content ? document.getElementById(content) : contentRef.current;
      
      if (!element) {
        throw new Error('Content element not found');
      }
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Add title
      pdf.setFontSize(16);
      pdf.text(title, 20, 20);
      
      // Add metadata
      pdf.setFontSize(10);
      pdf.text(`Subject: ${noteData?.subject || 'N/A'}`, 20, 30);
      pdf.text(`Class: ${noteData?.class_ || 'N/A'}`, 20, 35);
      pdf.text(`Duration: ${noteData?.duration || 'N/A'}`, 20, 40);
      pdf.text(`Date: ${noteData?.date || 'N/A'}`, 20, 45);
      
      // Add content image
      const imgWidth = 170;
      const imgHeight = canvas.height * imgWidth / canvas.width;
      pdf.addImage(imgData, 'PNG', 20, 50, imgWidth, imgHeight);
      
      // Save the PDF
      pdf.save(`${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);
      
      Swal.fire({
        title: 'Success',
        text: 'PDF saved successfully!',
        icon: 'success',
        confirmButtonText: 'OK'
      });
    } catch (error) {
      console.error('Error saving PDF:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to save as PDF. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setExportLoading(false);
      setExportType(null);
    }
  };

  const handleSaveAsImage = async (content) => {
    try {
      setExportLoading(true);
      setExportType('Image');
      
      const title = noteData?.topic || 'Lesson Note';
      const element = content ? document.getElementById(content) : contentRef.current;
      
      if (!element) {
        throw new Error('Content element not found');
      }
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false
      });
      
      canvas.toBlob((blob) => {
        saveAs(blob, `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`);
        Swal.fire({
          title: 'Success',
          text: 'Image saved successfully!',
          icon: 'success',
          confirmButtonText: 'OK'
        });
      });
    } catch (error) {
      console.error('Error saving image:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to save as image. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setExportLoading(false);
      setExportType(null);
    }
  };

  const handleSaveAsDocx = async (content) => {
    try {
      setExportLoading(true);
      setExportType('Document');
      
      const title = noteData?.topic || 'Lesson Note';
      const contentText = content 
        ? document.getElementById(content).innerText 
        : contentRef.current.innerText;
      
      if (!contentText) {
        throw new Error('Content text not found');
      }
      
      // Create a simple text document
      // In a real implementation, you'd use a library like docx.js to create proper DOCX files
      const metadata = `
Title: ${title}
Subject: ${noteData?.subject || 'N/A'}
Class: ${noteData?.class_ || 'N/A'}
Duration: ${noteData?.duration || 'N/A'}
Date: ${noteData?.date || 'N/A'}

`;
      
      const blob = new Blob([metadata + contentText], { type: 'text/plain' });
      saveAs(blob, `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`);
      
      Swal.fire({
        title: 'Success',
        text: 'Document saved successfully! (Note: This is a text file. For proper DOCX support, please integrate docx.js library)',
        icon: 'success',
        confirmButtonText: 'OK'
      });
    } catch (error) {
      console.error('Error saving document:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to save as document. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setExportLoading(false);
      setExportType(null);
    }
  };

  const handleRegenerateResponse = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/LessonNotes/regenerate/${id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ modifiedPrompt: '' }) // Empty for standard regeneration
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to regenerate lesson note');
      }
      
      const data = await response.json();
      
      // Add the new message to the list
      setMessages(prev => [
        ...prev,
        {
          id: `system-${Date.now()}`,
          type: 'system',
          content: 'Lesson note has been regenerated.'
        },
        {
          id: `ai-${Date.now()}`,
          type: 'ai',
          content: data.data.content
        }
      ]);
      
    } catch (error) {
      console.error('Error regenerating response:', error);
      setError(error.message || 'An error occurred while regenerating the lesson note');
      Swal.fire({
        title: 'Error',
        text: error.message || 'An error occurred while regenerating the lesson note',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to send a message to the AI
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      // Add user message to the UI immediately
      const userMessageId = `user-${Date.now()}`;
      setMessages(prev => [
        ...prev,
        {
          id: userMessageId,
          type: 'user',
          content: newMessage
        }
      ]);
      
      // Clear the input field
      setNewMessage('');
      
      // Send message to the API
      const response = await fetch(`${API_URL}/LessonNotes/${id}/message`, {
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
      
      // Add AI response to messages
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
      setIsLoading(false);
    }
  };

  // Function to copy text to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(
      () => {
        Swal.fire({
          title: 'Success',
          text: 'Copied to clipboard!',
          icon: 'success',
          confirmButtonText: 'OK',
          timer: 1500,
          timerProgressBar: true
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

  return {
    isLoading,
    error,
    noteData,
    messages,
    exportLoading,
    exportType,
    newMessage,
    contentRef,
    navigate,
    handleSaveAsPdf,
    handleSaveAsImage,
    handleSaveAsDocx,
    handleRegenerateResponse,
    handleSendMessage,
    copyToClipboard,
    setNewMessage
  };
}