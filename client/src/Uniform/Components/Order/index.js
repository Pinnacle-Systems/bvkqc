import { Eye, Plus } from "lucide-react";
import { useGetOrderByIdQuery, useGetOrderQuery } from "../../../redux/uniformService/OrderService";
import secureLocalStorage from "react-secure-storage";
import { useState } from "react";
import GeneralSummary from "./GeneralSummary";
import MailForm from "./MailForm";


export default  function Order({setForm,form,setisOpen,setMailform,mailForm}){

    const [id,setId] = useState("") 
    const params = { companyId: secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userCompanyId") }

    const { data: allData } = useGetOrderQuery({ params });

    const { data: singleData } = useGetOrderByIdQuery( id, { skip: !id } );

    console.log(singleData,"singleData");
    


   

    return(
    
        
          <> 

              {form === true   ?  <GeneralSummary  setForm={setForm} singleData={singleData}   setMailform={setMailform} />   :
    
                                       
             mailForm  === true ?     <MailForm  singleData={singleData} setForm={setForm}  />  :
                    
         <div className=" bg-white  custom-scrollbar border border-gray-200 mt-3">
             <table className="w-full  text-normal  overflow-y-auto  ">
                <thead>
                    <tr className="  text-[12px]">
                        <th className="px-4 py-2 w-2 text-center p-0.5 border border-gray-500">S No</th>
                        <th className="px-4 py-2 w-64 border border-gray-500">Sales Reference</th>
                        <th className="px-4 py-2 w-64 border border-gray-500">Buyer Po Number</th>
                        <th className="px-4 py-2 w-64 border border-gray-500">Date</th>
                        <th className="px-4 py-2 w-64 border border-gray-500">Customer</th>
                        <th className="px-4 py-2 w-64 border border-gray-500">Order Qty</th>
                        <th className="px-4 py-2 w-64 border border-gray-500">Product</th>
                        <th className="px-4 py-2 w-64 border border-gray-500">Status</th>
                        <th className="px-4 py-2 w-64 border border-gray-500">Product</th>
                        <th className="px-4 py-2 w-32 border border-gray-500 text-center"></th>


                    </tr>
                </thead>
                <tbody>
                    {(allData ? allData?.data : []).map((item, index) =>
                    <tr className="border border-blue-gray-200 cursor-pointer "
                      
                    >
                         <td  className="h-[30px]  text-[11px]  w-2 text-center p-0.5  border border-gray-500"   onClick={() =>{
                            setForm(true)
                            setId(item?.id)

                        }}>{index + 1}</td>
                        <td  className="h-[30px]   text-[11px]  w-2 text-center p-0.5  border border-gray-500"  onClick={() =>{
                            setForm(true)
                            setId(item?.id)

                        }}>{item?.docId}</td>
                        <td className="h-[30px]    text-[11px]  w-2 text-center p-0.5  border border-gray-500"   onClick={() =>{
                            setForm(true)
                            setId(item?.id)

                        }}>{item?.department}</td>
                        <td className="h-[30px]    text-[11px]  w-2 text-center p-0.5  border border-gray-500"   onClick={() =>{
                            setForm(true)
                            setisOpen(false) 
                            setId(item?.id)

                        }}>{item?.class}</td>
                        <td className="h-[30px]    text-[11px]  w-2 text-center p-0.5  border border-gray-500" 
                          onClick={() =>{
                            setForm(true)
                            setisOpen(false) 
                            setId(item?.id)

                        }}> {item?.supplierCode}</td>
                        <td className="h-[30px]    text-[11px]  w-2 text-center p-0.5  border border-gray-500"   onClick={() =>{
                            setForm(true)
                            setisOpen(false) 
                            setId(item?.id)

                        }}>{item?.product}</td>
                        <td className="h-[30px]    text-[11px]  w-2 text-center p-0.5  border border-gray-500"   onClick={() =>{
                            setForm(true)
                            setisOpen(false) 
                            setId(item?.id)

                        }}>{item?.poNumber}</td>
                        <td className="h-[30px]    text-[11px]  w-2 text-center p-0.5  border border-gray-500"   onClick={() =>{
                            setForm(true)
                            setisOpen(false) 
                            setId(item?.id)

                        }}>{item?.color}</td>
                        <td className={` w-2 text-center border border-gray-500 ${item?.isDeleted === true ? "bg-green-100" : "bg-red-200"}`}   onClick={() =>{
                            setForm(true)
                            setisOpen(false) 
                            setId(item?.id)

                        }}>
                         {item?.isDeleted === true ? <span className="text-xs w-8">Approved</span> : <span className="text-xs">Rejected</span>}
                        </td>                      
                          <td className="h-[30px]    text-[11px]  w-2 text-center p-0.5  border border-gray-500  ml-3 ">
                        <button
                        onClick={() => {
                            setForm(true)
                        }}
                        >
                        <Eye/>

                        </button>
                        </td>



                    </tr>
                    )}
                   </tbody>  
              
            </table>
        </div>
}
 </>                
                       


                      

    )
};