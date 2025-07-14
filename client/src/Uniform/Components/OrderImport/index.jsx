import React, { useState, useRef, useEffect } from 'react';
import { useAddSizeTableMasterMutation } from "../../../redux/uniformService/SizeTableMasterService";

export default function PdfTableExtractor() {
  const [tables, setTables] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [pageCount, setPageCount] = useState(0);
  const [tableCount, setTableCount] = useState(0);
  const [showText, setShowText] = useState(false);
  const [targetPage, setTargetPage] = useState(7);
  const [productReference, setProductReference] = useState('');
  const [sizeChartData, setSizeChartData] = useState([]);
  const [saveStatus, setSaveStatus] = useState({ success: false, message: '' });
  const [selectedSize, setSelectedSize] = useState('All Sizes');
  const fileInputRef = useRef(null);
  
  // Redux RTK Query hook
  const [addSizeTableMaster, { isLoading: isSaving }] = useAddSizeTableMasterMutation();

  const extractTables = async (file) => {
    setIsLoading(true);
    setError('');
    setTables([]);
    setPageCount(0);
    setTableCount(0);
    setShowText(false);
    setSizeChartData([]);
    setSaveStatus({ success: false, message: '' });
    setSelectedSize('All Sizes');
    
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
        
        // Process size chart data
        if (data.tables && data.tables.length > 0) {
          const processedData = processSizeChartData(data.tables);
          setSizeChartData(processedData);
        }
      } else {
        throw new Error(data.error || 'Failed to extract tables from PDF');
      }
    } catch (error) {
      setError(error.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Process the extracted tables to format for storage
  const processSizeChartData = (tables) => {
    let sizeChart = [];
    
    // Find the main size chart table (typically the largest one)
    const mainTable = tables.find(table => 
      table.table.length > 5 && 
      table.table[0]?.some(header => header.includes('YEARS'))
    );
    
    if (!mainTable) return [];
    
    const headers = mainTable.table[0];
    
    // Process each row of the table
    for (let i = 1; i < mainTable.table.length; i++) {
      const row = mainTable.table[i];
      
      // Skip rows that don't contain measurement data
      if (!row[2] || row[2].includes('Displaying') || row[2] === 'VISUAL') continue;
      
      const measurement = {
        description: row[2] || '',
        toleranceMin: row[3] || '',
        toleranceMax: row[4] || '',
        dimension: row[5] || '',
        values: []
      };
      
      // Extract size values (columns 6 to end)
      for (let j = 6; j < Math.min(row.length, headers.length); j++) {
        if (headers[j] && row[j]) {
          measurement.values.push({
            size: headers[j].replace('YEARS', '').trim(),
            value: row[j]
          });
        }
      }
      
      sizeChart.push(measurement);
    }
    
    return sizeChart;
  };

  // Get all available sizes from the extracted data
  const getAllSizes = () => {
    if (sizeChartData.length === 0) return [];
    
    // Get unique sizes from all measurements
    const sizes = new Set();
    sizeChartData.forEach(measurement => {
      measurement.values.forEach(value => {
        sizes.add(value.size);
      });
    });
    
    return ['All Sizes', ...Array.from(sizes).sort()];
  };

  const handleSaveSizeChart = async () => {
    if (!productReference) {
      setError('Product reference is required');
      return;
    }
    
    if (sizeChartData.length === 0) {
      setError('No size chart data to save');
      return;
    }
    
    try {
      const payload = {
        productReference,
        measurements: sizeChartData
      };
      
      const result = await addSizeTableMaster(payload).unwrap();
      
      if (result) {
        setSaveStatus({
          success: true,
          message: 'Size chart saved successfully!'
        });
      }
    } catch (err) {
      console.error('Save failed:', err);
      setError(`Failed to save size chart: ${err.data?.message || err.message}`);
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
    setShowText(false);
    setTargetPage(7);
    setProductReference('');
    setSizeChartData([]);
    setSaveStatus({ success: false, message: '' });
    setSelectedSize('All Sizes');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getSizeValue = (measurement, size) => {
    if (size === 'All Sizes') return '';
    
    const value = measurement.values.find(v => v.size === size);
    return value ? value.value : 'N/A';
  };


  return (
    <div className="bg-gray-50 py-6 px-4">
      <div className="mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 px-5 py-4">
          <h1 className="text-lg font-bold text-white">PDF Size Chart Extractor</h1>
          <p className="text-blue-100 text-xs mt-1">Extract and store size charts from PDF files</p>
        </div>

        {/* Main Content */}
        <div className="p-5">
          {/* Product Reference */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Product Reference *
            </label>
            <input
              type="text"
              value={productReference}
              onChange={(e) => setProductReference(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-xs"
              disabled={isLoading}
              placeholder="Enter product reference"
            />
            <p className="text-xs text-gray-500 mt-1">
              This will be used to store the size chart in the database
            </p>
          </div>

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
                  className="flex items-center justify-between bg-gray-50 border border-gray-300 rounded-md px-3 py-2 w-full cursor-pointer hover:bg-gray-100 transition-colors text-xs"
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
                className={`px-4 py-2 rounded-md font-medium text-xs transition-all flex items-center ${
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
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md font-medium text-xs transition-colors flex items-center"
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
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Target Page Number
            </label>
            <input
              type="number"
              min="1"
              value={targetPage}
              onChange={(e) => setTargetPage(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-xs"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Page containing the size chart (default: 7)
            </p>
          </div>

      

          {sizeChartData.length > 0 && (
            <div className="mb-4 flex justify-end">
              <button
                onClick={handleSaveSizeChart}
                disabled={isSaving || !productReference}
                className={`px-4 py-2 rounded-md font-medium text-xs flex items-center ${
                  isSaving || !productReference
                    ? 'bg-gray-200 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow-md'
                }`} 
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : 'Save Size Chart to Database'}
              </button>
            </div>
          )}

          {/* Status Indicators */}
          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md flex items-start text-xs mb-4">
              <svg className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="ml-2">
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          {saveStatus.success && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md flex items-start text-xs mb-4">
              <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div className="ml-2">
                <p className="text-green-800">{saveStatus.message}</p>
              </div>
            </div>
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="mt-6 flex flex-col items-center justify-center py-4">
              <div className="w-12 h-12 rounded-full border-t-2 border-b-2 border-blue-600 animate-spin mb-3"></div>
              <p className="text-xs text-gray-600">Extracting tables from page {targetPage} of {fileName}</p>
            </div>
          )}

          {/* Size Chart Preview */}
          {sizeChartData.length > 0 && (
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  Extracted Size Chart Data
                </h2>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs">
                  {productReference || 'No reference'}
                </span>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => setShowText(!showText)}
                  className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
                >
                  {showText ? 'Hide Full Size Table' : 'Show Full Size Table'}
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className={`h-5 w-5 ml-1 transition-transform ${showText ? 'rotate-180' : ''}`} 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {showText && (
                  <div className="mt-4 overflow-x-auto">
                    <table className="min-w-full divide-y text-xs divide-gray-200 border border-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="p-2 text-left  text-xs font-medium text-gray-700  uppercase tracking-wider">
                            Measurement
                          </th>


                          {getAllSizes().map((size, index) => (
                              <th 
                                key={index} 
                                className="p-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                              >
                                {size}
                              </th>
                              
                            ))}
                             <th className="p-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Dimension
                      </th>
                      <th className="p-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Tolerance
                      </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {sizeChartData.map((measurement, index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="p-2 text-xs font-medium text-gray-900 whitespace-nowrap">  
                              {measurement.description}
                            </td>
                            {getAllSizes().map((size, idx) => (
                                <td 
                                  key={idx} 
                                  className="p-2 text-xs text-gray-700 whitespace-nowrap"
                                >
                                  {getSizeValue(measurement, size)}
                                </td>
                              ))}
                                <td className="p-2 text-xs text-gray-500 whitespace-nowrap">
                          {measurement.dimension}
                        </td>
                        <td className="p-2 text-xs text-gray-500 whitespace-nowrap">
                          {measurement.toleranceMin} / {measurement.toleranceMax}
                        </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Results Display */}
          {tables.length > 0 && sizeChartData.length === 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  Page {targetPage} Tables ({tableCount} found)
                </h2>
                <div className="text-xs text-gray-600">
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
                                className="p-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b"
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
                                  className="p-2 text-xs text-gray-800 border-b"
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
              
       
            </div>
          )}
        </div>
      </div>
    </div>
  );
}