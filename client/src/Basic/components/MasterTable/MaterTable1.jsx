import React, { useEffect, useState } from "react";
import Loader from "../Loader";
import "./Master.css";
import { Power, Table, Check, X, Eye, Edit, Trash } from "lucide-react";
import { FaTableList } from "react-icons/fa6";
import { RiPlayListAddLine } from "react-icons/ri";
import { useUpdateAqlStatusInspectionMutation } from "../../../redux/uniformService/AqlInspectionService";
import { toast } from "react-toastify";

const ACTIVE = (
  <div className="bg-gradient-to-r from-green-200 to-green-500 inline-flex items-center justify-center rounded-full border-2 w-6 border-green-500 shadow-lg text-white hover:scale-110 transition-transform duration-300">
    <Power size={10} />
  </div>
);

const Mastertable = ({
  data,
  loading,
  header,
  onDataClick,
  setReadOnly,
  deleteData,
  setDeleteId,
  approveStatus,
  refetchAqlData,
  setApproveStatus
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [expandedRow, setExpandedRow] = useState(null);
  const [approveStatusFilter, setApproveStatusFilter] = useState("waiting");
  const [searchValue, setSearchValue] = useState('');

  const filteredData = data?.filter((item) => {
    const searchLower = searchValue.toLowerCase();
    const matchesSearch =
      !searchValue ||
      item.reference?.toLowerCase().includes(searchLower) ||
      item.allocationDetails?.[0]?.partyName?.toLowerCase().includes(searchLower) ||
      item.lineDetails?.name?.toLowerCase().includes(searchLower) ||
      item.id?.toString().includes(searchValue);

    const matchesStatus =
      approveStatusFilter === "all" ||
      (approveStatusFilter === "approve" && item.approveStatus === 1) ||
      (approveStatusFilter === "reject" && item.approveStatus === 0) ||
      (approveStatusFilter === "waiting" && item.approveStatus === null);

    return matchesSearch && matchesStatus;
  }) || [];

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const currentData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );
  console.log(currentData,"currentData")

  useEffect(() => {
    setCurrentPage(1);
  }, [searchValue, approveStatusFilter]);

  const [updateStatus] = useUpdateAqlStatusInspectionMutation();
  const handleApprove = async (id, status) => {
    try {
      const response = await updateStatus({ id, payload: { status } }).unwrap();
      setApproveStatus(response.approveStatus);
      refetchAqlData(); 
      toast.success(status === 1 ? "Approved successfully" : "Rejected successfully");
    } catch (err) {
      console.error("Failed to update status", err);
      toast.error("Failed to update status");
    }
  };

  const toggleRowExpand = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderSizeStatus = (hasBefore, hasAfter, beforeSize, afterSize) => {
    console.log(beforeSize,"beforeSize")
    if (!hasBefore && !hasAfter) {
      return (
        <div className="text-xs text-gray-500 italic">No size data</div>
      );
    }

    return (
      <div className="flex items-center space-x-2">
        {hasBefore && (
          <div className={`px-2 py-1 rounded text-xs ${hasAfter ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
            Before: {beforeSize}
          </div>
        )}
        {hasAfter && (
          <div className={`px-2 py-1 rounded text-xs ${hasBefore ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
            After: {afterSize}
          </div>
        )}
      </div>
    );
  };

  const renderApprovalStatus = (approveStatus) => {
    switch (approveStatus) {
      case 1:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Approved
          </span>
        );
      case 0:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Pending
          </span>
        );
    }
  };

  return (
    <div className="w-full mx-auto">
      <div className="text-xs px-0 bg-[#f1f1f0] bg-opacity-15 rounded-lg border shadow-md">
        <div className="flex justify-between mx-3 items-center py-3">
          <div className="text-normal flex items-center text-gray-600">
            <RiPlayListAddLine size={20} className="mr-2" />
            <div className="text-lg font-semibold text-gray-800">{header}</div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex bg-gray-100 p-1 rounded-lg shadow-inner">
              {/* ApproveStatus Filter Buttons */}
              <button
                title="Show Approved"
                className={`flex items-center gap-1 px-3 py-2 rounded-md transition-all duration-200 ${approveStatusFilter === "approve"
                  ? "bg-green-500 text-white shadow-md"
                  : "bg-white text-green-600 hover:bg-green-50"}`}
                onClick={() => setApproveStatusFilter("approve")}
              >
                <Check size={16} />
                <span className="hidden sm:inline">Approve</span>
              </button>

              <button
                title="Show Rejected"
                className={`flex items-center gap-1 px-3 py-2 rounded-md transition-all duration-200 ${approveStatusFilter === "reject"
                  ? "bg-red-500 text-white shadow-md"
                  : "bg-white text-red-600 hover:bg-red-50"}`}
                onClick={() => setApproveStatusFilter("reject")}
              >
                <X size={16} />
                <span className="hidden sm:inline">Reject</span>
              </button>

              <button
                title="Show Waiting"
                className={`flex items-center gap-1 px-3 py-2 rounded-md transition-all duration-200 ${approveStatusFilter === "waiting"
                  ? "bg-amber-500 text-white shadow-md"
                  : "bg-white text-amber-600 hover:bg-amber-50"}`}
                onClick={() => setApproveStatusFilter("waiting")}
              >
                <Power size={16} />
                <span className="hidden sm:inline">Waiting</span>
              </button>

              <button
                title="Show All"
                className={`flex items-center gap-1 px-3 py-2 rounded-md transition-all duration-200 ${approveStatusFilter === "all"
                  ? "bg-gray-600 text-white shadow-md"
                  : "bg-white text-gray-600 hover:bg-gray-100"}`}
                onClick={() => setApproveStatusFilter("all")}
              >
                <FaTableList size={16} />
                <span className="hidden sm:inline">All</span>
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                className="text-sm bg-gray-50 focus:outline-none border border-gray-300 rounded-md px-3 py-2 pl-10 w-64 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <div className="flex items-center">
              <label className="text-gray-700 text-sm mr-2">Rows:</label>
              <select
                className="p-1.5 border text-sm bg-gray-50 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                {[10, 15, 20].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader />
          </div>
        ) : (
          <>
            {filteredData?.length === 0 ? (
              <div className="flex-1 flex justify-center bg-white text-gray-500 items-center text-lg py-8">
                <p>No inspection records found</p>
              </div>
            ) : (
              <>
                <div className="md:hidden space-y-4 p-4">
                  {currentData?.map((dataObj, index) => (
                    <div
                      key={index}
                      className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
                    >
                      <div
                        className="p-4 cursor-pointer"
                        onClick={() => toggleRowExpand(dataObj.id)}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="text-sm font-semibold text-gray-800">
                              {dataObj?.reference || 'N/A'}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                              Inspection: {formatDate(dataObj?.inspectionDate)}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              ID: {dataObj?.id || 'N/A'}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <p className="text-gray-500 font-medium">Party</p>
                            <p>
                              {dataObj?.allocationDetails?.[0]?.partyName || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500 font-medium">Line</p>
                            <p>
                              {dataObj?.lineDetails?.name || 'N/A'}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3">
                          <p className="text-gray-500 font-medium text-xs">Size Status</p>
                          {renderSizeStatus(
                            dataObj.hasBefore,
                            dataObj.hasAfter,
                            dataObj.beforeSize,
                            dataObj.afterSize
                          )}
                        </div>

                        <div className="mt-2">
                          {renderApprovalStatus(dataObj.approveStatus)}
                        </div>
                      </div>

                      {expandedRow === dataObj.id && (
                        <div className="border-t border-gray-200 p-4 bg-gray-50">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500 font-medium">Allocation Date</p>
                              <p>
                                {formatDate(dataObj?.allocationDetails?.[0]?.allocationDate)}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500 font-medium">Delivery Date</p>
                              <p>
                                {formatDate(dataObj?.allocationDetails?.[0]?.deliveryDate)}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500 font-medium">Created At</p>
                              <p>{formatDate(dataObj?.createdAt)}</p>
                            </div>
                          </div>

                          <div className="mt-4 flex flex-wrap justify-end gap-2">
                            <button
                              onClick={() => {
                                onDataClick(dataObj?.id);
                                setReadOnly(true);
                              }}
                              className="flex items-center gap-1 px-3 py-1.5 bg-white text-blue-600 rounded-md text-xs border border-blue-200 hover:bg-blue-50"
                            >
                              <Eye size={14} /> View
                            </button>
                            <button
                              onClick={() => {
                                onDataClick(dataObj?.id);
                                setReadOnly(false);
                              }}
                              className="flex items-center gap-1 px-3 py-1.5 bg-white text-green-600 rounded-md text-xs border border-green-200 hover:bg-green-50"
                            >
                              <Edit size={14} /> Edit
                            </button>
                            <button
                              onClick={() => {
                                setDeleteId(dataObj.id);
                                deleteData();
                              }}
                              className="flex items-center gap-1 px-3 py-1.5 bg-white text-red-600 rounded-md text-xs border border-red-200 hover:bg-red-50"
                            >
                              <Trash size={14} /> Delete
                            </button>
                            
                            {/* Only show Approve/Reject buttons for pending records */}
                            {dataObj.approveStatus === null && (
                              <>
                                <button
                                  onClick={() => handleApprove(dataObj.id, 1)}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-md text-xs hover:bg-green-700"
                                >
                                  <Check size={14} /> Approve
                                </button>
                                <button
                                  onClick={() => handleApprove(dataObj.id, 0)}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-md text-xs hover:bg-red-700"
                                >
                                  <X size={14} /> Reject
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="hidden md:block bg-white overflow-auto custom-scrollbar border border-gray-200 max-h-[65vh]">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Order Id
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Party
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Line
                        </th>
                     
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Inspection Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Delivery Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Approval
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentData.map((dataObj, index) => (
                        <React.Fragment key={index}>
                          <tr
                            className={`hover:bg-gray-50 cursor-pointer ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                            onClick={() => toggleRowExpand(dataObj.id)}
                          >
                            <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                              {dataObj.reference}
                            </td>
                            <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">
                              {dataObj?.allocationDetails?.[0]?.partyName || 'N/A'}
                            </td>
                            <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">
                              {dataObj?.lineDetails?.name || 'N/A'}
                            </td>
                          
                            <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(dataObj.inspectionDate)}
                            </td>
                            <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(dataObj?.allocationDetails?.[0]?.deliveryDate)}
                            </td>
                            <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">
                              {renderApprovalStatus(dataObj.approveStatus)}
                            </td>
                            <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex space-x-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDataClick(dataObj?.id);
                                    setReadOnly(true);
                                  }}
                                  className="text-blue-600 hover:text-blue-800"
                                  title="View"
                                >
                                  <Eye size={16} />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDataClick(dataObj?.id);
                                    setReadOnly(false);
                                  }}
                                  className="text-green-600 hover:text-green-800"
                                  title="Edit"
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteId(dataObj.id);
                                    deleteData();
                                  }}
                                  className="text-red-600 hover:text-red-800"
                                  title="Delete"
                                >
                                  <Trash size={16} />
                                </button>
                              </div>
                            </td>
                            <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">
                              {/* Only show Approve/Reject buttons for pending records */}
                              {dataObj.approveStatus === null ? (
                                <div className="flex space-x-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleApprove(dataObj.id, 1);
                                    }}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-md text-xs hover:bg-green-700"
                                  >
                                    <Check size={14} /> Approve
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleApprove(dataObj.id, 0);
                                    }}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-md text-xs hover:bg-red-700"
                                  >
                                    <X size={14} /> Reject
                                  </button>
                                </div>
                              ) : (
                                <span className="text-xs text-gray-400">
                                  {dataObj.approveStatus === 1 ? 'Approved' : 'Rejected'}
                                </span>
                              )}
                            </td>
                          </tr>
                          {expandedRow === dataObj.id && (
                            <tr className="bg-gray-50">
                              <td colSpan="9" className="px-6 py-2">
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                  <div>
                                    <p className="text-gray-500 font-medium">Allocation Date</p>
                                    <p>{formatDate(dataObj?.allocationDetails?.[0]?.allocationDate)}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500 font-medium">Created At</p>
                                    <p>{formatDate(dataObj.createdAt)}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500 font-medium">Branch</p>
                                    <p>{dataObj?.allocations?.[0]?.Branch?.branchName || 'N/A'}</p>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="px-4 py-3 flex items-center justify-between border border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between items-center">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      Previous
                    </button>
                    <div className="text-sm text-gray-700">
                      Page <span className="font-medium">{currentPage}</span> of{' '}
                      <span className="font-medium">{totalPages}</span>
                    </div>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Mastertable;