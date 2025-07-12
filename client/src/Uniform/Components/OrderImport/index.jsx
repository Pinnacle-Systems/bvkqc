import React, { useState, useRef } from 'react';

export default function PdfTableExtractor() {
  const [tables, setTables] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [pageCount, setPageCount] = useState(0);
  const [tableCount, setTableCount] = useState(0);
  const [fullText, setFullText] = useState('');
  const [showText, setShowText] = useState(false);
  const [targetPage, setTargetPage] = useState(7);
  const fileInputRef = useRef(null);

  const extractTables = async (file) => {
    setIsLoading(true);
    setError('');
    setTables([]);
    setPageCount(0);
    setTableCount(0);
    setFullText('');
    setShowText(false);
    
    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('target_page', targetPage);

    try {
      const response = await fetch('http://localhost:5000/extract-page-tables', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        setTables(data.tables || []);
        setPageCount(data.page_count || 0);
        setTableCount(data.table_count || 0);
        setFullText(data.full_text || '');
      } else {
        throw new Error(data.error || 'Failed to extract tables from PDF');
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
    extractTables(fileInputRef.current.files[0]);
  };

  const handleClear = () => {
    setFileName('');
    setTables([]);
    setError('');
    setPageCount(0);
    setTableCount(0);
    setFullText('');
    setShowText(false);
    setTargetPage(7);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 px-5 py-4">
          <h1 className="text-lg font-bold text-white">PDF Table Extractor</h1>
          <p className="text-blue-100 text-sm mt-1">Extract tables from specific pages in PDF files</p>
        </div>

        {/* Main Content */}
        <div className="p-5">
          {/* File Upload Section */}
          <div className="mb-6">
            <div className="flex items-center gap-3">
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
                    Extracting...
                  </>
                ) : 'Extract Tables'}
              </button>
              
              <button
                onClick={handleClear}
                disabled={isLoading}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md font-medium text-sm transition-colors flex items-center"
              >
                Clear
              </button>
            </div>
            
            {fileName && !isLoading && !error && (
              <p className="text-xs text-gray-500 mt-1">
                Selected: {fileName}
              </p>
            )}
          </div>

          {/* Page Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target Page Number
            </label>
            <input
              type="number"
              min="1"
              value={targetPage}
              onChange={(e) => setTargetPage(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter the page number you want to extract tables from
            </p>
          </div>

          {/* Status Indicators */}
          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md flex items-start text-sm mb-4">
              <svg className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="ml-2">
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="mt-6 flex flex-col items-center justify-center py-4">
              <div className="w-12 h-12 rounded-full border-t-2 border-b-2 border-blue-600 animate-spin mb-3"></div>
              <p className="text-sm text-gray-600">Extracting tables from page {targetPage} of {fileName}</p>
            </div>
          )}

          {/* Results Display */}
          {tables.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  Page {targetPage} Tables ({tableCount} found)
                </h2>
                <div className="text-sm text-gray-600">
                  Total PDF pages: {pageCount}
                </div>
              </div>

              <div className="space-y-8">
                {tables.map((tableData, index) => (
                  <div key={index} className="border rounded-lg overflow-hidden shadow-sm bg-white">
                    <div className="bg-blue-50 px-4 py-2 border-b flex justify-between items-center">
                      <h3 className="font-medium text-blue-800">
                        Table {tableData.table_index} from Page {tableData.page}
                      </h3>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                          <tr>
                            {tableData.table[0]?.map((header, headerIndex) => (
                              <th 
                                key={headerIndex} 
                                className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b"
                              >
                                {header || `Column ${headerIndex + 1}`}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {tableData.table.slice(1).map((row, rowIndex) => (
                            <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              {row.map((cell, cellIndex) => (
                                <td 
                                  key={cellIndex} 
                                  className="px-4 py-3 text-sm text-gray-800 border-b"
                                >
                                  {cell || '-'}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>

              {/* Page Text Viewer */}
              {fullText && (
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-800">
                      Page {targetPage} Full Text Content
                    </h3>
                    <button 
                      onClick={() => setShowText(!showText)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      {showText ? 'Hide Text' : 'Show Text'}
                    </button>
                  </div>
                  
                  {showText && (
                    <div className="mt-2 p-4 bg-gray-50 border border-gray-200 rounded text-sm whitespace-pre-wrap max-h-96 overflow-auto">
                      {fullText}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && tables.length === 0 && fileName && !error && (
            <div className="mt-8 text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-700">No tables found on page {targetPage}</h3>
              <p className="mt-1 text-gray-500 max-w-md mx-auto">
                Page {targetPage} of this PDF doesn't contain any detectable tables.
              </p>
              
              {fullText && (
                <div className="mt-6">
                  <button 
                    onClick={() => setShowText(!showText)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    {showText ? 'Hide Page Text' : 'Show Page Text'}
                  </button>
                  {showText && (
                    <pre className="mt-3 p-4 bg-white border border-gray-200 rounded text-xs whitespace-pre-wrap max-h-96 overflow-auto">
                      {fullText}
                    </pre>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}