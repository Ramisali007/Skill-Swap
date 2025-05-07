import { useState, useEffect } from 'react';
import { XMarkIcon, ArrowDownTrayIcon, DocumentIcon, PhotoIcon } from '@heroicons/react/24/outline';

const DocumentPreview = ({ document, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fileType, setFileType] = useState(null);

  useEffect(() => {
    if (!document || !document.documentUrl) {
      setError('Document not found or URL is missing');
      setLoading(false);
      return;
    }

    // Determine file type from URL or document type
    const url = document.documentUrl;
    const extension = url.split('.').pop().toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
      setFileType('image');
    } else if (['pdf'].includes(extension)) {
      setFileType('pdf');
    } else if (document.documentType?.toLowerCase().includes('photo') || 
               document.documentType?.toLowerCase().includes('image')) {
      setFileType('image');
    } else if (document.documentType?.toLowerCase().includes('pdf')) {
      setFileType('pdf');
    } else {
      setFileType('other');
    }
    
    setLoading(false);
  }, [document]);

  const handleDownload = () => {
    if (!document.documentUrl) return;
    
    // Create a temporary anchor element
    const a = document.createElement('a');
    a.href = document.documentUrl;
    a.download = document.documentType || 'document';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="document-preview-modal" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {document.documentType || 'Document'} Preview
            </h3>
            <button
              type="button"
              className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={onClose}
            >
              <span className="sr-only">Close</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          {/* Content */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            {loading ? (
              <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <XMarkIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error loading document</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                {fileType === 'image' ? (
                  <div className="overflow-hidden rounded-md border border-gray-200 shadow-sm max-h-[70vh]">
                    <img 
                      src={document.documentUrl} 
                      alt={document.documentType || 'Document'} 
                      className="max-w-full h-auto object-contain"
                      onError={() => setError('Failed to load image')}
                    />
                  </div>
                ) : fileType === 'pdf' ? (
                  <div className="w-full h-[70vh] border border-gray-200 rounded-md overflow-hidden">
                    <iframe
                      src={`${document.documentUrl}#toolbar=0&navpanes=0`}
                      title={document.documentType || 'PDF Document'}
                      className="w-full h-full"
                      onError={() => setError('Failed to load PDF')}
                    ></iframe>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="mx-auto h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center">
                      {document.documentType?.toLowerCase().includes('photo') || 
                       document.documentType?.toLowerCase().includes('image') ? (
                        <PhotoIcon className="h-12 w-12 text-gray-400" />
                      ) : (
                        <DocumentIcon className="h-12 w-12 text-gray-400" />
                      )}
                    </div>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">Preview not available</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      This document type cannot be previewed. Please download the file to view it.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleDownload}
              disabled={loading || error}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowDownTrayIcon className="h-4 w-4 mr-1.5" />
              Download
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentPreview;
