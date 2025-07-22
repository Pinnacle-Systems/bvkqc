import React, { useState, useMemo, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import secureLocalStorage from "react-secure-storage";
import { useGetPartyQuery } from "../../../redux/services/PartyMasterService";
import { useGetLineMasterQuery } from "../../../redux/services/LineMasterService";
import { useGetBranchQuery } from "../../../redux/services/BranchMasterService";
import {
  useGetSizeTableMasterByReferenceQuery,
  useAddAllocationMasterMutation,
  useGetAllocationMasterQuery,
  useUpdateAllocationMasterMutation,
  useDeleteAllocationMasterMutation,
} from "../../../redux/uniformService/SizeTableMasterService";
import { toast } from "react-toastify";
import { format, isAfter, isToday } from "date-fns";
import {
  RiPlayListAddLine,
  RiEyeLine,
  RiPencilLine,
  RiDeleteBinLine,
  RiFileSearchLine,
} from "react-icons/ri";

const AllocationMasterTable = ({
  data,
  onView,
  onEdit,
  onDelete,
  onAddNew,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!data) return [];
    const term = searchTerm.toLowerCase();
    return data.filter(
      (item) =>
        item.Party?.name?.toLowerCase().includes(term) ||
        item.Branch?.branchName?.toLowerCase().includes(term) ||
        item.LineMaster?.lineName?.toLowerCase().includes(term) ||
        item.reference?.toLowerCase().includes(term) || // Added reference search
        format(new Date(item.DeliveryDate), "MMM dd, yyyy")
          .toLowerCase()
          .includes(term)
    );
  }, [data, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const currentData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, currentPage, rowsPerPage]);

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="bg-white w-full rounded-sm border border-gray-200 shadow-xs overflow-hidden">
      {/* Header Section - Compact */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-2 sm:p-3 bg-gray-50 border-b">
        <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-1 sm:mb-0">
          Allocation List
        </h2>
        <div className="flex flex-row w-full sm:w-auto gap-1 items-center">
          <div className="relative flex-grow sm:max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
              <svg
                className="w-3 h-3 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search..."
              className="block w-full pl-6 pr-2 py-1 text-xs border border-gray-300 rounded-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button
            onClick={onAddNew}
            className="flex items-center justify-center text-white bg-indigo-600 hover:bg-indigo-700 px-2 py-1 rounded-sm transition-colors text-xs font-medium whitespace-nowrap"
          >
            <RiPlayListAddLine className="mr-1 text-xs" />
            Add New
          </button>
        </div>
      </div>

      {/* Table Section - Compact */}
      <div className="overflow-x-auto w-full">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-3 py-2 text-left text-[10px] font-semibold text-gray-700 uppercase tracking-wider"
              >
                Reference
              </th>
              <th
                scope="col"
                className="px-3 py-2 text-left text-[10px] font-semibold text-gray-700 uppercase tracking-wider"
              >
                Party
              </th>
              <th
                scope="col"
                className="px-3 py-2 text-left text-[10px] font-semibold text-gray-700 uppercase tracking-wider"
              >
                Branch
              </th>
              <th
                scope="col"
                className="px-3 py-2 text-left text-[10px] font-semibold text-gray-700 uppercase tracking-wider"
              >
                Line
              </th>
              <th
                scope="col"
                className="px-3 py-2 text-left text-[10px] font-semibold text-gray-700 uppercase tracking-wider"
              >
                Delivery Date
              </th>
              <th
                scope="col"
                className="px-3 py-2 text-right text-[10px] font-semibold text-gray-700 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentData.length > 0 ? (
              currentData.map((allocation) => (
                <tr key={allocation.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                    {allocation.reference || (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700">
                    {allocation.Party?.name || (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700">
                    {allocation.Branch?.branchName || (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700">
                    {allocation.LineMaster?.lineName || (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700">
                    {allocation.DeliveryDate ? (
                      format(new Date(allocation.DeliveryDate), "MM/dd/yyyy")
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-right text-xs font-medium">
                    <div className="flex justify-end space-x-1">
                      <button
                        onClick={() => onView(allocation.id)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded-sm hover:bg-blue-50"
                        title="View"
                      >
                        <RiEyeLine className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => onEdit(allocation.id)}
                        className="text-green-600 hover:text-green-900 p-1 rounded-sm hover:bg-green-50"
                        title="Edit"
                      >
                        <RiPencilLine className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => onDelete(allocation.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded-sm hover:bg-red-50"
                        title="Delete"
                      >
                        <RiDeleteBinLine className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-3 py-4 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <RiFileSearchLine className="w-4 h-4 text-gray-400 mb-1" />
                    <p className="text-gray-500 text-xs">
                      No allocations found
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Compact Pagination */}
      {totalPages > 1 && (
        <div className="px-2 py-2 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="text-[10px] text-gray-700">
            Showing{" "}
            <span className="font-semibold">
              {(currentPage - 1) * rowsPerPage + 1}-
              {Math.min(currentPage * rowsPerPage, filteredData.length)}
            </span>{" "}
            of <span className="font-semibold">{filteredData.length}</span>
          </div>
          <div className="flex items-center gap-1">
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="text-[10px] border border-gray-300 rounded-sm px-1 py-0.5 bg-white"
            >
              {[10, 25, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>

            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-1.5 py-0.5 text-[10px] rounded-sm border ${
                currentPage === 1
                  ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              ‹
            </button>

            <span className="px-1.5 py-0.5 text-[10px] text-gray-700">
              {currentPage}/{totalPages}
            </span>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-1.5 py-0.5 text-[10px] rounded-sm border ${
                currentPage === totalPages
                  ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const AllocationForm = () => {
  const today = new Date();
  const companyId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userCompanyId"
  );

  const [selectedId, setSelectedId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [update, setUpdate] = useState(false);
  const {
    data: parties = [],
    isLoading: partiesLoading,
    error: partiesError,
  } = useGetPartyQuery({ params: { companyId } });

  const {
    data: lines = [],
    isLoading: linesLoading,
    error: linesError,
  } = useGetLineMasterQuery({ params: { companyId } });

  const {
    data: sizeTableData,
    isLoading: sizeTableLoading,
    error: sizeTableError,
  } = useGetSizeTableMasterByReferenceQuery();

  const {
    data: branches = [],
    isLoading: branchesLoading,
    error: branchesError,
  } = useGetBranchQuery({ params: { companyId } });

  const {
    data: allocations = [],
    isLoading: allocationsLoading,
    refetch: refetchAllocations,
  } = useGetAllocationMasterQuery();

  const [createAllocation] = useAddAllocationMasterMutation();
  const [updateAllocation] = useUpdateAllocationMasterMutation();
  const [deleteAllocation] = useDeleteAllocationMasterMutation();

  // Form Configuration
  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      partyId: "",
      branchId: "",
      lineMasterId: "",
      deliveryDate: null,
      reference: "",
    },
  });

  // Handlers
  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        deliveryDate: formData.deliveryDate.toISOString(),
        companyId: Number(companyId),
      };

      const result = selectedId
        ? await updateAllocation({
            id: selectedId,
            payload,
          }).unwrap()
        : await createAllocation(payload).unwrap();

      if (result.success) {
        toast.success(result.message || "Operation successful!");
        resetForm();
        refetchAllocations();
      } else {
        throw new Error(result.message || "Operation failed");
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(error.data?.message || error.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = useCallback(
    (id) => {
      const allocation = allocations.data?.find((item) => item.id === id);
      if (allocation) {
        setSelectedId(id);
        setValue("partyId", allocation.partyId);
        setValue("branchId", allocation.branchId);
        setValue("lineMasterId", allocation.lineMasterId);
        console.log(allocation.reference, "reference");
        setValue("reference", allocation.reference);
        setValue("deliveryDate", new Date(allocation.DeliveryDate));
        setShowForm(true);
        setReadOnly(false);
      }
    },
    [allocations.data, setValue]
  );
  console.log(allocations, "allocations");
  const handleView = useCallback(
    (id) => {
      const allocation = allocations.data?.find((item) => item.id === id);
      if (allocation) {
        setSelectedId(id);
        setUpdate(true);
        setValue("partyId", allocation.partyId);
        setValue("branchId", allocation.branchId);
        setValue("lineMasterId", allocation.lineMasterId);
        setValue("reference", allocation.reference);
        setValue("reference", allocation.reference);
        setValue("deliveryDate", new Date(allocation.DeliveryDate));

        setShowForm(true);
        setReadOnly(true);
      }
    },
    [allocations.data, setValue]
  );
  console.log(selectedId, "selectedId");
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this allocation?")) {
      try {
        const result = await deleteAllocation(id).unwrap();
        if (result.success) {
          toast.success("Allocation deleted successfully");
          refetchAllocations();
        } else {
          throw new Error(result.message || "Deletion failed");
        }
      } catch (error) {
        console.error("Deletion error:", error);
        toast.error(error.data?.message || error.message || "Deletion failed");
      }
    }
  };

  const resetForm = () => {
    reset();
    setSelectedId(null);
    setShowForm(false);
    setReadOnly(false);
  };

  const handleAddNew = () => {
    resetForm();
    setShowForm(true);
  };

  // Validation Functions
  const validateFutureDate = (date) => {
    return (
      isAfter(date, today) ||
      isToday(date) ||
      "Date must be today or in the future"
    );
  };
  const uniqueReferences = useMemo(() => {
    if (!allocations?.data || !sizeTableData?.data) return [];

    const allocatedRefs = new Set(
      allocations.data.map((item) => item.reference)
    );
    console.log(typeof allocatedRefs, "typeof");

    const filtered = sizeTableData.data
      .filter((item) => !allocatedRefs.has(item.reference))
      .map((item) => item.reference); 
    return [...new Set(filtered)]; // Unique list
  }, [allocations, sizeTableData]);

  if (partiesError || linesError || branchesError || sizeTableError) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              Failed to load required data. Please try again later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[f1f1f0] py-6 px-4 sm:px-6 lg:px-8">
      {showForm ? (
        <div className="max-w-3xl mx-auto">
          <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
            <div className="bg-indigo-600 px-5 py-3">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-white">
                  {selectedId
                    ? readOnly
                      ? "View Allocation"
                      : "Edit Allocation"
                    : "Create New Allocation"}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-300 hover:text-white"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <form
              onSubmit={handleSubmit(handleFormSubmit)}
              className="p-5 space-y-4"
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Reference Field */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                    Reference <span className="text-red-500">*</span>
                  </label>
                  {}
                  <div className="relative">
                    <select
                      {...register("reference", {
                        required: "Reference selection is required",
                      })}
                      disabled={readOnly || sizeTableLoading}
                      placeholder="Select a Reference"
                      className={`w-full px-4 py-2 text-xs border rounded-xl shadow-sm appearance-none
                        ${
                          errors.reference
                            ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                            : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                        } 
                        focus:ring-2 transition-all`}
                    >
                      <option value="">Select reference</option>
                      {uniqueReferences.map((ref, index) => (
                        <option key={index} value={ref}>
                          {ref}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                  {errors.reference && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.reference.message}
                    </p>
                  )}
                  {sizeTableLoading && (
                    <p className="mt-1 text-xs text-gray-500">
                      Loading references...
                    </p>
                  )}
                </div>

                {/* Party Field */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                    Party <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      {...register("partyId", {
                        required: "Party selection is required",
                        valueAsNumber: true,
                      })}
                      disabled={readOnly || partiesLoading}
                      className={`w-full px-4 py-2 text-xs border rounded-xl shadow-sm appearance-none
                        ${
                          errors.partyId
                            ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                            : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                        } 
                        focus:ring-2 transition-all`}
                    >
                      <option value="">Select party</option>
                      {parties?.data?.map((party) => (
                        <option key={party.id} value={party.id}>
                          {party.name} ({party.aliasName})
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                  {errors.partyId && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.partyId.message}
                    </p>
                  )}
                </div>

                {/* Branch Field */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Branch <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register("branchId", {
                      required: "Branch selection is required",
                      valueAsNumber: true,
                    })}
                    disabled={readOnly || branchesLoading}
                    className={`mt-0.5 block w-full pl-2.5 pr-7 py-1.5 text-xs border rounded shadow-sm
                      ${
                        errors.branchId
                          ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                          : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      } 
                      focus:ring-1 transition-colors`}
                  >
                    <option value="">Select a branch</option>
                    {branches?.data?.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.branchName}
                      </option>
                    ))}
                  </select>
                  {errors.branchId && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.branchId.message}
                    </p>
                  )}
                </div>

                {/* Line Field */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Line <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register("lineMasterId", {
                      required: "Line selection is required",
                      valueAsNumber: true,
                    })}
                    disabled={readOnly || linesLoading}
                    className={`mt-0.5 block w-full pl-2.5 pr-7 py-1.5 text-xs border rounded shadow-sm
                      ${
                        errors.lineMasterId
                          ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                          : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      } 
                      focus:ring-1 transition-colors`}
                  >
                    <option value="">Select a line</option>
                    {lines?.data?.map((line) => (
                      <option key={line.id} value={line.id}>
                        {line.lineName}
                      </option>
                    ))}
                  </select>
                  {errors.lineMasterId && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.lineMasterId.message}
                    </p>
                  )}
                </div>

                {/* Today's Date */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Today's Date
                  </label>
                  <input
                    type="text"
                    value={format(today, "MMM dd, yyyy")}
                    readOnly
                    className="mt-0.5 block w-full px-2.5 py-1.5 text-xs border border-gray-300 bg-gray-50 rounded shadow-sm"
                  />
                </div>

               
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Delivery Date <span className="text-red-500">*</span>
                  </label>  
                  <Controller
                    name="deliveryDate"
                    control={control}
                    rules={{
                      required: "Delivery date is required",
                      validate: validateFutureDate,
                    }}
                    render={({ field }) => (
                      <DatePicker
                        selected={field.value}
                        onChange={field.onChange}
                        minDate={today}
                        disabled={readOnly}
                        placeholderText="Select date"
                        className={`mt-0.5 block w-full px-2.5 py-1.5 text-xs border rounded shadow-sm
                          ${
                            errors.deliveryDate
                              ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                              : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                          } 
                          focus:ring-1 transition-colors`}
                      />
                    )}
                  />
                  {errors.deliveryDate && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.deliveryDate.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-blue-500 transition-colors"
                >
                  Cancel
                </button>
                {!readOnly && (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-3 py-1.5 text-xs font-medium text-white rounded shadow-sm transition-colors
                      ${
                        isSubmitting
                          ? "bg-indigo-400 cursor-not-allowed"
                          : "bg-indigo-600 hover:bg-indigo-700 focus:ring-1 focus:ring-offset-1 focus:ring-indigo-500"
                      }`}
                  >
                    {isSubmitting
                      ? "Processing..."
                      : selectedId
                      ? "Update"
                      : "Submit"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto">
          <AllocationMasterTable
            data={allocations?.data || []}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAddNew={handleAddNew}
          />
        </div>
      )}
    </div>
  );
};

export default AllocationForm;
