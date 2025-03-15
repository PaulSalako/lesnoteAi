// src/dashboard/components/NoteSearchPage/NoteViewModalLogic.js
import { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';

export function useNoteViewModal(note, onClose) {
  const [exportLoading, setExportLoading] = useState(false);
  const [exportType, setExportType] = useState(null);
  const contentRef = useRef(null);

  // Export functions
  const handleSaveAsPdf = async () => {
    try {
      setExportLoading(true);
      setExportType('PDF');
      
      const title = note?.topic || note?.topicName || 'Lesson Note';
      const element = contentRef.current;
      
      if (!element) {
        throw new Error('Content element not found');
      }
      
      // Extract text content
      let content = element.innerText || '';
      
      // Extract week information if available
      const weekInfo = extractWeek(content);
      
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
      
      pdf.text(`Subject: ${note?.subject || note?.subjectName || 'N/A'}`, margin, yPos);
      yPos += 5;
      pdf.text(`Class: ${note?.class_ || note?.className || note?.class || 'N/A'}`, margin, yPos);
      yPos += 5;
      pdf.text(`Duration: ${note?.duration || 'N/A'}`, margin, yPos);
      yPos += 5;
      pdf.text(`Date: ${note?.date || 'N/A'}`, margin, yPos);
      yPos += 5;
      
      if (weekInfo) {
        pdf.text(`Week: ${weekInfo}`, margin, yPos);
        yPos += 5;
      }
      
      // Add horizontal line
      yPos += 2;
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 5;

      // Add content section by section, handling multi-page content
      // This is a simplified approach that doesn't use extractSectionsImproved
      // We'll just add text content directly
      
      // Split the content into lines and add them to the PDF
      const lines = content.split('\n');
      let skipMetadata = true; // Flag to skip repeating the metadata we already added
      
      // Find where to start content (skip metadata)
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('PERFORMANCE OBJECTIVES') || 
            lines[i].includes('CONTENT') || 
            lines[i].includes('TEACHER') || 
            lines[i].includes('STUDENT')) {
          skipMetadata = false;
          break;
        }
      }
      
      pdf.setFontSize(10);
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Skip empty lines
        if (!line) continue;
        
        // Skip metadata section
        if (skipMetadata) {
          if (line.startsWith('Subject:') || 
              line.startsWith('Class:') || 
              line.startsWith('Topic:') || 
              line.startsWith('Duration:') || 
              line.startsWith('Week:') || 
              line.startsWith('Date:') || 
              line === 'Details:') {
            continue;
          }
          
          // If we've reached a bullet point in the metadata, stop skipping
          if (line.startsWith('•') || line.startsWith('* ')) {
            skipMetadata = false;
          }
        }
        
        // Check if we need to add a new page
        if (yPos > pageHeight - 20) {
          pdf.addPage();
          yPos = margin;
        }
        
        // Check if this is a section heading (ALL CAPS)
        if (/^[A-Z][A-Z\s&']+(:)?$/.test(line)) {
          pdf.setFont("helvetica", "bold");
          pdf.text(line, margin, yPos);
          pdf.setFont("helvetica", "normal");
          yPos += 7;
          continue;
        }
        
        // Check if line is numbered
        const numberedMatch = line.match(/^(\d+)\.?\s+(.+)$/);
        if (numberedMatch) {
          const number = numberedMatch[1];
          const text = numberedMatch[2];
          
          // Split text to fit width
          const chunks = splitTextIntoChunks(text, pdf, contentWidth - 10);
          
          // First line with number
          pdf.text(`${number}. ${chunks[0]}`, margin + 5, yPos);
          yPos += 5;
          
          // Additional lines
          for (let j = 1; j < chunks.length; j++) {
            pdf.text(chunks[j], margin + 10, yPos);
            yPos += 5;
          }
          
          continue;
        }
        
        // Check if line is a bullet point
        if (line.startsWith('•') || line.startsWith('* ') || line.startsWith('- ')) {
          const text = line.substring(line.startsWith('•') ? 1 : 2).trim();
          
          // Split text to fit width
          const chunks = splitTextIntoChunks(text, pdf, contentWidth - 10);
          
          // First line with bullet
          pdf.text(`• ${chunks[0]}`, margin + 5, yPos);
          yPos += 5;
          
          // Additional lines
          for (let j = 1; j < chunks.length; j++) {
            pdf.text(chunks[j], margin + 7, yPos);
            yPos += 5;
          }
          
          continue;
        }
        
        // Regular text - split into chunks to fit width
        const chunks = splitTextIntoChunks(line, pdf, contentWidth);
        
        for (let j = 0; j < chunks.length; j++) {
          pdf.text(chunks[j], margin, yPos);
          yPos += 5;
        }
        
        // Add extra space after paragraphs
        yPos += 2;
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

  const handleSaveAsImage = async () => {
    try {
      setExportLoading(true);
      setExportType('Image');
      
      const title = note?.topic || note?.topicName || 'Lesson Note';
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
      
      const title = note?.topic || note?.topicName || 'Lesson Note';
      const element = contentRef.current;
      
      if (!element) {
        throw new Error('Content element not found');
      }
      
      // Extract text content
      let content = element.innerText || '';
      
      // Extract week information if available
      const weekInfo = extractWeek(content);
      
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
            h2 { color: #444; margin-top: 24px; margin-bottom: 12px; font-size: 16pt; text-transform: uppercase; font-weight: bold; }
            .metadata { margin: 20px 0 30px 0; border-bottom: 1px solid #ddd; padding-bottom: 15px; }
            .metadata div { margin: 5px 0; }
            p { margin: 12px 0; }
            ul, ol { margin-left: 20px; margin-bottom: 15px; }
            li { margin: 8px 0; padding-left: 10px; }
            .main-content { margin-top: 20px; }
            .section { margin-bottom: 20px; }
            strong { font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>${title}</h1>          
          <div class="main-content">
      `;
      
      // Process the content (simpler approach without extractSectionsImproved)
      let processedContent = '';
      const lines = content.split('\n');
      let skipMetadata = true; // Flag to skip repeating the metadata
      
      // Find where to start content (skip metadata)
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (line.includes('PERFORMANCE OBJECTIVES') || 
            line.includes('CONTENT') || 
            line.includes('TEACHER') || 
            line.includes('STUDENT')) {
          skipMetadata = false;
          break;
        }
      }
      
      // Process line by line
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Skip empty lines
        if (!line) continue;
        
        // Skip metadata section
        if (skipMetadata) {
          if (line.startsWith('Subject:') || 
              line.startsWith('Class:') || 
              line.startsWith('Topic:') || 
              line.startsWith('Duration:') || 
              line.startsWith('Week:') || 
              line.startsWith('Date:') || 
              line === 'Details:') {
            continue;
          }
          
          // If we've reached a bullet point in the metadata, stop skipping
          if (line.startsWith('•') || line.startsWith('* ')) {
            skipMetadata = false;
          }
        }
        
        // Check if this is a section heading (ALL CAPS)
        if (/^[A-Z][A-Z\s&']+(:)?$/.test(line)) {
          processedContent += `<h2>${line}</h2>`;
          continue;
        }
        
        // Check if line is numbered
        const numberedMatch = line.match(/^(\d+)\.?\s+(.+)$/);
        if (numberedMatch) {
          processedContent += `<ol start="${numberedMatch[1]}"><li>${numberedMatch[2]}</li></ol>`;
          continue;
        }
        
        // Check if line is a bullet point
        if (line.startsWith('•') || line.startsWith('* ') || line.startsWith('- ')) {
          const text = line.substring(line.startsWith('•') ? 1 : 2).trim();
          processedContent += `<ul><li>${text}</li></ul>`;
          continue;
        }
        
        // Regular text
        processedContent += `<p>${line}</p>`;
      }
      
      // Add processed content to HTML
      htmlContent += processedContent;
      
      // Close HTML
      htmlContent += `
          </div>
        </body>
        </html>
      `;
      
      // Create a Blob with the HTML content
      const blob = new Blob([htmlContent], { type: 'application/msword' });
      
      // Create download link
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.doc`;
      
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
    exportLoading,
    exportType,
    contentRef,
    handleSaveAsPdf,
    handleSaveAsImage,
    handleSaveAsDocx,
    copyToClipboard
  };
}