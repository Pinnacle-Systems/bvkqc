import React, { useState, useRef } from 'react';

export default function PdfUploadReader() {
  const [extractedTable, setExtractedTable] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const extractMeasurementTable = async (file) => {
    setIsLoading(true);
    setError('');
    setWarning('');
    setSuccess(false);
    setExtractedTable('');
    
    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('target_page', '7');  // Specify page 7
    formData.append('content_type', 'table');  // Request table extraction

    try {
      const response = await fetch('http://127.0.0.1:5000/extract-content', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        if (data.table_content) {
          setExtractedTable(data.table_content);
          setSuccess(true);
        } else {
          setWarning('No measurement table found on page 7');
        }
      } else {
        throw new Error(data.error || 'Failed to extract measurement table');
      }
    } catch (error) {
      setError(error.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setFileName(file.name);
      setError('');
      setWarning('');
    } else {
      setError('Please upload a valid PDF file');
      fileInputRef.current.value = '';
    }
  };

  const handleProcessClick = () => {
    if (!fileInputRef.current?.files?.[0]) {
      setError('Please select a PDF file first');
      return;
    }
    extractMeasurementTable(fileInputRef.current.files[0]);
  };

  const handleClear = () => {
    setFileName('');
    setExtractedTable('');
    setSuccess(false);
    setError('');
    setWarning('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 px-5 py-4">
          <h1 className="text-lg font-bold text-white">Measurement Table Extractor</h1>
          <p className="text-sm text-blue-100 mt-1">Extracts measurement tables from page 7 of PDFs</p>
        </div>

        {/* Main Content */}
        <div className="p-5">
          {/* File Upload Section */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end mb-4">
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload PDF</label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    ref={fileInputRef}
                    id="pdf-upload"
                  />
                  <label 
                    htmlFor="pdf-upload"
                    className="flex items-center justify-between bg-gray-50 border border-gray-300 rounded-md px-3 py-2 w-full cursor-pointer hover:bg-gray-100 transition-colors text-sm"
                  >
                    <span className={`truncate ${fileName ? 'font-medium' : 'text-gray-500'}`}>
                      {fileName || "Select a PDF file..."}
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    </svg>
                  </label>
                </div>
                
                <button
                  onClick={handleProcessClick}
                  disabled={isLoading || !fileName}
                  className={`px-4 py-2 rounded-md font-medium text-sm transition-all flex items-center ${
                    (isLoading || !fileName) 
                      ? 'bg-gray-200 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Extracting
                    </>
                  ) : 'Extract Table'}
                </button>
                
                <button
                  onClick={handleClear}
                  disabled={isLoading}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md font-medium text-sm transition-colors flex items-center"
                >
                  Clear
                </button>
              </div>
              
              {fileName && !isLoading && !success && !error && (
                <p className="text-xs text-gray-500 mt-1">
                  Selected: {fileName}
                </p>
              )}
            </div>
          </div>

          {/* Status Indicators */}
          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md flex items-start text-sm">
              <svg className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="ml-2">
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          {warning && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md flex items-start text-sm">
              <svg className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="ml-2">
                <p className="text-yellow-800">{warning}</p>
              </div>
            </div>
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="mt-6 flex flex-col items-center justify-center py-4">
              <div className="w-12 h-12 rounded-full border-t-2 border-b-2 border-blue-600 animate-spin mb-3"></div>
              <p className="text-sm text-gray-600">Extracting measurement table from page 7...</p>
            </div>
          )}

          {/* Results Display */}
          {success && (
            <div className="mt-4">
              <div className="bg-blue-50 p-3 rounded-md mb-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-semibold text-gray-800 mb-1">
                      Measurement Table: <span className="text-blue-700">{fileName}</span>
                    </h2>
                    <div className="text-xs text-gray-600 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Extracted from page 7
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(extractedTable);
                      alert('Table copied to clipboard!');
                    }}
                    className="flex items-center px-3 py-1.5 bg-white border border-gray-300 rounded-md text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy Table
                  </button>
                </div>
              </div>

              {/* Extracted Table Display */}
              <div className="bg-gray-50 border border-gray-200 rounded-md p-4 max-h-96 overflow-auto text-sm">
                <pre className="text-gray-800 whitespace-pre-wrap break-words font-sans">
                  {extractedTable || (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      No table content found on page 7
                    </div>
                  )}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}