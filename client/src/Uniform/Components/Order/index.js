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
import { useGetUserByIdQuery } from "../../../redux/services/UsersMasterService";
import { useGetPercentageQuery } from "../../../redux/uniformService/Percentage";


export default function Order({ setForm, form, setEmailId, setActive, setCurrentId }) {

  const [id, setId] = useState("");
  const [fileName, setFileName] = useState("");
  const [poItems, setPoItems] = useState([]);
  const [poNo, setPoNo] = useState(null)
  const [vendor, setVendor] = useState('')
  const [isSave, setIsSave] = useState(true)
  const dispatch = useDispatch()
  const { branchId, finYearId, userId } = getCommonParams()
  const [isApproved, setIsApproved] = useState(false)
  const partyId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "partyId"

  )




  const { data: singleuserData } = useGetUserByIdQuery(userId, { skip: !userId });

  const userRole = singleuserData?.data?.userType || ""

  // const { data: percentage, isPercentageLoading, isPercentageFetching } = useGetPercentageQuery({ params: { branchId, finYearId, userId } });

  const { data: partyData } = useGetPartyQuery({ params: { branchId, finYearId } });

  const { data: allData } = useGetOrderQuery({ params: { branchId, finYearId, partyId, userRole } });

  const { data: singleData, isSingleFetching, isSingleLoading } = useGetOrderByIdQuery(id, { skip: !id });
  const [addData] = useAddOrderMutation();
  const [updateData] = useUpdateOrderMutation();




  const syncFormWithDb = useCallback(
    (data) => {
   
        setPoItems(data?.orderBillItems || []);
        setIsSave(data?.isSave)
        setVendor(data?.vendorId)
      
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
    isSave: true, excessQtyAmount,
    isApproved
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

    if (!window.confirm("Are you sure you want to save the details?")) {
      return;
    }
    if (id) {

      handleSubmitCustom(updateData, data, "Updated")

    } else {

      handleSubmitCustom(addData, data, "Added")

    }

  }





    // useEffect(() => {
    //     if (poItems?.length >= 5) return
    //     setPoItems(prev => {
    //         let newArray = Array?.from({ length: 5  - prev.length }, i => {
    //             return { excessQty: "", qty: 0.00,orderQty:0.00 }
    //         })
    //         return [...prev, ...newArray]
    //     }
    //     )
    // }, [poItems])

//  useEffect(() => {
//     if (percentage?.data?.length === 0) return;
    
//    let percentageValue = percentage?.data?.find(i => i.active)?.qty
// console.log(percentageValue,"percentageValue")

//     let newArray = poItems?.map((item, index) => {
//       return { ...item, excessQty: item?.orderQty ? percentageValue : "" }
//     });
//     setPoItems(newArray)
//   }, [percentage?.data, setPoItems,id]);



  return (


    <>
      {
        form === true && userRole === "MANUFACTURE" ?

          <Manufactureform

            setForm={setForm} singleData={singleData} poItems={poItems} setPoItems={setPoItems}

            vendor={vendor} setVendor={setVendor} setIsSave={setIsSave} saveData={saveData}

            orderId={id} setFileName={setFileName} setPoNo={setPoNo} poNo={poNo} setActive={setActive}

            id={id} setEmailId={setEmailId} setCurrentId={setCurrentId}

          />


          :


          form === true && userRole === "VENDOR" ?

            <VendorForm

              setForm={setForm} singleData={singleData} poItems={poItems} setPoItems={setPoItems}

              vendor={vendor} setVendor={setVendor} setIsSave={setIsSave} saveData={saveData}

              orderId={id} setFileName={setFileName} setPoNo={setPoNo} poNo={poNo} setActive={setActive}

              id={id} setEmailId={setEmailId} setCurrentId={setCurrentId}

            />
            :

            form === true ?

              <BuyerForm

                setForm={setForm} singleData={singleData} poItems={poItems} setPoItems={setPoItems}

                vendor={vendor} setVendor={setVendor} setIsSave={setIsSave} saveData={saveData}

                orderId={id} setFileName={setFileName} setPoNo={setPoNo} poNo={poNo} setActive={setActive} setCurrentId={setCurrentId}

                id={id} setEmailId={setEmailId} isApproved={isApproved} setIsApproved={setIsApproved}
              />

              :
              <div className="flex-1 flex flex-col">

                <FormHeaderNew model={"Order Report"} />


            







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


