import React, { useState, useEffect } from 'react';
import { useGetSizeTableMasterQuery, useGetAllocationMasterQuery } from "../../../redux/uniformService/SizeTableMasterService";
import secureLocalStorage from 'react-secure-storage';
import { useAddAqlInspectionMutation, useGetAqlInspectionsQuery, useGetAqlInspectionByIdQuery, useDeleteAqlInspectionMutation, useUpdateAqlInspectionMutation } from "../../../redux/uniformService/AqlInspectionService";
import Mastertable from '../MasterTable/MaterTable1.jsx';
import { toast } from 'react-toastify';
import Modal from '../../../UiComponents/Modal/index.js';
import LineDeatils from './LineDetails.jsx';

const Aql = () => {
  const [selectedReference, setSelectedReference] = useState('');
  const [inspectionDate, setInspectionDate] = useState(new Date().toISOString().split('T')[0]);
  const [id, setId] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [newItem, setNewItem] = useState(false);
  const [ayanCondition, setAyanCondition] = useState('before');
  const [showCompare, setShowCompare] = useState(false);

  const [showSizeDropdown, setShowSizeDropdown] = useState(false);
  const [measurements, setMeasurements] = useState([]);
  const [checkValues, setCheckValues] = useState({});

  const [formData, setFormData] = useState({
    before: {
      savedSizes: [],
      savedMeasurements: {},
      partialSavedMeasurements: {}
    },
    after: {
      savedSizes: [],
      savedMeasurements: {},
      partialSavedMeasurements: {}
    }
  });

  const [formStatus, setFormStatus] = useState({
    isDirty: false,
    lastSaved: null,
    isSubmitting: false
  });

  const [readOnly, setReadOnly] = useState(false);
  const [isDetailView, setIsDetailView] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const { data: aqlData } = useGetAqlInspectionsQuery();
  const { data: sizeData } = useGetSizeTableMasterQuery(
    { productReference: selectedReference },
    { skip: !selectedReference }
  );
  const { data: singleData } = useGetAqlInspectionByIdQuery(id, { skip: !id });
  const { data: sizeTableData } = useGetAllocationMasterQuery();
  const [addAqlInspection] = useAddAqlInspectionMutation();
  const [updateAqlInspection] = useUpdateAqlInspectionMutation();
  const [removeData] = useDeleteAqlInspectionMutation();
  const PIECES_COUNT = 5;
  const companyId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userCompanyId"
  );
  const storageKey = `aqlFormData_${companyId}_${selectedReference}`;

  const references = [...new Set(sizeTableData?.data?.map(item => item.reference) || [])];
  const selectedProduct = sizeData?.data;
  const availableSizes = selectedProduct?.availableSizes || [];

  const [mergedReportData, setMergedReportData] = useState([]);
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

  const loadSavedData = () => {
    const savedData = secureLocalStorage.getItem(storageKey);
    if (savedData) {
      setFormData(savedData);
      setFormStatus(prev => ({
        ...prev,
        lastSaved: new Date(savedData.lastUpdated).toLocaleString()
      }));
    }
  };

  const saveDataToStorage = () => {
    if (!selectedReference) return;

    const dataToSave = {
      ...formData,
      lastUpdated: new Date().toISOString()
    };

    secureLocalStorage.setItem(storageKey, dataToSave);
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
  }, [formData, selectedReference, formStatus.isDirty]);

useEffect(() => {
  if (singleData?.data && !formStatus.isDirty) {
    const data = singleData.data;
    setSelectedReference(data.reference || '');
    setId(data.id || '');

    if (data.inspectionDate) {
      setInspectionDate(new Date(data.inspectionDate).toISOString().split('T')[0]);
    }

    const newFormData = {
      before: {
        savedSizes: [],
        savedMeasurements: {},
        partialSavedMeasurements: {}
      },
      after: {
        savedSizes: [],
        savedMeasurements: {},
        partialSavedMeasurements: {}
      }
    };

    // Process before data
    if (data.before && Array.isArray(data.before)) {
      newFormData.before.savedSizes = data.before.map(sample => sample.size);

      data.before.forEach(sample => {
        const size = sample.size;
        newFormData.before.savedMeasurements[size] = {};

        sample.measurements?.forEach(measurement => {
          const values = Array(PIECES_COUNT).fill('');
          measurement.values?.forEach(valueObj => {
            if (valueObj.pieceNumber <= PIECES_COUNT) {
              values[valueObj.pieceNumber - 1] = valueObj.actualValue?.toString() || '';
            }
          });

          newFormData.before.savedMeasurements[size][measurement.measurementId] = values;
        });
      });
    }

    // Process after data
    if (data.after && Array.isArray(data.after)) {
      newFormData.after.savedSizes = data.after.map(sample => sample.size);

      data.after.forEach(sample => {
        const size = sample.size;
        newFormData.after.savedMeasurements[size] = {};

        sample.measurements?.forEach(measurement => {
          const values = Array(PIECES_COUNT).fill('');
          measurement.values?.forEach(valueObj => {
            if (valueObj.pieceNumber <= PIECES_COUNT) {
              values[valueObj.pieceNumber - 1] = valueObj.actualValue?.toString() || '';
            }
          });

          newFormData.after.savedMeasurements[size][measurement.measurementId] = values;
        });
      });
    }

    setFormData(newFormData);
    setReadOnly(true);
  }
}, [singleData, formStatus.isDirty]);

  useEffect(() => {
    if (selectedProduct && selectedSize) {
      const measurementData = selectedProduct.measurements
        ?.filter(m => m.values?.some(v => v.size === selectedSize))
        ?.map(m => {
          const valueObj = m.values?.find(v => v.size === selectedSize);
          return {
            id: m.id,
            name: m.description || 'Unnamed',
            standardValue: valueObj?.value ?? '',
            toleranceMin: m.toleranceMin ?? '0',
            toleranceMax: m.toleranceMax ?? '0',
            unit: m.unit ?? ''
          };
        }) || [];

      setMeasurements(measurementData);

      const sizeData = formData[ayanCondition].savedMeasurements?.[selectedSize] ||
        formData[ayanCondition].partialSavedMeasurements?.[selectedSize] || {};

      const initialCheckValues = {};
      measurementData.forEach(m => {
        initialCheckValues[m.id] = sizeData[m.id] ?? Array(PIECES_COUNT).fill('');
      });

      setCheckValues(initialCheckValues);
    } else {
      setMeasurements([]);
      setCheckValues({});
    }
  }, [selectedProduct, selectedSize, formData, ayanCondition]);

  const handleCheckValueChange = (measurementId, pieceIndex, value) => {
    if (readOnly) return;

    setCheckValues(prev => ({
      ...prev,
      [measurementId]: prev[measurementId].map((val, idx) =>
        idx === pieceIndex ? value : val)
    }));
    setFormStatus(prev => ({ ...prev, isDirty: true }));
  };

  const isSizeComplete = (size, condition) => {
    const sizeData = formData[condition].savedMeasurements?.[size];
    if (!sizeData) return false;

    return measurements.every(measurement => {
      const values = sizeData[measurement.id];
      return values && values.length === PIECES_COUNT && values.every(val => val !== '');
    });
  };

  const isSizePartiallySaved = (size, condition) => {
    return formData[condition].partialSavedMeasurements.hasOwnProperty(size) &&
      !isSizeComplete(size, condition);
  };

  const getSizeStatus = (size, condition) => {
    if (isSizeComplete(size, condition)) return 'complete';
    if (isSizePartiallySaved(size, condition)) return 'partial';
    return 'none';
  };

  const handlePartialSave = () => {
    if (!selectedSize || readOnly) return;

    setFormData(prev => ({
      ...prev,
      [ayanCondition]: {
        ...prev[ayanCondition],
        partialSavedMeasurements: {
          ...prev[ayanCondition].partialSavedMeasurements,
          [selectedSize]: checkValues
        },
        savedSizes: [...new Set([...prev[ayanCondition].savedSizes, selectedSize])]
      }
    }));

    setFormStatus(prev => ({ ...prev, isDirty: true }));
    toast.info('Partially saved measurements for this size.');
  };

const handleLoadSize = (size) => {
  setSelectedSize(size);
  setShowSizeDropdown(false);
  const sizeData = formData[ayanCondition].savedMeasurements?.[size] || 
                  formData[ayanCondition].partialSavedMeasurements?.[size] || {};
  
  const initialCheckValues = {};
  measurements.forEach(m => {
    initialCheckValues[m.id] = sizeData[m.id] ?? Array(PIECES_COUNT).fill('');
  });
  
  setCheckValues(initialCheckValues);
};

const handleReset = () => {
  if (window.confirm('Are you sure you want to reset the form? All unsaved data will be lost.')) {
    secureLocalStorage.removeItem(storageKey);
    setFormData({
      before: {
        savedSizes: [],
        savedMeasurements: {},
        partialSavedMeasurements: {}
      },
      after: {
        savedSizes: [],
        savedMeasurements: {},
        partialSavedMeasurements: {}
      }
    });
    setSelectedSize('');
    setCheckValues({});
    setFormStatus({
      isDirty: false,
      lastSaved: null,
      isSubmitting: false
    });
    toast.info('Form has been reset');
  }
};

const canCompare = () => {
  const beforeComplete = formData.before.savedSizes.filter(size => 
    isSizeComplete(size, 'before')).length;
  const afterComplete = formData.after.savedSizes.filter(size => 
    isSizeComplete(size, 'after')).length;
  
  return beforeComplete >= 2 && afterComplete >= 2;
};  const handleSaveSize = () => {
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

    setFormData(prev => ({
      ...prev,
      [ayanCondition]: {
        ...prev[ayanCondition],
        savedMeasurements: {
          ...prev[ayanCondition].savedMeasurements,
          [selectedSize]: checkValues
        },
        partialSavedMeasurements: {
          ...prev[ayanCondition].partialSavedMeasurements,
          [selectedSize]: undefined
        },
        savedSizes: [...new Set([...prev[ayanCondition].savedSizes, selectedSize])]
      }
    }));

    setSelectedSize('');
    setShowSizeDropdown(false);
    setFormStatus(prev => ({ ...prev, isDirty: true }));
    toast.success('Size measurements saved successfully!');
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
    const prepareConditionData = (condition) => {
      return formData[condition].savedSizes
        .filter(size => isSizeComplete(size, condition))
        .map(size => ({
          size: size,
          measurements: measurements.map(measurement => ({
            measurementId: measurement.id,
            measurementName: measurement.name,
            standardValue: measurement.standardValue.toString(),
            toleranceMin: measurement.toleranceMin.toString(),
            toleranceMax: measurement.toleranceMax.toString(),
            unit: measurement.unit,
            values: (formData[condition].savedMeasurements[size]?.[measurement.id] || [])
              .slice(0, PIECES_COUNT)
              .map((value, index) => ({
                pieceNumber: index + 1,
                actualValue: value.toString(),
                status: value ?
                  checkTolerance(measurement, value).includes('red') ?
                    'out_of_tolerance' : 'within_tolerance' :
                  'not_measured'
              }))
          }))
        }));
    };

    return {
      companyId: companyId.toString(),
      reference: selectedReference,
      inspectionDate: new Date(inspectionDate),
      before: prepareConditionData('before'),
      after: prepareConditionData('after')
    };
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    const beforeComplete = formData.before.savedSizes.filter(size =>
      isSizeComplete(size, 'before')).length;
    const afterComplete = formData.after.savedSizes.filter(size =>
      isSizeComplete(size, 'after')).length;

    if (beforeComplete === 0 && afterComplete === 0) {
      toast.error('Please save at least one complete size in either before or after condition before submitting.');
      return;
    }

    setFormStatus(prev => ({ ...prev, isSubmitting: true }));

    try {
      const payload = prepareDatabasePayload();
      let response;

      if (id) {
        response = await updateAqlInspection({ id, data: payload }).unwrap();
      } else {
        response = await addAqlInspection(payload).unwrap();
      }

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
  const resetForm = () => {
    if (window.confirm('Are you sure you want to reset the form? All unsaved data will be lost.')) {
      secureLocalStorage.removeItem(storageKey);
      setSelectedReference('');
      setSelectedSize('');
      setMeasurements([]);
      setCheckValues({});
      setFormData({
        before: {
          savedSizes: [],
          savedMeasurements: {},
          partialSavedMeasurements: {}
        },
        after: {
          savedSizes: [],
          savedMeasurements: {},
          partialSavedMeasurements: {}
        }
      });
      setFormStatus({
        isDirty: false,
        lastSaved: null,
        isSubmitting: false
      });
      setReadOnly(false);
      setId('');
      setAyanCondition('before');
      setShowCompare(false);
      toast.info('Form has been reset');
    }
  };

  const toggleAyanCondition = () => {
    if (formStatus.isDirty) {
      if (!window.confirm('You have unsaved changes. Switching ayan condition will lose your changes. Continue?')) {
        return;
      }
    }
    setAyanCondition(prev => prev === 'before' ? 'after' : 'before');
    setSelectedSize('');
    setFormStatus(prev => ({ ...prev, isDirty: false }));
  };

  const handleCompare = () => {
    const beforeComplete = formData.before.savedSizes.filter(size =>
      isSizeComplete(size, 'before')).length;
    const afterComplete = formData.after.savedSizes.filter(size =>
      isSizeComplete(size, 'after')).length;

    // if (beforeComplete < 2 || afterComplete < 2) {
    //   toast.error('You need at least 2 complete sizes in both before and after conditions to compare');
    //   return;
    // }

    setShowCompare(true);
  };

  const renderCompareTable = () => {
    if (!showCompare) return null;

    const commonSizes = [...new Set([
      ...formData.before.savedSizes.filter(size => isSizeComplete(size, 'before')),
      ...formData.after.savedSizes.filter(size => isSizeComplete(size, 'after'))
    ])];

    if (commonSizes.length === 0) {
      return (
        <div className="mt-4 p-4 bg-yellow-50 text-yellow-800 rounded">
          No common sizes with complete data to compare
        </div>
      );
    }

    return (
      <div className="mt-6 border-t pt-4">
        <h3 className="text-lg font-bold mb-4">Before vs After Comparison</h3>

        {/* Size selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Size to Compare
          </label>
          <select
            value={selectedSize}
            onChange={(e) => setSelectedSize(e.target.value)}
            className="w-full md:w-1/4 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select a size</option>
            {commonSizes.map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>

        {selectedSize && (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Measurement
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Standard
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tolerance
                  </th>
                  {Array.from({ length: PIECES_COUNT }, (_, i) => i + 1).map(num => (
                    <th key={num} colSpan={2} className="px-2 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Piece #{num}
                      <div className="grid grid-cols-2">
                        <span className="text-xs">Before</span>
                        <span className="text-xs">After</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {measurements.map(measurement => (
                  <tr key={measurement.id}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                      {measurement.name} ({measurement.unit})
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                      {measurement.standardValue}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                      -{measurement.toleranceMin}/+{measurement.toleranceMax}
                    </td>
                    {Array.from({ length: PIECES_COUNT }, (_, i) => i).map(index => (
                      <React.Fragment key={index}>
                        <td className={`px-2 py-2 text-center text-sm ${formData.before.savedMeasurements[selectedSize]?.[measurement.id]?.[index] ?
                            checkTolerance(measurement, formData.before.savedMeasurements[selectedSize][measurement.id][index]) :
                            'bg-gray-50'
                          }`}>
                          {formData.before.savedMeasurements[selectedSize]?.[measurement.id]?.[index] || '-'}
                        </td>
                        <td className={`px-2 py-2 text-center text-sm ${formData.after.savedMeasurements[selectedSize]?.[measurement.id]?.[index] ?
                            checkTolerance(measurement, formData.after.savedMeasurements[selectedSize][measurement.id][index]) :
                            'bg-gray-50'
                          }`}>
                          {formData.after.savedMeasurements[selectedSize]?.[measurement.id]?.[index] || '-'}
                        </td>
                      </React.Fragment>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

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
    "dataObj?.allocationDetails?.[0]?.deliveryDate ? new Date(dataObj.allocationDetails[0.deliveryDate).toLocaleDateString() : 'N/A'",
  ];

  const onDataClick = (id) => {
    setId(id);
    setNewItem(true);
    setShowCompare(false);
    setAyanCondition('before');
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
        setDeleteId(null);
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
      <Modal
        isOpen={isDetailView}
        widthClass={`${"w-[50%] h-[70%]"}`}
        onClose={() => setIsDetailView(false)}
      >
        <LineDeatils />
      </Modal>

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
            setIsDetailView={setIsDetailView}
            isDetailView={isDetailView}
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
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Order Id <span className="text-red-500">*</span>
                      </label>
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
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Inspection Date
                      </label>
                      <input
                        type="date"
                        value={inspectionDate}
                        onChange={(e) => !readOnly && setInspectionDate(e.target.value)}
                        readOnly={readOnly}
                        className={`w-full px-3 py-2 text-xs border rounded-md shadow-sm ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                      />
                    </div>

                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={toggleAyanCondition}
                        disabled={readOnly}
                        className={`w-full px-3 py-2 text-xs border rounded-md shadow-sm flex items-center justify-center
                          ${readOnly ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:border-blue-500'}
                          ${ayanCondition === 'before' ? 'border-blue-500 bg-blue-50' : 'border-purple-500 bg-purple-50'}`}
                      >
                        <span>{ayanCondition === 'before' ? 'Before Ayaning' : 'After Ayaning'}</span>
                        <svg className="h-4 w-4 ml-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>

                    <div>
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
                                const status = getSizeStatus(size, ayanCondition);
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
                         <button
                          type="button"
                          onClick={handleCompare}
                          // disabled={!canCompare()}
                          className={`px-3 py-2 rounded-md shadow-sm h-9 mt-5 text-xs font-medium text-white
                            ${!canCompare() ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'}`}
                        >
                          Compare
                        </button>
                  </div>

                  {/* Saved sizes indicators */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-4">
                      <div className="flex-1">
                        <h4 className="text-xs font-medium text-gray-700 mb-1">Before Ayaning</h4>
                        <div className="flex flex-wrap gap-2">
                          {formData.before.savedSizes.map((size, index) => (
                            <button
                              key={`before-${index}`}
                              type="button"
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                ${selectedSize === size ? 'ring-2 ring-blue-500' : ''}
                                ${getSizeStatus(size, 'before') === 'complete' ? 'bg-green-100 text-green-800' :
                                  getSizeStatus(size, 'before') === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'}`}
                              onClick={() => {
                                setAyanCondition('before');
                                handleLoadSize(size);
                              }}
                            >
                              {size}
                              {getSizeStatus(size, 'before') === 'complete' && ' ✓'}
                              {getSizeStatus(size, 'before') === 'partial' && ' ~'}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xs font-medium text-gray-700 mb-1">After Ayaning</h4>
                        <div className="flex flex-wrap gap-2">
                          {formData.after.savedSizes.map((size, index) => (
                            <button
                              key={`after-${index}`}
                              type="button"
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                ${selectedSize === size ? 'ring-2 ring-blue-500' : ''}
                                ${getSizeStatus(size, 'after') === 'complete' ? 'bg-green-100 text-green-800' :
                                  getSizeStatus(size, 'after') === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'}`}
                              onClick={() => {
                                setAyanCondition('after');
                                handleLoadSize(size);
                              }}
                            >
                              {size}
                              {getSizeStatus(size, 'after') === 'complete' && ' ✓'}
                              {getSizeStatus(size, 'after') === 'partial' && ' ~'}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Measurements table */}
                  {measurements.length > 0 && (
                    <div className="flex-1 overflow-hidden flex flex-col mb-3">
                      <div className="overflow-auto flex-1 pb-4">
                        <table className="min-w-full bg-white border border-gray-200">
                          <thead className="bg-gray-50 sticky top-0">
                            <tr>
                              <th rowSpan="2" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Measurement
                              </th>
                              <th rowSpan="2" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Std Value
                              </th>
                              <th rowSpan="2" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Tolerance
                              </th>
                              <th colSpan={PIECES_COUNT} className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Pieces (1-{PIECES_COUNT})
                              </th>
                            </tr>
                            <tr>
                              {Array.from({ length: PIECES_COUNT }, (_, i) => i + 1).map(num => (
                                <th key={num} className="px-2 py-1 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  #{num}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {measurements.map(measurement => (
                              <tr key={measurement.id}>
                                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {measurement.name} ({measurement.unit})
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                  {measurement.standardValue}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                  -{measurement.toleranceMin}/+{measurement.toleranceMax}
                                </td>
                                {checkValues[measurement.id]?.map((value, index) => (
                                  <td key={index} className="px-2 py-2 whitespace-nowrap">
                                    <input
                                      type="text"
                                      value={value}
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
                                      className={`w-full px-2 py-1 text-sm border rounded-sm text-center 
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

                  {/* Comparison section */}
                  {renderCompareTable()}

                  {/* Form actions */}
                  <div className="flex flex-wrap justify-end gap-2 pt-3 border-t border-gray-200">
                    {!readOnly && (
                      <>
                        <button
                          type="button"
                          onClick={handleReset}
                          className="px-3 py-2 border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                          Reset
                        </button>

                        {measurements.length > 0 && (
                          <>
                            <button
                              type="button"
                              onClick={handlePartialSave}
                              disabled={!selectedSize}
                              className={`px-3 py-2 rounded-md shadow-sm text-xs font-medium text-white
                                ${!selectedSize ? 'bg-gray-400 cursor-not-allowed' : 'bg-yellow-500 hover:bg-yellow-600'}`}
                            >
                              Partial Save
                            </button>

                            <button
                              type="button"
                              onClick={handleSaveSize}
                              disabled={!selectedSize}
                              className={`px-3 py-2 rounded-md shadow-sm text-xs font-medium text-white
                                ${!selectedSize ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                            >
                              Save Size
                            </button>
                          </>
                        )}

                        <button
                          type="button"
                          onClick={handleCompare}
                          // disabled={!canCompare()}
                          className={`px-3 py-2 rounded-md shadow-sm text-xs font-medium text-white
                            ${!canCompare() ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'}`}
                        >
                          Compare
                        </button>
                      </>
                    )}

                    {!readOnly && (
                      <button
                        type="submit"
                        disabled={
                          formStatus.isSubmitting ||
                          (
                            formData.before.savedSizes.filter(size => isSizeComplete(size, 'before')).length === 0 &&
                            formData.after.savedSizes.filter(size => isSizeComplete(size, 'after')).length === 0
                          )
                        }
                        className={`px-3 py-2 rounded-md shadow-sm text-xs font-medium text-white
      ${formStatus.isSubmitting ||
                            (
                              formData.before.savedSizes.filter(size => isSizeComplete(size, 'before')).length === 0 &&
                              formData.after.savedSizes.filter(size => isSizeComplete(size, 'after')).length === 0
                            )
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-green-600 hover:bg-green-700'
                          }`}
                      >
                        {formStatus.isSubmitting ? 'Submitting...' : 'Submit All'}
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