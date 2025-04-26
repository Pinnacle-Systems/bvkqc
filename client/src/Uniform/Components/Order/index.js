import { Eye, Plus } from "lucide-react";
import { useGetOrderByIdQuery, useGetOrderQuery } from "../../../redux/uniformService/OrderService";
import secureLocalStorage from "react-secure-storage";
import { useState } from "react";
import GeneralSummary from "./GeneralSummary";
import MailForm from "./MailForm";


export default  function Order({setForm,form,setMailform,mailForm}){

    const [id,setId] = useState("") 
    const [fileName, setFileName] = useState("");
    const params = { 
        
        companyId: secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userCompanyId"),
        userRole : secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userRole"),
        userId: secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userId"),
     }


    const { data: singleData } = useGetOrderByIdQuery( id, { skip: !id } );

    const userRole = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "userRole"
      );
      const userId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "userId"
      );
    
      const { data: allData } = useGetOrderQuery({ params });

        

   

    return(
    
        
          <> 

              {form === true   ?  <GeneralSummary  setForm={setForm} singleData={singleData} 
                setMailform={setMailform} orderId={id}  setFileName={setFileName} />   :
    
                                        
             mailForm  === true ?     <MailForm  singleData={singleData} setForm={setForm}  fileName={fileName}  />  :
                    
         <div className=" bg-white  custom-scrollbar border border-gray-200 mt-3">
            <div className="p-2 justify-items-center">{userRole ?  userRole : ""}</div>
             <table className="w-full  text-normal  overflow-y-auto  ">
                <thead>
                    <tr className="  text-[12px]">
                        <th className="px-4 py-2 w-2 text-center p-0.5 border border-gray-500">S No</th>
                        <th className="px-4 py-2 w-64 border border-gray-500"> Po Number</th>
                        <th className="px-4 py-2 w-64 border border-gray-500">Department</th>
                        <th className="px-4 py-2 w-64 border border-gray-500">Set</th>
                        <th className="px-4 py-2 w-64 border border-gray-500">Style No</th>
                        <th className="px-4 py-2 w-64 border border-gray-500">Product Ref</th>
                        <th className="px-4 py-2 w-64 border border-gray-500">Product Id</th>
                        <th className="px-4 py-2 w-64 border border-gray-500">Product</th>
                        <th className="px-4 py-2 w-64 border border-gray-500">Approval Status</th>
                        <th className="px-4 py-2 w-32 border border-gray-500 text-center"></th>
                    </tr>
                </thead>
             <tbody>



                    {(allData ? allData?.data : [])?.map((item, index) =>
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
                            setId(item?.id)

                        }}>{item?.class}</td>
                        <td className="h-[30px]    text-[11px]  w-2 text-center p-0.5  border border-gray-500" 
                          onClick={() =>{
                            setForm(true)
                            setId(item?.id)

                        }}> {item?.supplierCode}</td>
                        <td className="h-[30px]    text-[11px]  w-2 text-center p-0.5  border border-gray-500"   onClick={() =>{
                            setForm(true)
                            setId(item?.id)

                        }}>{item?.product}</td>
                        <td className="h-[30px]    text-[11px]  w-2 text-center p-0.5  border border-gray-500"   onClick={() =>{
                            setForm(true)
                            setId(item?.id)

                        }}>{item?.poNumber}</td>
                        <td className="h-[30px]    text-[11px]  w-2 text-center p-0.5  border border-gray-500"   onClick={() =>{
                            setForm(true)
                            setId(item?.id)

                        }}>{item?.color}</td>
                        <td className={` w-2 text-center border border-gray-500 ${item?.isDeleted === true ? "bg-green-100" : "bg-red-200"}`} 
                          onClick={() =>{
                           setForm(true)
                           setId(item?.id)

                        }}>
                         {item?.isDeleted === true ? <span className="text-xs w-8">Approved</span> : <span className="text-xs">Rejected</span>}
                        </td>                      
                          <td className="h-[30px]    text-[11px]  w-2 text-center p-0.5  border border-gray-500  ml-3 ">
                        <button
                        onClick={() => {
                            setId(item?.id)
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