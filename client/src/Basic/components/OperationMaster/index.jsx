import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';

const ExcelUploader = () => {
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [fileName, setFileName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const onDrop = useCallback((acceptedFiles) => {
    setError('');
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    setFileName(file.name);
    setIsLoading(true);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const binaryStr = e.target.result;
        const workbook = XLSX.read(binaryStr, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (jsonData.length < 2) {
          setError('The Excel file doesn\'t contain enough data');
          setIsLoading(false);
          return;
        }
        
        // First row as headers
        setHeaders(jsonData[0]);
        // Rest as data
        setData(jsonData.slice(1));
      } catch (err) {
        setError('Failed to process the Excel file');
        console.error(err);
      }
      setIsLoading(false);
    };
    
    reader.onerror = () => {
      setError('Failed to read the file');
      setIsLoading(false);
    };
    
    reader.readAsBinaryString(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxFiles: 1
  });

  const clearData = () => {
    setData([]);
    setHeaders([]);
    setFileName('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Excel File Upload</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Upload your Excel files to automatically populate the data table below. 
            Supports .xls and .xlsx formats.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
                ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                  </svg>
                </div>
                
                {isDragActive ? (
                  <p className="text-blue-600 font-medium">Drop the Excel file here</p>
                ) : (
                  <div>
                    <p className="text-gray-700 mb-1">Drag & drop your Excel file here</p>
                    <p className="text-gray-500 text-sm">or</p>
                    <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                      Browse Files
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* File Info */}
            {fileName && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg flex items-center justify-between">
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  <span className="text-gray-700 font-medium truncate">{fileName}</span>
                </div>
                <button 
                  onClick={clearData}
                  className="text-red-500 hover:text-red-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            )}
            
            {/* Loading State */}
            {isLoading && (
              <div className="mt-6 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Processing file...</span>
              </div>
            )}
            
            {/* Error Message */}
            {error && (
              <div className="mt-6 p-3 bg-red-50 text-red-700 rounded-lg flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                {error}
              </div>
            )}
          </div>
          
          {/* Data Preview */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Data Preview</h2>
              {data.length > 0 && (
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                  {data.length} rows
                </span>
              )}
            </div>
            
            {data.length > 0 ? (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {headers.map((header, index) => (
                        <th 
                          key={index} 
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((row, rowIndex) => (
                      <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex} className="px-4 py-3 text-sm text-gray-700">
                            {cell || '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <p className="mt-4">Upload an Excel file to preview data</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Instructions */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">How to use</h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-600">
            <li>Drag and drop an Excel file (.xls or .xlsx) into the upload area, or click to browse</li>
            <li>The system will automatically process the file and display the data</li>
            <li>Review the data in the preview table</li>
            <li>Use the clear button to remove the current file and data</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default ExcelUploader;