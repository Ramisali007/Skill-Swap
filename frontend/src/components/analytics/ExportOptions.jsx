import React, { useState } from 'react';
import { exportToCSV, generateFilename } from '../../utils/exportUtils';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const ExportOptions = ({ data, title, headers, chartRefs = [] }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState('csv');

  const handleExport = async () => {
    if (!data || data.length === 0) {
      alert('No data to export');
      return;
    }

    setIsExporting(true);

    try {
      if (exportFormat === 'csv') {
        exportToCSV(data, generateFilename(title), headers);
      } else if (exportFormat === 'pdf') {
        await exportToPDF(data, title, headers, chartRefs);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const exportToPDF = async (data, title, headers, chartRefs) => {
    // Create a new PDF document
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let yPos = margin;

    // Add title
    doc.setFontSize(18);
    doc.text(title, margin, yPos);
    yPos += 10;

    // Add date
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, yPos);
    yPos += 15;

    // Add charts if available
    if (chartRefs && chartRefs.length > 0) {
      for (const chartRef of chartRefs) {
        if (chartRef.current) {
          try {
            // Get chart canvas and convert to image
            const canvas = chartRef.current.canvas;
            if (canvas) {
              const imgData = canvas.toDataURL('image/png');
              
              // Calculate image dimensions to fit page width while maintaining aspect ratio
              const imgWidth = pageWidth - (margin * 2);
              const imgHeight = (canvas.height * imgWidth) / canvas.width;
              
              // Check if we need to add a new page
              if (yPos + imgHeight > pageHeight - margin) {
                doc.addPage();
                yPos = margin;
              }
              
              // Add image to PDF
              doc.addImage(imgData, 'PNG', margin, yPos, imgWidth, imgHeight);
              yPos += imgHeight + 10;
            }
          } catch (error) {
            console.error('Error adding chart to PDF:', error);
          }
        }
      }
    }

    // Check if we need to add a new page for the table
    if (yPos > pageHeight - 60) {
      doc.addPage();
      yPos = margin;
    }

    // Add table with data
    if (data && data.length > 0 && headers) {
      // Prepare table headers and data
      const tableHeaders = headers.map(header => ({
        header,
        dataKey: header
      }));
      
      // Add table
      doc.autoTable({
        startY: yPos,
        head: [headers],
        body: data.map(row => headers.map(header => row[header])),
        margin: { top: yPos, left: margin, right: margin, bottom: margin },
        styles: { overflow: 'linebreak' },
        headStyles: { fillColor: [66, 66, 66] }
      });
    }

    // Save the PDF
    doc.save(generateFilename(title, 'pdf'));
  };

  return (
    <div className="flex items-center space-x-2">
      <select
        value={exportFormat}
        onChange={(e) => setExportFormat(e.target.value)}
        className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        disabled={isExporting}
      >
        <option value="csv">CSV</option>
        <option value="pdf">PDF</option>
      </select>
      <button
        type="button"
        onClick={handleExport}
        disabled={isExporting}
        className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
          isExporting ? 'opacity-75 cursor-not-allowed' : ''
        }`}
      >
        {isExporting ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Exporting...
          </>
        ) : (
          <>
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export
          </>
        )}
      </button>
    </div>
  );
};

export default ExportOptions;
