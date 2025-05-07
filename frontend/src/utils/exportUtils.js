/**
 * Utility functions for exporting data in various formats
 */

/**
 * Convert data to CSV format and trigger download
 * @param {Array} data - Array of objects to convert to CSV
 * @param {String} filename - Name of the file to download
 * @param {Array} headers - Optional array of header names. If not provided, will use object keys
 */
export const exportToCSV = (data, filename, headers = null) => {
  if (!data || !data.length) {
    console.error('No data to export');
    return;
  }

  // If headers not provided, use object keys from first item
  const headerRow = headers || Object.keys(data[0]);
  
  // Create CSV content
  let csvContent = headerRow.join(',') + '\\n';
  
  // Add data rows
  data.forEach(item => {
    const row = headerRow.map(header => {
      // Get the value for this header
      const value = typeof item[header] === 'object' && item[header] !== null 
        ? JSON.stringify(item[header]) 
        : item[header];
      
      // Handle special characters and ensure proper CSV format
      const cell = value === null || value === undefined ? '' : String(value);
      
      // Escape quotes and wrap in quotes if contains comma, newline or quote
      if (cell.includes(',') || cell.includes('\\n') || cell.includes('"')) {
        return '"' + cell.replace(/"/g, '""') + '"';
      }
      return cell;
    });
    
    csvContent += row.join(',') + '\\n';
  });
  
  // Create a blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  // Create download link and trigger click
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename || 'export.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Format date for display or export
 * @param {Date|String} date - Date to format
 * @param {String} format - Format string (default: 'YYYY-MM-DD')
 * @returns {String} Formatted date string
 */
export const formatDate = (date, format = 'YYYY-MM-DD') => {
  const d = date instanceof Date ? date : new Date(date);
  
  if (isNaN(d.getTime())) {
    return 'Invalid Date';
  }
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
};

/**
 * Generate a filename with date suffix
 * @param {String} prefix - Prefix for the filename
 * @param {String} extension - File extension (default: 'csv')
 * @returns {String} Filename with date suffix
 */
export const generateFilename = (prefix, extension = 'csv') => {
  const date = formatDate(new Date(), 'YYYY-MM-DD');
  return `${prefix}_${date}.${extension}`;
};

/**
 * Format currency value
 * @param {Number} value - Value to format
 * @param {String} currency - Currency code (default: 'USD')
 * @returns {String} Formatted currency string
 */
export const formatCurrency = (value, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(value);
};

/**
 * Format number with thousands separator
 * @param {Number} value - Value to format
 * @returns {String} Formatted number string
 */
export const formatNumber = (value) => {
  return new Intl.NumberFormat('en-US').format(value);
};
