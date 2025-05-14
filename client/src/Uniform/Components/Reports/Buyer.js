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


export default function BuyerForm({ singleData,  poItems, setPoItems,
  setActive, setIsSave, saveData, id, setEmailId, setCurrentId, isApproved, setIsApproved, setPoSentForApproval }) {
  console.log(singleData, 'singleData7');


  const [formReport, setFormReport] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const { branchId, finYearId, userId } = getCommonParams()
  const [attachments, setAttachments] = useState([]);


  const { data: partydata } = useGetPartyQuery({ params: { branchId, finYearId, userId } });


  let data = singleData?.data
  const isMailForm  =  true



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
      <FormHeaderNew
        model={"Po Number"}
         poNumber={data?.docId}
      />
      <Modal isOpen={formReport} onClose={() => setFormReport(false)} widthClass={"px-2 h-[90%] w-[70%]"}>
        <ArtDesignReport
          // heading={MODEL}

          tableWidth="100%"
          // data={allData?.data}
          // onClick={(id) => {
          // setId(id);
          // setFormReport(false);
          // }
          // }
          setAttachments={setAttachments}
          attachments={attachments}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
        />
      </Modal>
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
                value={findFromList(data?.manufactureId, partydata?.data, "name")}
              />

            </div>
            <div className="flex flex-col ">
              <label className="text-xs font-semibold ">Po Date</label>
              <input
                type="text"
                className="border border-gray-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"

                value={getDateFromDateTime(data?.orderdate)}

              />
            </div>
      <div className="col-span-2 flex flex-col">
              <label className="text-xs font-semibold ">Vendor</label>
              <input
                type="text"
                className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 w-80"
                value={findFromList(data?.vendorId, partydata?.data, "name")}
              />

            </div>


            <div className="flex flex-col ">
              <label className="text-xs font-semibold ">Delivery Date</label>
              <input
                type="text"
                className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={getDateFromDateTime(data?.deliverydate)}

              />
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
                  <th className=" text-[13px] w-[50px]">OrderQty</th>
                  {/* <th className=" text-[13px] w-[50px]">Excess %</th> */}
                  <th className=" text-[13px] w-[50px]">Qty</th>
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
                      <td className="border border-gray-300 text-[12px] text-right ">{item?.orderQty || ""}</td>
                      {/* <td className="border border-gray-300 w-16">
                     <input
                     type="number"
                     value={item?.excessQty }
                     onChange={(e) => handleQtyChange("excessQty" ,index, e.target.value,item?.orderQty)}
                     className="w-full p-1   rounded-md text-right focus:ring-blue-400"
                   />
               
               </td> */}

                      <td className="border border-gray-300 text-right w-32 " key={index}>{item?.qty || ""} </td>

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





                  <td className="border border-gray-300 text-right w-32"></td>
                  <td className="border border-gray-200 text-right w-32 text-lg  text-gray-800 font-bold ">
                    {poItems.reduce((a, c) => a + parseInt(c.orderQty || 0), 0) || ""}
                  </td>


                  <td className="border border-gray-200 text-right w-32 text-lg text-gray-800 font-bold  ">
                    {poItems.reduce((a, c) => a + parseInt(c.qty || 0), 0) || ""}

                  </td>


                </tr>

              </tbody>


            </table>
          </div>
        </div>



        <div className=" w-full flex justify-between">

          <div className=" w-18 flex flex-col ">
            <label className="text-xs font-semibold text-gray-600">Approval status</label>
            <select
              className='px-1  border border-gray-300 rounded text-xs '
              value={isApproved}
              onChange={(e) =>
                setIsApproved(e.target.value)
              }
            >
              <option value=''>Select status</option>
              <option value='approve'>Approve</option>
              <option value='reject'>Reject</option>
              <option value='hold'>Hold</option>
            </select>

          </div>





          <button
            className="bg-blue-600 hover:bg-blue-700 text-white   px-2  h-6 rounded-sm  text-[12px]"
            onClick={() => {
              // setIsSave(true);
                saveData(isMailForm);
              // exportAndUploadExcel(data);
              // setForm(false);
              // setActive("Mail");
              setPoSentForApproval = (true)
            }}
          >
            Send mail
          </button>

        </div>

      </div >








    </>
  )





};