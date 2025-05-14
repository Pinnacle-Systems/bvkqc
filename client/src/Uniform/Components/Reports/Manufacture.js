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
  setActive, saveData, id, setEmailId, setCurrentId, deliverydate, setDeliverydate
}) {


  const [upload] = useUploadMutation();

  const { branchId, finYearId, userId } = getCommonParams()

  const { data: Partydata } = useGetPartyQuery({ params: { branchId, finYearId, userId } });


  const { data: percentage, isPercentageLoading, isPercentageFetching } = useGetPercentageQuery({ params: { branchId, finYearId, userId } });

  let partyOptions = Partydata?.data?.filter(item => item?.partyType === "VENDOR")
  let data = singleData?.data
  const isMailForm  =  true



  useEffect(() => {
    if (!id) return
    setCurrentId(singleData?.data?.id)
  }, [id, singleData]);



  const exportAndUploadExcel = async (data, poItemsData, text = "uploaded") => {
    try {
      const combinedData = poItemsData?.filter(item => item?.orderQty != null).map((item, index) => ({
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
        OrderQty: item.orderQty,
        Product: item.product,
        excessPercentage: item.excessQty,
        Quantity: item.qty
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
      toast.error("Something went wrong!",{
        autoClose: 1000 
      });
    }
  };



  const handleQtyChange = (field, index, value, orderQty) => {

    let percentageValue = percentage?.data?.find(i => i.active)?.qty


    setPoItems((prev) => {
      let newItems = structuredClone(prev);

      if (field === 'excessQty') {

        if (parseInt(value) > parseInt(percentageValue)) {
          toast.error("Excess % is Too High",{
        autoClose: 1000 
      });
          return newItems
        }

        newItems[index]['excessQty'] = value;
        const percentage = parseInt((orderQty * value) / 100);
        const updatedQty = Math.round(orderQty + percentage);

        newItems[index]['qty'] = updatedQty;
      } else {
        newItems[index][field] = value;
      }

      return newItems;
    });
  };


  useEffect(() => {
    if (poItems?.length >= 7) return
    setPoItems(prev => {
      let newArray = Array.from({ length: 7 - prev.length }, () => {
        return { department: "", ProcessMasterId: "", itemId: "", stockQty: "0", orderQty: "", price: "0.00", amount: "0.000", pcsQty: "0", sacCode: "0.00", tax: 0, sizeType: "Fixed", particular: '' }
      })
      return [...prev, ...newArray]
    }
    )
  }, [setPoItems, poItems])

  return (
    <>
      <FormHeaderNew
        model={"Order"}
      />

      <div className="flex flex-col w-full bg-white p-1 h-full overflow-auto">


        <div className="grid grid-cols-7 gap-4 border border-gray-300  p-1 rounded h-[15%]"  >

          <div className="flex flex-col ">
            <label className="text-xs font-semibold text-gray-600">Po Number</label>
            <input
              type="text"
              className="border-2  rounded-md px-2  text-xs focus:outline-none focus:ring-2 border-blue-400 font-bold text-black"
              value={data?.docId}
            />
          </div>
          <div className="flex flex-col ">
            <label className="text-xs font-semibold text-gray-600">Po Date</label>
            <input
              type="text"
              className="border border-gray-300 rounded-md px-2  text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"

              value={getDateFromDateTime(data?.orderdate)}

            />
          </div>
          <div className="flex flex-col ">
            <label className="text-xs font-semibold text-gray-600">Customer</label>
            <input
              type="text"
              className="border border-gray-300 rounded-md px-2  text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={"MAX"}
            />
          </div>
          <div className="flex flex-col col-span-2 ">
            <label className="text-xs font-semibold text-gray-600">Manufacture</label>
            <input
              type="text"
              className="border border-gray-300 rounded-md px-2  text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={data?.Manufacture?.name}
            />
          </div>

        </div>



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
                <th className="w-[50px]">OrderQty</th>
                <th className="w-[50px]">Excess %</th>
                <th className="w-[50px]">Qty</th>
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





        <div className=" w-full flex gap-4 border border-gray-300  p-1  h-[14%]">
          <div className="flex flex-col w-72 ">
            <label className="text-xs font-semibold text-gray-600">Tag vendor</label>

            <DropdownWithSearch className={"w-72 text-xs border-gray-300"} value={vendor} setValue={setVendor} options={partyOptions} optionName={"Tag vendor On Party Master"} masterName={"PARTY MASTER"} />
          </div>

          <div className="flex flex-col ">


            <div className=' w-[48%]'>
              <DateInputNew
                name={"Delivery Date"}
                value={
                  deliverydate
                } setValue={setDeliverydate} />
            </div>
          </div>
        </div>


        <div className=" flex  justify-end  gap-3 mt-[50px]">
        
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-1  rounded-sm "
              onClick={() => {
             
                saveData()

              }}
            >
              Save
            </button>
         
        
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white  p-0  rounded-sm  "
            onClick={() => {
              // setIsSave(true);
              saveData(isMailForm);
              exportAndUploadExcel(data, poItems);
              // setForm(false);
              // setActive("Mail");
            }}
          >
            Save & Send
          </button>
        </div>
      </div>








    </>
  )





};