import React, { useState, useEffect } from 'react';
import { useGetSizeTableMasterQuery, useGetSizeTableMasterByReferenceQuery } from "../../../redux/uniformService/SizeTableMasterService";
import secureLocalStorage from 'react-secure-storage';

export default function AQLForm() {
  const [selectedReference, setSelectedReference] = useState('');
  const [inspectionDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSize, setSelectedSize] = useState('');
  const [showSizeDropdown, setShowSizeDropdown] = useState(false);
  const [measurements, setMeasurements] = useState([]);
  const [checkValues, setCheckValues] = useState({});

  const companyId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userCompanyId"
  );

  // Fetch size table data for the selected reference
  const { data: sizeData } = useGetSizeTableMasterQuery(
    { productReference: selectedReference },
    { skip: !selectedReference }
  );

  // Fetch all references for the dropdown
  const { data: sizeTableData } = useGetSizeTableMasterByReferenceQuery();

  // Extract unique references
  const references = sizeTableData?.data?.map(item => item.reference) || [];
  const selectedProduct = sizeData?.data;
  const availableSizes = selectedProduct?.availableSizes || [];

  useEffect(() => {
    if (selectedProduct && selectedSize) {
      const measurementData = selectedProduct.measurements
        .filter(m => m.values.some(v => v.size === selectedSize))
        .map(m => {
          const valueObj = m.values.find(v => v.size === selectedSize);
          return {
            id: m.id,
            name: m.description,
            standardValue: valueObj.value,
            toleranceMin: m.toleranceMin || '0',
            toleranceMax: m.toleranceMax || '0'
          };
        });

      setMeasurements(measurementData);
      
      // Initialize check values for each measurement (7 pieces)
      const initialCheckValues = {};
      measurementData.forEach(m => {
        initialCheckValues[m.id] = Array(7).fill('');
      });
      setCheckValues(initialCheckValues);
    } else {
      setMeasurements([]);
      setCheckValues({});
    }
  }, [selectedProduct, selectedSize]);

  const handleCheckValueChange = (measurementId, pieceIndex, value) => {
    setCheckValues(prev => ({
      ...prev,
      [measurementId]: prev[measurementId].map((val, idx) => 
        idx === pieceIndex ? value : val)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = {
      reference: selectedReference,
      size: selectedSize,
      inspectionDate,
      measurements: measurements.map(m => ({
        name: m.name,
        standardValue: m.standardValue,
        tolerance: `-${m.toleranceMin}/+${m.toleranceMax}`,
        checks: checkValues[m.id] || []
      }))
    };
    console.log(formData);
    alert('AQL Form submitted successfully!');
  };

  const checkTolerance = (measurement, value) => {
    if (!value) return '';
    const numericValue = parseFloat(value);
    const standardValue = parseFloat(measurement.standardValue);
    const toleranceMin = parseFloat(measurement.toleranceMin);
    const toleranceMax = parseFloat(measurement.toleranceMax);

    const deviation = numericValue - standardValue;
    const absoluteDeviation = Math.abs(deviation);

    if (deviation < 0 && absoluteDeviation > toleranceMin) {
      return 'bg-red-100 text-red-800'; // Below minimum tolerance
    } else if (deviation > 0 && absoluteDeviation > toleranceMax) {
      return 'bg-red-100 text-red-800'; // Above maximum tolerance
    }
    return 'bg-green-100 text-green-800'; // Within tolerance
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-2 sm:px-4">
      <div className="max-w-full mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col" style={{ minHeight: 'calc(100vh - 2rem)' }}>
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-3">
            <h1 className="text-lg font-bold text-white">AQL Inspection Form</h1>
            <p className="text-blue-100 text-xs">Single-table quality control measurement</p>
          </div>

          {/* Form Content */}
          <div className="p-4 flex-1 flex flex-col">
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
              {/* Top form fields */}
              <div className="grid grid-cols-3 w-1/2 md:grid-cols-3 gap-3 mb-4">
                {/* Product Reference */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Product Reference <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={selectedReference}
                      onChange={(e) => {
                        setSelectedReference(e.target.value);
                        setSelectedSize('');
                      }}
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none bg-white"
                      required
                    >
                      <option value="">Select a reference</option>
                      {references.map((ref, index) => (
                        <option key={index} value={ref}>{ref}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                {/* Inspection Date */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Inspection Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={inspectionDate}
                      readOnly
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
                 <div className="mb-4">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Size <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowSizeDropdown(!showSizeDropdown)}
                    disabled={!selectedReference}
                    className={`w-full px-3 py-2 text-left text-xs border border-gray-300 rounded-md shadow-sm flex justify-between items-center ${
                      !selectedReference ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:border-blue-500'
                    }`}
                  >
                    <span className={selectedSize ? 'text-gray-900' : 'text-gray-500'}>
                      {selectedSize || 'Select size'}
                    </span>
                    <svg className={`h-4 w-4 text-gray-400 transition-transform ${showSizeDropdown ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {showSizeDropdown && (
                    <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 text-xs ring-1 ring-black ring-opacity-5 max-h-60 overflow-auto focus:outline-none">
                      {availableSizes.length > 0 ? (
                        availableSizes.map((size, index) => (
                          <div
                            key={index}
                            className="px-3 py-1 hover:bg-blue-50 cursor-pointer"
                            onClick={() => {
                              setSelectedSize(size);
                              setShowSizeDropdown(false);
                            }}
                          >
                            {size}
                          </div>
                        ))
                      ) : (
                        <div className="px-3 py-1 text-gray-500">No sizes available</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              </div>
              
              {/* Size dropdown */}
             

              {/* Measurement Table - This will now take remaining space */}
              {measurements.length > 0 && (
                <div className="flex-1 overflow-hidden flex flex-col mb-3">
                  <div className="overflow-auto flex-1">
                    <table className="min-w-full bg-white border border-gray-200">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th rowSpan="2" className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                            Measurement
                          </th>
                          <th rowSpan="2" className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                            Std Value
                          </th>
                          <th rowSpan="2" className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                            Tolerance
                          </th>
                          <th colSpan="7" className="px-2 py-1 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                            Pieces (1-7)
                          </th>
                        </tr>
                        <tr>
                          {[1, 2, 3, 4, 5, 6, 7].map(num => (
                            <th key={num} className="px-1 py-1 text-xs font-medium text-gray-500 uppercase tracking-wider">
                              #{num}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {measurements.map(measurement => (
                          <tr key={measurement.id}>
                            <td className="px-2 py-1 whitespace-nowrap text-xs font-medium text-gray-900">
                              {measurement.name}
                            </td>
                            <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-500">
                              {measurement.standardValue}
                            </td>
                            <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-500">
                              -{measurement.toleranceMin}/+{measurement.toleranceMax}
                            </td>
                            {checkValues[measurement.id]?.map((value, index) => (
                              <td key={index} className="px-1 py-1 whitespace-nowrap">
                                <input
                                  type="number"
                                  step="0.01"
                                  value={value}
                                  onChange={(e) => handleCheckValueChange(measurement.id, index, e.target.value)}
                                  className={`w-full px-1 py-1 text-xs border rounded-sm text-center ${
                                    value ? checkTolerance(measurement, value) : 'border-gray-300'
                                  }`}
                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedReference('');
                    setSelectedSize('');
                    setMeasurements([]);
                    setCheckValues({});
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-blue-500 transition-all"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={!selectedReference || !selectedSize || measurements.length === 0}
                  className={`px-4 py-2 rounded-md shadow-sm text-xs font-medium text-white focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-blue-500 transition-all ${
                    !selectedReference || !selectedSize || measurements.length === 0
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}