import { DropdownWithSearch, Modal } from "../../../Inputs";
import { useEffect, useState } from "react";

import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";

import { useGetPercentageQuery } from "../../../redux/uniformService/Percentage";
import {
  useGetPartyQuery,
  useUploadMutation,
} from "../../../redux/services/PartyMasterService";
import {
  findFromList,
  getCommonParams,
  getDateFromDateTime,
} from "../../../Utils/helper";
import FormHeader from "../../../Basic/components/FormHeader";
import FormHeaderNew from "../../../Basic/components/FormHeaderNew";
import ArtDesignReport from "../MultipleAttachment/ArtDesignReport";


export default function BuyerForm({ singleData, poItems, setPoItems, userRole,
  setActive, setForm, saveData, id, setCurrentId, isApproved, setIsApproved, form, active }) {


  const [formReport, setFormReport] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const { branchId, finYearId, userId } = getCommonParams();
  const [attachments, setAttachments] = useState([]);


  console.log(id, 'id26');


  let data = singleData?.data
  const isMailForm = true
  const isBuyer = true
  const model = "Po Number"
  console.log(data, "data")

  useEffect(() => {
    if (poItems.length >= 5) return;
    setPoItems((prev) => {
      let newArray = Array.from({ length: 5 - prev.length }, (i) => {
        return { excessQty: "", qty: 0.0, orderQty: 0.0 };
      });
      return [...prev, ...newArray];
    });
  }, [poItems]);

  useEffect(() => {
    if (!id) return;
    setAttachments(singleData?.data?.attachments);
    setCurrentId(singleData?.data?.id);
  }, [id, singleData]);

  useEffect(() => {
    if (poItems?.length >= 10) return;
    setPoItems((prev) => {
      let newArray = Array.from({ length: 10 - prev.length }, () => {
        return {
          department: "",
          ProcessMasterId: "",
          itemId: "",
          stockQty: "0",  
          orderQty: "",
          price: "0.00",
          amount: "0.000",
          pcsQty: "0",
          sacCode: "0.00",
          tax: 0,
          sizeType: "Fixed",
          particular: "",
        };
      });
      return [...prev, ...newArray];
    });
  }, [setPoItems, poItems]);

  return (
    <>
      <Modal
        isOpen={formReport}
        onClose={() => setFormReport(false)}
        widthClass={"px-2 h-[90%] w-[70%]"}
      >
        <ArtDesignReport
          tableWidth="100%"
          userRole={userRole}
          setAttachments={setAttachments}
          attachments={attachments}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
        />
      </Modal>
<div className="h-screen flex flex-col bg-[#F1F1F0]">           <div
        className="flex m-2 items-center justify-between p-2 md:px-4"
        style={{ backgroundColor: "white" }}
      >
        <div className="text-sm font-semibold flex items-center gap-2">
          <span className="text-gray-600">{model}:</span>
          <span className="text-white bg-[#303AB2] px-2 py-0.5 rounded-md font-bold shadow-md">
            {data?.docId}
          </span>
        </div>

        <div className="flex items-center gap-2 ml-4">
          {active === "order" && form === true && (
            <button
              onClick={() => {
                setForm(false);
                setActive("order");
              }}
              className="group flex items-center bg-white text-[#E4002B] border border-[#E4002B] hover:bg-[#E4002B] hover:text-white transition-all duration-200 ease-in-out px-3 py-1 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-[#E4002B] focus:ring-offset-1"
            >
              <svg
                className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span className="ml-1.5 text-xs font-medium">Back</span>
            </button>
          )}

          {data?.deliverydate && data?.vendorId && (
            <button
              onClick={() => saveData(isMailForm, false, isBuyer)}
              className="group flex items-center bg-white text-[#303AB2] border border-[#303AB2] hover:bg-[#303AB2] hover:text-white transition-all duration-200 ease-in-out px-3 py-1 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-[#303AB2] focus:ring-offset-1"
            >
              <svg
                className="w-4 h-4 transition-transform duration-200 group-hover:rotate-12"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v16h16V4H4zm4 8l4 4 4-4"
                />
              </svg>
              <span className="ml-1.5 text-xs font-medium">SEND MAIL</span>
            </button>
          )}

          {/* Print Set Button */}
          <button
            onClick={() => setShowPrintModal(true)}
            className="group flex items-center bg-white text-[#28A745] border border-[#28A745] hover:bg-[#28A745] hover:text-white transition-all duration-200 ease-in-out px-3 py-1 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-[#28A745] focus:ring-offset-1"
          >
            <svg
              className="w-4 h-4 transition-transform duration-200 group-hover:scale-105"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 9V2h12v7M6 18h12v4H6v-4z"
              />
            </svg>
            <span className="ml-1.5 text-xs font-medium">Print Set</span>
          </button>

          {/* Print Set Modal */}
          {showPrintModal && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-md w-64 space-y-4">
                <h3 className="text-lg font-semibold">Print Settings</h3>
                <p className="text-sm text-gray-600">
                  Configure your print settings.
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowPrintModal(false)}
                    className="px-3 py-1 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      // Add your print function here
                      setShowPrintModal(false);
                    }}
                    className="px-3 py-1 bg-[#28A745] text-white rounded-md hover:bg-[#218838]"
                  >
                    Print
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div
        className="flex flex-col w-full p-1 h-full overflow-auto justify-between item-end bg-white gap-4"
        style={{ backgroundColor: "#F1F1F0" }}
      >
        <div>
          <div className="flex flex-wrap gap-1 border  rounded item-center p-1" style={{ backgroundColor: "white" }}>
            {/* <div className="flex flex-col ">
              <label className="text-xs font-semibold ">Po Number</label>
              <input
                type="text"
                className="border-2  rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-2 border-blue-400 font-bold text-black"
                value={data?.docId}
              />
            </div> */}
            <div className="col-span-2 flex flex-col">
              <label className="text-xs font-semibold ">Manufacture</label>
              <input
                type="text"
                className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 w-80"
                value={data?.Manufacture?.name}
                disabled={true}
              />
            </div>
            <div className="flex flex-col ">
              <label className="text-xs font-semibold ">Po Date</label>
              <input
                type="text"
                className="border border-gray-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={data?.orderdate ? getDateFromDateTime(data?.orderdate) : ""}
                disabled={true}


              />
            </div>
            <div className="col-span-2 flex flex-col">
              <label className="text-xs font-semibold ">Vendor</label>
              <input
                type="text"
                className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 w-80"
                value={data?.Vendor?.name}
                disabled={true}
              />
            </div>

            <div className="flex flex-col ">
              <label className="text-xs font-semibold ">Delivery Date</label>
              <input
                type="text"
                className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={
                  data?.deliverydate
                    ? getDateFromDateTime(data?.deliverydate)
                    : ""
                }
                disabled={true}
              />
            </div>

            {singleData?.data?.poSentForApproval && (
              <div className=" w-18 flex flex-col ">
                <label className="text-xs font-semibold  ">
                  Approval status
                </label>
                <select
                  className={`px-1 border rounded text-xs p-1 
             ${
               isApproved === "Approve"
                 ? "border-green-500 text-white-600  text-green-500"
                 : ""
             }
              ${isApproved === "Reject" ? "border-red-500 text-red-600" : ""}
              ${
                isApproved === "hold" ? "border-yellow-500 text-yellow-600" : ""
              }
              ${isApproved === "" ? "border-gray-300 text-gray-500" : ""}
                          `}
                  value={isApproved}
                  onChange={(e) => setIsApproved(e.target.value)}
                  disabled={!data?.deliverydate || !data?.vendorId}
                >
                  <option value="">Select status</option>
                  <option value="Approve">Approve</option>
                  <option value="Reject">Reject</option>
                  <option value="Hold">Hold</option>
                </select>
              </div>
            )}

           {singleData?.data?.poSentForApproval && (
  <div className="flex pt-3">
    <button
      className="relative h-8 px-4 py-1 bg-blue-600 text-white font-medium 
      rounded-full shadow-sm hover:bg-blue-700 hover:shadow-md transform transition-all 
      duration-300 ease-in-out focus:outline-none focus:ring-2 
      focus:ring-blue-400 focus:ring-offset-2"
      onClick={() => setFormReport(true)}
    >
      <span className="text-[13px]">View Art Design</span>
    </button>
  </div>
)}

          </div>

          <div className="w-full   overflow-x-auto h-[100%] pt-2">
     <table className="table-fixed w-full text-xs rounded-lg border border-gray-300">
  <thead className="bg-white text-gray-800 border-b border-gray-300">
    <tr>
      <th className="text-[12px] font-semibold p-1 border border-gray-300 w-[30px]">S No</th>
      <th className="text-[12px] font-semibold p-1 border border-gray-300">Department</th>
      <th className="text-[12px] font-semibold p-1 border border-gray-300">Class-SubClass</th>
      <th className="text-[12px] font-semibold p-1 border border-gray-300">Item Code</th>
      <th className="text-[12px] font-semibold p-1 border border-gray-300">Bar Code</th>
      <th className="text-[12px] font-semibold p-1 border border-gray-300">Supplier Code</th>
      <th className="text-[12px] font-semibold p-1 border border-gray-300">Style Code</th>
      <th className="text-[12px] font-semibold p-1 border border-gray-300">Size Desc</th>
      <th className="text-[12px] font-semibold p-1 border border-gray-300 w-[40px]">Size</th>
      <th className="text-[12px] font-semibold p-1 border border-gray-300 w-[50px]">Color</th>
      <th className="text-[12px] font-semibold p-1 border border-gray-300 w-[50px]">MRP</th>
      <th className="text-[12px] font-semibold p-1 border border-gray-300 w-[50px]">Po Qty</th>

      {data?.isSave && (
        <>
          <th className="text-[12px] font-semibold p-1 border border-gray-300 w-[50px]">Excess %</th>
          <th className="text-[12px] font-semibold p-1 border border-gray-300 w-[60px]">Order Qty</th>
        </>
      )}
    </tr>
  </thead>

  <tbody>
    {(poItems || []).map((item, index) => (
      <tr
        key={index}
        className={`${
          index % 2 === 0 ? "bg-gray-100" : "bg-white"
        } hover:bg-gray-200`}
      >
        <td className="border p-1 text-center text-[11px]">{index + 1}</td>
        <td className="border p-1 text-left text-[11px]">{item?.department}</td>
        <td className="border p-1 text-left text-[11px]">{item?.class}</td>
        <td className="border p-1 text-left text-[11px]">{item?.itemCode}</td>
        <td className="border p-1 text-left text-[11px]">{item?.barCode}</td>
        <td className="border p-1 text-left text-[11px]">{item?.supplierCode}</td>
        <td className="border p-1 text-left text-[11px]">{item?.styleCode}</td>
        <td className="border p-1 text-left text-[11px]">{item?.sizeDesc}</td>
        <td className="border p-1 text-center text-[11px]">{item?.size}</td>
        <td className="border p-1 text-center text-[11px]">{item?.color}</td>
        <td className="border p-1 text-right text-[11px]">{item?.mrp}</td>
        <td className="border p-1 text-right text-[11px]">
          {Math.round(item?.orderQty) || ""}
        </td>

        {data?.isSave && (
          <>
            <td className="border p-1 text-right text-[11px]">
              {item?.excessQty || ""}
            </td>
            <td className="border p-1 text-right text-[11px]">
              {Math.round(item?.qty) || ""}
            </td>
          </>
        )}
      </tr>
    ))}

    {/* Total Row */}
    <tr className="bg-white font-bold text-gray-800">
      <td colSpan={11} className="border p-2 text-left">Total</td>
      <td className="border p-2 text-right text-sm font-extrabold text-[#303AB2]">
        {poItems.reduce((a, c) => a + Math.round(c.orderQty || 0), 0) || ""}
      </td>
      {data?.isSave && (
        <>
          <td className="border p-2 text-right"></td>
          <td className="border p-2 text-right text-sm font-extrabold text-[#303AB2]">
            {poItems.reduce((a, c) => a + Math.round(c.qty || 0), 0) || ""}
          </td>
        </>
      )}

    </tr>
  </tbody>
</table>



          </div>
        </div>
      </div>
      </div>
   
    </>
  );
}
