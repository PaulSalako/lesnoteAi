// src/dashboard/components/ViewNotePage/ViewNotePageLogic.js
import { API_URL } from '../../config';
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';


export function useViewNotePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [noteData, setNoteData] = useState(null);
  const [content, setContent] = useState('');
  const [exportLoading, setExportLoading] = useState(false);
  const [exportType, setExportType] = useState(null);
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
        
        const response = await fetch(`${API_URL}/LessonNotes/${id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const responseData = await response.json();
        
        if (!response.ok) {
          console.error('Error response:', responseData);
          throw new Error(responseData.message || 'Failed to fetch lesson note');
        }
        
        console.log('Fetched Lesson Note:', responseData);
        
        setNoteData(responseData);
        
        // Set content based on the response structure
        if (responseData.content) {
          setContent(responseData.content);
        } else if (responseData.messages && responseData.messages.length > 0) {
          // Get the last AI message to display as content
          const aiMessages = responseData.messages.filter(
            msg => msg.role === 'assistant'
          );
          if (aiMessages.length > 0) {
            setContent(aiMessages[aiMessages.length - 1].content);
          }
        }
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
  const handleSaveAsPdf = async () => {
    try {
      setExportLoading(true);
      setExportType('PDF');
      
      const title = noteData?.topic || 'Lesson Note';
      const element = contentRef.current;
      
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

  const handleSaveAsImage = async () => {
    try {
      setExportLoading(true);
      setExportType('Image');
      
      const title = noteData?.topic || 'Lesson Note';
      const element = contentRef.current;
      
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

  const handleSaveAsDocx = async () => {
    try {
      setExportLoading(true);
      setExportType('Document');
      
      const title = noteData?.topic || 'Lesson Note';
      const contentText = contentRef.current.innerText;
      
      if (!contentText) {
        throw new Error('Content text not found');
      }
      
      // Create a simple text document
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
          text: 'Could not copy text to clipboard.',
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
    content,
    exportLoading,
    exportType,
    contentRef,
    navigate,
    handleSaveAsPdf,
    handleSaveAsImage,
    handleSaveAsDocx,
    copyToClipboard
  };
}