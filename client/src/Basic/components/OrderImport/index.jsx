import React, { useState, useRef } from 'react';
import { useAddSizeTableMasterMutation, useGetSizeTableMasterQuery } from "../../../redux/uniformService/SizeTableMasterService";
import { useGetPartyQuery } from '../../../redux/services/PartyMasterService';
import { useExtractPageTablesMutation } from '../../../redux/services/pdfApi';
import secureLocalStorage from 'react-secure-storage';

export default function PdfTableExtractor() {
  // State declarations
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
  const [visualData, setVisualData] = useState([]);
  const [saveStatus, setSaveStatus] = useState({ success: false, message: '' });
  const fileInputRef = useRef(null);
  const [searchValue, setSearchValue] = useState("");
  const [selectedPartyId, setSelectedPartyId] = useState('');
  const [selectedParty, setSelectedParty] = useState(null);
  const handlePartyChange = (e) => {
    console.log(e.target.value, "handle")
    const partyId = e.target.value;
    setSelectedPartyId(partyId);

    const foundParty = partyData.find(party => party.id === Number(partyId));
    setSelectedParty(foundParty || null);
  };
  const companyId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userCompanyId"
  );
  const params = {
    companyId,
  };
  const [extractPageTables] = useExtractPageTablesMutation();

  // Redux RTK Query hook
  const [addSizeTableMaster, { isLoading: isSaving }] = useAddSizeTableMasterMutation();
  const { data: sizeData } = useGetSizeTableMasterQuery({
    productReference: "KIABI INTERNATIONAL",
  }); console.log(sizeData, "sizeData")
  const {
    data: partyData,

  } = useGetPartyQuery({ params, searchParams: searchValue });
  console.log(partyData?.data, "partdyData")

    const extractTables = async (file) => {
    setIsLoading(true);
    setError('');
    setTables([]);
    setPageCount(0);
    setTableCount(0);
    setShowText(false);
    setSizeChartData([]);
    setVisualData([]);
    setSaveStatus({ success: false, message: '' });

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
          const { sizeChart, visualMeasurements } = processSizeChartData(data.tables);
          setSizeChartData(sizeChart);
          setVisualData(visualMeasurements);
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


  // Improved table processing to handle uneven data
  const processSizeChartData = (tables) => {
    let sizeChart = [];
    let visualMeasurements = [];

    // Find the main size chart table (largest table with size headers)
    const mainTable = tables.reduce((largest, table) => {
      if (!table.table || table.table.length < 2) return largest;

      // Check if table has size headers (like "2 YEARS", "3 YEARS", etc.)
      const hasSizeHeaders = table.table[0]?.some(header =>
        /\d+\s*YEARS/i.test(header)
      );

      if (!hasSizeHeaders) return largest;

      // Select the table with the most rows and columns
      if (!largest || table.table.length > largest.table.length) {
        return table;
      }
      return largest;
    }, null);

    if (!mainTable) return { sizeChart: [], visualMeasurements: [] };

    const headers = mainTable.table[0];
    const sizeHeaders = headers.filter(header => /\d+\s*YEARS/i.test(header));

    // Find the description column index (most consistent column with text)
    const descriptionIndex = headers.findIndex(header =>
      header.toLowerCase().includes('description')
    );

    // Process each row of the table
    for (let i = 1; i < mainTable.table.length; i++) {
      const row = mainTable.table[i];
      if (!row || row.length < 6) continue;

      const firstCell = row[0] || '';

      // Check if this is a visual measurement row
      if (firstCell === 'VISUAL' || firstCell.includes('VISUAL')) {
        // Process visual measurements
        const visualRow = mainTable.table[i + 1];
        if (visualRow && visualRow[2] && visualRow[2].includes('VISUAL')) {
          const visualDescription = visualRow[2];
          const visualValues = [];

          for (let j = 0; j < sizeHeaders.length; j++) {
            const size = sizeHeaders[j].replace('YEARS', '').trim();
            const valueIndex = headers.indexOf(sizeHeaders[j]);
            const value = valueIndex !== -1 && visualRow[valueIndex] ? visualRow[valueIndex] : '';

            if (value) {
              visualValues.push({
                size,
                value
              });
            }
          }

          if (visualDescription && visualValues.length > 0) {
            visualMeasurements.push({
              description: visualDescription,
              values: visualValues
            });
          }
        }
        continue;
      }

      // Skip summary rows and empty rows
      if (
        firstCell.includes('Displaying') ||
        row.some(cell => cell.includes('Displaying'))
      ) {
        continue;
      }

      // Find the description - use most reliable method
      let description = '';
      if (descriptionIndex !== -1 && row[descriptionIndex]) {
        description = row[descriptionIndex];
      } else {
        // Fallback: find the longest text in the first few columns
        for (let j = 0; j < 3; j++) {
          if (row[j] && row[j].length > description.length) {
            description = row[j];
          }
        }
      }

      // Find dimension values - look for TO-prefixed codes
      const dimensionIndex = row.findIndex(cell => /^TO\d+[A-Z]*$/i.test(cell));
      const dimension = dimensionIndex !== -1 ? row[dimensionIndex] : '';

      // Find tolerance values
      const toleranceMin = row.find(cell => /^[-−]?\d+\.\d+$/.test(cell)) || '';
      const toleranceMax = row.find(cell => /^[+]?\d+\.\d+$/.test(cell)) || '';

      // Extract size values
      const values = [];
      for (let j = 0; j < sizeHeaders.length; j++) {
        const size = sizeHeaders[j].replace('YEARS', '').trim();
        const valueIndex = headers.indexOf(sizeHeaders[j]);
        const value = valueIndex !== -1 && row[valueIndex] ? row[valueIndex] : '';

        if (value) {
          values.push({
            size,
            value
          });
        }
      }

      if (description && values.length > 0) {
        sizeChart.push({
          description,
          toleranceMin,
          toleranceMax,
          dimension,
          values
        });
      }
    }

    return { sizeChart, visualMeasurements };
  };

  // Get all available sizes from the extracted data
  const getAllSizes = () => {
    if (sizeChartData.length === 0 && visualData.length === 0) return [];

    // Get unique sizes from all measurements
    const sizes = new Set();

    sizeChartData.forEach(measurement => {
      measurement.values.forEach(value => {
        sizes.add(value.size);
      });
    });

    visualData.forEach(measurement => {
      measurement.values.forEach(value => {
        sizes.add(value.size);
      });
    });

    return Array.from(sizes).sort((a, b) => {
      const numA = parseInt(a);
      const numB = parseInt(b);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.localeCompare(b);
    });
  };

const handleSaveSizeChart = async () => {
  // Reset previous status
  setError('');
  setSaveStatus({ success: false, message: '' });

  // Validate inputs
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
      measurements: sizeChartData,
      visualMeasurements: visualData,
      selectedPartyId: selectedPartyId,
      companyId: companyId 
    };

    const result = await addSizeTableMaster(payload).unwrap();

    if (result) {
      setSaveStatus({
        success: true,
        message: `Size chart for ${productReference} saved successfully!`
      });
      
      setTimeout(() => {
        handleClear();
        setSaveStatus({ success: false, message: '' });
      }, 1000);
    }
  } catch (err) {
    console.error('Save failed:', err);
    const errorMessage = err.data?.message || err.message || 'Failed to save size chart';
    setError(errorMessage);
    
    // More detailed error handling
    if (err.status === 401) {
      setError('Session expired. Please refresh the page.');
    } else if (err.status === 409) {
      setError('This size chart already exists for the product reference.');
    }
  }
};


  const getSizeValue = (measurement, size) => {
    const value = measurement.values.find(v => v.size === size);
    return value ? value.value : 'N/A';
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
    setVisualData([]);
    setSaveStatus({ success: false, message: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-[f1f1f0] py-4 px-3">
      <div className="mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-indigo-600 px-4 py-2">
          <h1 className="text-base font-bold text-white">PDF Size Chart Extractor</h1>
          <p className="text-blue-100 text-xs">Extract size charts from PDF files</p>
        </div>

        <div className="p-2">
          <div className="">
            <div className=" w-full">
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex flex-col md:flex-row gap-4 items-end">
                  <div className="flex-1 min-w-[180px]">
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                      Order No *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={productReference}
                        onChange={(e) => setProductReference(e.target.value)}
                        className="w-full px-4 py-2 text-xs border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="PRD-2023-XXXXX"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="w-24">
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                      Page
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        value={targetPage}
                        onChange={(e) => setTargetPage(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full px-4 py-2 text-xs border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-center"
                      />
                    </div>
                  </div>

                  <div className="min-w-[200px]">
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                      Buyer
                    </label>
                    <div className="relative">
                      <select
                        id="party"
                        value={selectedPartyId}
                        onChange={handlePartyChange}
                        className="w-full px-4 py-2 text-xs border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none"
                      >
                        <option value="">Select Buyer</option>
                        {partyData?.data?.map((party) => (
                          <option key={party.id} value={party.id}>
                            {party.name} ({party.aliasName})
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* File Upload */}
                  <div className="flex-1 min-w-[220px]">
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                      PDF Document
                    </label>
                    <div className="relative">
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
                        className={`flex items-center justify-between bg-gray-50 border border-gray-300 rounded-xl px-4 py-2 w-full cursor-pointer hover:bg-gray-100 transition-colors ${fileName ? 'border-blue-300 bg-blue-50' : ''
                          }`}
                      >
                        <span className={`truncate max-w-[70%] text-xs ${fileName ? 'font-medium text-gray-800' : 'text-gray-500'}`}>
                          {fileName ? (
                            <span className="flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              {fileName}
                            </span>
                          ) : "Select file..."}
                        </span>
                        <span className="bg-white border border-green-300 text-green-700 text-xs px-3  rounded-lg hover:bg-gray-50 transition-colors">
                          Browse
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={handleProcessClick}
                      disabled={isLoading || !fileName || !productReference}
                      className={`px-5 py-2 rounded-xl font-medium text-xs flex items-center justify-center transition-all min-w-[120px] ${(isLoading || !fileName || !productReference)
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg'
                        }`}
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                          </svg>
                          Extract
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleClear}
                      disabled={isLoading}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-medium text-gray-700 transition-colors flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="mt-6">
                  {error && (
                    <div className="flex items-center text-xs text-red-600 bg-red-50 p-3 rounded-xl">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {error}
                    </div>
                  )}

                  {fileName && !isLoading && !error && (
                    <div className="flex items-center text-xs text-green-600 bg-green-50 p-3 rounded-xl">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Ready to process: <span className="font-medium">{fileName}</span></span>
                    </div>
                  )}

                  {isLoading && (
                    <div className="flex items-center text-xs text-blue-600 bg-blue-50 p-3 rounded-xl">
                      <svg className="animate-spin mr-2 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Extracting data from page {targetPage}...
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>



          {error && (
            <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded flex items-start text-xs">
              <svg className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="ml-1.5">
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          {saveStatus.success && (
            <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded flex items-start text-xs">
              <svg className="h-4 w-4 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div className="ml-1.5">
                <p className="text-green-800">{saveStatus.message}</p>
              </div>
            </div>
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-2">
              <div className="w-8 h-8 rounded-full border-t-2 border-b-2 border-blue-600 animate-spin mb-2"></div>
              <p className="text-xs text-gray-600">Extracting page {targetPage}</p>
            </div>
          )}

          {/* Size Chart Preview */}
          {(sizeChartData.length > 0 || visualData.length > 0) && (
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xs font-bold text-gray-800">
                  Size Chart Data
                </h2>
                <div className="flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
                    {productReference}
                  </span>

                  <button
                    onClick={handleSaveSizeChart}
                    disabled={isSaving || !productReference}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-1.5 ${isSaving || !productReference
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                      } ${isSaving ? 'opacity-80' : ''
                      }`}
                  >
                    {isSaving ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Importing...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        <span>Import Size Chart</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="mt-3">
                <button
                  onClick={() => setShowText(!showText)}
                  className="flex items-center text-blue-600 hover:text-blue-800 text-xs font-medium"
                >
                  {showText ? 'Hide Full Table' : 'Show Full Table'}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 ml-1 transition-transform ${showText ? 'rotate-180' : ''}`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>

                {showText && (
                  <div className="mt-4 space-y-6">
                    {/* Main Size Chart Table */}
                    {sizeChartData.length > 0 && (
                      <div>
                        <h3 className="text-xs font-semibold text-gray-700 mb-2">Measurements</h3>
                        <div className="overflow-x-auto text-xs">
                          <table className="min-w-full border border-gray-200">
                            <thead className="bg-gray-100">
                              <tr>
                                <th className="p-1 text-left font-medium border-b border-gray-200">Measurement</th>
                                {getAllSizes().map((size, index) => (
                                  <th key={index} className="p-1 text-left font-medium border-b border-gray-200">
                                    {size} Years
                                  </th>
                                ))}
                                <th className="p-1 text-left font-medium border-b border-gray-200">Dim</th>
                                <th className="p-1 text-left font-medium border-b border-gray-200">Tolerance</th>
                              </tr>
                            </thead>
                            <tbody>
                              {sizeChartData.map((measurement, index) => (
                                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                  <td className="p-1 font-medium border-b border-gray-200">
                                    {measurement.description}
                                  </td>
                                  {getAllSizes().map((size, idx) => (
                                    <td key={idx} className="p-1 text-center border-b border-gray-200">
                                      {getSizeValue(measurement, size)}
                                    </td>
                                  ))}
                                  <td className="p-1 text-center border-b border-gray-200">
                                    {measurement.dimension}
                                  </td>
                                  <td className="p-1 text-center border-b border-gray-200">
                                    {measurement.toleranceMin}/{measurement.toleranceMax}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                  </div>
                )}
              </div>
            </div>
          )}

          {/* Results Display */}
          {tables.length > 0 && sizeChartData.length === 0 && visualData.length === 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xs font-semibold text-gray-800">
                  Page {targetPage} Tables ({tableCount})
                </h2>
                <div className="text-xs text-gray-600">
                  PDF pages: {pageCount}
                </div>
              </div>

              <div className="space-y-4">
                {tables.map((tableData, index) => (
                  <div key={index} className="border rounded overflow-hidden bg-white">
                    <div className="bg-blue-50 px-2 py-1 border-b flex justify-between">
                      <h3 className="text-xs font-medium text-blue-800">
                        Table {tableData.table_index} (Page {tableData.page})
                      </h3>
                    </div>

                    <div className="overflow-x-auto text-xs">
                      <table className="min-w-full">
                        <thead className="bg-gray-100">
                          <tr>
                            {tableData.table[0]?.map((header, headerIndex) => (
                              <th
                                key={headerIndex}
                                className="p-1 text-left font-medium border-b border-gray-200"
                              >
                                {header || `Col ${headerIndex + 1}`}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {tableData.table.slice(1).map((row, rowIndex) => (
                            <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              {row.map((cell, cellIndex) => (
                                <td
                                  key={cellIndex}
                                  className="p-1 border-b border-gray-200"
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
            <div className="mt-4 text-center py-6 bg-gray-50 rounded border border-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-xs font-medium text-gray-700">No tables on page {targetPage}</h3>
              <p className="mt-1 text-gray-500 text-xs">
                This PDF page doesn't contain detectable tables
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}