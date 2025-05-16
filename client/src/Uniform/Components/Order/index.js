import { useAddOrderMutation, useGetOrderByIdQuery, useGetOrderQuery, useUpdateOrderMutation } from "../../../redux/uniformService/OrderService";
import secureLocalStorage from "react-secure-storage";
import React, { useCallback, useEffect, useState } from "react";
import GeneralSummary from "./GeneralSummary";
import { getCommonParams, getDateFromDateTime } from "../../../Utils/helper";
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
import moment from 'moment';


export default function Order({ setForm, form, setEmailId, active, setActive, setCurrentId }) {
  const today = new Date()
  console.log(today, "today")
  const [id, setId] = useState("");
  const [refreshPage, setRefreshPage] = useState(false)
  const [fileName, setFileName] = useState("");
  const [poItems, setPoItems] = useState([]);
  const [poNo, setPoNo] = useState(null)
  const [vendor, setVendor] = useState('')
  const [deliveryDate, setDeliveryDate] = useState(moment.utc().format('YYYY-MM-DD'));

  const [isSave, setIsSave] = useState(true)
  const [poSentForApproval, setPoSentForApproval] = useState(false)
  const { branchId, finYearId, userId } = getCommonParams()
  const [docDate, setDocDate] = useState(getDateFromDateTime(today));
  const partyId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "partyId"

  )




  const { data: singleuserData } = useGetUserByIdQuery(userId, { skip: !userId });

  const userRole = singleuserData?.data?.userType || ""

  // const { data: percentage, isPercentageLoading, isPercentageFetching } = useGetPercentageQuery({ params: { branchId, finYearId, userId } });

  const { data: partyData } = useGetPartyQuery({ params: { branchId, finYearId } });

  const { data: allData, refetch } = useGetOrderQuery({ params: { branchId, finYearId, partyId, userRole } });

  const { data: singleData, isSingleFetching, isSingleLoading } = useGetOrderByIdQuery(id, { skip: !id });
  const [addData] = useAddOrderMutation();
  const [updateData] = useUpdateOrderMutation();


  console.log(docDate, "docDate")

  const syncFormWithDb = useCallback(
    (data) => {
      setPoItems(data?.orderBillItems || []);
      setIsSave(data?.isSave)
      setVendor(data?.vendorId)
      setDeliveryDate(data?.deliverydate ? moment(data?.deliverydate).format('YYYY-MM-DD') : null)
      setDocDate(data?.docDate ? moment(data?.docDate).format('YYYY-MM-DD') : null)
      setIsApproved(data?.isApproved || '');
      // setPoSentForApproval(data?.poSentForApproval  ||  "")
    },
    [id]
  );
  useEffect(() => {
    syncFormWithDb(singleData?.data);
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

  const excessQty = poItems?.reduce((a, c) => a + parseFloat(c?.excessQty || 0), 0);
  const excessQtyAmount = poItems?.reduce((a, c) => a + parseFloat(c?.qty || 0), 0);

  const [isApproved, setIsApproved] = useState('')
  const data = {
    id,
    branchId, userId,
    orderDetails: poItems?.filter(item => item?.orderQty > 0),
    finYearId,
    vendor,
    excessQty,
    isSave: true, excessQtyAmount,
    isApproved,
    deliveryDate, docDate
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


        toast.success(text + "Successfully", {
          autoClose: 1000
        });
      } else {
        toast.error(returnData?.message, {
          autoClose: 1000
        });
      }

    } catch (error) {
      console.log("handle", error);
    }
  };


  const saveData = (isMailForm = false, isManufacture = false, isBuyer = false) => {
    console.log(isMailForm, "isMailForm", isManufacture, isBuyer)

    if (!window.confirm("Are you sure you want to save And Send Mail The details?")) {
      return;
    }
    if (isManufacture && userRole === "MANUFACTURE") {
      if (!deliveryDate) {
        toast.info("Choose The Delivery Date", {
          autoClose: 1000
        })
        return;
      }
      if (!vendor) {
        toast.info("Choose The Vendor", {
          autoClose: 1000
        })
        return;
      }
    }
    if (isBuyer) {
      if (!deliveryDate) {
        toast.info("Cannot send Mail ", {
          autoClose: 1000
        })
        return;
      }
      if (!vendor) {
        toast.info("Cannot send Mail", {
          autoClose: 1000
        })
        return;
      }
    }

    if (isMailForm) {
      setForm(false);
      setActive("Mail");
    }

    if (id) {

      handleSubmitCustom(updateData, data, "Updated")

    } else {

      handleSubmitCustom(addData, data, "Added")

    }

  }



  console.log(active, "active", form, "form")



  return (

    //forms
    <React.Fragment >
      {
        form === true && userRole === "MANUFACTURE" ?

          <Manufactureform

            setForm={setForm} form={form} singleData={singleData} poItems={poItems} setPoItems={setPoItems}

            vendor={vendor} setVendor={setVendor} setIsSave={setIsSave} saveData={saveData}

            orderId={id} setFileName={setFileName} setPoNo={setPoNo} poNo={poNo} setActive={setActive} active={active}

            id={id} setEmailId={setEmailId} setCurrentId={setCurrentId}

            deliveryDate={deliveryDate} setDeliveryDate={setDeliveryDate}

          />


          :


          form === true && userRole === "VENDOR" ?

            <VendorForm

              setForm={setForm} form={form} singleData={singleData} poItems={poItems} setPoItems={setPoItems}

              vendor={vendor} setVendor={setVendor} setIsSave={setIsSave} saveData={saveData}

              orderId={id} setFileName={setFileName} setPoNo={setPoNo} poNo={poNo} setActive={setActive}

              id={id} setEmailId={setEmailId} setCurrentId={setCurrentId}

              poSentForApproval={poSentForApproval} active={active}

              setPoSentForApproval={setPoSentForApproval}

            />
            :

            form === true ?

              <BuyerForm

                setForm={setForm} form={form} singleData={singleData} poItems={poItems} setPoItems={setPoItems}

                vendor={vendor} setVendor={setVendor} setIsSave={setIsSave} saveData={saveData}

                orderId={id} setFileName={setFileName} setPoNo={setPoNo} poNo={poNo} setActive={setActive} setCurrentId={setCurrentId}

                id={id} setEmailId={setEmailId} isApproved={isApproved} setIsApproved={setIsApproved} active={active}

              />

              :

              //Order Report pages
              <div className="flex-1 flex flex-col h-[screen]">

                <FormHeaderNew model={"List Of Orders"} refresh={"Refresh"} refreshPage={refetch} />



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
                          poSentForApproval={poSentForApproval}
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
    </React.Fragment >

  )

}


