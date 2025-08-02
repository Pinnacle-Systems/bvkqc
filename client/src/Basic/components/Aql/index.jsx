import React, { useState, useEffect, useCallback } from 'react';
import { useGetSizeTableMasterQuery, useGetAllocationMasterQuery } from "../../../redux/uniformService/SizeTableMasterService";
import secureLocalStorage from 'react-secure-storage';
import { useAddAqlInspectionMutation, useGetAqlInspectionsQuery, useGetAqlInspectionByIdQuery, useDeleteAqlInspectionMutation, useUpdateAqlInspectionMutation } from "../../../redux/uniformService/AqlInspectionService";
import Mastertable from '../MasterTable/MaterTable1.jsx';
import { toast } from 'react-toastify';

const Aql = () => {
  const [selectedReference, setSelectedReference] = useState('');
  const [inspectionDate, setInspectionDate] = useState(new Date().toISOString().split('T')[0]);
  const [id, setId] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [newItem, setNewItem] = useState(false);

  const [showSizeDropdown, setShowSizeDropdown] = useState(false);
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
  const PIECES_COUNT = 5;
  const companyId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userCompanyId"
  );
  const storageKey = `aqlFormData_${companyId}_${selectedReference}`;

  const { data: sizeData } = useGetSizeTableMasterQuery(
    { productReference: selectedReference },
    { skip: !selectedReference }
  );
  const {
    data: singleData,
    isLoading: isSingleLoading,
    isFetching: isSingleFetching
  } = useGetAqlInspectionByIdQuery(id, { skip: !id });

  const { data: sizeTableData } = useGetAllocationMasterQuery();
  const [addAqlInspection, { isLoading: isSubmitting }] = useAddAqlInspectionMutation();
  const [removeData] = useDeleteAqlInspectionMutation();
  const [mergedReportData, setMergedReportData] = useState([]);

  const references = [...new Set(sizeTableData?.data?.map(item => item.reference) || [])];
  const selectedProduct = sizeData?.data;
  const availableSizes = selectedProduct?.availableSizes || [];

  useEffect(() => {
    if (sizeTableData?.data && aqlData?.data) {
      const merged = aqlData.data.map(aqlItem => {
        const matchingAllocations = sizeTableData.data.filter(
          allocItem => allocItem.reference === aqlItem.reference
        );

        return {
          ...aqlItem,
          allocations: matchingAllocations,
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
      if (id) return
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

  const syncFormWithDb = useCallback((data) => {
    if (!data) return;
    setSelectedReference(data.reference || '');
    if (data.inspectionDate) {
      setInspectionDate(new Date(data.inspectionDate).toISOString().split('T')[0]);
    }

    const savedSizesArr = data.samples?.map(sample => sample.size) || [];
    setSavedSizes(savedSizesArr);

    const savedMeas = {};

    data.samples?.forEach(sample => {
      const size = sample.size;
      savedMeas[size] = {};

      sample.measurements?.forEach(measurement => {
        const values = Array(PIECES_COUNT).fill('');
        measurement.values?.slice(0, PIECES_COUNT).forEach(valueObj => {
          if (valueObj.pieceNumber <= PIECES_COUNT) {
            values[valueObj.pieceNumber - 1] = valueObj.actualValue.toString();
          }
        });

        savedMeas[size][measurement.measurementId] = values;
      });
    });

    setSavedMeasurements(savedMeas);
    setPartialSavedMeasurements({});

    if (savedSizesArr.length > 0) {
      setSelectedSize(savedSizesArr[0]);
    }
    setReadOnly(true);
  }, []);

  useEffect(() => {
    if (singleData?.data && !formStatus.isDirty) {
      syncFormWithDb(singleData.data);
    }
  }, [singleData, syncFormWithDb, formStatus.isDirty]);

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

      const sizeData = savedMeasurements[selectedSize] || partialSavedMeasurements[selectedSize] || {};
      const initialCheckValues = {};

      measurementData.forEach(m => {
        initialCheckValues[m.id] = sizeData[m.id] || Array(PIECES_COUNT).fill('');
      });

      setCheckValues(initialCheckValues);
    } else {
      setMeasurements([]);
      setCheckValues({});
    }
  }, [selectedProduct, selectedSize, savedMeasurements, partialSavedMeasurements]);

  const handleCheckValueChange = (measurementId, pieceIndex, value) => {
    if (readOnly) return;

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
    if (!selectedSize || readOnly) return;

    const updatedPartialMeasurements = {
      ...partialSavedMeasurements,
      [selectedSize]: checkValues
    };
    setPartialSavedMeasurements(updatedPartialMeasurements);

    if (!savedSizes.includes(selectedSize)) {
      setSavedSizes(prev => [...prev, selectedSize]);
    }

    setFormStatus(prev => ({ ...prev, isDirty: true }));
    toast.info('Partially saved measurements for this size.');
  };

  const handleSaveSize = () => {
    if (!selectedSize || readOnly) return;

    const isComplete = measurements.every(measurement => {
      return checkValues[measurement.id] &&
        checkValues[measurement.id].length === PIECES_COUNT &&
        checkValues[measurement.id].every(val => val !== '');
    });

    if (!isComplete) {
      toast.error(`Please fill all measurements for all ${PIECES_COUNT} pieces before fully saving this size.`);
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
    toast.success('Size measurements saved successfully!');
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
        values: (savedMeasurements[size]?.[measurement.id] || [])
          .slice(0, PIECES_COUNT)
          .map((value, index) => ({
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
      toast.error('Please save at least one complete size (all measurements filled) before submitting.');
      return;
    }

    setFormStatus(prev => ({ ...prev, isSubmitting: true }));

    try {
      const payload = prepareDatabasePayload();
      const response = await addAqlInspection(payload).unwrap();

      if (response.success) {
        toast.success('AQL Form submitted successfully!');
        secureLocalStorage.removeItem(storageKey);
        resetForm();
      } else {
        throw new Error(response.message || 'Submission failed');
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.error(`Failed to submit AQL form: ${error.message}`);
    } finally {
      setFormStatus(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset the form? All unsaved data will be lost.')) {
      secureLocalStorage.removeItem(storageKey);
      resetForm();
      toast.info('Form has been reset');
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
    setReadOnly(false);
    setId('');
  };

  const getSizeStatus = (size) => {
    if (isSizeComplete(size)) return 'complete';
    if (isSizePartiallySaved(size)) return 'partial';
    return 'none';
  };

  const [deleteId, setDeleteId] = useState(null);

  const onDataClick = (id) => {
    setId(id);
    setNewItem(true);
  };

  const deleteData = async () => {
    if (deleteId) {
      if (!window.confirm("Are you sure to delete this inspection?")) {
        return;
      }
      try {
        await removeData(deleteId);
        setId("");
        toast.success("Deleted Successfully");
        setDeleteId(null)
        setNewItem(false);
      } catch (error) {
        toast.error("Something went wrong");
      }
    }
  };

  const handleCancel = () => {
    if (formStatus.isDirty) {
      if (!window.confirm('You have unsaved changes. Are you sure you want to cancel?')) {
        return;
      }
    }
    setNewItem(false);
    resetForm();
  };

  return (
    <>
      {newItem === false ? (
        <>
          <div className="bg-white px-4 py-2 flex items-center justify-between">
            <h1 className="text-lg font-bold text-gray-800">AQL Inspection Report</h1>
            <button
              onClick={() => {
                setId('');
                setNewItem(true);
              }}
              className="text-indigo-600 hover:text-white rounded-md border border-indigo-600 bg-white hover:bg-indigo-600 px-3 py-1 text-xs"
            >
              Add New +
            </button>
          </div>

          <Mastertable
            header={`AQL Inspection Report`}
            onDataClick={onDataClick}
            tableHeaders={tableHeaders}
            tableDataNames={tableDataNames}
            data={mergedReportData}
            deleteData={deleteData}
            setReadOnly={setReadOnly}
            setDeleteId={setDeleteId}
          />
        </>
      ) : (
        <div className="min-h-screen bg-gray-50">
          <div className="w-full">
            <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col" style={{ minHeight: 'calc(100vh - 2rem)' }}>
              <div className="bg-white px-4 py-2 flex items-center justify-between">
                <h1 className="text-lg font-bold text-gray-800">
                  {id ? 'AQL Inspection Details' : 'AQL Inspection Form'}
                </h1>
                <div
                  className="text-indigo-600 hover:text-white rounded-md border border-indigo-600 bg-white hover:bg-indigo-600 px-2 py-1 text-xs flex items-center cursor-pointer"
                  onClick={handleCancel}
                >
                  <span>Back to Report</span>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col">
                <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
                  <div className="grid grid-cols-3 md:grid-cols-3 gap-3 mb-4 md:w-1/2">
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
                          disabled={readOnly}
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
                          onChange={(e) => !readOnly && setInspectionDate(e.target.value)}
                          readOnly={readOnly}
                          className={`w-full px-3 py-2 text-xs border rounded-md shadow-sm ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                        />
                      </div>
                    </div>

                    <div className="mb-4 w-16">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Size <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => !readOnly && setShowSizeDropdown(!showSizeDropdown)}
                          disabled={!selectedReference || readOnly}
                          className={`w-full px-3 py-2 text-left text-xs border rounded-md shadow-sm flex justify-between items-center 
                            ${!selectedReference || readOnly ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:border-blue-500'}
                            ${selectedSize ? 'border-blue-500' : 'border-gray-300'}`}
                        >
                          <span className={selectedSize ? 'text-gray-900' : 'text-gray-500'}>
                            {selectedSize || 'size'}
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
                                    className={`px-3 py-1 hover:bg-blue-50 cursor-pointer flex justify-between items-center 
                                      ${status === 'complete' ? 'bg-green-50' : status === 'partial' ? 'bg-yellow-50' : ''}
                                      ${selectedSize === size ? 'bg-blue-50' : ''}`}
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
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                ${selectedSize === size ? 'ring-2 ring-blue-500' : ''}
                                ${status === 'complete' ? 'bg-green-100 text-green-800' :
                                  status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'}`}
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

                  {measurements.length > 0 && (
                    <div className="flex-1 overflow-hidden flex flex-col mb-3">
                      <div className="overflow-auto flex-1 pb-4">
                        {/* Mobile Card View */}
                        <div className="md:hidden grid grid-cols-1 gap-4">
                          {measurements.map(measurement => (
                            <div
                              key={measurement.id}
                              className="bg-white border border-gray-200 rounded-lg shadow-sm p-4"
                            >
                              <div className="flex justify-between items-center mb-3 pb-2 border-b">
                                <h3 className="text-sm font-medium text-gray-800">
                                  {measurement.name} ({measurement.unit})
                                </h3>
                                <div className="text-xs text-gray-500">
                                  Std: {measurement.standardValue}
                                  <span className="ml-1">
                                    (-{measurement.toleranceMin}/+{measurement.toleranceMax})
                                  </span>
                                </div>
                              </div>

                              <div className="grid grid-cols-5  sm:grid-cols-3 gap-3">
                                {Array.from({ length: PIECES_COUNT }, (_, i) => i).map(pieceIndex => (
                                  <div key={pieceIndex} className="flex flex-col">
                                    <label className="text-xs text-gray-500 mb-1">
                                      Piece #{pieceIndex + 1}
                                    </label>
                                    <input
                                      type="text"
                                      value={checkValues[measurement.id]?.[pieceIndex] || ''}
                                      onChange={(e) => {
                                        if (readOnly) return;
                                        let raw = e.target.value;
                                        raw = raw.replace(/[^\d.]/g, '');
                                        const parts = raw.split('.');
                                        if (parts.length > 2) return;
                                        if (parts[1]?.length > 2) return;

                                        handleCheckValueChange(measurement.id, pieceIndex, raw);
                                      }}
                                      onBlur={(e) => {
                                        if (readOnly) return;
                                        let val = e.target.value;
                                        if (/^\d{3}$/.test(val)) {
                                          val = (parseFloat(val) / 10).toFixed(2);
                                        } else {
                                          val = parseFloat(val || 0).toFixed(2);
                                        }
                                        handleCheckValueChange(measurement.id, pieceIndex, val);
                                      }}
                                      className={`w-full px-3 py-2 text-sm border rounded-md text-center ${checkValues[measurement.id]?.[pieceIndex]
                                          ? checkTolerance(measurement, checkValues[measurement.id][pieceIndex])
                                          : 'border-gray-300'
                                        } ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                      readOnly={readOnly}
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Desktop Table View */}
                        <table className="hidden md:table min-w-full bg-white border border-gray-200">
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
                                      value={id ? (parseFloat(value) || 0).toFixed(2) : value}
                                      onChange={(e) => {
                                        if (readOnly) return;
                                        let raw = e.target.value;
                                        raw = raw.replace(/[^\d.]/g, '');
                                        const parts = raw.split('.');
                                        if (parts.length > 2) return;
                                        if (parts[1]?.length > 2) return;

                                        handleCheckValueChange(measurement.id, index, raw);
                                      }}
                                      onBlur={(e) => {
                                        if (readOnly) return;
                                        let val = e.target.value;
                                        if (/^\d{3}$/.test(val)) {
                                          val = (parseFloat(val) / 10).toFixed(2);
                                        } else {
                                          val = parseFloat(val || 0).toFixed(2);
                                        }
                                        handleCheckValueChange(measurement.id, index, val);
                                      }}
                                      className={`w-full px-1 py-1 text-xs border rounded-sm text-center 
                                        ${value ? checkTolerance(measurement, value) : 'border-gray-300'}
                                        ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                      readOnly={readOnly}
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

                  <div className="flex flex-wrap justify-end gap-2 pt-3 border-t border-gray-200">
                    {!readOnly && (
                      <>
                        <button
                          type="button"
                          onClick={handleReset}
                          className="px-3 py-2 border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-blue-500 transition-all flex-grow md:flex-grow-0"
                        >
                          Reset
                        </button>

                        {measurements.length > 0 && (
                          <>
                            <button
                              type="button"
                              onClick={handlePartialSave}
                              disabled={!selectedSize}
                              className={`px-3 py-2 rounded-md shadow-sm text-xs font-medium text-white focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-blue-500 transition-all flex-grow md:flex-grow-0
                                ${!selectedSize ? 'bg-gray-400 cursor-not-allowed' : 'bg-yellow-500 hover:bg-yellow-600'}`}
                            >
                              Partial Save
                            </button>

                            <button
                              type="button"
                              onClick={handleSaveSize}
                              disabled={!selectedSize}
                              className={`px-3 py-2 rounded-md shadow-sm text-xs font-medium text-white focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-blue-500 transition-all flex-grow md:flex-grow-0
                                ${!selectedSize ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                            >
                              Save Size
                            </button>
                          </>
                        )}
                      </>
                    )}

                    {!readOnly && (
                      <button
                        type="submit"
                        disabled={savedSizes.filter(size => isSizeComplete(size)).length === 0 || isSubmitting}
                        className={`px-3 py-2 rounded-md shadow-sm text-xs font-medium text-white focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-blue-500 transition-all flex-grow md:flex-grow-0
                          ${savedSizes.filter(size => isSizeComplete(size)).length === 0
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-green-600 hover:bg-green-700'}`}
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit All'}
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Aql;