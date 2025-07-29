import React, { useState, useEffect } from 'react';
import { useGetSizeTableMasterQuery, useGetAllocationMasterQuery } from "../../../redux/uniformService/SizeTableMasterService";
import secureLocalStorage from 'react-secure-storage';
import { useAddAqlInspectionMutation, useGetAqlInspectionsQuery, useDeleteAqlInspectionMutation } from "../../../redux/uniformService/AqlInspectionService";
import Mastertable from '../MasterTable/Mastertable';
import { toast } from 'react-toastify';

const Aql = () => {
  const [selectedReference, setSelectedReference] = useState('');
  const [inspectionDate] = useState(new Date().toISOString().split('T')[0]);
  const [id, setId] = useState('')
  const [selectedSize, setSelectedSize] = useState('');
  const [showSizeDropdown, setShowSizeDropdown] = useState(false);
  const [allMeasurementsCache, setAllMeasurementsCache] = useState({});
  const [measurements, setMeasurements] = useState([]);
  const [checkValues, setCheckValues] = useState({});
  const [savedSizes, setSavedSizes] = useState([]);
  const [savedMeasurements, setSavedMeasurements] = useState({});
  const [partialSavedMeasurements, setPartialSavedMeasurements] = useState({});
  const [formStatus, setFormStatus] = useState({
    isDirty: false,
    lastSaved: null,
    isSubmitting: false
  });
  const [readOnly, setReadOnly] = useState(false);
  const { data: aqlData } = useGetAqlInspectionsQuery();
  const PIECES_COUNT = 5; // Changed from 7 to 5 pieces

  const companyId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userCompanyId"
  );

  const storageKey = `aqlFormData_${companyId}_${selectedReference}`;

  const { data: sizeData } = useGetSizeTableMasterQuery(
    { productReference: selectedReference },
    { skip: !selectedReference }
  );

  const { data: sizeTableData } = useGetAllocationMasterQuery();
  const [addAqlInspection, { isLoading: isSubmitting }] = useAddAqlInspectionMutation();
  const [removeData] = useDeleteAqlInspectionMutation();
  const [mergedReportData, setMergedReportData] = useState([])

  const references = [...new Set(sizeTableData?.data?.map(item => item.reference) || [])];
  const selectedProduct = sizeData?.data;
  const availableSizes = selectedProduct?.availableSizes || [];
  useEffect(() => {
    if (sizeTableData?.data && aqlData?.data) {
      const merged = aqlData.data.map(aqlItem => {
        // Find matching allocation(s) by reference
        const matchingAllocations = sizeTableData.data.filter(
          allocItem => allocItem.reference === aqlItem.reference
        );

        return {
          ...aqlItem,
          allocations: matchingAllocations,
          // Include specific allocation details you need
          allocationDetails: matchingAllocations.map(alloc => ({
            id: alloc.id,
            partyName: alloc.Party?.name,
            lineName: alloc.LineMaster?.lineName,
            deliveryDate: alloc.DeliveryDate,
            allocationDate: alloc.allocationDate
          }))
        };
      });

      setMergedReportData(merged);
    }
  }, [sizeTableData, aqlData]);

  // Table configuration for the merged report
  const tableHeaders = [
    "ID",
    "Reference",
    "Inspection Date",
    "Party",
    "Line",
    "Delivery Date",
   
  ];

  const tableDataNames = [
    "dataObj?.id",
    "dataObj?.reference",
    "new Date(dataObj?.inspectionDate).toLocaleDateString()",
    "dataObj?.allocationDetails?.[0]?.partyName || 'N/A'",
    "dataObj?.allocationDetails?.[0]?.lineName || 'N/A'",
    "dataObj?.allocationDetails?.[0]?.deliveryDate ? new Date(dataObj.allocationDetails[0].deliveryDate).toLocaleDateString() : 'N/A'",
  
  ];


  const loadSavedData = () => {
    const savedData = secureLocalStorage.getItem(storageKey);
    if (savedData) {
      setSavedSizes(savedData.savedSizes || []);
      setSavedMeasurements(savedData.savedMeasurements || {});
      setPartialSavedMeasurements(savedData.partialSavedMeasurements || {});
      setFormStatus(prev => ({
        ...prev,
        lastSaved: new Date(savedData.lastUpdated).toLocaleString()
      }));

      if (savedData.savedSizes?.length > 0 && !selectedSize) {
        setSelectedSize(savedData.savedSizes[0]);
      }
    } else {
      setSavedSizes([]);
      setSavedMeasurements({});
      setPartialSavedMeasurements({});
    }
  };

  const saveDataToStorage = () => {
    if (!selectedReference) return;

    const formData = {
      savedSizes,
      savedMeasurements,
      partialSavedMeasurements,
      lastUpdated: new Date().toISOString()
    };

    secureLocalStorage.setItem(storageKey, formData);
    setFormStatus(prev => ({
      ...prev,
      isDirty: false,
      lastSaved: new Date().toLocaleString()
    }));
  };

  useEffect(() => {
    if (selectedReference) {
      loadSavedData();
    } else {
      resetForm();
    }
  }, [selectedReference]);

  useEffect(() => {
    if (selectedReference && formStatus.isDirty) {
      const saveTimer = setTimeout(() => {
        saveDataToStorage();
      }, 1000);

      return () => clearTimeout(saveTimer);
    }
  }, [savedSizes, savedMeasurements, partialSavedMeasurements, selectedReference, formStatus.isDirty]);

  useEffect(() => {
    if (selectedProduct && selectedSize) {
      const measurementData = selectedProduct.measurements
        ?.filter(m => m.values?.some(v => v.size === selectedSize))
        ?.map(m => {
          const valueObj = m.values?.find(v => v.size === selectedSize);
          return {
            id: m.id,
            name: m.description,
            standardValue: valueObj?.value,
            toleranceMin: m.toleranceMin || '0',
            toleranceMax: m.toleranceMax || '0',
            unit: m.unit || ''
          };
        }) || [];

      setMeasurements(measurementData);

      const savedData = savedMeasurements[selectedSize] || partialSavedMeasurements[selectedSize] || {};
      const initialCheckValues = {};
      measurementData.forEach(m => {
        initialCheckValues[m.id] = savedData[m.id] || Array(PIECES_COUNT).fill('');
      });

      setCheckValues(initialCheckValues);
    } else {
      setMeasurements([]);
      setCheckValues({});
    }
  }, [selectedProduct, selectedSize, savedMeasurements, partialSavedMeasurements]);

  const handleCheckValueChange = (measurementId, pieceIndex, value) => {
    setCheckValues(prev => ({
      ...prev,
      [measurementId]: prev[measurementId].map((val, idx) =>
        idx === pieceIndex ? value : val)
    }));
    setFormStatus(prev => ({ ...prev, isDirty: true }));
  };

  const isSizeComplete = (size) => {
    const sizeData = savedMeasurements[size];
    if (!sizeData) return false;

    return measurements.every(measurement => {
      const values = sizeData[measurement.id];
      return values && values.length === PIECES_COUNT && values.every(val => val !== '');
    });
  };

  const isSizePartiallySaved = (size) => {
    return partialSavedMeasurements.hasOwnProperty(size) &&
      !isSizeComplete(size);
  };

  const handlePartialSave = () => {
    if (!selectedSize) return;

    const updatedPartialMeasurements = {
      ...partialSavedMeasurements,
      [selectedSize]: checkValues
    };
    setPartialSavedMeasurements(updatedPartialMeasurements);

    if (!savedSizes.includes(selectedSize)) {
      setSavedSizes(prev => [...prev, selectedSize]);
    }

    setFormStatus(prev => ({ ...prev, isDirty: true }));
    alert('Partially saved measurements for this size.');
  };

  const handleSaveSize = () => {
    if (!selectedSize) return;

    const isComplete = measurements.every(measurement => {
      return checkValues[measurement.id] &&
        checkValues[measurement.id].length === PIECES_COUNT &&
        checkValues[measurement.id].every(val => val !== '');
    });

    if (!isComplete) {
      alert(`Please fill all measurements for all ${PIECES_COUNT} pieces before fully saving this size.`);
      return;
    }

    const updatedMeasurements = {
      ...savedMeasurements,
      [selectedSize]: checkValues
    };
    setSavedMeasurements(updatedMeasurements);

    const updatedPartial = { ...partialSavedMeasurements };
    delete updatedPartial[selectedSize];
    setPartialSavedMeasurements(updatedPartial);

    if (!savedSizes.includes(selectedSize)) {
      setSavedSizes(prev => [...prev, selectedSize]);
    }

    setSelectedSize('');
    setShowSizeDropdown(false);
    setFormStatus(prev => ({ ...prev, isDirty: true }));
  };

  const handleLoadSize = (size) => {
    setSelectedSize(size);
    setShowSizeDropdown(false);
  };

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

  const prepareDatabasePayload = () => {
    // Only include sizes that have complete measurements
    const validSamples = savedSizes.filter(size =>
      isSizeComplete(size)
    ).map(size => ({
      size: size,
      measurements: measurements.map(measurement => ({
        measurementId: measurement.id,
        measurementName: measurement.name,
        standardValue: measurement.standardValue.toString(),
        toleranceMin: measurement.toleranceMin.toString(),
        toleranceMax: measurement.toleranceMax.toString(),
        unit: measurement.unit,
        values: (savedMeasurements[size]?.[measurement.id] || []).map((value, index) => ({
          pieceNumber: index + 1,
          actualValue: value.toString(),
          status: value ? checkTolerance(measurement, value).includes('red') ? 'out_of_tolerance' : 'within_tolerance' : 'not_measured'
        }))
      }))
    }));

    return {
      companyId: companyId.toString(),
      reference: selectedReference,
      inspectionDate: new Date(inspectionDate),
      samples: validSamples
    };
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validSamples = savedSizes.filter(size => isSizeComplete(size));
    if (validSamples.length === 0) {
      alert('Please save at least one complete size (all measurements filled) before submitting.');
      return;
    }

    setFormStatus(prev => ({ ...prev, isSubmitting: true }));

    try {
      const payload = prepareDatabasePayload();

      const response = await addAqlInspection(payload).unwrap();

      if (response.success) {
        alert('AQL Form submitted successfully!');
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
    setPartialSavedMeasurements({});
    setFormStatus({
      isDirty: false,
      lastSaved: null,
      isSubmitting: false
    });
  };

  const handleManualSave = () => {
    saveDataToStorage();
    alert('Form progress saved successfully!');
  };

  const getSizeStatus = (size) => {
    if (isSizeComplete(size)) return 'complete';
    if (isSizePartiallySaved(size)) return 'partial';
    return 'none';
  };

  const onDataClick = (id) => {
    setId(id);
    console.log("AQL report item clicked:", id);
  };

  const deleteData = async () => {
    if (id) {
      if (!window.confirm("Are you sure to delete...?")) {
        return;
      }
      try {
        await removeData(id);
        setId("");
        toast.success("Deleted Successfully");
      } catch (error) {
        toast.error("something went wrong");
      }
    }
  };

  return (
    <>
      <Mastertable
        header={`AQL Inspection Report`}
        onDataClick={onDataClick}
        tableHeaders={tableHeaders}
        tableDataNames={tableDataNames}
        data={mergedReportData}
        setReadOnly={setReadOnly}
        deleteData={deleteData}
      />
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

            <div className="p-4 flex-1 flex flex-col">
              <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
                <div className="grid grid-cols-3 w-1/2 md:grid-cols-3 gap-3 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Order Id <span className="text-red-500">*</span>
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
                        className={`w-full px-3 py-2 text-left text-xs border rounded-md shadow-sm flex justify-between items-center ${!selectedReference ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:border-blue-500'
                          } ${selectedSize ? 'border-blue-500' : 'border-gray-300'}`}
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
                            availableSizes.map((size, index) => {
                              const status = getSizeStatus(size);
                              return (
                                <div
                                  key={index}
                                  className={`px-3 py-1 hover:bg-blue-50 cursor-pointer flex justify-between items-center ${status === 'complete' ? 'bg-green-50' :
                                    status === 'partial' ? 'bg-yellow-50' : ''
                                    } ${selectedSize === size ? 'bg-blue-50' : ''}`}
                                  onClick={() => handleLoadSize(size)}
                                >
                                  <span>{size}</span>
                                  <div className="flex items-center">
                                    {status === 'complete' && (
                                      <span className="text-green-500 ml-2">✓</span>
                                    )}
                                    {status === 'partial' && (
                                      <span className="text-yellow-500 ml-2">~</span>
                                    )}
                                  </div>
                                </div>
                              );
                            })
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
                    <p className="text-xs font-medium text-gray-700 mb-1">Saved Sizes:</p>
                    <div className="flex flex-wrap gap-2">
                      {savedSizes.map((size, index) => {
                        const status = getSizeStatus(size);
                        return (
                          <button
                            key={index}
                            type="button"
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${selectedSize === size ? 'ring-2 ring-blue-500' : ''
                              } ${status === 'complete' ? 'bg-green-100 text-green-800' :
                                status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                              }`}
                            onClick={() => handleLoadSize(size)}
                          >
                            {size}
                            {status === 'complete' && (
                              <span className="ml-1">✓</span>
                            )}
                            {status === 'partial' && (
                              <span className="ml-1">~</span>
                            )}
                          </button>
                        );
                      })}
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
                            <th colSpan={PIECES_COUNT} className="px-2 py-1 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                              Pieces (1-{PIECES_COUNT})
                            </th>
                          </tr>
                          <tr>
                            {Array.from({ length: PIECES_COUNT }, (_, i) => i + 1).map(num => (
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
                                    type="text"
                                    value={value}
                                    onChange={(e) => {
                                      let raw = e.target.value;

                                      // Remove any non-digit or dot character except one dot
                                      raw = raw.replace(/[^\d.]/g, '');

                                      // Prevent multiple decimals
                                      const parts = raw.split('.');
                                      if (parts.length > 2) return;

                                      // Limit to 2 digits after decimal
                                      if (parts[1]?.length > 2) return;

                                      handleCheckValueChange(measurement.id, index, raw);
                                    }}
                                    onBlur={(e) => {
                                      let val = e.target.value;

                                      // If whole number or longer, format by dividing by 10
                                      if (/^\d{3}$/.test(val)) {
                                        val = (parseFloat(val) / 10).toFixed(2); // e.g. 233 → 23.30
                                      } else {
                                        val = parseFloat(val || 0).toFixed(2);
                                      }

                                      handleCheckValueChange(measurement.id, index, val);
                                    }}
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

                  {measurements.length > 0 && (
                    <>
                      <button
                        type="button"
                        onClick={handlePartialSave}
                        disabled={!selectedSize}
                        className={`px-4 py-2 rounded-md shadow-sm text-xs font-medium text-white focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-blue-500 transition-all ${!selectedSize
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-yellow-500 hover:bg-yellow-600'
                          }`}
                      >
                        Partial Save
                      </button>

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
                    </>
                  )}

                  <button
                    type="submit"
                    disabled={savedSizes.filter(size => isSizeComplete(size)).length === 0 || isSubmitting}
                    className={`px-4 py-2 rounded-md shadow-sm text-xs font-medium text-white focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-blue-500 transition-all ${savedSizes.filter(size => isSizeComplete(size)).length === 0
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700'
                      }`}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit All'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Aql;