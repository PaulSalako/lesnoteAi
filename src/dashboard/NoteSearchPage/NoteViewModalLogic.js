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
      pdf.text(`Subject: ${note?.subject || note?.subjectName || 'N/A'}`, 20, 30);
      pdf.text(`Class: ${note?.class_ || note?.className || note?.class || 'N/A'}`, 20, 35);
      pdf.text(`Duration: ${note?.duration || 'N/A'}`, 20, 40);
      pdf.text(`Date: ${note?.date || 'N/A'}`, 20, 45);
      
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
      const contentText = contentRef.current.innerText;
      
      if (!contentText) {
        throw new Error('Content text not found');
      }
      
      // Create a simple text document
      const metadata = `
Title: ${title}
Subject: ${note?.subject || note?.subjectName || 'N/A'}
Class: ${note?.class_ || note?.className || note?.class || 'N/A'}
Duration: ${note?.duration || 'N/A'}
Date: ${note?.date || 'N/A'}

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
    exportLoading,
    exportType,
    contentRef,
    handleSaveAsPdf,
    handleSaveAsImage,
    handleSaveAsDocx,
    copyToClipboard
  };
}