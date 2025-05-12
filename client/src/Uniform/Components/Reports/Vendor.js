import { DropdownWithSearch, Modal } from "../../../Inputs"
import { useEffect, useState } from "react";
import { saveAs } from 'file-saver';
import * as XLSX from "xlsx"
import { toast } from "react-toastify";
import { useGetPercentageQuery } from "../../../redux/uniformService/Percentage";
import { useGetPartyQuery } from "../../../redux/services/PartyMasterService";
import { getCommonParams, getDateFromDateTime, renameFile } from "../../../Utils/helper";
import FormHeader from "../../../Basic/components/FormHeader";
import FormHeaderNew from "../../../Basic/components/FormHeaderNew";
import { useAddOrderMutation, useAttachOrderMutation, useGetOrderByIdQuery, useUpdateOrderMutation } from "../../../redux/uniformService/OrderService";
import MailForm from "../Email";
import ArtDesignReport from "../MultipleAttachment/ArtDesignReport";


export default function VendorForm({ singleData, setForm, poItems, setPoItems,
  setActive, setIsSave, id, setCurrentId, poSentForApproval, setPoSentForApproval }) {

  const [attachments, setAttachments] = useState([]);

  const [formReport, setFormReport] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const { branchId, finYearId, userId } = getCommonParams()

  console.log(singleData, "singleData")

  const [addData] = useAddOrderMutation();
  const [updateData] = useUpdateOrderMutation();


  const { data: Partydata } = useGetPartyQuery({ params: { branchId, finYearId, userId } });
  const { data: percentage } = useGetPercentageQuery({ params: { branchId, finYearId, userId } });

  let excessQty = percentage?.data?.filter(item => item?.active === true)
  let partyOptions = Partydata?.data?.filter(item => item?.partyType === "VENDOR")
  let orderData = singleData?.data

  const data = {
    attachments, isAttachments: true, poSentForApproval
  };

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



  console.log(attachments, "attach")

  const handleSubmitCustom = async (callback, data, text) => {
    try {
      const formData = new FormData();
      for (let key in data) {
        if (key === 'attachments') {
          formData.append(key, JSON.stringify(data[key].map(i => ({ ...i, filePath: (i.filePath instanceof File) ? i.filePath.name : i.filePath }))));
          data[key].forEach(option => {
            if (option?.filePath instanceof File) {
              formData.append('file', option.filePath);
            }
          });
        } else {
          formData.append(key, data[key]);
        }
      }

      let returnData;
      if (text === "Updated") {
        returnData = await callback({ id, body: formData }).unwrap();
      } else {
        returnData = await callback(formData).unwrap();
      }
      if (returnData.statusCode === 0) {

        toast.success(text + "Successfully");


      } else {
        toast.error(returnData?.message);
      }

    } catch (error) {
      console.log("handle", error);
    }
  };


  const saveData = () => {

    if (!window.confirm("Are you sure save the details ...?")) {
      return;
    }
    if (id) {
      handleSubmitCustom(updateData, data, "Updated");
    } else {
      handleSubmitCustom(addData, data, "Added");
    }
  };









  return (
    <>
      <FormHeaderNew
        model={"Order"}
      />
      <Modal isOpen={formReport}
        onClose={() => setFormReport(false)} widthClass={"px-2 h-[90%] w-[70%]"}
      >
        <ArtDesignReport
          setFormReport={setFormReport}
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
      <div className="flex flex-col w-full bg-white p-6 h-full overflow-auto">


        <div className="grid grid-cols-7 gap-4 border border-gray-300 pb-3 p-2 rounded h-[15%]"  >

          <div className="flex flex-col ">
            <label className="text-xs font-semibold text-gray-600">Po Number</label>
            <input
              type="text"
              className="border-2  rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-2 border-blue-400 font-bold text-black"
              value={orderData?.docId}
            />
          </div>
          <div className="flex flex-col ">
            <label className="text-xs font-semibold text-gray-600">Po Date</label>
            <input
              type="text"
              className="border border-gray-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"

              value={getDateFromDateTime(orderData?.orderdate)}

            />
          </div>
          <div className="flex flex-col ">
            <label className="text-xs font-semibold text-gray-600">Customer</label>
            <input
              type="text"
              className="border border-gray-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={"MAX"}
            />
          </div>

          <div className="flex flex-col col-span-2 ">
            <label className="text-xs font-semibold text-gray-600">Manufacture</label>
            <input
              type="text"
              className="border border-gray-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 w-80"
              value={orderData?.manufacture || ""}
            />

          </div>


          <div className="flex  mt-2">
            <button
              className="relative py-1  bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-300 ease-in-out overflow-hidden"
              onClick={() => setFormReport(true)}
            >
              <span className="absolute inset-0 bg-white opacity-10 blur-sm rounded-xl"></span>
              <span className="relative z-10"> Attach  Design</span>
            </button>
          </div>



        </div>



        <div className="w-full mt-5 mb-3 h-[250px] overflow-y-auto overflow-x-auto ">
          <table className="table-fixed w-full text-xs rounded-lg border border-gray-200 h-[90%]">
            <thead className="bg-gray-200 text-gray-700 ">
              <tr className="p-2">
                <th className="w-[50px] p-2">S No</th>
                <th className="w-[120px] p-2">Department</th>
                <th className="w-[150px]">Class-SubClass</th>
                <th className="w-[120px]">ItemCode</th>
                <th className="w-[120px]">BarCode</th>
                <th className="w-[120px]">SeasonSupplierCode</th>
                <th className="w-[120px]">StyleCodeGroup</th>
                <th className="w-[150px]">SizeDesc</th>
                <th className="w-[50px]">Size</th>
                <th className="w-[90px]">Color</th>
                <th className="w-[50px]">MRP</th>
                <th className="w-[50px]">OrderQty</th>
                <th className="w-[50px]">Qty</th>
              </tr>
            </thead>

            <tbody className="">
              {(poItems || []).map((item, index) => (
                <tr key={index} className=" table-row ">
                  <td className="border border-gray-300 text-center p-2">{index + 1}</td>
                  <td className="border border-gray-300 text-left ">{item?.department}</td>
                  <td className="border border-gray-300 text-left ">{item?.class}</td>

                  <td className="border border-gray-300 text-left " >{item?.itemCode}</td>
                  <td className="border border-gray-300 text-left ">{item?.barCode}</td>

                  <td className="border border-gray-300 text-left ">{item?.supplierCode}</td>
                  <td className="border border-gray-300 text-left ">{item?.styleCode}</td>
                  <td className="border border-gray-300 text-left ">{item?.sizeDesc}</td>
                  <td className="border border-gray-300 text-center ">{item?.size}</td>

                  <td className="border border-gray-300 text-center ">{item?.color}</td>
                  <td className="border border-gray-300 text-right ">{item?.mrp}</td>

                  <td className="border border-gray-300 text-right ">{item?.orderQty || ""}</td>
                  <td className="border border-gray-300 text-right w-32 " key={index}>{item?.qty || ""} </td>



                </tr>
              ))}
              <tr className="border-2  border-gray-400 bg-gray-200 p-2">
                <td className="border-b border-gray-300 text-center w-2"></td>
                <td className="border-b border-gray-300 text-left w-32"></td>
                <td className="border-b border-gray-300 text-left w-32"></td>
                <td className="border-b border-gray-300 text-left w-32"></td>
                <td className="border-b border-gray-300 text-left w-32 text-xl text-gray-800  font-extrabold">
                  Total
                </td>
                <td className="border-b border-gray-300 text-left w-32"></td>
                <td className="border-b border-gray-300 text-left w-16"></td>
                <td className="border-b border-gray-300 text-left w-52"></td>
                <td className="border-b border-gray-300 text-left w-52"></td>
                <td className="border-b border-gray-300 text-left w-52"></td>





                <td className="border-b border-gray-300 text-right w-32"></td>
                <td className="border-x border-gray-500 text-right w-32 text-lg  text-gray-800 font-bold ">
                  {poItems.reduce((a, c) => a + parseFloat(c.orderQty || 0), 0) || ""}
                </td>


                <td className="border-x border-gray-500 text-right w-32 text-lg text-gray-800 font-bold  ">
                  {poItems.reduce((a, c) => a + parseFloat(c.qty || 0), 0) || ""}

                </td>


              </tr>
            </tbody>
          </table>
        </div>


        <div className="flex justify-end gap-3 mt-[50px]">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded"
            onClick={() => {
              saveData();
              setForm(false);
              setActive("Mail");

            }}
          >
            Save & Send
          </button>
        </div>

      </div>
    </>
  )





};