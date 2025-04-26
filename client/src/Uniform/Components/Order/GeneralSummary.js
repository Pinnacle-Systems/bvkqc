import {  SpecialInput } from "../../../Inputs"
import { useState } from "react";
import { useGetUserByIdQuery } from "../../../redux/services/UsersMasterService";
import secureLocalStorage from "react-secure-storage";

import * as XLSX from "xlsx"
import { toast } from "react-toastify";
import { useUploadMutation } from "../../../redux/uniformService/OrderService";


export default function GeneralSummary({singleData ,setForm,setMailform,orderId,setFileName}){

        const Model = "Summary"

        let data = singleData?.data
        const id = secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userId")

  const {data: Userdata,isFetching: isSingleFetching,isLoading: isSingleLoading,} = useGetUserByIdQuery(id);
  const [upload] = useUploadMutation();





    
    const FromEmailAddress =  Userdata?.data?.email
    const passskey  = Userdata?.data?.passKey

    const exportAndUploadExcel = async ( text = "uploaded") => {
        try {
            const combinedData = singleData?.data?.orderBillItems?.map((item, index) => ({
                SrNo: index + 1,
                BranchID: data.branchId,
                Department: data.department,
                Class: data.class,
                Color: data.color,
                PONumber: data.poNumber,
                Product: data.product,
                StyleCode: data.styleCode,
                SupplierCode: data.supplierCode,
                OrderDate: data.orderdate,
                ItemCode: item.itemCode,
                BarCode: item.barCode,
                Size: item.sizeDesc,
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
    
            // saveAs(excelBlob, 'myData.xlsx'); 
    
            const formData = new FormData();
            const fileName = `Order_${Date.now()}.xlsx`;
            console.log(fileName,"fileName")
            formData.append('file', excelBlob, fileName);
            console.log("formData", formData,"id",id);
    
            const response = await upload({ id: id, body: formData }).unwrap();
            console.log("Upload Response:", response?.data?.excelFineName);
            setFileName(response?.data?.excelFineName)
    
            toast.success(`${text} Successfully`);
            console.log("Upload Response:", response);
    
        } catch (error) {
            console.error("Error during Export and Upload:", error);
            toast.error("Something went wrong!");
        }
    };

    return(
        <>
         
            <div className="flex flex-col  w-[100%]">
                
                <div className="p-3 bg-blue-200 text-center mb-5">{Model}</div>
                  

                  <div className="grid grid-cols-7  flex-row border-2 border-gray-500  w-full pb-2 p-2 ">
                 

                            <div className="mt-5 ">
                                    <SpecialInput  name={"Order  Number"}  value={data?.docId}   />
                            </div>
                            <div className="mt-5 ">
                                    <SpecialInput  name={"Customer"}    />
                            </div> 
                            <div className="mt-5 ">
                                    <SpecialInput  name={"Del  Address"}    />
                            </div> 
                            <div className="mt-5 ">
                                    <SpecialInput  name={"Sales Ex"}    />
                            </div> 
                            <div className="mt-5 ">
                                    <SpecialInput  name={"Remarks"}    />
                            </div> 
                            <div className="mt-5 ">
                                    <SpecialInput  name={"Required Approval"}    />
                            </div> 
                            <div className="mt-5 ">
                                    <SpecialInput name={"Reason"}  />
                            </div> 
                            <div className="mt-5 ">
                                    <SpecialInput   name={"Cancelled By"}   />
                            </div>
                            <div className="mt-5 ">
                                    <SpecialInput   name={"Cancel Date"}    />
                            </div> 
                            <div className="mt-5 ">
                                    <SpecialInput   name={"Approval Status"}    />
                            </div>
                            <div className="mt-5 ">
                                    <SpecialInput    name={"Approved By"}   />
                            </div>
                    </div>   

                <div className="custom-scrollbar flex-row w-full  mt-5 ">
                 
                    <table className="w-full  text-normal  overflow-y-auto "  id="table-to-xls">
                <thead>
                    
                    <tr className="text-[12px]">
                        <th className="px-4 py-2 w-2 text-center p-0.5 border border-gray-500">S No</th>
                        <th className="px-4 py-2 w-64 border border-gray-500">ItemCode</th>
                        <th className="px-4 py-2 w-64 border border-gray-500">BarCode</th>
                        <th className="px-4 py-2 w-32 border border-gray-500">Size</th>
                        <th className="px-4 py-2 w-64 border border-gray-500">sizeDesc</th>
                        <th className="px-4 py-2 w-64 border border-gray-500">MRP</th>
                        <th className="px-4 py-2 w-64 border border-gray-500">Qty</th>
                        <th className="px-4 py-2 w-64 border border-gray-500">OrderQty</th>

                    </tr>
                </thead>  
                <tbody>
                    {(singleData ? singleData?.data?.orderBillItems : []).map((item, index) =>
                    <tr className="p-0.5 text-sm">

                        <td className="table-data  text-center ">{index + 1}</td>
                        <td className="table-data"> {item?.itemCode} </td>
                        <td className="table-data">{item?.barCode}</td>
                        <td className="table-data ">{item?.size}</td>
                        <td className="table-data ">{item?.sizeDesc}</td>
                        <td className="table-data text-right">{item?.mrp}</td>
                        <td className="table-data tetx-right">
                            <input type="number" value={item?.qty} onChange={(e) => e.target.value}   className="p-0.5 w-full  text-right"/>
                        </td>
                        <td className="table-data text-right">{item?.orderQty}</td>




                    </tr>
                    )}
                </tbody>
                        </table>    
                  <div className="mt-3 flex justify-end">
                                                 <button className="bg-blue-600 hover:bg-blue-700 text-black px-4 py-2 rounded mt-2" 
                                                         onClick={() => {
                                                             exportAndUploadExcel()
                                                            setForm(false)
                                                            setMailform(true)

                                                         }}
                                                     >
                                                 Save And Send 
                                                 </button>
                                             </div>  
                    </div>
                </div>
                     


               
   



        </>
    )
};