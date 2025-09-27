import React, { useState, useEffect } from "react";
import {
  useGetSizeTableMasterQuery,
  useGetAllocationMasterQuery,
} from "../../../redux/uniformService/SizeTableMasterService";
import secureLocalStorage from "react-secure-storage";
import {
  useGetSAqlInspectionsQuery,
  useGetSAqlInspectionByIdQuery,
  useAddSAqlInspectionMutation,
  useUpdateSAqlInspectionMutation,
  useDeleteSAqlInspectionMutation,
} from "../../../redux/uniformService/SAqlInspectionService";
import Mastertable from "../MasterTable/MaterTable1.jsx";
import { toast } from "react-toastify";
import Modal from "../../../UiComponents/Modal/index.js";
import { useGetLineMasterQuery } from "../../../redux/services/LineMasterService";
import { useGetdefectCorrectionQuery } from "../../../redux/services/DefectCorrectionMasterService.js";
import { useGetDefectQuery } from "../../../redux/services/DefectMasterService.js";
import { useGetOperationQuery } from "../../../redux/services/OprtaionMasterService.js";
import Filter from "./filter.png";

const Aql = () => {
  // State declarations
  const [selectedReference, setSelectedReference] = useState("");
  const [inspectionDate, setInspectionDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [id, setId] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [newItem, setNewItem] = useState(false);
  const [ayanCondition, setAyanCondition] = useState("before");
  const [showCompare, setShowCompare] = useState(false);
  const [color, setColor] = useState("");
  const [selectedLine, setSelectedLine] = useState("");
  const [showSizeDropdown, setShowSizeDropdown] = useState(false);
  const [measurements, setMeasurements] = useState([]);
  const [checkValues, setCheckValues] = useState({});
  const [approveStatus, setApproveStatus] = useState(0);
  const [measurementMeta, setMeasurementMeta] = useState({});
  const [showMeasurementPopup, setShowMeasurementPopup] = useState(false);
  const [availableMeasurements, setAvailableMeasurements] = useState([]);
  const [selectedMeasurements, setSelectedMeasurements] = useState([]);
  const [selectedShift, setSelectedShift] = useState("");

  // User data from storage
  const companyId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userCompanyId"
  );
  const userId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userId"
  );
  const branchId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "currentBranchId"
  );

  // Form data structure for storing all sizes and measurements
  const [formData, setFormData] = useState({
    before: {
      savedSizes: [],
      savedMeasurements: {},
      partialSavedMeasurements: {},
      measurementMeta: {},
    },
    after: {
      savedSizes: [],
      savedMeasurements: {},
      partialSavedMeasurements: {},
      measurementMeta: {},
    },
  });

  // API queries
  const { data: operationData } = useGetOperationQuery({ params: { companyId } });
  const { data: aqlData, refetch: refetchAqlData } = useGetSAqlInspectionsQuery();
  const { data: sizeData } = useGetSizeTableMasterQuery(
    { productReference: selectedReference },
    { skip: !selectedReference }
  );
  const { data: singleData } = useGetSAqlInspectionByIdQuery(id, { skip: !id });
  const { data: sizeTableData } = useGetAllocationMasterQuery();
  const [addAqlInspection] = useAddSAqlInspectionMutation();
  const [updateAqlInspection] = useUpdateSAqlInspectionMutation();
  const [removeData] = useDeleteSAqlInspectionMutation();

  const { data: lines = [] } = useGetLineMasterQuery({ params: { companyId } });
  const { data: defect } = useGetDefectQuery({ params: { companyId } });
  const { data: DefectCorrection } = useGetdefectCorrectionQuery({ params: { companyId } });

  // Constants
  const PIECES_COUNT = 7;
  const storageKey = `aqlFormData_${companyId}_${selectedReference}`;
  const measurementSelectionKey = `aqlMeasurementSelections_${companyId}`;

  // Derived data
  const references = [
    ...new Set(
      (sizeTableData?.data || [])
        .filter((item) => item?.Branch?.id == branchId)
        .map((item) => item.reference)
    ),
  ];

  const selectedProduct = sizeData?.data;
  const availableSizes = selectedProduct?.availableSizes || [];
  const operationOptions = operationData?.data?.filter(
    (op) => op.reference === selectedReference
  );
  const defectOptions = defect?.data;
  const correctiveActionOptions = DefectCorrection?.data;

  const filterLines =
    sizeTableData?.data
      ?.filter((item) => item.reference === selectedReference)
      ?.map((item) => item.LineMaster?.lineName) || [];

  const CorrectLine = lines?.data?.filter((line) => filterLines.includes(line.lineName)) || [];

  const shifts = [
    { id: 1, label: "1", time: "8:30 - 10:15" },
    { id: 2, label: "2", time: "10:30 - 12:30" },
    { id: 3, label: "3", time: "1:30 - 3:30" },
    { id: 4, label: "4", time: "3:30 - 5:50" },
  ];

  // State for UI and form status
  const [formStatus, setFormStatus] = useState({
    isDirty: false,
    lastSaved: null,
    isSubmitting: false,
  });

  const [readOnly, setReadOnly] = useState(false);
  const [isDetailView, setIsDetailView] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const [isTabletView, setIsTabletView] = useState(
    window.innerWidth >= 768 && window.innerWidth < 1024
  );

  const [mergedReportData, setMergedReportData] = useState([]);

  // Responsive handling
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
      setIsTabletView(window.innerWidth >= 768 && window.innerWidth < 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Measurement selection functions
  const loadMeasurementSelections = () => {
    try {
      const savedSelections = secureLocalStorage.getItem(measurementSelectionKey);
      if (savedSelections && selectedReference && selectedSize) {
        const referenceSelections = savedSelections[selectedReference] || {};
        return referenceSelections[selectedSize] || [];
      }
    } catch (error) {
      console.error("Error loading measurement selections:", error);
    }
    return [];
  };

  const saveMeasurementSelections = (reference, size, measurements) => {
    try {
      const existingSelections = secureLocalStorage.getItem(measurementSelectionKey) || {};
      const referenceSelections = existingSelections[reference] || {};

      const updatedSelections = {
        ...existingSelections,
        [reference]: {
          ...referenceSelections,
          [size]: measurements,
        },
      };
      secureLocalStorage.setItem(measurementSelectionKey, updatedSelections);
    } catch (error) {
      console.error("Error saving measurement selections:", error);
    }
  };

  const clearMeasurementSelectionsForSize = () => {
    if (selectedReference && selectedSize) {
      const existingSelections = secureLocalStorage.getItem(measurementSelectionKey) || {};
      const referenceSelections = existingSelections[selectedReference] || {};

      const updatedSelections = {
        ...existingSelections,
        [selectedReference]: {
          ...referenceSelections,
          [selectedSize]: [],
        },
      };
      secureLocalStorage.setItem(measurementSelectionKey, updatedSelections);
      setSelectedMeasurements([]);
      setMeasurements([]);
      setCheckValues({});
      toast.info(`Measurement selections cleared for ${selectedReference} - ${selectedSize}`);
    }
  };

  const clearAllMeasurementSelections = () => {
    if (selectedReference) {
      const existingSelections = secureLocalStorage.getItem(measurementSelectionKey) || {};
      const updatedSelections = {
        ...existingSelections,
        [selectedReference]: {},
      };
      secureLocalStorage.setItem(measurementSelectionKey, updatedSelections);
      setSelectedMeasurements([]);
      setMeasurements([]);
      setCheckValues({});
      toast.info(`All measurement selections cleared for ${selectedReference}`);
    }
  };

  const openMeasurementPopup = () => {
    if (!selectedReference || !selectedSize || !selectedProduct) {
      toast.error("Please select a reference and size first");
      return;
    }

    const allMeasurements = selectedProduct.measurements
      ?.filter((m) => m.values?.some((v) => v.size === selectedSize))
      ?.map((m) => {
        const valueObj = m.values?.find((v) => v.size === selectedSize);
        return {
          id: m.id,
          name: m.description || "Unnamed",
          standardValue: valueObj?.value ?? "",
          toleranceMin: m.toleranceMin ?? "0",
          toleranceMax: m.toleranceMax ?? "0",
          unit: m.unit ?? "",
          isActive: true,
        };
      }) || [];

    setAvailableMeasurements(allMeasurements);
    const savedSelections = loadMeasurementSelections();
    const initialSelections = savedSelections.length > 0 ? savedSelections : allMeasurements.map((m) => m.id);
    
    setSelectedMeasurements(initialSelections);
    setShowMeasurementPopup(true);
  };

  const handleMeasurementSelection = (measurementId, isSelected) => {
    setSelectedMeasurements((prev) => 
      isSelected ? [...prev, measurementId] : prev.filter((id) => id !== measurementId)
    );
  };

  const handleSelectAllMeasurements = (selectAll) => {
    setSelectedMeasurements(selectAll ? availableMeasurements.map((m) => m.id) : []);
  };

  const applyMeasurementSelection = () => {
    if (selectedMeasurements.length === 0) {
      toast.error("Please select at least one measurement");
      return;
    }

    const filteredMeasurements = availableMeasurements.filter((m) =>
      selectedMeasurements.includes(m.id)
    );

    setMeasurements(filteredMeasurements);

    const newCheckValues = {};
    filteredMeasurements.forEach((m) => {
      const existingValues = 
        formData[ayanCondition].savedMeasurements?.[selectedSize]?.[m.id] ||
        formData[ayanCondition].partialSavedMeasurements?.[selectedSize]?.[m.id] ||
        Array(PIECES_COUNT).fill("");
      
      newCheckValues[m.id] = existingValues;
    });

    setCheckValues(newCheckValues);
    saveMeasurementSelections(selectedReference, selectedSize, selectedMeasurements);
    setShowMeasurementPopup(false);
    
    toast.success(`Selected ${filteredMeasurements.length} measurements for ${selectedSize}`);
    setFormStatus((prev) => ({ ...prev, isDirty: true }));
  };

  // Load measurements when dependencies change
  useEffect(() => {
    if (selectedReference && selectedProduct && selectedSize) {
      const savedSelections = loadMeasurementSelections();
      setSelectedMeasurements(savedSelections);

      const allMeasurementData = selectedProduct.measurements
        ?.filter((m) => m.values?.some((v) => v.size === selectedSize))
        ?.map((m) => {
          const valueObj = m.values?.find((v) => v.size === selectedSize);
          return {
            id: m.id,
            name: m.description || "Unnamed",
            standardValue: valueObj?.value ?? "",
            toleranceMin: m.toleranceMin ?? "0",
            toleranceMax: m.toleranceMax ?? "0",
            unit: m.unit ?? "",
          };
        }) || [];

      const measurementData = savedSelections.length > 0
        ? allMeasurementData.filter((m) => savedSelections.includes(m.id))
        : allMeasurementData;

      setMeasurements(measurementData);

      const sizeData = formData[ayanCondition].savedMeasurements?.[selectedSize] ||
        formData[ayanCondition].partialSavedMeasurements?.[selectedSize] || {};

      const initialCheckValues = {};
      measurementData.forEach((m) => {
        initialCheckValues[m.id] = sizeData[m.id] || Array(PIECES_COUNT).fill("");
      });

      setCheckValues(initialCheckValues);

      const savedMeta = formData[ayanCondition].measurementMeta?.[selectedSize] || {};
      setMeasurementMeta(savedMeta);
    } else {
      setMeasurements([]);
      setCheckValues({});
      setSelectedMeasurements([]);
    }
  }, [selectedReference, selectedProduct, selectedSize, ayanCondition, formData]);

  // Reset when reference changes
  useEffect(() => {
    if (selectedReference) {
      setSelectedSize("");
      setMeasurements([]);
      setCheckValues({});
      setSelectedMeasurements([]);
      setMeasurementMeta({});
    }
  }, [selectedReference]);

  // Merge report data
  useEffect(() => {
    if (sizeTableData?.data && aqlData?.data) {
      const merged = aqlData.data.map((aqlItem) => {
        const matchingAllocations = sizeTableData.data.filter(
          (allocItem) => allocItem.reference === aqlItem.reference
        );

        return {
          ...aqlItem,
          allocations: matchingAllocations,
          allocationDetails: matchingAllocations.map((alloc) => ({
            id: alloc.id,
            partyName: alloc.Party?.name,
            lineName: alloc.LineMaster?.lineName,
            deliveryDate: alloc.DeliveryDate,
            allocationDate: alloc.allocationDate,
          })),
        };
      });
      setMergedReportData(merged);
    }
  }, [sizeTableData, aqlData, approveStatus]);

  // Storage management
  const loadSavedData = () => {
    const savedData = secureLocalStorage.getItem(storageKey);
    if (savedData) {
      setFormData(savedData);
      setFormStatus((prev) => ({
        ...prev,
        lastSaved: new Date(savedData.lastUpdated).toLocaleString(),
      }));
    }
  };

  const saveDataToStorage = () => {
    if (!selectedReference) return;

    const dataToSave = {
      ...formData,
      lastUpdated: new Date().toISOString(),
    };

    secureLocalStorage.setItem(storageKey, dataToSave);
    setFormStatus((prev) => ({
      ...prev,
      isDirty: false,
      lastSaved: new Date().toLocaleString(),
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

  // Load single inspection data
  useEffect(() => {
    if (singleData?.data && !formStatus.isDirty) {
      const data = singleData.data;
      setSelectedReference(data.reference || "");
      setId(data.id || "");
      setColor(data?.color || "");
      
      if (data.inspectionDate) {
        setInspectionDate(new Date(data.inspectionDate).toISOString().split("T")[0]);
      }
      
      if (data?.lineMasterId) {
        setSelectedLine(data?.lineMasterId);
      }

      const newFormData = {
        before: { savedSizes: [], savedMeasurements: {}, partialSavedMeasurements: {}, measurementMeta: {} },
        after: { savedSizes: [], savedMeasurements: {}, partialSavedMeasurements: {}, measurementMeta: {} },
      };

      // Process before condition data
      if (data.before && Array.isArray(data.before)) {
        newFormData.before.savedSizes = data.before.map((sample) => sample.size);

        data.before.forEach((sample) => {
          const size = sample.size;
          newFormData.before.savedMeasurements[size] = {};

          sample.measurements?.forEach((measurement) => {
            const values = Array(PIECES_COUNT).fill("");
            measurement.values?.forEach((valueObj) => {
              if (valueObj.pieceNumber <= PIECES_COUNT) {
                const val = valueObj.actualValue?.toString() || "";
                values[valueObj.pieceNumber - 1] = val && !isNaN(val) ? parseFloat(val).toFixed(2) : val;
              }
            });

            newFormData.before.savedMeasurements[size][measurement.measurementId] = values;
          });
        });
      }

      // Process after condition data
      if (data.after && Array.isArray(data.after)) {
        newFormData.after.savedSizes = data.after.map((sample) => sample.size);

        data.after.forEach((sample) => {
          const size = sample.size;
          newFormData.after.savedMeasurements[size] = {};

          sample.measurements?.forEach((measurement) => {
            const values = Array(PIECES_COUNT).fill("");
            measurement.values?.forEach((valueObj) => {
              if (valueObj.pieceNumber <= PIECES_COUNT) {
                const val = valueObj.actualValue?.toString() || "";
                values[valueObj.pieceNumber - 1] = val && !isNaN(val) ? parseFloat(val).toFixed(2) : val;
              }
            });

            newFormData.after.savedMeasurements[size][measurement.measurementId] = values;
          });
        });
      }

      setFormData(newFormData);
      const firstSize = data.before?.[0]?.size || data.after?.[0]?.size;
      if (firstSize) setSelectedSize(firstSize);
    }
  }, [singleData, formStatus.isDirty]);

  // Measurement value handlers
  const handleCheckValueChange = (measurementId, pieceIndex, value) => {
    if (readOnly) return;

    setCheckValues((prev) => ({
      ...prev,
      [measurementId]: prev[measurementId].map((val, idx) =>
        idx === pieceIndex ? value : val
      ),
    }));
    setFormStatus((prev) => ({ ...prev, isDirty: true }));
  };

  const handleMetaChange = (measurementId, field, value) => {
    setMeasurementMeta((prev) => ({
      ...prev,
      [measurementId]: {
        ...prev[measurementId],
        [field]: value,
      },
    }));
    setFormStatus((prev) => ({ ...prev, isDirty: true }));
  };

  // Size status helpers
  const isSizeComplete = (size, condition) => {
    const sizeData = formData[condition].savedMeasurements?.[size];
    if (!sizeData) return false;

    const currentMeasurements = measurements.filter(m => selectedMeasurements.includes(m.id));
    return currentMeasurements.every((measurement) => {
      const values = sizeData[measurement.id];
      return values && values.length === PIECES_COUNT && values.every(val => val !== "" && val !== null && val !== undefined);
    });
  };

  const isSizePartiallySaved = (size, condition) => {
    return formData[condition].partialSavedMeasurements.hasOwnProperty(size) && !isSizeComplete(size, condition);
  };

  const getSizeStatus = (size, condition) => {
    if (isSizeComplete(size, condition)) return "complete";
    if (isSizePartiallySaved(size, condition)) return "partial";
    return "none";
  };

  // Size management functions
  const handleLoadSize = (size) => {
    setSelectedSize(size);
    setShowSizeDropdown(false);
  };

  const handleSaveSize = () => {
    if (!selectedSize || readOnly) return;

    // Check if all selected measurements have values for all pieces
    const isComplete = measurements.every((measurement) => {
      return checkValues[measurement.id] &&
        checkValues[measurement.id].length === PIECES_COUNT &&
        checkValues[measurement.id].every(val => val !== "" && val !== null && val !== undefined);
    });

    if (!isComplete) {
      toast.error(`Please fill all measurements for all ${PIECES_COUNT} pieces before saving this size.`);
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [ayanCondition]: {
        ...prev[ayanCondition],
        savedMeasurements: {
          ...prev[ayanCondition].savedMeasurements,
          [selectedSize]: checkValues,
        },
        measurementMeta: {
          ...prev[ayanCondition].measurementMeta,
          [selectedSize]: measurementMeta,
        },
        partialSavedMeasurements: {
          ...prev[ayanCondition].partialSavedMeasurements,
          [selectedSize]: undefined,
        },
        savedSizes: [...new Set([...prev[ayanCondition].savedSizes, selectedSize])],
      },
    }));

    setFormStatus((prev) => ({ ...prev, isDirty: true }));
    toast.success(`Size ${selectedSize} measurements saved successfully!`);
  };

  const handlePartialSave = () => {
    if (!selectedSize || readOnly) return;

    setFormData((prev) => ({
      ...prev,
      [ayanCondition]: {
        ...prev[ayanCondition],
        partialSavedMeasurements: {
          ...prev[ayanCondition].partialSavedMeasurements,
          [selectedSize]: checkValues,
        },
        measurementMeta: {
          ...prev[ayanCondition].measurementMeta,
          [selectedSize]: measurementMeta,
        },
        savedSizes: [...new Set([...prev[ayanCondition].savedSizes, selectedSize])],
      },
    }));

    setFormStatus((prev) => ({ ...prev, isDirty: true }));
    toast.info("Partially saved measurements for this size.");
  };

  // Tolerance checking
  const checkTolerance = (measurement, value) => {
    if (!value || isNaN(value) || value === "") return "";
    const numericValue = parseFloat(value);
    const standardValue = parseFloat(measurement.standardValue);
    const toleranceMin = parseFloat(measurement.toleranceMin);
    const toleranceMax = parseFloat(measurement.toleranceMax);

    const deviation = numericValue - standardValue;

    if (deviation < 0 && Math.abs(deviation) > Math.abs(toleranceMin)) {
      return "bg-red-100 text-red-800";
    } else if (deviation > 0 && deviation > toleranceMax) {
      return "bg-red-100 text-red-800";
    }
    return "bg-green-100 text-green-800";
  };

  // CORRECTED: Prepare data for database submission - SUBMIT ALL SAVED SIZES
  const prepareDatabasePayload = () => {
    const getMeasurementsForSize = (size) => {
      return selectedProduct?.measurements
        ?.filter((m) => m.values?.some((v) => v.size === size))
        ?.map((m) => {
          const valueObj = m.values?.find((v) => v.size === size);
          return {
            id: m.id,
            name: m.description || "Unnamed",
            standardValue: valueObj?.value ?? "",
            toleranceMin: m.toleranceMin ?? "0",
            toleranceMax: m.toleranceMax ?? "0",
            unit: m.unit ?? "",
          };
        }) || [];
    };

    const prepareConditionData = (condition) => {
      // Get ALL saved sizes (both complete and partial)
      const allSavedSizes = formData[condition].savedSizes;
      
      return allSavedSizes.map((size) => {
        const sizeMeasurements = getMeasurementsForSize(size);
        const sizeMeta = formData[condition].measurementMeta?.[size] || {};

        // Get measurements from both complete and partial saves
        const completeMeasurements = formData[condition].savedMeasurements?.[size] || {};
        const partialMeasurements = formData[condition].partialSavedMeasurements?.[size] || {};
        
        // Combine both complete and partial measurements
        const allMeasurementsData = { ...partialMeasurements, ...completeMeasurements };

        return {
          size: size,
          measurements: sizeMeasurements
            .filter(measurement => Object.keys(allMeasurementsData).includes(measurement.id.toString()))
            .map((measurement) => {
              const meta = sizeMeta[measurement.id] || {};
              const measurementValues = allMeasurementsData[measurement.id] || [];
              
              return {
                measurementId: measurement.id,
                measurementName: measurement.name,
                standardValue: measurement.standardValue.toString(),
                toleranceMin: measurement.toleranceMin.toString(),
                toleranceMax: measurement.toleranceMax.toString(),
                unit: measurement.unit,
                machineNo: meta.machineNo || "",
                operationId: meta.operation || "",
                spi: meta.spi || "",
                defectId: meta.defect || "",
                correctiveActionId: meta.correctiveAction || "",
                values: measurementValues
                  .slice(0, PIECES_COUNT)
                  .map((value, index) => ({
                    pieceNumber: index + 1,
                    actualValue: value ? value.toString() : "",
                    status: value && value !== ""
                      ? checkTolerance(measurement, value).includes("red")
                        ? "out_of_tolerance"
                        : "within_tolerance"
                      : "not_measured",
                  })),
              };
            }),
        };
      }).filter(sizeData => sizeData.measurements.length > 0); // Only include sizes with measurements
    };

    return {
      reference: selectedReference,
      inspectionDate: inspectionDate,
      before: prepareConditionData("before"),
      after: prepareConditionData("after"),
      companyId: parseInt(companyId),
      userId: userId,
      lineMasterId: selectedLine,
      color: color,
      shift: selectedShift,
    };
  };

  // CORRECTED: Form submission - Submit ALL saved sizes
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if there are any saved sizes (complete or partial)
    const beforeSizes = formData.before.savedSizes.length;
    const afterSizes = formData.after.savedSizes.length;

    if (beforeSizes === 0 && afterSizes === 0) {
      toast.error("Please save at least one size (complete or partial) in either before or after condition before submitting.");
      return;
    }

    setFormStatus((prev) => ({ ...prev, isSubmitting: true }));

    try {
      const payload = prepareDatabasePayload();
      
      // Log the payload for debugging
      console.log("Submitting ALL sizes:", payload);
      
      let response;

      if (id) {
        response = await updateAqlInspection({ id, data: payload }).unwrap();
      } else {
        response = await addAqlInspection(payload).unwrap();
      }

      if (response.success) {
        const beforeCount = payload.before.length;
        const afterCount = payload.after.length;
        toast.success(`AQL Form submitted successfully! Submitted ${beforeCount} before sizes and ${afterCount} after sizes.`);
        secureLocalStorage.removeItem(storageKey);
        resetForm();
      } else {
        throw new Error(response.message || "Submission failed");
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(`Failed to submit AQL form: ${error.message}`);
    } finally {
      setFormStatus((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  // Utility functions
  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset the form? All unsaved data will be lost.")) {
      secureLocalStorage.removeItem(storageKey);
      setFormData({
        before: { savedSizes: [], savedMeasurements: {}, partialSavedMeasurements: {}, measurementMeta: {} },
        after: { savedSizes: [], savedMeasurements: {}, partialSavedMeasurements: {}, measurementMeta: {} },
      });
      setSelectedSize("");
      setCheckValues({});
      setSelectedMeasurements([]);
      setMeasurementMeta({});
      setFormStatus({ isDirty: false, lastSaved: null, isSubmitting: false });
      toast.success("Form reset successfully");
    }
  };

  const resetForm = () => {
    secureLocalStorage.removeItem(storageKey);
    setSelectedReference("");
    setSelectedSize("");
    setMeasurements([]);
    setCheckValues({});
    setColor("");
    setSelectedMeasurements([]);
    setMeasurementMeta({});
    setFormData({
      before: { savedSizes: [], savedMeasurements: {}, partialSavedMeasurements: {}, measurementMeta: {} },
      after: { savedSizes: [], savedMeasurements: {}, partialSavedMeasurements: {}, measurementMeta: {} },
    });
    setFormStatus({ isDirty: false, lastSaved: null, isSubmitting: false });
    setReadOnly(false);
    setId("");
    setAyanCondition("before");
    setShowCompare(false);
  };

  const addTimeButton = () => {
    const now = new Date();
    const timeString = now.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const updatedCheckValues = { ...checkValues };
    measurements.forEach((measurement) => {
      if (updatedCheckValues[measurement.id]) {
        updatedCheckValues[measurement.id] = updatedCheckValues[measurement.id].map((value) => 
          value === "" ? timeString : value
        );
      }
    });

    setCheckValues(updatedCheckValues);
    setFormStatus((prev) => ({ ...prev, isDirty: true }));
    toast.success(`Added current time (${timeString}) to all empty fields`);
  };

  const toggleAyanCondition = () => {
    if (formStatus.isDirty) {
      if (!window.confirm("You have unsaved changes. Switching ayan condition will lose your changes. Continue?")) {
        return;
      }
    }
    setAyanCondition((prev) => (prev === "before" ? "after" : "before"));
    setFormStatus((prev) => ({ ...prev, isDirty: false }));
  };

  // Data table handlers
  const onDataClick = (id) => {
    setId(id);
    setReadOnly(true);
    setNewItem(true);
    setShowCompare(false);
    setAyanCondition("before");
    setFormStatus((prev) => ({ ...prev, isDirty: false }));
  };

  const deleteData = async () => {
    if (deleteId) {
      if (!window.confirm("Are you sure to delete this inspection?")) return;
      try {
        await removeData(deleteId).unwrap();
        setId("");
        toast.success("Deleted Successfully");
        setDeleteId(null);
        setNewItem(false);
        refetchAqlData();
      } catch (error) {
        toast.error("Something went wrong");
      }
    }
  };

  const handleCancel = () => {
    if (formStatus.isDirty && !window.confirm("You have unsaved changes. Are you sure you want to cancel?")) {
      return;
    }
    setNewItem(false);
    resetForm();
  };

  // Measurement Selection Popup Component
  const MeasurementSelectionPopup = () => (
    <Modal isOpen={showMeasurementPopup} widthClass="w-[90%] max-w-4xl" onClose={() => setShowMeasurementPopup(false)}>
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-bold">Select Measurements for {selectedReference} - {selectedSize}</h3>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={clearMeasurementSelectionsForSize}
              className="px-3 py-1 text-xs bg-red-500 text-white rounded"
            >
              Clear This Size
            </button>
            <button
              type="button"
              onClick={clearAllMeasurementSelections}
              className="px-3 py-1 text-xs bg-orange-500 text-white rounded"
            >
              Clear All Sizes
            </button>
          </div>
        </div>

        <div className="mb-2 p-2 bg-blue-50 rounded">
          <p className="text-sm text-blue-700">
            <strong>Note:</strong> Your measurement selections will be saved specifically for <strong>{selectedSize}</strong> size. Each size can have different measurement preferences.
          </p>
        </div>

        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-gray-600">
            {selectedMeasurements.length} of {availableMeasurements.length} measurements selected for {selectedSize}
          </span>
          <div className="space-x-2">
            <button
              type="button"
              onClick={() => handleSelectAllMeasurements(true)}
              className="px-3 py-1 text-xs bg-blue-500 text-white rounded"
            >
              Select All
            </button>
            <button
              type="button"
              onClick={() => handleSelectAllMeasurements(false)}
              className="px-3 py-1 text-xs bg-gray-500 text-white rounded"
            >
              Deselect All
            </button>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {availableMeasurements.map((measurement) => (
              <div key={measurement.id} className="flex items-center p-2 border rounded">
                <input
                  type="checkbox"
                  checked={selectedMeasurements.includes(measurement.id)}
                  onChange={(e) => handleMeasurementSelection(measurement.id, e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm">
                  <span className="font-medium">{measurement.name}</span>
                  <div className="text-gray-500 text-xs">
                    Std: {measurement.standardValue} ({measurement.unit})
                  </div>
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center mt-4 pt-4 border-t">
          <div className="text-sm text-gray-600">
            Selections will be saved specifically for <strong>{selectedSize}</strong> size
          </div>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setShowMeasurementPopup(false)}
              className="px-4 py-2 text-sm bg-gray-300 text-gray-700 rounded"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={applyMeasurementSelection}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded"
            >
              Apply to Size- {selectedSize}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );

  // UI rendering functions
  const renderFormControls = () => (
    <div className={`grid ${isMobileView ? "grid-cols-3" : "grid-cols-1 md:grid-cols-7"} gap-4 mb-4`}>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Order Id <span className="text-red-500">*</span></label>
        <select
          value={selectedReference}
          onChange={(e) => {
            setSelectedReference(e.target.value);
            setSelectedSize("");
            setMeasurements([]);
            setCheckValues({});
            setSelectedMeasurements([]);
            setFormStatus((prev) => ({ ...prev, isDirty: false }));
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

      <div className="flex-1 min-w-[90px]">
        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Color *</label>
        <input
          type="text"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          placeholder="Color"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Inspection Date</label>
        <input
          type="date"
          value={inspectionDate}
          onChange={(e) => !readOnly && setInspectionDate(e.target.value)}
          readOnly={readOnly}
          className={`w-full px-3 py-2 text-xs border rounded-md shadow-sm ${readOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Line <span className="text-red-500">*</span></label>
        <select
          value={selectedLine}
          onChange={(e) => setSelectedLine(e.target.value)}
          disabled={readOnly}
          className="mt-0.5 block w-full pl-2.5 pr-7 py-2 text-xs border border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select a line</option>
          {CorrectLine?.map((line) => (
            <option key={line.id} value={line.id}>{line.lineName}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-2">
        <div className="w-1/3">
          <label className="block text-xs font-medium text-gray-700 mb-1">Size <span className="text-red-500">*</span></label>
          <div className="relative">
            <button
              type="button"
              onClick={() => !readOnly && setShowSizeDropdown(!showSizeDropdown)}
              disabled={!selectedReference || readOnly}
              className={`w-full px-3 py-2 text-left text-xs border rounded-md shadow-sm flex justify-between items-center 
                ${!selectedReference || readOnly ? "bg-gray-100 cursor-not-allowed" : "bg-white hover:border-blue-500"}
                ${selectedSize ? "border-blue-500" : "border-gray-300"}`}
            >
              <span className={selectedSize ? "text-gray-900" : "text-gray-500"}>{selectedSize || "size"}</span>
              <svg className={`h-4 w-4 text-gray-400 transition-transform ${showSizeDropdown ? "rotate-180" : ""}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
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
                          ${status === "complete" ? "bg-green-50" : status === "partial" ? "bg-yellow-50" : ""}
                          ${selectedSize === size ? "bg-blue-50" : ""}`}
                        onClick={() => handleLoadSize(size)}
                      >
                        <span>{size}</span>
                        <div className="flex items-center">
                          {status === "complete" && <span className="text-green-500 ml-2">✓</span>}
                          {status === "partial" && <span className="text-yellow-500 ml-2">~</span>}
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

        <div className="flex items-end">
          <button
            type="button"
            onClick={openMeasurementPopup}
            disabled={!selectedSize}
            className={`px-3 py-1 rounded-md shadow-sm h-9 text-xs font-medium ${!selectedSize ? "border border-sky-700 cursor-not-allowed text-gray-200" : " border border-sky-700 "}`}
          >
            <img src={Filter} alt="filter" className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Shift <span className="text-red-500">*</span></label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {shifts.map((shift) => (
            <button
              key={shift.id}
              type="button"
              onClick={() => setSelectedShift(shift.id)}
              className={`flex flex-col items-center justify-center border rounded-lg px-2 py-2 text-xs transition-all
                ${selectedShift === shift.id ? "border-blue-500 bg-blue-50 text-blue-700 font-semibold shadow-sm" : "border-gray-300 bg-white hover:border-blue-400"}`}
            >
              <span className="text-sm">{shift.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderMeasurementsTable = () => {
    if (measurements.length === 0 && selectedSize) {
      return (
        <div className="flex-1 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {selectedMeasurements.length === 0
                ? "No measurements selected"
                : "Loading measurements..."}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {selectedMeasurements.length === 0
                ? 'Click "Select Measurements" to choose which measurements to display.'
                : "Applying your saved measurement preferences..."}
            </p>
            <button
              type="button"
              onClick={openMeasurementPopup}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <img src={Filter} alt="filter" className="w-5 h-5 mr-2" />
              Select Measurements
            </button>
          </div>
        </div>
      );
    }

    if (measurements.length === 0) return null;

    const inputStyle = "w-full px-1.5 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-blue-500";
    const selectStyle = `${inputStyle} appearance-none bg-white bg-arrow bg-no-repeat bg-right`;

    if (isMobileView) {
      return (
        <div className="flex-1 overflow-hidden flex flex-col mb-2">
          <div className="overflow-auto flex-1 pb-2">
            {measurements.map((measurement) => (
              <div key={measurement.id} className="mb-3 border rounded p-2 bg-white">
                <div className="grid grid-cols-2 gap-1.5 mb-2">
                  <div className="flex flex-col">
                    <label className="text-xs text-gray-500 mb-0.5">M/c No</label>
                    <input
                      type="text"
                      value={measurementMeta[measurement.id]?.machineNo || ""}
                      onChange={(e) => handleMetaChange(measurement.id, "machineNo", e.target.value)}
                      className={inputStyle}
                      readOnly={readOnly}
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-xs text-gray-500 mb-0.5">Operation</label>
                    <select
                      value={measurementMeta[measurement.id]?.operation || ""}
                      onChange={(e) => handleMetaChange(measurement.id, "operation", e.target.value)}
                      className={selectStyle}
                      disabled={readOnly}
                      style={{ backgroundSize: "12px 12px", backgroundPosition: "right 4px center" }}
                    >
                      <option value="">Select</option>
                      {operationOptions?.map((option) => (
                        <option key={option.id} value={option.id}>{option.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-xs text-gray-500 mb-0.5">SPI</label>
                    <input
                      type="text"
                      value={measurementMeta[measurement.id]?.spi || ""}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, "");
                        if (value.length > 2) value = value.slice(0, 2);
                        handleMetaChange(measurement.id, "spi", value);
                      }}
                      className="w-12 px-1 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-center"
                      readOnly={readOnly}
                      maxLength={2}
                      inputMode="numeric"
                      pattern="[0-9]*"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-xs text-gray-500 mb-0.5">Defect</label>
                    <select
                      value={measurementMeta[measurement.id]?.defect || ""}
                      onChange={(e) => handleMetaChange(measurement.id, "defect", e.target.value)}
                      className={selectStyle}
                      disabled={readOnly}
                      style={{ backgroundSize: "12px 12px", backgroundPosition: "right 4px center" }}
                    >
                      <option value="">Select</option>
                      {defectOptions?.map((option) => (
                        <option key={option.id} value={option.id}>{option.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col col-span-2">
                    <label className="text-xs text-gray-500 mb-0.5">Corrective Action</label>
                    <select
                      value={measurementMeta[measurement.id]?.correctiveAction || ""}
                      onChange={(e) => handleMetaChange(measurement.id, "correctiveAction", e.target.value)}
                      className={selectStyle}
                      disabled={readOnly}
                      style={{ backgroundSize: "12px 12px", backgroundPosition: "right 4px center" }}
                    >
                      <option value="">Select</option>
                      {correctiveActionOptions?.map((option) => (
                        <option key={option.id} value={option.name}>{option.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-1.5">
                  <h4 className="text-xs font-medium text-gray-900">
                    {measurement.name} ({measurement.unit})
                  </h4>
                  <div className="text-xs text-gray-500">
                    Std: {measurement.standardValue} (Tol: -{measurement.toleranceMin}/+{measurement.toleranceMax})
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-1">
                  {checkValues[measurement.id]?.map((value, index) => (
                    <div key={index} className="flex flex-col">
                      <label className="text-xs text-gray-500 mb-0.5">#{index + 1}</label>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={value}
                        onChange={(e) => {
                          if (readOnly) return;
                          let raw = e.target.value;
                          raw = raw.replace(/[^\d.]/g, "");
                          const parts = raw.split(".");
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
                        className={`${inputStyle} text-center ${
                          value ? checkTolerance(measurement, value) : "border-gray-300"
                        } ${readOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
                        readOnly={readOnly}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    } else if (isTabletView) {
      return (
        <div className="flex-1 overflow-hidden flex flex-col mb-2">
          <div className="overflow-auto flex-1 pb-2">
            <table className="min-w-full bg-white border border-gray-200 text-xs">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-1.5 py-1.5 text-left font-medium text-gray-500 uppercase tracking-wider">M/c No</th>
                  <th className="px-1.5 py-1.5 text-left font-medium text-gray-500 uppercase tracking-wider">Operation</th>
                  <th className="px-1.5 py-1.5 text-left font-medium text-gray-500 uppercase tracking-wider">SPI</th>
                  <th className="px-1.5 py-1.5 text-left font-medium text-gray-500 uppercase tracking-wider">Defect</th>
                  <th className="px-1.5 py-1.5 text-left font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  <th className="px-1.5 py-1.5 text-left font-medium text-gray-500 uppercase tracking-wider">Measurement</th>
                  {Array.from({ length: PIECES_COUNT }, (_, i) => i + 1).map((num) => (
                    <th key={num} className="px-1 py-1 text-center font-medium text-gray-500 uppercase tracking-wider">#{num}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {measurements.map((measurement) => (
                  <tr key={measurement.id} className="hover:bg-gray-50">
                    <td className="px-1.5 py-1.5 whitespace-nowrap">
                      <input
                        type="text"
                        value={measurementMeta[measurement.id]?.machineNo || ""}
                        onChange={(e) => handleMetaChange(measurement.id, "machineNo", e.target.value)}
                        className={inputStyle}
                        readOnly={readOnly}
                      />
                    </td>
                    <td className="px-1.5 py-1.5 whitespace-nowrap">
                      <select
                        value={measurementMeta[measurement.id]?.operation || ""}
                        onChange={(e) => handleMetaChange(measurement.id, "operation", e.target.value)}
                        className={selectStyle}
                        disabled={readOnly}
                        style={{ backgroundSize: "10px 10px", backgroundPosition: "right 2px center" }}
                      >
                        <option value="">Select</option>
                        {operationOptions?.map((option) => (
                          <option key={option.id} value={option.id}>{option.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-1.5 py-1.5 whitespace-nowrap">
                      <input
                        type="text"
                        value={measurementMeta[measurement.id]?.spi || ""}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, "");
                          if (value.length > 2) value = value.slice(0, 2);
                          handleMetaChange(measurement.id, "spi", value);
                        }}
                        className="w-12 px-1 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-center"
                        readOnly={readOnly}
                        maxLength={2}
                        inputMode="numeric"
                        pattern="[0-9]*"
                      />
                    </td>
                    <td className="px-1.5 py-1.5 whitespace-nowrap">
                      <select
                        value={measurementMeta[measurement.id]?.defect || ""}
                        onChange={(e) => handleMetaChange(measurement.id, "defect", e.target.value)}
                        className={selectStyle}
                        disabled={readOnly}
                        style={{ backgroundSize: "10px 10px", backgroundPosition: "right 2px center" }}
                      >
                        <option value="">Select</option>
                        {defectOptions?.map((option) => (
                          <option key={option.id} value={option.id}>{option.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-1.5 py-1.5 whitespace-nowrap">
                      <select
                        value={measurementMeta[measurement.id]?.correctiveAction || ""}
                        onChange={(e) => handleMetaChange(measurement.id, "correctiveAction", e.target.value)}
                        className={selectStyle}
                        disabled={readOnly}
                        style={{ backgroundSize: "10px 10px", backgroundPosition: "right 2px center" }}
                      >
                        <option value="">Select</option>
                        {correctiveActionOptions?.map((option) => (
                          <option key={option.id} value={option.name}>{option.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-1.5 py-1.5 whitespace-nowrap font-medium text-gray-900">
                      <div>{measurement.name}</div>
                      <div className="text-gray-500">Std: {measurement.standardValue}</div>
                      <div className="text-gray-500">Tol: -{measurement.toleranceMin}/+{measurement.toleranceMax}</div>
                    </td>
                    {checkValues[measurement.id]?.map((value, index) => (
                      <td key={index} className="px-1 py-1 whitespace-nowrap">
                        <input
                          type="number"
                          value={value}
                          onChange={(e) => {
                            if (readOnly) return;
                            let rawValue = e.target.value;
                            rawValue = rawValue.replace(/[^0-9.]/g, "");
                            const parts = rawValue.split(".");
                            if (parts.length > 2) {
                              rawValue = parts[0] + "." + parts.slice(1).join("");
                            }
                            if (parts[1] && parts[1].length > 2) {
                              rawValue = parts[0] + "." + parts[1].substring(0, 2);
                            }
                            handleCheckValueChange(measurement.id, index, rawValue);
                          }}
                          onBlur={(e) => {
                            if (readOnly) return;
                            let val = e.target.value;
                            if (val === "") {
                              handleCheckValueChange(measurement.id, index, "");
                              return;
                            }
                            val = parseFloat(val).toFixed(2);
                            handleCheckValueChange(measurement.id, index, val);
                          }}
                          className={`${inputStyle} text-center ${
                            value ? checkTolerance(measurement, value) : "border-gray-300"
                          } ${readOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
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
      );
    } else {
      return (
        <div className="flex-1 overflow-hidden flex flex-col mb-2">
          <div className="overflow-auto flex-1 pb-2">
            <table className="min-w-full bg-white border border-gray-200 text-xs">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th rowSpan="2" className="px-2 py-1.5 text-left font-medium text-gray-500 uppercase tracking-wider">M/c No</th>
                  <th rowSpan="2" className="px-2 py-1.5 text-left font-medium text-gray-500 uppercase tracking-wider">Operation</th>
                  <th rowSpan="2" className="px-2 py-1.5 text-left font-medium text-gray-500 uppercase tracking-wider">SPI</th>
                  <th rowSpan="2" className="px-2 py-1.5 text-left font-medium text-gray-500 uppercase tracking-wider">Defect</th>
                  <th rowSpan="2" className="px-2 py-1.5 text-left font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  <th rowSpan="2" className="px-2 py-1.5 text-left font-medium text-gray-500 uppercase tracking-wider">Measurement</th>
                  <th rowSpan="2" className="px-2 py-1.5 text-left font-medium text-gray-500 uppercase tracking-wider">Std</th>
                  <th rowSpan="2" className="px-2 py-1.5 text-left font-medium text-gray-500 uppercase tracking-wider">Tolerance</th>
                  <th colSpan={PIECES_COUNT} className="px-2 py-1.5 text-center font-medium text-gray-500 uppercase tracking-wider">
                    Pieces (1-{PIECES_COUNT})
                  </th>
                </tr>
                <tr>
                  {Array.from({ length: PIECES_COUNT }, (_, i) => i + 1).map((num) => (
                    <th key={num} className="px-1 py-1 text-center font-medium text-gray-500 uppercase tracking-wider">#{num}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {measurements.map((measurement) => (
                  <tr key={measurement.id} className="hover:bg-gray-50">
                    <td className="px-2 py-1.5 whitespace-nowrap">
                      <input
                        type="text"
                        value={measurementMeta[measurement.id]?.machineNo || ""}
                        onChange={(e) => handleMetaChange(measurement.id, "machineNo", e.target.value)}
                        className={inputStyle}
                        readOnly={readOnly}
                      />
                    </td>
                    <td className="px-2 py-1.5 whitespace-nowrap">
                      <select
                        value={measurementMeta[measurement.id]?.operation || ""}
                        onChange={(e) => handleMetaChange(measurement.id, "operation", e.target.value)}
                        className={selectStyle}
                        disabled={readOnly}
                        style={{ backgroundSize: "10px 10px", backgroundPosition: "right 4px center" }}
                      >
                        <option value="">Select</option>
                        {operationOptions?.map((option) => (
                          <option key={option.id} value={option.id}>{option.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-2 py-1.5 whitespace-nowrap">
                      <input
                        type="text"
                        value={measurementMeta[measurement.id]?.spi || ""}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, "");
                          if (value.length > 2) value = value.slice(0, 2);
                          handleMetaChange(measurement.id, "spi", value);
                        }}
                        className="w-12 px-1 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-center"
                        readOnly={readOnly}
                        maxLength={2}
                        inputMode="numeric"
                        pattern="[0-9]*"
                      />
                    </td>
                    <td className="px-2 py-1.5 whitespace-nowrap">
                      <select
                        value={measurementMeta[measurement.id]?.defect || ""}
                        onChange={(e) => handleMetaChange(measurement.id, "defect", e.target.value)}
                        className={selectStyle}
                        disabled={readOnly}
                        style={{ backgroundSize: "10px 10px", backgroundPosition: "right 4px center" }}
                      >
                        <option value="">Select</option>
                        {defectOptions?.map((option) => (
                          <option key={option.id} value={option.id}>{option.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-2 py-1.5 whitespace-nowrap">
                      <select
                        value={measurementMeta[measurement.id]?.correctiveAction || ""}
                        onChange={(e) => handleMetaChange(measurement.id, "correctiveAction", e.target.value)}
                        className={selectStyle}
                        disabled={readOnly}
                        style={{ backgroundSize: "10px 10px", backgroundPosition: "right 4px center" }}
                      >
                        <option value="">Select</option>
                        {correctiveActionOptions?.filter((option) => option.defectId === Number(measurementMeta[measurement.id]?.defect))?.map((option) => (
                          <option key={option.id} value={option.id}>{option.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-2 py-1.5 whitespace-nowrap font-medium text-gray-900">
                      {measurement.name} ({measurement.unit})
                    </td>
                    <td className="px-2 py-1.5 whitespace-nowrap text-gray-500">
                      {measurement.standardValue}
                    </td>
                    <td className="px-2 py-1.5 whitespace-nowrap text-gray-500">
                      -{measurement.toleranceMin}/+{measurement.toleranceMax}
                    </td>
                    {checkValues[measurement.id]?.map((value, index) => (
                      <td key={index} className="px-1 py-1 whitespace-nowrap">
                        <input
                          type="number"
                          value={value}
                          onChange={(e) => {
                            if (readOnly) return;
                            let rawValue = e.target.value;
                            rawValue = rawValue.replace(/[^0-9.]/g, "");
                            const parts = rawValue.split(".");
                            if (parts.length > 2) {
                              rawValue = parts[0] + "." + parts.slice(1).join("");
                            }
                            if (parts[1] && parts[1].length > 2) {
                              rawValue = parts[0] + "." + parts[1].substring(0, 2);
                            }
                            handleCheckValueChange(measurement.id, index, rawValue);
                          }}
                          onBlur={(e) => {
                            if (readOnly) return;
                            let val = e.target.value;
                            if (val === "") {
                              handleCheckValueChange(measurement.id, index, "");
                              return;
                            }
                            val = parseFloat(val).toFixed(2);
                            handleCheckValueChange(measurement.id, index, val);
                          }}
                          className={`${inputStyle} text-center ${
                            value ? checkTolerance(measurement, value) : "border-gray-300"
                          } ${readOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
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
      );
    }
  };

  const renderActionButtons = () => (
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
                onClick={addTimeButton}
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Add Time
              </button>

              <button
                type="button"
                onClick={handlePartialSave}
                disabled={!selectedSize}
                className={`px-3 py-2 rounded-md shadow-sm text-xs font-medium text-white
                  ${!selectedSize ? "bg-gray-400 cursor-not-allowed" : "bg-yellow-500 hover:bg-yellow-600"}`}
              >
                Partial Save
              </button>

              <button
                type="button"
                onClick={handleSaveSize}
                disabled={!selectedSize}
                className={`px-3 py-2 rounded-md shadow-sm text-xs font-medium text-white
                  ${!selectedSize ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
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
          disabled={formStatus.isSubmitting || (formData.before.savedSizes.length === 0 && formData.after.savedSizes.length === 0)}
          className={`px-3 py-2 rounded-md shadow-sm text-xs font-medium text-white
            ${formStatus.isSubmitting || (formData.before.savedSizes.length === 0 && formData.after.savedSizes.length === 0)
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"}`}
        >
          {formStatus.isSubmitting ? "Submitting..." : id ? "Update" : "Submit All"}
        </button>
      )}
    </div>
  );

  // Table configuration
  const tableHeaders = ["ID", "Reference", "Inspection Date", "Party", "Line", "Delivery Date"];
  const tableDataNames = [
    "dataObj?.id",
    "dataObj?.reference",
    "new Date(dataObj?.inspectionDate).toLocaleDateString()",
    "dataObj?.allocationDetails?.[0]?.partyName || 'N/A'",
    "dataObj?.allocationDetails?.[0]?.lineName || 'N/A'",
    "dataObj?.allocationDetails?.[0]?.deliveryDate ? new Date(dataObj.allocationDetails[0].deliveryDate).toLocaleDateString() : 'N/A'",
  ];

  return (
    <>
      <MeasurementSelectionPopup />

      <Modal isOpen={isDetailView} widthClass={"w-[50%] h-[70%]"} onClose={() => setIsDetailView(false)}></Modal>

      {newItem === false ? (
        <>
          <div className="bg-white px-4 py-2 flex items-center justify-between">
            <h1 className="text-lg font-bold text-gray-800">AQL Inspection Report</h1>
            <button
              onClick={() => {
                setId("");
                setNewItem(true);
                setSelectedMeasurements([]);
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
            refetchAqlData={refetchAqlData}
            data={mergedReportData}
            deleteData={deleteData}
            setReadOnly={setReadOnly}
            setDeleteId={setDeleteId}
            setIsDetailView={setIsDetailView}
            isDetailView={isDetailView}
            approveStatus={approveStatus}
            setApproveStatus={setApproveStatus}
          />
        </>
      ) : (
        <div className="min-h-screen bg-gray-50">
          <div className="w-full">
            <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col" style={{ minHeight: "calc(100vh - 2rem)" }}>
              <div className="bg-white px-4 py-2 flex items-center justify-between">
                <h1 className="text-lg font-bold text-gray-800">
                  {id ? "Seven Sample Inspection Details" : "Seven Sample Inspection Form"}
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
                  {renderFormControls()}
                  {renderMeasurementsTable()}
                  {renderActionButtons()}
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