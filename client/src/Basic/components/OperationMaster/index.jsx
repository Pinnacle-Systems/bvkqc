import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import { useGetAllocationMasterQuery } from '../../../redux/uniformService/SizeTableMasterService';
import {
  useGetOperationQuery,
  useAddOperationMutation,
  useGetOperationByIdQuery,
  useDeleteOperationMutation,
  useUpdateOperationMutation
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
  const [editingOperation, setEditingOperation] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const params = {
    companyId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userCompanyId"
    ),
  };

  const { data: sizeTableData } = useGetAllocationMasterQuery();
  const [addOperation] = useAddOperationMutation();
  const [updateOperation] = useUpdateOperationMutation();
  const [deleteOperation] = useDeleteOperationMutation();
  const { data: operationByIdData } = useGetOperationByIdQuery(selectedReference, { skip: !selectedReference });
  const { data: operationData, refetch: refetchOperations } = useGetOperationQuery({ params });

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
      refetchOperations();
    } catch (err) {
      console.error("Error adding operations:", err);
      toast.error("Failed to add operations");
    }
  };

  const handleEditOperation = (operation) => {
    setEditingOperation(operation);
    setIsEditModalOpen(true);
  };

  const handleUpdateOperation = async (updatedData) => {
    try {
      await updateOperation({
        id: editingOperation.id,
        ...updatedData
      }).unwrap();
      toast.success("Operation updated successfully!");
      setIsEditModalOpen(false);
      setEditingOperation(null);
      refetchOperations();
    } catch (err) {
      console.error("Error updating operation:", err);
      toast.error("Failed to update operation");
    }
  };

  const handleDeleteOperation = async (operationId) => {
    if (window.confirm("Are you sure you want to delete this operation?")) {
      try {
        await deleteOperation(operationId).unwrap();
        toast.success("Operation deleted successfully!");
        refetchOperations();
      } catch (err) {
        console.error("Error deleting operation:", err);
        toast.error("Failed to delete operation");
      }
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
          operations: []
        });
      }
      map.get(item.reference).operations.push(item);
    });

    return Array.from(map.values());
  }, [operationData]);

  return (
    <div className="min-h-screen bg-gray-50 px-3 sm:px-4 lg:px-6 py-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Operations Manager</h1>
          <button
            onClick={() => setShowReport(!showReport)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center text-sm font-medium shadow-md hover:shadow-lg"
          >
            {showReport ? 'Add New Operation' : 'View Operations Report'}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showReport ? "M6 18L18 6M6 6l12 12" : "M9 5l7 7-7 7"} />
            </svg>
          </button>
        </div>

        {showReport ? (
          <ReportView 
            groupedOperations={groupedOperations} 
            onEdit={handleEditOperation}
            onDelete={handleDeleteOperation}
          />
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

        {isEditModalOpen && (
          <EditOperationModal
            operation={editingOperation}
            onClose={() => {
              setIsEditModalOpen(false);
              setEditingOperation(null);
            }}
            onSave={handleUpdateOperation}
          />
        )}
      </div>
    </div>
  );
};

// Edit Operation Modal Component
const EditOperationModal = ({ operation, onClose, onSave }) => {
  const [formData, setFormData] = useState(operation || {});

  useEffect(() => {
    setFormData(operation || {});
  }, [operation]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Edit Operation</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-4">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">Operation Name</label>
            <input
              type="text"
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">Reference</label>
            <input
              type="text"
              name="reference"
              value={formData.reference || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Enhanced Report View Component with Edit/Delete Actions
const ReportView = ({ groupedOperations, onEdit, onDelete }) => (
  <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
    {/* <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
      <h2 className="text-lg font-semibold text-gray-800">Operations Report</h2>
      <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full">
        {groupedOperations.length} references
      </span>
    </div> */}
    
    {groupedOperations.length > 0 ? (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Operations</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {groupedOperations.map((group, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>{console.log(group, "group") }
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{group.reference}</td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  <div className="flex flex-wrap gap-2">
                    {group.operations.map((operation, i) => (
                      <span key={i} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {operation.name}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onEdit(group.operations)}
                      className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-100"
                      title="Edit"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onDelete(group.operations[0].id)}
                      className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-100"
                      title="Delete"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
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
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-semibold text-gray-800">Upload Operations</h2>
      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
        Step 1 of 2
      </span>
    </div>

    <div className="mb-4">
      <label className="block text-gray-700 text-sm font-medium mb-2">Select Reference:</label>
      <select
        className="border rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm shadow-sm"
        value={selectedReference}
        onChange={(e) => setSelectedReference(e.target.value)}
      >
        <option value="">-- Select Reference --</option>
        {availableReferences.map((ref, index) => (
          <option key={index} value={ref}>{ref}</option>
        ))}
      </select>
      {availableReferences.length === 0 && (
        <p className="text-xs text-amber-600 mt-2">
          All references already have operations. No available references to assign.
        </p>
      )}
    </div>

    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200 mb-4
        ${isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400'}`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center space-y-3">
        <div className="p-3 bg-indigo-100 rounded-full">
          <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
          </svg>
        </div>

        {isDragActive ? (
          <p className="text-indigo-600 text-sm font-medium">Drop the Excel file here</p>
        ) : (
          <div>
            <p className="text-gray-700 text-sm mb-2">Drag & drop your Excel file here</p>
            <p className="text-gray-500 text-xs mb-2">Supported formats: .xls, .xlsx</p>
            <button className="mt-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 text-sm font-medium shadow-sm">
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
      <div className="mt-6 pt-4 border-t border-gray-200">
        <button
          onClick={handleSaveOperations}
          disabled={isLoading}
          className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors text-sm font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : 'Save Operations'}
        </button>
      </div>
    )}

    {isLoading && <LoadingState />}
    {error && <ErrorMessage error={error} />}
  </div>
);

const PreviewSection = ({ headers, data }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-semibold text-gray-800">Data Preview</h2>
      {data.length > 0 && (
        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
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
  <div className="mt-4 p-3 bg-blue-50 rounded-md flex items-center justify-between text-sm border border-blue-100">
    <div className="flex items-center">
      <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
      </svg>
      <span className="text-gray-700 font-medium truncate">{fileName}</span>
    </div>
    <button 
      onClick={clearData} 
      className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center"
    >
      Clear
      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
);

const LoadingState = () => (
  <div className="mt-4 flex items-center justify-center py-4">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    <span className="ml-3 text-gray-600 text-sm">Processing file...</span>
  </div>
);

const ErrorMessage = ({ error }) => (
  <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md flex items-center text-sm border border-red-100">
    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
    {error}
  </div>
);

const DataTable = ({ headers, data }) => (
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
);

const EmptyState = ({ icon, message }) => (
  <div className="text-center py-8 text-gray-500 text-sm">
    {icon}
    <p className="mt-2">{message}</p>
  </div>
);

const ReportEmptyIcon = () => (
  <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
  </svg>
);

const PreviewEmptyIcon = () => (
  <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
  </svg>
);

export default ExcelUploader;