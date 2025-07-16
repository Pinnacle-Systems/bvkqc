import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useGetPartyQuery } from "../../../redux/services/PartyMasterService";
import { useGetLineMasterQuery } from "../../../redux/services/LineMasterService";
import { useGetBranchQuery } from "../../../redux/services/BranchMasterService";
import secureLocalStorage from "react-secure-storage";
import { useAddAllocationMasterMutation } from "../../../redux/uniformService/SizeTableMasterService";

const AllocationForm = () => {
  const companyId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userCompanyId"
  );
  
  const [saveStatus, setSaveStatus] = useState(null);
  
  const {
    data: parties = [],
    isLoading: partiesLoading,
    error: partiesError,
  } = useGetPartyQuery({ params: { companyId } });
  
  const [saveAllocation] = useAddAllocationMasterMutation();
  
  const {
    data: lines = [],
    isLoading: linesLoading,
    error: linesError,
  } = useGetLineMasterQuery({ params: { companyId } });

  const {
    data: branches = [],
    isLoading: branchesLoading,
    error: branchesError,
  } = useGetBranchQuery({ params: { companyId } });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      partyId: "",
      branchId: "",
      lineMasterId: "",
      deliveryDate: null,
    },
  });

  const today = new Date();

  const onSubmit = async (data) => {
    try {
      const formattedData = {
        ...data,
        deliveryDate: data.deliveryDate.toISOString()
      };
      
      const result = await saveAllocation(formattedData).unwrap();
      
      if (result.success) {
        setSaveStatus({
          success: true,
          message: 'Allocation saved successfully!'
        });
        reset();
      } else {
        setSaveStatus({
          success: false,
          message: result.message || 'Failed to save allocation'
        });
      }
    } catch (error) {
      console.error("Submission failed:", error);
      setSaveStatus({
        success: false,
        message: error.data?.message || 'Server error occurred'
      });
    }
  };

  if (partiesLoading || linesLoading || branchesLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (partiesError || linesError || branchesError) {
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
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
          <div className="bg-indigo-600 px-5 py-3">
            <h2 className="text-lg font-medium text-white">Allocation Form</h2>
            <p className="text-gray-300 text-xs mt-0.5">
              Fill in the details to create a new allocation
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
            {saveStatus && (
              <div className={`p-3 rounded-lg ${
                saveStatus.success 
                  ? "bg-green-100 text-green-700" 
                  : "bg-red-100 text-red-700"
              }`}>
                {saveStatus.message}
              </div>
            )}
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Party Field */}
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
                <label
                  className="block text-xs font-medium text-gray-600 mb-1"
                >
                  Branch <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("branchId", {
                    required: "Branch selection is required",
                    valueAsNumber: true
                  })}
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
                <label
                  className="block text-xs font-medium text-gray-600 mb-1"
                >
                  Line <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("lineMasterId", {
                    required: "Line selection is required",
                    valueAsNumber: true
                  })}
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
                <label
                  className="block text-xs font-medium text-gray-600 mb-1"
                >
                  Today's Date
                </label>
                <input
                  type="text"
                  value={today.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                  readOnly
                  className="mt-0.5 block w-full px-2.5 py-1.5 text-xs border border-gray-300 bg-gray-50 rounded shadow-sm"
                />
              </div>

              {/* Delivery Date */}
              <div>
                <label
                  className="block text-xs font-medium text-gray-600 mb-1"
                >
                  Delivery Date <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="deliveryDate"
                  control={control}
                  rules={{ required: "Delivery date is required" }}
                  render={({ field }) => (
                    <DatePicker
                      selected={field.value}
                      onChange={(date) => field.onChange(date)}
                      minDate={today}
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
                onClick={() => reset()}
                className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-blue-500 transition-colors"
              >
                Cancel
              </button>
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
                {isSubmitting ? "Submitting..." : "Submit Allocation"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AllocationForm;