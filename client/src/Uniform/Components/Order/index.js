import { Eye, Plus } from "lucide-react";
import { useAddOrderMutation, useGetOrderByIdQuery, useGetOrderQuery, useUpdateOrderMutation } from "../../../redux/uniformService/OrderService";
import secureLocalStorage from "react-secure-storage";
import { useCallback, useEffect, useState } from "react";
import GeneralSummary from "./GeneralSummary";
import FormHeader from "../../../Basic/components/FormHeader";
import { getCommonParams, getDateFromDateTime, priceWithTax } from "../../../Utils/helper";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";


export default  function Order({setForm,form,setEmailId,setActive}){

      const [id,setId] = useState(""); 
      const [fileName, setFileName] = useState("");
      const [poItems, setPoItems] = useState([]);
      const [poNo, setPoNo] = useState(null)
      const [vendor,setVendor]  =   useState('')
      const [isSave,setIsSave]  =  useState(true)
      const dispatch = useDispatch()
      const { branchId, finYearId, userId } = getCommonParams()

     const { data: allData } = useGetOrderQuery({ params:{ branchId ,  finYearId ,  userId  }});
     const { data: singleData,isSingleFetching, isSingleLoading } = useGetOrderByIdQuery( id, { skip: !id } );
     const [addData] = useAddOrderMutation();
     const [updateData] = useUpdateOrderMutation();

     console.log(allData,"allData")



      


          const syncFormWithDb = useCallback(
              (data) => {
                  if (!id) {
                    setPoItems([]);
                   
                  } else {
                    setPoItems(data?.orderBillItems  ||  []);
                    setIsSave(data?.isSave)
                  }
              },
              [id]
          );
              useEffect(() => {
                  syncFormWithDb(singleData?.data);
              }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

      const excessQty =  poItems.reduce((a, c) => a + parseFloat(c.excessQty || 0), 0);
      const excessQtyAmount  =   poItems.reduce((a, c) => a + parseFloat(c.qty || 0), 0);
      const data = {
        id,
        branchId, userId,
        orderDetails: poItems?.filter(item => item?.orderQty > 0),
        finYearId,
        vendor,
        excessQty,
        isSave:true ,excessQtyAmount
    
      }
        
        const handleSubmitCustom = async (callback, data, text) => {
          try {
            let returnData = await callback(data).unwrap();
            if (returnData.statusCode === 0) {
              setId(returnData?.data?.id)
              toast.success(text + "Successfully");
              dispatch({
                type: `partyMaster/invalidateTags`,
                payload: ['Party'],
              });
            } else {
              toast.error(returnData?.message)
            }
          } catch (error) {
            console.log(error)
          }

        }
       
   const saveData = () => {
    
    if (!window.confirm("Are you sure you want to save the details?")) {
      return ; 
    }
    if (id) {
    
      handleSubmitCustom(updateData, data, "Updated")

    } else {

      handleSubmitCustom(addData, data, "Added")

    }

  }  

   

    return(
    
        
          <> 

              { form === true   ? 
              
              <GeneralSummary  setForm={setForm} singleData={singleData}  poItems={poItems}  setPoItems={setPoItems}

              vendor={vendor}  setVendor={setVendor}    setIsSave={setIsSave}  saveData={saveData}
         
              orderId={id}  setFileName={setFileName} setPoNo={setPoNo} poNo={poNo}    setActive={setActive}  
             
             id={id}   setEmailId={setEmailId}

             /> 

          :

 
   
    
          <div className="flex-1 flex flex-col">
                                        
            <FormHeader   model={"Order Report"} />  
       
           
            <main className="p-2 space-y-6">


              <div className=" bg-white shadow rounded-lg">
                <table className="min-w-full text-left overflow-x-auto" >
                  <thead className="bg-gray-100 text-gray-600 uppercase text-xs leading-normal border border-black-100">
                    <tr >
                      <th className="py-3 px-6">S No</th>
                      <th className="py-3 px-6">Po Number</th>
                      <th className="py-3 px-6">Manufacture</th>
                      <th className="py-3 px-6">Vendor</th>
                      <th className="py-3 px-6">Product</th>
                      <th className="py-3 px-6">Delivery date</th>
                      <th className="py-3 px-6">Approval Status</th>
                    </tr>
                  </thead>

                  <tbody className="text-gray-700 text-xs">
                


                    
                
            {(allData ? allData?.data : [])?.map((item, index) =>

              <tr className="border-b transition-all duration-300 hover:shadow-lg  hover:bg-gray-300 transform  table-row "
                        onClick={() =>{
                        setForm(true)
                        setId(item?.id)
                        setPoNo(item?.docId) }}
              >
                      <td className="p-2 font-semibold">{parseInt(index)  + 1}</td>
                      <td className="p-2">{item?.docId}</td>
                      <td className="p-3">{item?.manufacture}</td>
                  <td className="p-3">{item?.vendor}</td>
                  <td className="p-3">{item?.isApproval ===  1   ?  "TSHIRT AND SHORTS"  :   "TSHIRT AND SHORTS"} </td>

                  <th className="py-3 px-6">{getDateFromDateTime(item?.orderdate)}</th>

       
                      <td className="p-2 items-end ">
                          {item?.isSave ? (
                            <span className="inline-flex  text-sm font-semibold bg-green-300 text-white-500  px-1 w-20 rounded">
                              Progress
                            </span>
                          ) : (
                            <span className="inline-flex   text-sm font-semibold bg-red-300 text-white-500 px-1 w-20 rounded ">
                              Pending
                            </span>
                          )}
                        </td>
                      <td className="flex ">
                        <button className="mt-2 hover:bg-blue-600  rounded"><Eye/></button>
                      </td>
             

                    </tr>



            )}
                

                  </tbody>
                </table>
              </div>

            </main>
      

      </div>


            }
    </>                
                       
)

}

                      
