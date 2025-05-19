import { DateInput, DateInputNew, DropdownWithSearch } from "../../../Inputs"
import { useEffect, useState } from "react";

import { saveAs } from 'file-saver';
import * as XLSX from "xlsx"
import { toast } from "react-toastify";

import { useGetPercentageQuery } from "../../../redux/uniformService/Percentage";
import { useGetPartyQuery } from "../../../redux/services/PartyMasterService";
import { getCommonParams, getDateFromDateTime } from "../../../Utils/helper";
import FormHeaderNew from "../../../Basic/components/FormHeaderNew";
import { useUploadMutation } from "../../../redux/uniformService/OrderService";


export default function Manufactureform({ singleData, setForm, vendor, setVendor, poItems, setPoItems,
  setActive, saveData, id, setEmailId, setCurrentId, deliveryDate, setDeliveryDate, form, active , mailConvert
}) {



  const [upload] = useUploadMutation();

  const { branchId, finYearId, userId } = getCommonParams()

  const { data: Partydata } = useGetPartyQuery({ params: { branchId, finYearId, userId } });


  const { data: percentage, isPercentageLoading, isPercentageFetching } = useGetPercentageQuery({ params: { branchId, finYearId, userId } });

  let partyOptions = Partydata?.data?.filter(item => item?.partyType === "VENDOR")
  let data = singleData?.data
  const isMailForm = true
  const model = "Po Number"
  const isManufacture = true;
  console.log(data, "data")

  useEffect(() => {
    if (!id) return
    setCurrentId(singleData?.data?.id)
  }, [id, singleData]);



  const exportAndUploadExcel = async (data, poItemsData) => {
    // console.log(poItemsData?.filter(obj => obj?.orderQty != null && obj?.orderQty.toString().trim() !== ""),"Poitems")
    const filterdPoItems = poItemsData?.filter(obj => obj?.orderQty != null && obj?.orderQty.toString().trim() !== "")
    try {
      const combinedData = (filterdPoItems || [])?.map((item, index) => ({
        SrNo: index + 1,
        PONumber: data.docId,
        OrderDate: getDateFromDateTime(data.orderdate),
        Department: item.department,
        Class: item.class,
        ItemCode: item.itemCode,
        BarCode: item.barCode,
        SeasonSupplierCode: item.supplierCode,
        StyleCode: item.styleCode,
        Size: item.size,
        sizeDescription: item.sizeDesc,
        Color: item.color,
        Mrp: item.mrp,
        Product: item.product,
        PoQty: item.orderQty,
        excessPercentage: item.excessQty,
        OrderQty: Math.round(item.qty)
      }));

      const worksheet = XLSX.utils.json_to_sheet(combinedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const excelBlob = new Blob(
        [excelBuffer],
        { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
      );

      const fileName = `Order_${Date.now()}.xlsx`;
      const formData = new FormData();
      formData.append('file', excelBlob, fileName);
      formData.append('id', id);
      const response = await upload({ body: formData, id }).unwrap();
      setEmailId(response?.data?.id)




    } catch (error) {
      console.error("Error during Export and Upload:", error);
      toast.error("Something went wrong!", {
        position: "top-right",
        autoClose: 100,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",

      });
    }
  };



  const handleQtyChange = (field, index, value, orderQty) => {

    let percentageValue = percentage?.data?.find(i => i.active)?.qty


    setPoItems((prev) => {
      let newItems = structuredClone(prev);

      if (field === 'excessQty') {

        if (parseInt(value) > parseInt(percentageValue)) {
          toast.error("Excess % is Too High", {
            autoClose: 1000
          });
          return newItems
        }

        newItems[index]['excessQty'] = value;
        const percentage = Math.round((orderQty * value) / 100);
        const updatedQty = Math.round(orderQty + percentage);

        newItems[index]['qty'] = updatedQty;
      } else {
        newItems[index][field] = value;
      }

      return newItems;
    });
  };


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
      <div className="flex items-center justify-between p-2 md:flex-row " style={{ backgroundColor: '#F1F1F0' }}>
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


      <div className="flex flex-col w-full bg-white p-1 h-full overflow-auto">


        <div className="flex flex-wrap gap-1 border  rounded item-center p-1"  >
          <div className="flex flex-col ">
            <label className="text-xs font-semibold">Customer</label>
            <input
              type="text"
              className="border border-gray-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={"MAX"}
              disabled={true}
            />
          </div>

          <div className="col-span-2 flex flex-col">
            <label className="text-xs font-semibold ">Manufacture </label>
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
              value={getDateFromDateTime(data?.orderdate)}
              disabled={true}


            />
          </div>

          <div className="flex flex-col w-72 ">
            <label className="text-xs font-semibold ">Tag vendor  <span className="text-red-500">*</span></label>
            <DropdownWithSearch className={"w-72 text-xs border-gray-300"} value={vendor} setValue={setVendor} options={partyOptions} optionName={"Tag vendor From Party Master"} masterName={"PARTY MASTER"} />

          </div>



          <div className=''>

            <DateInputNew name={"Delivery Date"} value={deliveryDate} setValue={setDeliveryDate} required={true} type={"date"} />
          </div>

        </div >

        <div className="w-full my-2  h-[80%] overflow-y-auto overflow-x-auto ">
          <table className="table-fixed w-full text-xs rounded-lg border border-gray-200 h-[90%]">
            <thead className="bg-gray-200 text-gray-700 ">
              <tr className="p-1">
                <th className="w-[50px] p-1">S No</th>
                <th className="w-[120px] p-1">Department</th>
                <th className="w-[150px]">Class-SubClass</th>
                <th className="w-[120px]">ItemCode</th>
                <th className="w-[120px]">BarCode</th>
                <th className="w-[120px]">SeasonSupplierCode</th>
                <th className="w-[120px]">StyleCodeGroup</th>
                <th className="w-[150px]">SizeDesc</th>
                <th className="w-[50px]">Size</th>
                <th className="w-[90px]">Color</th>
                <th className="w-[50px]">MRP</th>
                <th className="w-[50px]">Po Qty</th>
                <th className="w-[50px]">Excess %</th>
                <th className="w-[50px]">Order Qty</th>
              </tr>
            </thead>

            <tbody className="">
              {(poItems || []).map((item, index) => (
                <tr key={index} className=" table-row ">
                  <td className="border border-gray-300 text-center p-1">{index + 1}</td>
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
                  <td className="border border-gray-300 w-16">
                    <input
                      type="number"
                      value={item?.excessQty}
                      onChange={(e) => handleQtyChange("excessQty", index, e.target.value, item?.orderQty)}
                      className="w-full p-1   rounded-md text-right focus:ring-blue-400"
                      disabled={data?.isSave || item?.orderQty == ""}

                    />

                  </td>

                  <td className="border border-gray-300 text-right w-32 " key={index}>{Math.round(item?.qty) || ""} </td>

                </tr>
              ))}
              <tr className="border-2  border-gray-400 bg-gray-200 p-1">
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
                  {poItems?.reduce((a, c) => a + Math.round(c.orderQty || 0), 0) || ""}
                </td>


                <td className="border-b border-gray-300 text-right w-32 text-lg text-gray-800  font-bold">
                </td>
                <td className="border-x border-gray-500 text-right w-32 text-lg text-gray-800 font-bold  ">
                  {poItems?.reduce((a, c) => a + Math.round(c.qty || 0), 0) || ""}

                </td>


              </tr>

            </tbody>


          </table>
        </div>








        <div className=" flex  justify-end gap-3">


          {!data?.isSave && (
            <>

              <button
                onClick={() => {
                  saveData(!isMailForm, isManufacture);
                }}
                className="group flex items-center justify-center text-[#303AB2] hover:text-white border border-[#303AB2] hover:bg-[#303AB2] transition-all duration-200 ease-in-out px-4 py-1.5 rounded-full shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#303AB2] focus:ring-offset-2"
              >
                <svg
                  className="w-4 h-4 transition-transform duration-200 group-hover:-translate-y-0.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="ml-2 text-xs font-medium tracking-wide uppercase">
                  Save
                </span>
              </button>


              <button
                onClick={() => {
                  saveData(isMailForm, isManufacture);
                    
                  exportAndUploadExcel(data, poItems);
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
                  Save & Send
                </span>
              </button>

            </>
          )}
        </div>
      </div>








    </>
  )





};