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
      
      // Extract text content
      let textContent = element.innerText || '';
      
      // Create PDF document
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Set up dimensions
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      
      // Add title
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(16);
      pdf.text(title, pageWidth / 2, margin, { align: "center" });
      
      // Add metadata
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      let yPos = margin + 10;
      
      pdf.text(`Subject: ${noteData?.subject || 'N/A'}`, margin, yPos);
      yPos += 5;
      pdf.text(`Class: ${noteData?.class_ || 'N/A'}`, margin, yPos);
      yPos += 5;
      pdf.text(`Duration: ${noteData?.duration || 'N/A'}`, margin, yPos);
      yPos += 5;
      pdf.text(`Date: ${noteData?.date || 'N/A'}`, margin, yPos);
      yPos += 5;
      
      // Extract week information if available
      const weekInfo = extractWeek(textContent);
      if (weekInfo) {
        pdf.text(`Week: ${weekInfo}`, margin, yPos);
        yPos += 5;
      }
      
      // Add horizontal line
      yPos += 2;
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 7;
      
      // Process the text content
      // If we're exporting a specific message, it's likely an AI message with formatted content
      if (content && content.includes('message-')) {
        // This is a specific message, likely containing AI response
        
        // Check if this is for a single message (AI response)
        const messageId = content.replace('message-', '');
        const message = messages.find(msg => msg.id === messageId);
        
        if (message && message.type === 'ai') {
          // It's an AI message, process its content
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(12);
          pdf.text("LESSON CONTENT", margin, yPos);
          yPos += 7;
          
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(10);
          
          // Process content line by line
          const lines = message.content.split('\n');
          
          let inList = false;
          let listIndex = 1;
          
          lines.forEach(line => {
            const trimmedLine = line.trim();
            
            // Skip empty lines
            if (!trimmedLine) {
              yPos += 2;
              return;
            }
            
            // Check if a new page is needed
            if (yPos > pageHeight - 20) {
              pdf.addPage();
              yPos = margin;
            }
            
            // Check if this is a section heading (ALL CAPS)
            if (/^[A-Z][A-Z\s&']+(:)?$/.test(trimmedLine)) {
              pdf.setFont("helvetica", "bold");
              pdf.text(trimmedLine, margin, yPos);
              pdf.setFont("helvetica", "normal");
              yPos += 7;
              return;
            }
            
            // Handle numbered list items
            const listMatch = trimmedLine.match(/^(\d+)\.?\s+(.+)$/);
            if (listMatch) {
              const listText = listMatch[2];
              const listNumber = listMatch[1];
              
              // For formatting, split text into chunks that fit the page width
              const textChunks = splitTextIntoChunks(listText, pdf, contentWidth - 10);
              
              // First line includes the number
              pdf.text(`${listNumber}. ${textChunks[0]}`, margin + 5, yPos);
              yPos += 5;
              
              // Additional lines are indented
              for (let i = 1; i < textChunks.length; i++) {
                pdf.text(textChunks[i], margin + 10, yPos);
                yPos += 5;
              }
              
              inList = true;
              return;
            }
            
            // Handle bullet points
            if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ')) {
              const bulletText = trimmedLine.substring(2);
              
              // Split into chunks
              const textChunks = splitTextIntoChunks(bulletText, pdf, contentWidth - 10);
              
              // First line with bullet
              pdf.text(`• ${textChunks[0]}`, margin + 5, yPos);
              yPos += 5;
              
              // Additional lines indented
              for (let i = 1; i < textChunks.length; i++) {
                pdf.text(textChunks[i], margin + 7, yPos);
                yPos += 5;
              }
              
              inList = true;
              return;
            }
            
            // Regular text
            // If this is a continuation of a list item (indented text)
            if (inList && trimmedLine.startsWith('  ')) {
              const textChunks = splitTextIntoChunks(trimmedLine, pdf, contentWidth - 15);
              
              textChunks.forEach(chunk => {
                pdf.text(chunk, margin + 10, yPos);
                yPos += 5;
              });
            }
            else {
              inList = false;
              
              // Check if this is a subheading (ends with colon)
              if (trimmedLine.endsWith(':')) {
                pdf.setFont("helvetica", "bold");
                pdf.text(trimmedLine, margin, yPos);
                pdf.setFont("helvetica", "normal");
                yPos += 5;
              } else {
                // Regular text, split into chunks
                const textChunks = splitTextIntoChunks(trimmedLine, pdf, contentWidth);
                
                textChunks.forEach(chunk => {
                  pdf.text(chunk, margin, yPos);
                  yPos += 5;
                });
              }
            }
          });
        }
      } else {
        // This is the entire chat, process messages
        
        // Go through each message
        pdf.setFontSize(10);
        
        for (const message of messages) {
          // Skip system messages in PDF export
          if (message.type === 'system') continue;
          
          // Check if new page is needed
          if (yPos > pageHeight - 30) {
            pdf.addPage();
            yPos = margin;
          }
          
          // Add message sender
          pdf.setFont("helvetica", "bold");
          if (message.type === 'user') {
            pdf.text("👤 User Message:", margin, yPos);
          } else if (message.type === 'ai') {
            pdf.text("🤖 AI Response:", margin, yPos);
          }
          yPos += 7;
          
          // Add message content
          pdf.setFont("helvetica", "normal");
          
          const lines = message.content.split('\n');
          
          lines.forEach(line => {
            const trimmedLine = line.trim();
            if (!trimmedLine) {
              yPos += 2;
              return;
            }
            
            // Check if new page is needed
            if (yPos > pageHeight - 20) {
              pdf.addPage();
              yPos = margin;
            }
            
            // Split line into chunks that fit the page width
            const chunks = splitTextIntoChunks(trimmedLine, pdf, contentWidth);
            
            chunks.forEach(chunk => {
              pdf.text(chunk, margin, yPos);
              yPos += 5;
            });
          });
          
          // Add spacing between messages
          yPos += 10;
        }
      }
      
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
  
  // Helper function to split text into chunks that fit the page width
  function splitTextIntoChunks(text, pdf, maxWidth) {
    const chunks = [];
    let currentChunk = '';
    const words = text.split(' ');
    
    words.forEach(word => {
      // Test if adding this word would exceed the width
      const testChunk = currentChunk + (currentChunk ? ' ' : '') + word;
      const textWidth = pdf.getStringUnitWidth(testChunk) * pdf.internal.getFontSize() / pdf.internal.scaleFactor;
      
      if (textWidth <= maxWidth) {
        currentChunk = testChunk;
      } else {
        // Current chunk is full, start a new one
        chunks.push(currentChunk);
        currentChunk = word;
      }
    });
    
    // Add the final chunk
    if (currentChunk) {
      chunks.push(currentChunk);
    }
    
    return chunks;
  }

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

  const handleSaveAsDocx = async (messageId) => {
    try {
      setExportLoading(true);
      setExportType('Document');
      
      const title = noteData?.topic || 'Lesson Note';
      
      // Determine which messages to include
      let messagesToInclude = messages;
      
      // If a messageId is provided, only include that specific message
      if (messageId) {
        const id = messageId.replace('message-', '');
        messagesToInclude = messages.filter(message => message.id === id);
        
        // If no matching message found
        if (messagesToInclude.length === 0) {
          throw new Error('Message not found');
        }
      }
      
      // Only include AI messages (content)
      const aiMessages = messagesToInclude.filter(message => message.type === 'ai');
      
      // Extract the content from the first AI message (to avoid repetition)
      let lessonContent = '';
      if (aiMessages.length > 0) {
        lessonContent = aiMessages[0].content;
      }
      
      // Extract week information if available
      const weekInfo = extractWeek(lessonContent);
      
      // Create HTML content with improved formatting
      let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>${title}</title>
          <style>
            body { font-family: 'Calibri', sans-serif; margin: 40px; line-height: 1.5; }
            h1 { text-align: center; color: #333; font-size: 24pt; margin-bottom: 20px; }
            h2 { color: #444; margin-top: 24px; margin-bottom: 12px; font-size: 16pt; text-transform: uppercase; }
            .metadata { margin: 20px 0 30px 0; border-bottom: 1px solid #ddd; padding-bottom: 15px; }
            .metadata div { margin: 5px 0; }
            p { margin: 12px 0; }
            ul, ol { margin-left: 20px; margin-bottom: 15px; }
            li { margin: 8px 0; padding-left: 10px; }
            .main-content { margin-top: 20px; }
            .section { margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
      `;
      
      // Process the actual lesson content
      let cleanedContent = removeDetailsSection(lessonContent);
      
      // Identify major sections by uppercase titles followed by colon
      const sectionMatches = cleanedContent.match(/\n\s*([A-Z][A-Z\s&']+):\s*\n/g) || [];
      
      // If no sections are found, just use the whole content
      if (sectionMatches.length === 0) {
        htmlContent += `<div class="main-content">${processContentImproved(cleanedContent)}</div>`;
      } else {
        // Extract and process sections
        const sectionTitles = [];
        sectionMatches.forEach(match => {
          const title = match.trim().replace(/:\s*$/, '').replace(/^\n\s*/, '');
          sectionTitles.push(title);
        });
        
        // Split content by section titles
        let sections = cleanedContent.split(/\n\s*[A-Z][A-Z\s&']+:\s*\n/);
        
        // Remove the first empty part
        sections = sections.slice(1);
        
        // Add each section to HTML
        htmlContent += '<div class="main-content">';
        for (let i = 0; i < sectionTitles.length; i++) {
          if (i < sections.length) {
            htmlContent += `<h2>${sectionTitles[i]}</h2>`;
            htmlContent += `<div class="section">${processContentImproved(sections[i])}</div>`;
          }
        }
        htmlContent += '</div>';
      }
      
      // Close HTML
      htmlContent += `
        </body>
        </html>
      `;
      
      // Create a Blob with the HTML content
      const blob = new Blob([htmlContent], { type: 'application/msword' });
      
      // Create filename
      const filename = messageId
        ? `${title}_message_${messageId.replace('message-', '')}`
        : title;
      
      // Create download link
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${filename.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.doc`;
      
      // Append to document, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      Swal.fire({
        title: 'Success',
        text: 'Document saved successfully!',
        icon: 'success',
        confirmButtonText: 'OK'
      });
    } catch (error) {
      console.error('Error saving document:', error);
      console.error('Error details:', error.stack);
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
  
  // Helper function to extract the Week information
  function extractWeek(text) {
    const weekMatch = text.match(/Week:\s*(Week\s*\d+)/i);
    return weekMatch ? weekMatch[1] : '';
  }
  
  // Helper function to remove the Details section
  function removeDetailsSection(text) {
    // Find and remove the Details section
    const detailsPattern = /(\s*Details:[\s\S]*?)(?=\n\s*[A-Z][A-Z\s&']+:)/;
    return text.replace(detailsPattern, '');
  }
  
  // Improved content processing function
  function processContentImproved(content) {
    // Process numbered lists correctly
    let processed = '';
    let inList = false;
    let listItems = [];
    
    // Split content into lines
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines
      if (!line) {
        if (inList && listItems.length > 0) {
          processed += `<ol>${listItems.join('')}</ol>`;
          listItems = [];
          inList = false;
        }
        continue;
      }
      
      // Check if line is a numbered list item
      const listMatch = line.match(/^(\d+)\.\s+(.+)$/);
      if (listMatch) {
        // It's a list item
        inList = true;
        listItems.push(`<li>${listMatch[2]}</li>`);
      } else {
        // Not a list item
        if (inList && listItems.length > 0) {
          processed += `<ol>${listItems.join('')}</ol>`;
          listItems = [];
          inList = false;
        }
        
        // Check for bullet points
        if (line.startsWith('* ')) {
          processed += `<ul><li>${line.substring(2)}</li></ul>`;
        } else {
          // Regular paragraph
          processed += `<p>${line}</p>`;
        }
      }
    }
    
    // Close any open list
    if (inList && listItems.length > 0) {
      processed += `<ol>${listItems.join('')}</ol>`;
    }
    
    // Clean up consecutive lists of the same type
    processed = processed.replace(/<\/ol>\s*<ol>/g, '');
    processed = processed.replace(/<\/ul>\s*<ul>/g, '');
    
    // Format text (bold, italic) if needed
    processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    processed = processed.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    return processed;
  }

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