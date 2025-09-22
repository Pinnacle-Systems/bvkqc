import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import { useGetAllocationMasterQuery } from '../../../redux/uniformService/SizeTableMasterService';
import {
  useGetOperationQuery,
  useAddOperationMutation
} from '../../../redux/services/OprtaionMasterService';
import secureLocalStorage from 'react-secure-storage';
import { toast } from 'react-toastify';

const ExcelUploader = () => {
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [fileName, setFileName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedReference, setSelectedReference] = useState('');
  const [error, setError] = useState('');

  const params = {
    companyId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userCompanyId"
    ),
  };

  const { data: sizeTableData } = useGetAllocationMasterQuery();
  const [addOperation] = useAddOperationMutation();
  const {data:operationData} = useGetOperationQuery({params})
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

        setHeaders(jsonData[0]); // first row = headers
        setData(jsonData.slice(1).filter(row => row.length > 0)); // remove empty rows
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
    const references = [...new Set(sizeTableData?.data?.map(item => item.reference) || [])];


  const clearData = () => {
    setData([]);
    setHeaders([]);
    setFileName('');
    setError('');
  };

 const handleSaveOperations = async () => {
  if (!selectedReference) {
    toast.error("Please select a reference first");
    return;
  }

  if (data.length === 0) {
    toast.error("No data to save");
    return;
  }

  try {
    // Map all rows to an array of objects
    const operationsToAdd = data.map(row => {
      // If multiple columns exist, send as array or object
      return {
        data: row, // send entire row as array
        reference: selectedReference,
        companyId: params.companyId
      };
    });

    // Single API call sending the whole array
    await addOperation({ operations: operationsToAdd }).unwrap();

    toast.success("Operations added successfully!");
    clearData();
  } catch (err) {
    console.error("Error adding operations:", err);
    toast.error("Failed to add operations");
  }
};


  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxFiles: 1
  });

  return (
    <div className="min-h-screen bg-[f1f1f0] px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
       
        {/* Reference Selection */}
        <div className="w-72 mb-2">
          <label className="block text-gray-700 font-medium mb-2">Select Reference:</label>
          <select
            className="border rounded-md px-3 py-2 w-full"
            value={selectedReference}
            onChange={(e) => setSelectedReference(e.target.value)}
          >
            <option value="">-- Select Reference --</option>
            {references.map((ref, index) => (
            <option key={index} value={ref}>{ref}</option>
          ))}
          </select>
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
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <span className="text-gray-700 font-medium truncate">{fileName}</span>
                </div>
                <button onClick={clearData} className="text-red-500 hover:text-red-700">
                  Clear
                </button>
              </div>
            )}

            {/* Save Button */}
            {data.length > 0 && selectedReference && (
              <div className="mt-6">
                <button
                  onClick={handleSaveOperations}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  Save Operations
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
                <p>Upload an Excel file to preview data</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExcelUploader;
