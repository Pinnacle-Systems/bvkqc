import { DropdownWithSearch, Modal } from "../../../Inputs"
import { useEffect, useState } from "react";
import { saveAs } from 'file-saver';
import * as XLSX from "xlsx"
import { toast } from "react-toastify";
import { useGetPercentageQuery } from "../../../redux/uniformService/Percentage";
import { getCommonParams, getDateFromDateTime, renameFile } from "../../../Utils/helper";
import FormHeader from "../../../Basic/components/FormHeader";
import FormHeaderNew from "../../../Basic/components/FormHeaderNew";
import { useAddOrderMutation, useAttachOrderMutation, useGetOrderByIdQuery, useUpdateOrderMutation, useUploadMutation } from "../../../redux/uniformService/OrderService";
import MailForm from "../Email";
import ArtDesignReport from "../MultipleAttachment/ArtDesignReport";


export default function VendorForm({ singleData, setForm, poItems, setPoItems,
  setActive, setIsSave, id, setCurrentId, form, active, setEmailId }) {

  const [attachments, setAttachments] = useState([]);

  const [formReport, setFormReport] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const { branchId, finYearId, userId } = getCommonParams()


  const [addData] = useAddOrderMutation();
  const [updateData] = useUpdateOrderMutation();

  const [upload] = useUploadMutation();




  let orderData = singleData?.data;
  const model = "Po Number";

  const data = {
    attachments, isAttachments: true
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

        setActive("Mail")
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
        OrderQty: parseInt(item.qty)
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








  return (
    <>

      <Modal isOpen={formReport}
        onClose={() => setFormReport(false)} widthClass={"px-2 h-[90%] w-[70%]"}
      >
        <ArtDesignReport

          setFormReport={setFormReport}
          tableWidth="100%"
          formReport={formReport}
          setAttachments={setAttachments}
          attachments={attachments}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
        />
      </Modal>
      <div className="flex items-center justify-between p-2 md:flex-row bg-gray-300">
        <div className="text-md font-semibold">
          <span className="">{model} : </span>&nbsp;
          <span className="text-[#303AB2]">{orderData?.docId}</span>
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
      <div className="flex flex-col w-full bg-white  h-full overflow-auto p-1">



        <div className="flex flex-wrap gap-1 border  rounded item-center p-2"  >
          <div className="flex flex-col ">
            <label className="text-xs font-semibold">Customer</label>
            <input
              type="text"
              className="border border-gray-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={"MAX"}
            />
          </div>


          <div className="col-span-2 flex flex-col">
            <label className="text-xs font-semibold ">Manufacture</label>
            <input
              type="text"
              className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 w-80"
              value={orderData?.Manufacture?.name}
            />

          </div>
          <div className="flex flex-col ">
            <label className="text-xs font-semibold ">Po Date</label>
            <input
              type="text"
              className="border border-gray-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"

              value={getDateFromDateTime(orderData?.orderdate)}

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
              <span className="relative z-10 text-[12px]"> Attach Art Design</span>
            </button>
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
                {
                  orderData?.isSave && (


                    <>
                      <th className="w-[50px]">Excess %</th>
                      <th className="w-[50px]">Order Qty</th>
                    </>
                  )
                }


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
                  <td className="border border-gray-300 text-right ">{Math.round(item?.orderQty) || ""}</td>

                  {

                    orderData?.isSave && (
                      <>
                        <td className="border border-gray-300 text-right ">{item?.excessQty || ""}</td>
                        <td className="border border-gray-300 text-right w-32 " key={index}>{Math.round(item?.qty) || ""} </td>
                      </>
                    )

                  }



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
                <td className="border-b border-gray-300 text-center w-2"></td>
                <td className="border-b border-gray-300 text-right w-32"></td>
                <td className="border-b border-gray-300 text-right w-32"></td>

                <td className="border-b border-gray-300 text-right w-32"></td>
                <td className="border-x border-gray-500 text-right w-32 text-lg  text-gray-800 font-bold ">
                  {poItems?.reduce((a, c) => a + Math.round(c.orderQty || 0), 0) || ""}
                </td>

                {data?.isSave && (

                  <>
                    <td className="border-b border-gray-300 text-right w-32 text-lg text-gray-800  font-bold">
                    </td>
                    <td className="border-x border-gray-500 text-right w-32 text-lg text-gray-800 font-bold  ">
                      {poItems?.reduce((a, c) => a + Math.round(c.qty || 0), 0) || ""}

                    </td>
                  </>
                )}



              </tr>

            </tbody>


          </table>
        </div>








        <div className="flex justify-end gap-3 ">


          <button
            onClick={() => {
              saveData();
              exportAndUploadExcel(orderData, poItems);

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
              SAVE AND SEND
            </span>
          </button>
        </div>

      </div>
    </>
  )





};