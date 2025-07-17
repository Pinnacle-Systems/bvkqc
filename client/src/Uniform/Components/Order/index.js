import React, { useState, useMemo, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import secureLocalStorage from "react-secure-storage";
import { useGetPartyQuery } from "../../../redux/services/PartyMasterService";
import { useGetLineMasterQuery } from "../../../redux/services/LineMasterService";
import { useGetBranchQuery } from "../../../redux/services/BranchMasterService";
import { useGetSizeTableMasterByReferenceQuery } from "../../../redux/uniformService/SizeTableMasterService";
import { 
  useAddAllocationMasterMutation, 
  useGetAllocationMasterQuery,
  useUpdateAllocationMasterMutation,
  useDeleteAllocationMasterMutation 
} from "../../../redux/uniformService/SizeTableMasterService";
import { toast } from "react-toastify";
import { format, isAfter, isToday } from "date-fns";
import { RiPlayListAddLine, RiEyeLine, RiPencilLine, RiDeleteBinLine } from "react-icons/ri";

const AllocationMasterTable = ({ 
  data, 
  onView, 
  onEdit, 
  onDelete,
  onAddNew
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!data) return [];
    const term = searchTerm.toLowerCase();
    return data.filter(item => 
      (item.Party?.name?.toLowerCase().includes(term)) ||
      (item.Branch?.branchName?.toLowerCase().includes(term)) ||
      (item.LineMaster?.lineName?.toLowerCase().includes(term)) ||
      (format(new Date(item.DeliveryDate), "MMM dd, yyyy").toLowerCase().includes(term))
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
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="flex justify-between items-center p-4 bg-gray-50 border-b">
        <h2 className="text-lg font-semibold text-gray-800">Allocation List</h2>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search allocations..."
              className="pl-8 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg 
              className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <button
            onClick={onAddNew}
            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
          >
            <RiPlayListAddLine className="mr-1" />
            Add New
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Party
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Branch
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Line
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Delivery Date
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentData.length > 0 ? (
              currentData.map((allocation) => (
                <tr 
                  key={allocation.id} 
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                    {allocation.Party?.name || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                    {allocation.Branch?.branchName || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                    {allocation.LineMaster?.lineName || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                    {allocation.DeliveryDate 
                      ? format(new Date(allocation.DeliveryDate), "MMM dd, yyyy")
                      : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => onView(allocation.id)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                        title="View"
                      >
                        <RiEyeLine className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => onEdit(allocation.id)}
                        className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 transition-colors"
                        title="Edit"
                      >
                        <RiPencilLine className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => onDelete(allocation.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <RiDeleteBinLine className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                  No allocations found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{currentData.length}</span> of{" "}
            <span className="font-medium">{filteredData.length}</span> results
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              {[10, 25, 50].map(size => (
                <option key={size} value={size}>
                  Show {size}
                </option>
              ))}
            </select>
            
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 text-sm rounded border ${
                currentPage === 1 
                  ? "text-gray-400 cursor-not-allowed" 
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Previous
            </button>
            
            <span className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 text-sm rounded border ${
                currentPage === totalPages 
                  ? "text-gray-400 cursor-not-allowed" 
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Main Allocation Form Component
const AllocationForm = () => {
  // Constants and Initial State
  const today = new Date();
  const companyId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userCompanyId"
  );
  
  const [selectedId, setSelectedId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // API Queries
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
    data: sizeTable =[],
    isLoading:sizeTableLoading,
    error: sizeTableerror
  } = useGetSizeTableMasterByReferenceQuery()
  console.log(sizeTable?.data,"sizeTable")

  const {
    data: branches = [],
    isLoading: branchesLoading,
    error: branchesError,
  } = useGetBranchQuery({ params: { companyId } });

  const { 
    data: allocations = [], 
    isLoading: allocationsLoading,
    refetch: refetchAllocations 
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
    },
  });

  // Handlers
  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        deliveryDate: formData.deliveryDate.toISOString(),
        ...(selectedId && { id: selectedId })
      };

      const result = selectedId 
        ? await updateAllocation(payload).unwrap()
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

  const handleEdit = useCallback((id) => {
    const allocation = allocations.data?.find(item => item.id === id);
    if (allocation) {
      setSelectedId(id);
      setValue("partyId", allocation.partyId);
      setValue("branchId", allocation.branchId);
      setValue("lineMasterId", allocation.lineMasterId);
      setValue("deliveryDate", new Date(allocation.DeliveryDate));
      setShowForm(true);
      setReadOnly(false);
    }
  }, [allocations.data, setValue]);

  const handleView = useCallback((id) => {
    const allocation = allocations.data?.find(item => item.id === id);
    if (allocation) {
      setSelectedId(id);
      setValue("partyId", allocation.partyId);
      setValue("branchId", allocation.branchId);
      setValue("lineMasterId", allocation.lineMasterId);
      setValue("deliveryDate", new Date(allocation.DeliveryDate));
      setShowForm(true);
      setReadOnly(true);
    }
  }, [allocations.data, setValue]);

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
    return isAfter(date, today) || isToday(date) || "Date must be today or in the future";
  };



  if (partiesError || linesError || branchesError) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
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
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      {showForm ? (
        <div className="max-w-3xl mx-auto">
          <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
            <div className="bg-indigo-600 px-5 py-3">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-white">
                  {selectedId ? (readOnly ? "View Allocation" : "Edit Allocation") : "Create New Allocation"}
                </h2>
                <button 
                  onClick={resetForm}
                  className="text-gray-300 hover:text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit(handleFormSubmit)} className="p-5 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Party Field */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                    Refernce <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      {...register("reference", {
                        required: "reference selection is required",
                        valueAsNumber: true
                      })}
                      disabled={readOnly}
                      className={`w-full px-4 py-2 text-xs border rounded-xl shadow-sm appearance-none
                        ${errors.referenceId ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"} 
                        focus:ring-2 transition-all`}
                    >
                      <option value="">Select reference</option>
                      {allocations?.data?.map((allocation) => (
                        <option key={allocation.id} value={allocation.id}>
                          {allocation.name} ({allocation.aliasName})
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  {errors.partyId && (
                    <p className="mt-1 text-xs text-red-600">{errors.partyId.message}</p>
                  )}
                </div>
  <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                    Party <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      {...register("partyId", {
                        required: "Party selection is required",
                        valueAsNumber: true
                      })}
                      disabled={readOnly}
                      className={`w-full px-4 py-2 text-xs border rounded-xl shadow-sm appearance-none
                        ${errors.partyId ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"} 
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
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  {errors.partyId && (
                    <p className="mt-1 text-xs text-red-600">{errors.partyId.message}</p>
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
                      valueAsNumber: true
                    })}
                    disabled={readOnly}
                    className={`mt-0.5 block w-full pl-2.5 pr-7 py-1.5 text-xs border rounded shadow-sm
                      ${errors.branchId ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"} 
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
                    <p className="mt-1 text-xs text-red-600">{errors.branchId.message}</p>
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
                      valueAsNumber: true
                    })}
                    disabled={readOnly}
                    className={`mt-0.5 block w-full pl-2.5 pr-7 py-1.5 text-xs border rounded shadow-sm
                      ${errors.lineMasterId ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"} 
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
                    <p className="mt-1 text-xs text-red-600">{errors.lineMasterId.message}</p>
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

                {/* Delivery Date */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Delivery Date <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="deliveryDate"
                    control={control}
                    rules={{ 
                      required: "Delivery date is required",
                      validate: validateFutureDate
                    }}
                    render={({ field }) => (
                      <DatePicker
                        selected={field.value}
                        onChange={field.onChange}
                        minDate={today}
                        disabled={readOnly}
                        placeholderText="Select date"
                        className={`mt-0.5 block w-full px-2.5 py-1.5 text-xs border rounded shadow-sm
                          ${errors.deliveryDate ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"} 
                          focus:ring-1 transition-colors`}
                      />
                    )}
                  />
                  {errors.deliveryDate && (
                    <p className="mt-1 text-xs text-red-600">{errors.deliveryDate.message}</p>
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
                    {isSubmitting ? "Processing..." : (selectedId ? "Update" : "Submit")}
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