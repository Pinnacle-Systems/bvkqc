import React, { useState, useEffect } from 'react';
import { useGetSizeTableMasterQuery, useGetSizeTableMasterByReferenceQuery } from "../../../redux/uniformService/SizeTableMasterService";
import secureLocalStorage from 'react-secure-storage';
import { useAddSampleMutation } from "../../../redux/uniformService/QualityControlService";
export default function AQLForm() {
  const [selectedReference, setSelectedReference] = useState('');
  const [inspectionDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSize, setSelectedSize] = useState('');
  const [showSizeDropdown, setShowSizeDropdown] = useState(false);
  const [measurements, setMeasurements] = useState([]);
  const [checkValues, setCheckValues] = useState({});
  const [savedSizes, setSavedSizes] = useState([]);
  const [savedMeasurements, setSavedMeasurements] = useState({});
  const [formStatus, setFormStatus] = useState({
    isDirty: false,
    lastSaved: null,
    isSubmitting: false
  });

  const companyId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userCompanyId"
  );

  // Generate a unique storage key based on company and reference
  const storageKey = `aqlFormData_${companyId}_${selectedReference}`;

  // Fetch size table data
  const { data: sizeData } = useGetSizeTableMasterQuery(
    { productReference: selectedReference },
    { skip: !selectedReference }
  );

  // Fetch all references
  const { data: sizeTableData } = useGetSizeTableMasterByReferenceQuery();

  // Mutation for submitting AQL inspection
  const [submitAQLInspection] = useAddSampleMutation();

  // Extract unique references
  const references = [...new Set(sizeTableData?.data?.map(item => item.reference) || [])];
  const selectedProduct = sizeData?.data;
  const availableSizes = selectedProduct?.availableSizes || [];

  // Load saved data from localStorage
  const loadSavedData = () => {
    const savedData = secureLocalStorage.getItem(storageKey);
    if (savedData) {
      setSavedSizes(savedData.savedSizes || []);
      setSavedMeasurements(savedData.savedMeasurements || {});
      setFormStatus(prev => ({
        ...prev,
        lastSaved: new Date(savedData.lastUpdated).toLocaleString()
      }));
    } else {
      setSavedSizes([]);
      setSavedMeasurements({});
    }
    setSelectedSize('');
    setCheckValues({});
    setMeasurements([]);
  };

  // Save data to localStorage
  const saveDataToStorage = () => {
    if (!selectedReference) return;
    
    const formData = {
      savedSizes,
      savedMeasurements,
      lastUpdated: new Date().toISOString()
    };
    
    secureLocalStorage.setItem(storageKey, formData);
    setFormStatus(prev => ({
      ...prev,
      isDirty: false,
      lastSaved: new Date().toLocaleString()
    }));
  };

  // Initialize form
  useEffect(() => {
    if (selectedReference) {
      loadSavedData();
    }
  }, [selectedReference]);

  // Auto-save when data changes
  useEffect(() => {
    if (selectedReference && formStatus.isDirty) {
      const saveTimer = setTimeout(() => {
        saveDataToStorage();
      }, 1000); // Debounce saving

      return () => clearTimeout(saveTimer);
    }
  }, [savedSizes, savedMeasurements, selectedReference, formStatus.isDirty]);

  // Load measurements for selected size
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
            toleranceMax: m.toleranceMax || '0',
            unit: m.unit || ''
          };
        });

      setMeasurements(measurementData);

      // Initialize check values with saved data or empty array
      const savedSizeData = savedMeasurements[selectedSize] || {};
      const initialCheckValues = {};
       measurementData.forEach(m => {
       initialCheckValues[m.id] = savedSizeData[m.id] || Array(7).fill('');
      });

      setCheckValues(initialCheckValues);
    } else {
      setMeasurements([]);
      setCheckValues({});
    }
  }, [selectedProduct, selectedSize, savedMeasurements]);

  // Handle measurement value changes
  const handleCheckValueChange = (measurementId, pieceIndex, value) => {
    setCheckValues(prev => ({
      ...prev,
      [measurementId]: prev[measurementId].map((val, idx) =>
        idx === pieceIndex ? value : val)
    }));
    setFormStatus(prev => ({ ...prev, isDirty: true }));
  };

  // Check if all measurements for a size are complete
  const isSizeComplete = (size) => {
    const sizeData = savedMeasurements[size];
    if (!sizeData) return false;
    
    return measurements.every(measurement => {
      const values = sizeData[measurement.id];
      return values && values.length === 7 && values.every(val => val !== '');
    });
  };

  // Save current size data
  const handleSaveSize = () => {
    if (!selectedSize) return;

    // Validate all measurements are filled
    const isComplete = measurements.every(measurement => {
      return checkValues[measurement.id] &&
        checkValues[measurement.id].length === 7 &&
        checkValues[measurement.id].every(val => val !== '');
    });

    if (!isComplete) {
      alert('Please fill all measurements for all 7 pieces before saving this size.');
      return;
    }

    // Update saved measurements
    const updatedMeasurements = {
      ...savedMeasurements,
      [selectedSize]: checkValues
    };
    setSavedMeasurements(updatedMeasurements);

    // Add to saved sizes if new
    if (!savedSizes.includes(selectedSize)) {
      setSavedSizes(prev => [...prev, selectedSize]);
    }

    // Clear current selection
    setSelectedSize('');
    setShowSizeDropdown(false);
    setFormStatus(prev => ({ ...prev, isDirty: true }));
  };

  // Load a previously saved size
  const handleLoadSize = (size) => {
    setSelectedSize(size);
    setShowSizeDropdown(false);
  };

  // Submit all data to API
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (savedSizes.length === 0) {
      alert('Please save at least one size before submitting.');
      return;
    }

    // Validate all saved sizes are complete
    const allSizesComplete = savedSizes.every(size => isSizeComplete(size));
    if (!allSizesComplete) {
      alert('Please complete all measurements for all saved sizes before submitting.');
      return;
    }

    setFormStatus(prev => ({ ...prev, isSubmitting: true }));

    try {
      // Prepare submission data
      const submissionData = {
        companyId,
        reference: selectedReference,
        inspectionDate,
        sizes: savedSizes.map(size => ({
          size,
          measurements: measurements.map(m => ({
            measurementId: m.id,
            measurementName: m.name,
            standardValue: parseFloat(m.standardValue),
            toleranceMin: parseFloat(m.toleranceMin),
            toleranceMax: parseFloat(m.toleranceMax),
            unit: m.unit,
            values: savedMeasurements[size][m.id].map((val, idx) => ({
              pieceNumber: idx + 1,
              actualValue: parseFloat(val)
            }))
          }))
        }))
      };

      // Submit to API
      const response = await submitAQLInspection(submissionData).unwrap();
      
      if (response.success) {
        alert('AQL Form submitted successfully!');
        // Clear form after successful submission
        secureLocalStorage.removeItem(storageKey);
        resetForm();
      } else {
        throw new Error(response.message || 'Submission failed');
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert(`Failed to submit AQL form: ${error.message}`);
    } finally {
      setFormStatus(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  // Check if value is within tolerance
  const checkTolerance = (measurement, value) => {
    if (!value || isNaN(value)) return '';
    const numericValue = parseFloat(value);
    const standardValue = parseFloat(measurement.standardValue);
    const toleranceMin = parseFloat(measurement.toleranceMin);
    const toleranceMax = parseFloat(measurement.toleranceMax);

    const deviation = numericValue - standardValue;

    if (deviation < 0 && Math.abs(deviation) > Math.abs(toleranceMin)) {
      return 'bg-red-100 text-red-800';
    }
    else if (deviation > 0 && deviation > toleranceMax) {
      return 'bg-red-100 text-red-800';
    }
    return 'bg-green-100 text-green-800';
  };

  // Reset form completely
  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset the form? All unsaved data will be lost.')) {
      secureLocalStorage.removeItem(storageKey);
      resetForm();
    }
  };

  const resetForm = () => {
    setSelectedReference('');
    setSelectedSize('');
    setMeasurements([]);
    setCheckValues({});
    setSavedSizes([]);
    setSavedMeasurements({});
    setFormStatus({
      isDirty: false,
      lastSaved: null,
      isSubmitting: false
    });
  };


  // Manually save current progress
  const handleManualSave = () => {
    saveDataToStorage();
    alert('Form progress saved successfully!');
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

          {/* Status Bar */}
          <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
            <div className="text-xs text-gray-600">
              {formStatus.lastSaved && (
                <span>Last saved: {formStatus.lastSaved}</span>
              )}
            </div>
            <button
              type="button"
              onClick={handleManualSave}
              disabled={!formStatus.isDirty}
              className={`px-2 py-1 text-xs rounded ${!formStatus.isDirty
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
            >
              Save Progress
            </button>
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
                        setFormStatus(prev => ({ ...prev, isDirty: false }));
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

                {/* Size dropdown */}
                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Size <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowSizeDropdown(!showSizeDropdown)}
                      disabled={!selectedReference}
                      className={`w-full px-3 py-2 text-left text-xs border border-gray-300 rounded-md shadow-sm flex justify-between items-center ${!selectedReference ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:border-blue-500'
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
                              className={`px-3 py-1 hover:bg-blue-50 cursor-pointer ${savedSizes.includes(size) ? (isSizeComplete(size) ? 'bg-green-50' : 'bg-yellow-50') : ''
                                }`}
                              onClick={() => handleLoadSize(size)}
                            >
                              <div className="flex justify-between items-center">
                                <span>{size}</span>
                                {savedSizes.includes(size) && (
                                  <span className={isSizeComplete(size) ? 'text-green-500' : 'text-yellow-500'}>
                                    {isSizeComplete(size) ? '✓' : '...'}
                                  </span>
                                )}
                              </div>
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

              {/* Saved sizes indicator */}
              {savedSizes.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-700 mb-1">Completed Sizes:</p>
                  <div className="flex flex-wrap gap-2">
                    {savedSizes.map((size, index) => (
                      <span
                        key={index}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer ${isSizeComplete(size)
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                          }`}
                        onClick={() => handleLoadSize(size)}
                      >
                        {size}
                        {isSizeComplete(size) ? ' ✓' : ' ...'}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Measurement Table */}
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
                              {measurement.name} ({measurement.unit})
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
                                  className={`w-full px-1 py-1 text-xs border rounded-sm text-center ${value ? checkTolerance(measurement, value) : 'border-gray-300'
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
                  onClick={handleReset}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-blue-500 transition-all"
                >
                  Reset
                </button>

                {measurements.length > 0 && !savedSizes.includes(selectedSize) && (
                  <button
                    type="button"
                    onClick={handleSaveSize}
                    disabled={!selectedSize}
                    className={`px-4 py-2 rounded-md shadow-sm text-xs font-medium text-white focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-blue-500 transition-all ${!selectedSize
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                  >
                    Save Size
                  </button>
                )}

                <button
                  type="submit"
                  disabled={savedSizes.length === 0 || !savedSizes.every(size => isSizeComplete(size)) || formStatus.isSubmitting}
                  className={`px-4 py-2 rounded-md shadow-sm text-xs font-medium text-white focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-blue-500 transition-all ${savedSizes.length === 0 || !savedSizes.every(size => isSizeComplete(size))
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700'
                    }`}
                >
                  {formStatus.isSubmitting ? 'Submitting...' : 'Submit All'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}