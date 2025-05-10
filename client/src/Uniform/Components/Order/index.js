import { useAddOrderMutation, useGetOrderByIdQuery, useGetOrderQuery, useUpdateOrderMutation } from "../../../redux/uniformService/OrderService";
import secureLocalStorage from "react-secure-storage";
import { useCallback, useEffect, useState } from "react";
import GeneralSummary from "./GeneralSummary";
import { getCommonParams } from "../../../Utils/helper";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { useGetPartyQuery } from "../../../redux/services/PartyMasterService";
import Manufacture from "./Manufacture";
import Vendor from "./Vendor";
import Buyer from "./Buyer";
import Manufactureform from "../Reports/Manufacture";
import VendorForm from "../Reports/Vendor";
import BuyerForm from "../Reports/Buyer";
import FormHeaderNew from "../../../Basic/components/FormHeaderNew";
import { useGetUserByIdQuery, useGetUserQuery } from "../../../redux/services/UsersMasterService";


export default function Order({ setForm, form, setEmailId, setActive }) {

  const [id, setId] = useState("");
  const [fileName, setFileName] = useState("");
  const [poItems, setPoItems] = useState([]);
  const [poNo, setPoNo] = useState(null)
  const [vendor, setVendor] = useState('')
  const [isSave, setIsSave] = useState(true)
  const dispatch = useDispatch()
  const { branchId, finYearId, userId } = getCommonParams()

  const partyId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "partyId"

  )




  const { data: singleuserData } = useGetUserByIdQuery(userId, { skip: !userId });

  const userRole = singleuserData?.data?.userType || ""



  const { data: partyData } = useGetPartyQuery({ params: { branchId, finYearId } });

  const { data: allData } = useGetOrderQuery({ params: { branchId, finYearId, partyId, userRole } });

  const { data: singleData, isSingleFetching, isSingleLoading } = useGetOrderByIdQuery(id, { skip: !id });
  const [addData] = useAddOrderMutation();
  const [updateData] = useUpdateOrderMutation();


  const syncFormWithDb = useCallback(
    (data) => {
      if (!id) {
        setPoItems([]);

      } else {
        setPoItems(data?.orderBillItems || []);
        setIsSave(data?.isSave)
        setVendor(data?.vendorId)
      }
    },
    [id]
  );
  useEffect(() => {
    syncFormWithDb(singleData?.data);
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

  const excessQty = poItems?.reduce((a, c) => a + parseFloat(c?.excessQty || 0), 0);
  const excessQtyAmount = poItems?.reduce((a, c) => a + parseFloat(c?.qty || 0), 0);
  const data = {
    id,
    branchId, userId,
    orderDetails: poItems?.filter(item => item?.orderQty > 0),
    finYearId,
    vendor,
    excessQty,
    isSave: true, excessQtyAmount

  }

  const handleSubmitCustom = async (callback, data, text) => {

    try {
      const formData = new FormData();
      for (let key in data) {
        if (key === "orderDetails") {
          data[key].forEach(item =>
            formData.append(key, JSON.stringify(item))
          );
        }
        if (key === 'attachments') {
          formData.append(key, JSON.stringify(data[key].map(i => ({ ...i, filePath: (i.filePath instanceof File) ? i.filePath.name : i.filePath }))));
          data[key].forEach(option => {
            if (option?.filePath instanceof File) {
              formData.append('images', option.filePath);
            }
          });
        } else {
          formData.append(key, data[key]);
        }
      }
      console.log(formData, 'formData104');

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
  // const handleSubmitCustom = async (callback, data, text) => {
  //   try {
  //     let returnData = await callback(data).unwrap();
  //     if (returnData.statusCode === 0) {
  //       setId(returnData?.data?.id)
  //       toast.success(text + "Successfully");
  //       dispatch({
  //         type: `partyMaster/invalidateTags`,
  //         payload: ['Party'],
  //       });
  //     } else {
  //       toast.error(returnData?.message)
  //     }
  //   } catch (error) {
  //     console.log(error)
  //   }

  // }

  const saveData = () => {

    if (!window.confirm("Are you sure you want to save the details?")) {
      return;
    }
    if (id) {

      handleSubmitCustom(updateData, data, "Updated")

    } else {

      handleSubmitCustom(addData, data, "Added")

    }

  }

  console.log(poItems, 'poItems');

  return (


    <>


      {
        form === true && userRole === "MANUFACTURE" ?

          <Manufactureform

            setForm={setForm} singleData={singleData} poItems={poItems} setPoItems={setPoItems}

            vendor={vendor} setVendor={setVendor} setIsSave={setIsSave} saveData={saveData}

            orderId={id} setFileName={setFileName} setPoNo={setPoNo} poNo={poNo} setActive={setActive}

            id={id} setEmailId={setEmailId}
          />


          :


          form === true && userRole === "VENDOR" ?

            <VendorForm

              setForm={setForm} singleData={singleData} poItems={poItems} setPoItems={setPoItems}

              vendor={vendor} setVendor={setVendor} setIsSave={setIsSave} saveData={saveData}

              orderId={id} setFileName={setFileName} setPoNo={setPoNo} poNo={poNo} setActive={setActive}

              id={id} setEmailId={setEmailId}
            />
            :

            form === true ?

              <BuyerForm

                setForm={setForm} singleData={singleData} poItems={poItems} setPoItems={setPoItems}

                vendor={vendor} setVendor={setVendor} setIsSave={setIsSave} saveData={saveData}

                orderId={id} setFileName={setFileName} setPoNo={setPoNo} poNo={poNo} setActive={setActive}

                id={id} setEmailId={setEmailId}
              />

              :
              <div className="flex-1 flex flex-col">

                <FormHeaderNew model={"Order Report"} />


                {/* <main className="p-2 space-y-6">

              {   userRole ===  "VENDOR"   ||       userRole ===  "MANUFACTURE"  ?

              <div className=" bg-white shadow rounded-lg">
                <table className="min-w-full text-left overflow-x-auto" >
                  <thead className="bg-gray-100 text-gray-600 uppercase text-xs leading-normal border border-black-100">
                    <tr >
                      <th className="py-3 px-6">S No</th>
                      <th className="py-3 px-6">Po Number</th>
                      <th className="py-3 px-6">Order date</th>
                      <th className="py-3 px-6">Delivery date</th>
                     { userRole ===  "MANUFACTURE"   &&      
                      <th className="py-3 px-6">Vendor</th> }  
                         
                          { userRole ===  "VENDOR"   &&      
                      <th className="py-3 px-6">Manufacture</th> } 
                      
                      <th className="py-3 px-6">Product</th>
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
              <td className="p-3">{getDateFromDateTime(item?.orderdate)}</td>
              <th className="py-3 px-6">{getDateFromDateTime(item?.deliverydate)}</th>
              { userRole ===  "MANUFACTURE"   &&   
              <td className="p-3">{findFromList(item.vendorId,partyData?.data, "name")}</td> }
             <td className="p-3">{findFromList(item.manufactureId,partyData?.data, "name")   ||  item?.manufactureId   }</td>
      
              <td className="p-3">{item?.isApproval ===  1   ?  "TSHIRT AND SHORTS"  :   "TSHIRT AND SHORTS"} </td>



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
            
     

            </tr>

          )}
            
                  </tbody>
                </table>
              </div>
          


     :

          <div className=" bg-white shadow rounded-lg">
            <table className="min-w-full text-left overflow-x-auto" >
              <thead className="bg-gray-100 text-gray-600 uppercase text-xs leading-normal border border-black-100">
                <tr >
                  <th className="py-3 px-6">S No</th>
                  <th className="py-3 px-6">Po Number</th>
                  <th className="py-3 px-6">Orderdate</th>
                  <th className="py-3 px-6">Delivery date</th>
                  <th className="py-3 px-6">Manufacture</th>
                  <th className="py-3 px-6">Vendor</th>
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
          <td className="p-3">{getDateFromDateTime(item?.orderdate)}</td>
          <th className="py-3 ">{getDateFromDateTime(item?.deliverydate)}</th>
          <td className="p-3">{findFromList(item?.manufactureId,partyData?.data, "name") ||  item?.manufactureId }</td>
          <td className="p-3">{findFromList(item?.vendorId,partyData?.data, "name") ||  "Not yet Conformed"  }  </td>



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



          </tr>

          )}

              </tbody>
            </table>
          </div>
        
                            
      }


                

            </main> */}




                <main className="p-2 space-y-6">
                  {
                    userRole === "MANUFACTURE" ?

                      <>
                        <Manufacture

                          allData={allData}
                          setForm={setForm}
                          setId={setId}
                          setPoNo={setPoNo}
                          partyData={partyData}
                        />
                      </>
                      :

                      userRole === "VENDOR" ?

                        <>
                          <Vendor

                            allData={allData}
                            setForm={setForm}
                            setId={setId}
                            setPoNo={setPoNo}
                            partyData={partyData}
                          />
                        </>

                        :
                        <Buyer

                          partyData={partyData}
                          allData={allData}
                          setForm={setForm}
                          setId={setId}
                          setPoNo={setPoNo}
                        />
                  }
                </main>

              </div>


      }
    </>

  )

}


