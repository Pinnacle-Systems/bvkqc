import React, { useState, useRef, useMemo } from 'react';
import { useAddSizeTableMasterMutation } from "../../../redux/uniformService/SizeTableMasterService";
import { useGetPartyQuery } from '../../../redux/services/PartyMasterService';
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
  const [selectedPartyId, setSelectedPartyId] = useState('');
  const fileInputRef = useRef(null);
  
  const companyId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userCompanyId"
  );
  const params = { companyId };
  
  // RTK Query hooks
  const [addSizeTableMaster, { isLoading: isSaving }] = useAddSizeTableMasterMutation();
  const { data: partyData } = useGetPartyQuery({ params });

  const handlePartyChange = (e) => {
    setSelectedPartyId(e.target.value);
  };

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
      const response = await fetch('https://agf.pinnaclesystems.co.in/extract-page-tables', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        setTables(data.tables || []);
        setPageCount(data.page_count || 0);
        setTableCount(data.table_count || 0);

        if (data.tables?.length > 0) {
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

  const processSizeChartData = (tables) => {
    let sizeChart = [];
    let visualMeasurements = [];

    // Find the main size chart table
    const mainTable = tables.reduce((largest, table) => {
      if (!table.table || table.table.length < 2) return largest;

      const hasSizeHeaders = table.table[0]?.some(header =>
        /(\d+[\s-]*\d*\s*YEARS?)|(SIZE\s*\d+)/i.test(header)
      );

      if (!hasSizeHeaders) return largest;

      if (!largest || table.table.length > largest.table.length) {
        return table;
      }
      return largest;
    }, null);

    if (!mainTable) return { sizeChart: [], visualMeasurements: [] };

    const headers = mainTable.table[0];
    const sizeHeaders = headers.filter(header => 
      /(\d+[\s-]*\d*\s*YEARS?)|(SIZE\s*\d+)/i.test(header)
    );

    const descriptionIndex = headers.findIndex(header =>
      header.toLowerCase().includes('description')
    );

    for (let i = 1; i < mainTable.table.length; i++) {
      const row = mainTable.table[i];
      if (!row || row.length < 6) continue;

      const firstCell = (row[0] || '').toLowerCase();

      // Handle visual measurements
      if (firstCell.includes('visual')) {
        const nextRow = mainTable.table[i + 1];
        if (nextRow && nextRow[2]?.toLowerCase().includes('visual')) {
          const visualValues = [];
          for (let j = 0; j < sizeHeaders.length; j++) {
            const size = sizeHeaders[j].replace(/\s*YEARS?/i, '').trim();
            const valueIndex = headers.indexOf(sizeHeaders[j]);
            const value = valueIndex !== -1 ? nextRow[valueIndex] : '';
            if (value) {
              visualValues.push({ size, value });
            }
          }
          if (visualValues.length > 0) {
            visualMeasurements.push({
              description: nextRow[2],
              values: visualValues
            });
          }
          i++; // Skip next row
        }
        continue;
      }

      // Skip irrelevant rows
      if (firstCell.includes('displaying') || row.some(cell => 
        cell?.toLowerCase().includes('displaying'))) {
        continue;
      }

      // Extract measurement data
      let description = descriptionIndex !== -1 ? row[descriptionIndex] : '';
      if (!description) {
        for (let j = 0; j < 3; j++) {
          if (row[j] && row[j].length > (description || '').length) {
            description = row[j];
          }
        }
      }

      // Find dimension (TO-codes)
      let dimension = '';
      for (let k = 0; k < row.length; k++) {
        const cell = row[k] || '';
        if (/TO\d+[A-Z]*/i.test(cell)) {
          dimension = cell;
          break;
        }
      }

      // Find tolerances
      let toleranceMin = '';
      let toleranceMax = '';
      for (let k = 0; k < row.length; k++) {
        const cell = row[k] || '';
        if (/^[-−]?\d+\.\d+$/.test(cell)) toleranceMin = cell;
        if (/^[+]?\d+\.\d+$/.test(cell)) toleranceMax = cell;
      }

      // Extract size values
      const values = [];
      for (let j = 0; j < sizeHeaders.length; j++) {
        const size = sizeHeaders[j].replace(/\s*YEARS?/i, '').trim();
        const valueIndex = headers.indexOf(sizeHeaders[j]);
        const value = valueIndex !== -1 ? row[valueIndex] : '';
        if (value) {
          values.push({ size, value });
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

  // Memoized size extraction
  const sizes = useMemo(() => {
    const sizeSet = new Set();
    [...sizeChartData, ...visualData].forEach(item => {
      item.values.forEach(val => sizeSet.add(val.size));
    });
    return Array.from(sizeSet).sort((a, b) => {
      const numA = parseInt(a), numB = parseInt(b);
      return !isNaN(numA) && !isNaN(numB) ? numA - numB : a.localeCompare(b);
    });
  }, [sizeChartData, visualData]);

  const getSizeValue = (measurement, size) => {
    const value = measurement.values.find(v => v.size === size);
    return value ? value.value : 'N/A';
  };

  const handleSaveSizeChart = async () => {
    setError('');
    setSaveStatus({ success: false, message: '' });

    if (!productReference) {
      setError('Product reference is required');
      return;
    }

    if (!selectedPartyId) {
      setError('Buyer selection is required');
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
        partyId: selectedPartyId,
        companyId
      };

      await addSizeTableMaster(payload).unwrap();
      setSaveStatus({
        success: true,
        message: `Size chart for ${productReference} saved successfully!`
      });
      
      setTimeout(() => {
        handleClear();
        setSaveStatus({ success: false, message: '' });
      }, 1000);
    } catch (err) {
      setError(err.data?.message || err.message || 'Failed to save size chart');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file?.type === 'application/pdf') {
      setFileName(file.name);
      setError('');
    } else {
      setError('Please upload a valid PDF file');
      if (fileInputRef.current) fileInputRef.current.value = '';
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
    setSelectedPartyId('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="bg-[f1f1f0] py-4 px-3">
      <div className="mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-indigo-600 px-4 py-2">
          <h1 className="text-base font-bold text-white">PDF Size Chart Extractor</h1>
        </div>

        <div className="p-2">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            {/* Product Reference */}
            <div className="flex-1 min-w-[180px]">
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                Order No *
              </label>
              <input
                type="text"
                value={productReference}
                onChange={(e) => setProductReference(e.target.value)}
                className="w-full px-4 py-2 text-xs border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="PRD-2023-XXXXX"
              />
            </div>

            {/* Page Number */}
            <div className="w-24">
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                Page
              </label>
              <input
                type="number"
                min="1"
                value={targetPage}
                onChange={(e) => setTargetPage(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-4 py-2 text-xs border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-center"
              />
            </div>

            {/* Buyer Selection */}
            <div className="min-w-[200px]">
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                Buyer *
              </label>
              <select
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
                  className={`flex items-center justify-between bg-gray-50 border border-gray-300 rounded-xl px-4 py-2 w-full cursor-pointer hover:bg-gray-100 transition-colors ${fileName ? 'border-blue-300 bg-blue-50' : ''}`}
                >
                  <span className={`truncate max-w-[70%] text-xs ${fileName ? 'font-medium text-gray-800' : 'text-gray-500'}`}>
                    {fileName || "Select file..."}
                  </span>
                  <span className="bg-white border border-green-300 text-green-700 text-xs px-3 rounded-lg hover:bg-gray-50 transition-colors">
                    Browse
                  </span>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleProcessClick}
                disabled={isLoading || !fileName || !productReference || !selectedPartyId}
                className={`px-5 py-2 rounded-xl font-medium text-xs flex items-center justify-center transition-all min-w-[120px] ${
                  (isLoading || !fileName || !productReference || !selectedPartyId)
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg'
                }`}
              >
                {isLoading ? 'Processing...' : 'Extract'}
              </button>
              <button
                onClick={handleClear}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-medium text-gray-700 transition-colors flex items-center"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Status Messages */}
          <div className="mt-6">
            {error && (
              <div className="flex items-center text-xs text-red-600 bg-red-50 p-3 rounded-xl">
                {error}
              </div>
            )}
            {saveStatus.success && (
              <div className="flex items-center text-xs text-green-600 bg-green-50 p-3 rounded-xl">
                {saveStatus.message}
              </div>
            )}
          </div>

          {/* Size Chart Preview */}
          {(sizeChartData.length > 0 || visualData.length > 0) && (
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xs font-bold text-gray-800">
                  Size Chart Data
                </h2>
                <button
                  onClick={handleSaveSizeChart}
                  disabled={isSaving}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center space-x-1.5 ${
                    isSaving 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-md hover:shadow-lg'
                  }`}
                >
                  {isSaving ? 'Importing...' : 'Import Size Chart'}
                </button>
              </div>

              {/* Measurements Table */}
              <div className="overflow-x-auto text-xs mt-3">
                <table className="min-w-full border border-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-1 text-left font-medium border-b border-gray-200">Measurement</th>
                      {sizes.map((size, idx) => (
                        <th key={idx} className="p-1 text-left font-medium border-b border-gray-200">
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
                        {sizes.map((size, idx) => (
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

          {/* Raw Tables Display */}
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
              {/* ... tables rendering code ... */}
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