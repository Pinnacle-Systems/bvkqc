import { DropdownWithSearch, Modal } from "../../../Inputs"
import { useEffect, useState } from "react";

import { saveAs } from 'file-saver';
import * as XLSX from "xlsx"
import { toast } from "react-toastify";

import { useGetPercentageQuery } from "../../../redux/uniformService/Percentage";
import { useGetPartyQuery, useUploadMutation } from "../../../redux/services/PartyMasterService";
import { findFromList, getCommonParams, getDateFromDateTime } from "../../../Utils/helper";
import FormHeader from "../../../Basic/components/FormHeader";
import FormHeaderNew from "../../../Basic/components/FormHeaderNew";
import ArtDesignReport from "../MultipleAttachment/ArtDesignReport";


export default function BuyerForm({ singleData, poItems, setPoItems,
  setActive, setForm, saveData, id, setCurrentId, isApproved, setIsApproved, setPoSentForApproval,  form  , active }) {
  console.log(singleData, 'singleData7');


  const [formReport, setFormReport] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const { branchId, finYearId, userId } = getCommonParams()
  const [attachments, setAttachments] = useState([]);


  const { data: partydata } = useGetPartyQuery({ params: { branchId, finYearId, userId } });


  let data = singleData?.data
  const isMailForm = true
  const isBuyer  =  true
  const model = "Po Number"


  useEffect(() => {
    if (poItems.length >= 5) return
    setPoItems(prev => {
      let newArray = Array.from({ length: 5 - prev.length }, i => {
        return { excessQty: "", qty: 0.00, orderQty: 0.00 }
      })
      return [...prev, ...newArray]
    }
    )
  }, [poItems])


  useEffect(() => {
    if (!id) return
    setAttachments(singleData?.data?.attachments)
    setCurrentId(singleData?.data?.id)
  }, [id, singleData])


















  console.log(poItems, "poItems");

  console.log(data, "data");
  useEffect(() => {
    if (poItems?.length >= 14) return
    setPoItems(prev => {
      let newArray = Array.from({ length: 14 - prev.length }, () => {
        return { department: "", ProcessMasterId: "", itemId: "", stockQty: "0", orderQty: "", price: "0.00", amount: "0.000", pcsQty: "0", sacCode: "0.00", tax: 0, sizeType: "Fixed", particular: '' }
      })
      return [...prev, ...newArray]
    }
    )
  }, [setPoItems, poItems])


  return (
    <>
   
      <Modal isOpen={formReport} onClose={() => setFormReport(false)} widthClass={"px-2 h-[90%] w-[70%]"}>
        <ArtDesignReport

          tableWidth="100%"
       
          setAttachments={setAttachments}
          attachments={attachments}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
        />
      </Modal>
          <div className="flex items-center justify-between p-2 md:flex-row bg-gray-300">
      <div className="text-md font-semibold">
        <span className="">{model} : </span>&nbsp;
        <span className="text-[#303AB2]">{data?.docId}</span>
      </div>


  {active === "order" && form === true && (
    <div className="flex items-center space-x-1">

            <button
            onClick={() => {
            setForm(false);
            setActive("order");
            }}
            className="group flex items-center text-[#E4002B] hover:text-white border border-[#E4002B] hover:bg-[#E4002B] transition-all duration-200 ease-in-out px-3 py-1 rounded-full shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#E4002B] focus:ring-offset-2"
            >
            <svg
            className="w-4 h-4 md:w-5 md:h-5 transition-transform duration-200 group-hover:-translate-x-1"
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
            <span className="ml-2 text-xs font-medium tracking-wide uppercase">
            Back
            </span>
            </button>

    </div>
  )}
    </div>
      <div className="flex flex-col w-full p-1 h-full overflow-auto justify-between item-end bg-white gap-4">

        <div>
          <div className="flex flex-wrap gap-1 border  rounded item-center p-1"  >

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
              />

            </div>
            <div className="flex flex-col ">
              <label className="text-xs font-semibold ">Po Date</label>
              <input
                type="text"
                className="border border-gray-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"

                value={data?.orderdate   ?   getDateFromDateTime(data?.orderdate)  :  ""}

              />
            </div>
            <div className="col-span-2 flex flex-col">
              <label className="text-xs font-semibold ">Vendor</label>
              <input
                type="text"
                className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 w-80"
                value={data?.Vendor?.name}
              />

            </div>


            <div className="flex flex-col ">
              <label className="text-xs font-semibold ">Delivery Date</label>
              <input
                type="text"
                className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={  data?.deliverydate   ? getDateFromDateTime(data?.deliverydate)  : ""}

              />
            </div>


         

          

           <div className=" w-18 flex flex-col ">
            <label className="text-xs font-semibold  ">Approval status</label>
            <select
                className={`px-1 border rounded text-xs p-1 
             ${isApproved === 'Approve' ? 'border-green-500 text-white-600  text-green-500'   : ''}
              ${isApproved === 'Reject' ? 'border-red-500 text-red-600' : ''}
              ${isApproved === 'hold' ? 'border-yellow-500 text-yellow-600' : ''}
              ${isApproved === '' ? 'border-gray-300 text-gray-500' : ''}
                          `}              value={isApproved}
              onChange={(e) =>
                setIsApproved(e.target.value)
              }
              disabled={!data?.deliverydate  ||   !data?.vendorId  }
            >
              <option value='' >Select status</option>
              <option value='Approve'  >Approve</option>
              <option value='Reject'>Reject</option>
              <option value='Hold'>Hold</option>
            </select>

          </div>

            <div className="flex pt-4">
              <button
                className="relative  h-6 px-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white
                rounded shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-300 ease-in-out overflow-hidden"
                onClick={() => setFormReport(true)}
              >
                <span className="absolute  bg-white opacity-10 "></span>
                <span className="relative z-10 text-[12px]"> View Art Design</span>
              </button>
            </div>

          </div >



          <div className="w-full   overflow-x-auto h-[100%] pt-2">
            <table className="table-fixed w-full text-xs rounded-lg border border-gray-200 h-[90%]">
              <thead className="bg-gray-200 text-gray-700 ">
                <tr className="p-2">
                  <th className=" text-[13px] w-[50px] p-1">S No</th>
                  <th className=" text-[13px] w-[120px] ">Department</th>
                  <th className=" text-[13px] w-[150px]">Class-SubClass</th>
                  <th className=" text-[13px] w-[120px]">ItemCode</th>
                  <th className=" text-[13px] w-[120px]">BarCode</th>
                  <th className=" text-[13px] w-[120px]">SeasonSupplierCode</th>
                  <th className=" text-[13px] w-[120px]">StyleCodeGroup</th>
                  <th className=" text-[13px] w-[150px]">SizeDesc</th>
                  <th className=" text-[13px] w-[50px]">Size</th>
                  <th className=" text-[13px] w-[90px]">Color</th>
                  <th className=" text-[13px] w-[50px]">MRP</th>
                  <th className=" text-[13px] w-[50px]">Po Qty</th>
                    <th className="w-[50px]">Excess %</th>

                  {data?.isSave   &&  
                  <th className=" text-[13px] w-[50px]">Order Qty</th>
                  
                  }

                </tr>
              </thead>

              <tbody className="">
                {(poItems || []).map((item, index) => (
                  <>

                    <tr key={index} className=" ">
                      <td className="border border-gray-300 text-[12px] p-1 text-center ">{index + 1}</td>
                      <td className="border border-gray-300 text-[12px] text-left ">{item?.department}</td>
                      <td className="border border-gray-300 text-[12px] text-left ">{item?.class}</td>

                      <td className="border border-gray-300 text-[12px] text-left " >{item?.itemCode}</td>
                      <td className="border border-gray-300 text-[12px] text-left ">{item?.barCode}</td>

                      <td className="border border-gray-300 text-[12px] text-left ">{item?.supplierCode}</td>
                      <td className="border border-gray-300 text-[12px] text-left ">{item?.styleCode}</td>
                      <td className="border border-gray-300 text-[12px] text-left ">{item?.sizeDesc}</td>

                      <td className="border border-gray-300 text-[12px] text-center ">{item?.size}</td>
                      <td className="border border-gray-300 text-[12px] text-center ">{item?.color}</td>

                      <td className="border border-gray-300 text-[12px] text-right ">{item?.mrp}</td>
                      <td className="border border-gray-300 text-[12px] text-right ">{Math.round(item?.orderQty) || ""}</td>
                          <td className="border border-gray-300 text-right ">{item?.excessQty || ""}</td>
         
                        {data?.isSave   &&   
                          <td className="border border-gray-300 text-right w-32 " key={index}>{Math.round(item?.qty) || ""} </td>

                        }

                    </tr>
                  </>
                ))}
                <tr className="border  border-gray-200 bg-gray-200 p-2">
                  <td className="border border-gray-300 text-center w-2"></td>
                  <td className="border border-gray-300 text-left w-32"></td>
                  <td className="border border-gray-300 text-left w-32"></td>
                  <td className="border border-gray-300 text-left w-32"></td>
                  <td className="border  text-left w-32 text-xl text-gray-800  font-extrabold">
                    Total
                  </td>
                  <td className="border border-gray-300 text-left w-32"></td>
                  <td className="border border-gray-300 text-left w-16"></td>
                  <td className="border border-gray-300 text-left w-52"></td>
                  <td className="border border-gray-300 text-left w-52"></td>
                  <td className="border border-gray-300 text-left w-52"></td>
                  <td className="border border-gray-300 text-left w-52"></td>
                  <td className="border border-gray-200 text-right w-32 text-lg  text-gray-800 font-bold ">
                    {poItems.reduce((a, c) => a +  Math.round(c.orderQty || 0), 0) || ""}
                  </td>
                  <td className="border border-gray-300 text-right w-32"></td>

                    {data?.isSave   &&   
                    <td className="border border-gray-200 text-right w-32 text-lg text-gray-800 font-bold  ">
                    {poItems.reduce((a, c) => a +  Math.round(c.qty || 0), 0) || ""}

                    </td>
                    }

                </tr>

              </tbody>







            </table>
          </div>
        </div>



        <div className=" w-full flex justify-end">
{!data?.deliverydate  ||   !data?.vendorId   ?    <></>   :  
    <button
      onClick={() => {
          console.log(isBuyer,":isBuyer")
        saveData(isMailForm,false,isBuyer);
        setPoSentForApproval = (true)

      }}
      className="group flex items-center justify-center text-[#303AB2] hover:text-white border border-[#303AB2] hover:bg-[#303AB2] transition-all duration-200 ease-in-out px-4 py-1.5 rounded-full shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#303AB2] focus:ring-offset-2"
    >
      <svg
        className="w-4 h-4 transition-transform duration-200 group-hover:rotate-12"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v16h16V4H4zm4 8l4 4 4-4" />
      </svg>
      <span className="ml-2 text-xs font-medium tracking-wide uppercase">
        SEND MAIL
      </span>
    </button>

     }
        </div>

      </div >








    </>
  )





};