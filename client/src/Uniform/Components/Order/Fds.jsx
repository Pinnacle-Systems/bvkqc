import React, { useState, useEffect } from 'react';
import { useGetSizeTableMasterQuery, useGetSizeTableMasterByReferenceQuery } from "../../../redux/uniformService/SizeTableMasterService";
import secureLocalStorage from 'react-secure-storage';

export default function AQLForm() {
  const [selectedReference, setSelectedReference] = useState('');
  const [inspectionDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSize, setSelectedSize] = useState('');
  const [showSizeDropdown, setShowSizeDropdown] = useState(false);
  const [selectedMeasurementDetails, setSelectedMeasurementDetails] = useState([]);
  const [checkLists, setCheckLists] = useState({});
  const [activeTab, setActiveTab] = useState('');

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
      const measurements = selectedProduct.measurements
        .filter(m => m.values.some(v => v.size === selectedSize))
        .map(m => {
          const valueObj = m.values.find(v => v.size === selectedSize);
          return {
            id: m.id,
            description: m.description,
            standardValue: valueObj.value,
            toleranceMin: m.toleranceMin || '0',
            toleranceMax: m.toleranceMax || '0',
            checkList: Array(7).fill('')
          };
        });

      setSelectedMeasurementDetails(measurements);
      
      // Initialize checkLists for each measurement
      const initialCheckLists = {};
      measurements.forEach(m => {
        initialCheckLists[m.id] = Array(7).fill('');
      });
      setCheckLists(initialCheckLists);
      
      // Set first measurement as active tab if available
      if (measurements.length > 0) {
        setActiveTab(measurements[0].id);
      }
    } else {
      setSelectedMeasurementDetails([]);
      setCheckLists({});
      setActiveTab('');
    }
  }, [selectedProduct, selectedSize]);

  const handleCheckListChange = (measurementId, index, value) => {
    setCheckLists(prev => ({
      ...prev,
      [measurementId]: prev[measurementId].map((item, i) => 
        i === index ? value : item)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = {
      selectedReference,
      inspectionDate,
      selectedSize,
      measurements: selectedMeasurementDetails.map(m => ({
        measurement: m.description,
        standardValue: m.standardValue,
        tolerance: `-${m.toleranceMin}/+${m.toleranceMax}`,
        checkList: checkLists[m.id] || []
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
      return 'text-red-600'; // Below minimum tolerance
    } else if (deviation > 0 && absoluteDeviation > toleranceMax) {
      return 'text-red-600'; // Above maximum tolerance
    }
    return 'text-green-600'; // Within tolerance
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">AQL Inspection Form</h1>
            <p className="text-blue-100">Comprehensive quality control measurement form</p>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Product Reference */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Reference <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={selectedReference}
                      onChange={(e) => {
                        setSelectedReference(e.target.value);
                        setSelectedSize('');
                      }}
                      className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none bg-white"
                      required
                    >
                      <option value="">Select a reference</option>
                      {references.map((ref, index) => (
                        <option key={index} value={ref}>{ref}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                {/* Inspection Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Inspection Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={inspectionDate}
                      readOnly
                      className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg shadow-sm bg-gray-100 cursor-not-allowed"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Size Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Size <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowSizeDropdown(!showSizeDropdown)}
                    disabled={!selectedReference}
                    className={`w-full px-4 py-3 text-left text-sm border border-gray-300 rounded-lg shadow-sm flex justify-between items-center ${
                      !selectedReference ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:border-blue-500'
                    }`}
                  >
                    <span className={selectedSize ? 'text-gray-900' : 'text-gray-500'}>
                      {selectedSize || 'Select size'}
                    </span>
                    <svg className={`h-5 w-5 text-gray-400 transition-transform ${showSizeDropdown ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {showSizeDropdown && (
                    <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 max-h-60 overflow-auto focus:outline-none sm:text-sm">
                      {availableSizes.length > 0 ? (
                        availableSizes.map((size, index) => (
                          <div
                            key={index}
                            className="px-4 py-2 hover:bg-blue-50 cursor-pointer"
                            onClick={() => {
                              setSelectedSize(size);
                              setShowSizeDropdown(false);
                            }}
                          >
                            {size}
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-2 text-gray-500">No sizes available</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Measurement Tabs */}
              {selectedMeasurementDetails.length > 0 && (
                <div className="mb-6">
                  <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8 overflow-x-auto">
                      {selectedMeasurementDetails.map((measurement) => (
                        <button
                          key={measurement.id}
                          onClick={() => setActiveTab(measurement.id)}
                          className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === measurement.id
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          {measurement.description}
                        </button>
                      ))}
                    </nav>
                  </div>
                </div>
              )}

              {/* Measurement Details Table */}
              {selectedMeasurementDetails.length > 0 && (
                <div className="mb-8">
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Measurement</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Standard Value</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tolerance Range</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedMeasurementDetails
                          .filter(m => m.id === activeTab)
                          .map((measurement) => (
                            <tr key={measurement.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {measurement.description}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {measurement.standardValue}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                -{measurement.toleranceMin} / +{measurement.toleranceMax}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Check List Table */}
              {activeTab && (
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Quality Check Measurements (7 Pieces)</h3>
                    {selectedMeasurementDetails.find(m => m.id === activeTab) && (
                      <span className="text-sm text-gray-500">
                        Expected: {
                          selectedMeasurementDetails.find(m => m.id === activeTab).standardValue
                        } (Tolerance: -{
                          selectedMeasurementDetails.find(m => m.id === activeTab).toleranceMin
                        }/+{
                          selectedMeasurementDetails.find(m => m.id === activeTab).toleranceMax
                        })
                      </span>
                    )}
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Piece #</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Measured Value</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deviation</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {activeTab && checkLists[activeTab]?.map((value, index) => {
                          const measurement = selectedMeasurementDetails.find(m => m.id === activeTab);
                          if (!measurement) return null;

                          const deviation = value
                            ? (parseFloat(value) - parseFloat(measurement.standardValue)).toFixed(2)
                            : '';

                          const statusClass = value ? checkTolerance(measurement, value) : '';

                          const statusText = value
                            ? Math.abs(parseFloat(deviation)) <=
                              Math.max(
                                parseFloat(measurement.toleranceMin),
                                parseFloat(measurement.toleranceMax)
                              )
                              ? 'Within Tolerance'
                              : 'Out of Tolerance'
                            : '';

                          return (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                Piece {index + 1}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <input
                                  type="number"
                                  step="0.01"
                                  value={value}
                                  onChange={(e) => handleCheckListChange(activeTab, index, e.target.value)}
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="Enter value"
                                />
                              </td>
                              <td className={`px-6 py-4 whitespace-nowrap text-sm ${statusClass}`}>
                                {deviation !== ''
                                  ? parseFloat(deviation) > 0
                                    ? `+${deviation}`
                                    : deviation
                                  : '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                {statusText && (
                                  <span
                                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                      statusText === 'Within Tolerance'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                    }`}
                                  >
                                    {statusText}
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedReference('');
                    setSelectedSize('');
                    setSelectedMeasurementDetails([]);
                    setCheckLists({});
                    setActiveTab('');
                  }}
                  className="px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                >
                  Reset Form
                </button>
                <button
                  type="submit"
                  disabled={!selectedReference || !selectedSize || selectedMeasurementDetails.length === 0}
                  className={`px-6 py-3 rounded-lg shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all ${
                    !selectedReference || !selectedSize || selectedMeasurementDetails.length === 0
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  Submit Inspection
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}