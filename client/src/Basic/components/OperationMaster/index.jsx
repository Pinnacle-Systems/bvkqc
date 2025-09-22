import React, { useState, useCallback, useMemo } from 'react';
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
  const [showReport, setShowReport] = useState(false);

  const params = {
    companyId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userCompanyId"
    ),
  };

  const { data: sizeTableData } = useGetAllocationMasterQuery();
  const [addOperation] = useAddOperationMutation();
  const { data: operationData } = useGetOperationQuery({ params });

  // Filter out references that already have operations
  const availableReferences = useMemo(() => {
    if (!sizeTableData?.data) return [];
    
    // Get all references that already have operations
    const usedReferences = new Set();
    if (operationData?.data) {
      operationData.data.forEach(item => {
        if (item.reference) usedReferences.add(item.reference);
      });
    }
    
    // Return only references that don't have operations yet
    return [...new Set(sizeTableData.data.map(item => item.reference))]
      .filter(ref => ref && !usedReferences.has(ref));
  }, [sizeTableData, operationData]);

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

        setHeaders(jsonData[0]);
        setData(jsonData.slice(1).filter(row => row.length > 0));
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

  const clearData = () => {
    setData([]);
    setHeaders([]);
    setFileName('');
    setError('');
    setSelectedReference('');
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
      const operationsToAdd = data.map(row => ({
        data: row,
        reference: selectedReference,
        companyId: params.companyId
      }));

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

  const groupedOperations = useMemo(() => {
    if (!operationData?.data) return [];

    const map = new Map();
    operationData.data.forEach(item => {
      if (!map.has(item.reference)) {
        map.set(item.reference, {
          reference: item.reference,
          names: []
        });
      }
      map.get(item.reference).names.push(item.name);
    });

    return Array.from(map.values());
  }, [operationData]);

  return (
    <div className="min-h-screen bg-gray-50 px-3 sm:px-4 lg:px-6 py-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold text-gray-900">Operations Manager</h1>
          <button
            onClick={() => setShowReport(!showReport)}
            className="px-3 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors flex items-center text-sm"
          >
            {showReport ? 'Add New' : 'View Report'}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showReport ? "M6 18L18 6M6 6l12 12" : "M9 5l7 7-7 7"} />
            </svg>
          </button>
        </div>

        {showReport ? (
          <ReportView groupedOperations={groupedOperations} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <UploadSection 
              availableReferences={availableReferences}
              selectedReference={selectedReference}
              setSelectedReference={setSelectedReference}
              getRootProps={getRootProps}
              getInputProps={getInputProps}
              isDragActive={isDragActive}
              fileName={fileName}
              clearData={clearData}
              data={data}
              isLoading={isLoading}
              error={error}
              handleSaveOperations={handleSaveOperations}
            />
            <PreviewSection headers={headers} data={data} />
          </div>
        )}
      </div>
    </div>
  );
};

// Extracted Report View Component
const ReportView = ({ groupedOperations }) => (
  <div className="bg-white rounded-lg shadow p-4 mb-6">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-base font-semibold text-gray-800">Operations Report</h2>
      <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full">
        {groupedOperations.length} references
      </span>
    </div>
    
    {groupedOperations.length > 0 ? (
      <div className="overflow-x-auto rounded border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Operations</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {groupedOperations.map((group, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-3 py-2 text-sm font-medium text-gray-900">{group.reference}</td>
                <td className="px-3 py-2 text-sm text-gray-700">
                  <div className="flex flex-wrap gap-1">
                    {group.names.map((name, i) => (
                      <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {name}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <EmptyState 
        icon={<ReportEmptyIcon />}
        message="No operations data available"
      />
    )}
  </div>
);

const UploadSection = ({
  availableReferences,
  selectedReference,
  setSelectedReference,
  getRootProps,
  getInputProps,
  isDragActive,
  fileName,
  clearData,
  data,
  isLoading,
  error,
  handleSaveOperations
}) => (
  <div className="bg-white rounded-lg shadow p-4">
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-base font-semibold text-gray-800">Upload Operations</h2>
    </div>

    <div className="mb-3">
      <label className="block text-gray-700 text-sm font-medium mb-1">Select Reference:</label>
      <select
        className="border rounded px-2 py-1.5 w-full focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
        value={selectedReference}
        onChange={(e) => setSelectedReference(e.target.value)}
      >
        <option value="">-- Select Reference --</option>
        {availableReferences.map((ref, index) => (
          <option key={index} value={ref}>{ref}</option>
        ))}
      </select>
      {availableReferences.length === 0 && (
        <p className="text-xs text-amber-600 mt-1">
          All references already have operations. No available references to assign.
        </p>
      )}
    </div>

    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded p-4 text-center cursor-pointer transition-all duration-200 mb-3
        ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center space-y-2">
        <div className="p-2 bg-blue-100 rounded-full">
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
          </svg>
        </div>

        {isDragActive ? (
          <p className="text-blue-600 text-sm font-medium">Drop the Excel file here</p>
        ) : (
          <div>
            <p className="text-gray-700 text-sm mb-1">Drag & drop your Excel file here</p>
            <p className="text-gray-500 text-xs">or</p>
            <button className="mt-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-offset-1 text-sm">
              Browse Files
            </button>
          </div>
        )}
      </div>
    </div>

    {fileName && (
      <FileInfo fileName={fileName} clearData={clearData} />
    )}

    {data.length > 0 && selectedReference && (
      <div className="mt-4">
        <button
          onClick={handleSaveOperations}
          className="w-full px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-1 focus:ring-green-500 focus:ring-offset-1 transition-colors text-sm"
        >
          Save Operations
        </button>
      </div>
    )}

    {isLoading && <LoadingState />}
    {error && <ErrorMessage error={error} />}
  </div>
);

// Extracted Preview Section Component
const PreviewSection = ({ headers, data }) => (
  <div className="bg-white rounded-lg shadow p-4">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-base font-semibold text-gray-800">Data Preview</h2>
      {data.length > 0 && (
        <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full">
          {data.length} rows
        </span>
      )}
    </div>

    {data.length > 0 ? (
      <DataTable headers={headers} data={data} />
    ) : (
      <EmptyState 
        icon={<PreviewEmptyIcon />}
        message="Upload an Excel file to preview data"
      />
    )}
  </div>
);

// Helper Components
const FileInfo = ({ fileName, clearData }) => (
  <div className="mt-3 p-2 bg-blue-50 rounded flex items-center justify-between text-sm">
    <div className="flex items-center">
      <svg className="w-4 h-4 text-blue-600 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
      </svg>
      <span className="text-gray-700 font-medium truncate">{fileName}</span>
    </div>
    <button onClick={clearData} className="text-red-500 hover:text-red-700 text-sm">
      Clear
    </button>
  </div>
);

const LoadingState = () => (
  <div className="mt-4 flex items-center justify-center">
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
    <span className="ml-2 text-gray-600 text-sm">Processing file...</span>
  </div>
);

const ErrorMessage = ({ error }) => (
  <div className="mt-4 p-2 bg-red-50 text-red-700 rounded flex items-center text-sm">
    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
    {error}
  </div>
);

const DataTable = ({ headers, data }) => (
  <div className="overflow-x-auto rounded border border-gray-200">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          {headers.map((header, index) => (
            <th
              key={index}
              className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
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
              <td key={cellIndex} className="px-2 py-1.5 text-xs text-gray-700">
                {cell || '-'}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const EmptyState = ({ icon, message }) => (
  <div className="text-center py-8 text-gray-500 text-sm">
    {icon}
    <p>{message}</p>
  </div>
);

const ReportEmptyIcon = () => (
  <svg className="w-12 h-12 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
  </svg>
);

const PreviewEmptyIcon = () => (
  <svg className="w-12 h-12 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
  </svg>
);

export default ExcelUploader;