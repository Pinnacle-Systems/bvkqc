import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import secureLocalStorage from 'react-secure-storage';
import { useGetCityQuery } from '../../../redux/services/CityMasterService';
// import { useGetCurrencyMasterQuery } from '../../../redux/ErpServices/CurrencyMasterServices';
import { useAddPartyMutation, useDeletePartyMutation, useGetPartyByIdQuery, useGetPartyQuery, useUpdatePartyMutation } from '../../../redux/services/PartyMasterService';
import moment from 'moment';
import { findFromList } from '../../../Utils/helper';
// import { useGetProcessQuery } from '../../../redux/services/procss';
import Loader from '../../components/Loader';
import { dropDownListMergedObject, dropDownListObject, multiSelectOption } from '../../../Utils/contructObject';
import PartyOnItems from './PartyOnItems';
import { ChevronLeft, ChevronRight, Delete, Plus } from 'lucide-react';
import { PartyTypes, statusDropdown } from '../../../Utils/DropdownData';
import BrowseSingleImage from '../../components/BrowseSingleImage';
import MastersForm from '../MastersForm/MastersForm';
import { Modal, ToggleButton, CheckBox, DateInput, DropdownInput, MultiSelectDropdown, RadioButton, TextArea, TextInput, LongTextInput } from '../../../Inputs';
import Mastertable from '../MasterTable/Mastertable';
import { useGetProcessMasterQuery } from '../../../redux/uniformService/ProcessMasterService';
import { useGetCurrencyMasterQuery } from '../../../redux/services/CurrencyMasterServices';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashCan, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { DELETE, PLUS } from '../../../icons';
import { toast } from 'react-toastify';
import { push } from '../../../redux/features/opentabs';


const MODEL = "Party Master"

export default function Form() {



    const [form, setForm] = useState(false);
    const [readOnly, setReadOnly] = useState(false);
    const [id, setId] = useState("");
    const [panNo, setPanNo] = useState("");
    const [name, setName] = useState("");
    const [aliasName, setAliasName] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [tinNo, setTinNo] = useState("");
    const [cstNo, setCstNo] = useState("");
    const [cinNo, setCinNo] = useState("");
    const [faxNo, setFaxNo] = useState("");
    const [website, setWebsite] = useState("");
    const [code, setCode] = useState("");
    const [address, setAddress] = useState("");
    const [city, setCity] = useState("");
    const [pincode, setPincode] = useState("");
    const [contactPersonName, setContactPersionName] = useState("");
    const [isIgst, setGstNo] = useState(true);
    const [costCode, setCostCode] = useState("");
    const [contactMobile, setContactMobile] = useState('');
    const [mailId,setMailId] = useState("")
    const [partyType, setpartyType] = useState("");

    const [cstDate, setCstDate] = useState("");
    const [email, setEmail] = useState("");
    const [accessoryItemList, setAccessoryItemList] = useState([]);

    const [accessoryGroup, setAccessoryGroup] = useState(false);
    const [accessoryGroupPrev, setAccessoryGroupPrev] = useState(false);
    const [priceTemplateId, setPriceTemplateId] = useState("");

    const [currency, setCurrency] = useState("INR");
    const [active, setActive] = useState(true);
    const [isSupplier, setSupplier] = useState(true);
    const [isClient, setClient] = useState(true);
    const [itemsPopup, setItemsPopup] = useState(false);
    const [backUpItemsList, setBackUpItemsList] = useState([]);
    const [shippingAddress, setShippingAddress] = useState([])
    const [contactDetails, setContactDetails] = useState([]);


    const [searchValue, setSearchValue] = useState("");

    const openTabs = useSelector((state) => state.openTabs);
    const projectForm = useMemo(() => { return openTabs.tabs.find(i => i.name === "PARTY MASTER")?.projectForm}, [openTabs])
console.log(projectForm,"projectForm")
    useEffect(() => {
      setForm(projectForm);
    }, [projectForm]);
    

    const [errors, setErrors] = useState({});
    const [image, setImage] = useState({});
    console.log(typeof (image), "image", image)

    const childRecord = useRef(0);
    const dispatch = useDispatch()

    const companyId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "userCompanyId"
    )
    // const { data: accessoryItemsMasterList, isLoading: isItemsLoading, isFetching: isItemsFetching } = useGetAccessoryItemMasterQuery({ companyId })
    let accessoryItemsMasterList;

    const userId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "userId"
    )
    const params = {
        companyId
    };
    const { data: cityList } =
        useGetCityQuery({ params }); console.log(cityList, "cityList")

    const { data: currencyList } =
        useGetCurrencyMasterQuery({ params });

    const { data: allData, isLoading, isFetching } = useGetPartyQuery({ params, searchParams: searchValue });

    const {
        data: singleData,
        isFetching: isSingleFetching,
        isLoading: isSingleLoading,
    } = useGetPartyByIdQuery(id, { skip: !id });

    const [addData] = useAddPartyMutation();
    const [updateData] = useUpdatePartyMutation();
    const [removeData] = useDeletePartyMutation();

    const syncFormWithDb = useCallback((data) => {
        if (!id) {
            setReadOnly(false);
            setPanNo("");
            setName("");
            setImage("")
            setAliasName("");
            setDisplayName("");
            setAddress("");
            setTinNo("");
            setCstNo("");
            setCinNo("");
            setFaxNo("");
            setCinNo("");
            setContactPersionName("");
            setGstNo("");
            setCostCode("");
            setCstDate("");
            setCode("");
            setPincode("");
            setWebsite("");
            setEmail("");
            setCity("");
            setCurrency("");
            setActive(id ? (data?.active ?? true) : false);
            setSupplier(false);
            setClient(false);
            setContactMobile((''));
            setAccessoryGroup((false));
            setAccessoryItemList(([]))
            setPriceTemplateId("")
            setpartyType("")
            setMailId("")
        } else {
            setReadOnly(true);
            setPanNo(data?.panNo || "");
            setName(data?.name || "");
             setMailId(data?.mailId)

            setAliasName(data?.aliasName || "");
            setImage(data?.image || "")
            setDisplayName(data?.displayName || "");
            setAddress(data?.address || "");
            setTinNo(data?.tinNo || "");
            setCstNo(data?.cstNo || "");
            setCinNo(data?.cinNo || "");
            setFaxNo(data?.faxNo || "");
            setCinNo(data?.cinNo || "");
            setContactPersionName(data?.contactPersionName || "");
            setGstNo(data?.isIgst || "");
            setCostCode(data?.costCode || "");
            setCstDate(data?.cstDate ? moment.utc(data?.cstDate).format('YYYY-MM-DD') : "");
            setCode(data?.code || "");
            setPincode(data?.pincode || "");
            setWebsite(data?.website || "");
            setEmail(data?.email || "");
            setCity(data?.cityId || "");
            setCurrency(data?.currencyId || "");
            setActive(id ? (data?.active ?? false) : true);
            setSupplier((data?.yarn || false));
            setClient((data?.fabric || false));
            setAccessoryGroup((data?.accessoryGroup || false));
            setAccessoryItemList((data?.PartyOnAccessoryItems ? data.PartyOnAccessoryItems.map(item => parseInt(item.accessoryItemId)) : []))
            setPriceTemplateId(data?.priceTemplateId || "")
            setShippingAddress(data?.ShippingAddress ? data?.ShippingAddress : [])
            setContactDetails((data?.ContactDetails ? data.ContactDetails : ''));
            setSupplier(data?.isSupplier || false);
            setClient(data?.isClient || false);
            setpartyType(data?.partyType)
        }

    }, [id]);

    useEffect(() => {
        syncFormWithDb(singleData?.data);
    }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

    const data = {
        name, code, aliasName, displayName, address, cityId: city, pincode, panNo, tinNo, cstNo, cstDate, cinNo,
        faxNo, email, website, contactPersonName, isIgst, currencyId: currency, costCode, contactMobile,
        active, isSupplier, isClient, accessoryGroup, companyId, shippingAddress, contactDetails,
        accessoryItemList,partyType ,
        id, userId, priceTemplateId, image,mailId
    }

    const { data: processList, isLoading: isProcessLoading, isFetching: isProcessFetching } = useGetProcessMasterQuery({ params });

    const validateData = (data) => {

        if (data.name &&  data.mailId   &&  data.partyType ) {
            return true;
            // && data.joiningDate && data.fatherName && data.dob && data.gender && data.maritalStatus && data.bloodGroup &&
            //     data.panNo && data.email && data.mobile && data.degree && data.specialization &&
            //     data.localAddress && data.localCity && data.localPincode && data.partyCategoryId && data.currencyId

        }
        return false;
    }
    const handleSubmitCustom = async (callback, data, text) => {
        try {
            let returnData;
            if (text === "Updated") {
                returnData = await callback({ id, body: data }).unwrap();
            } else {
                returnData = await callback(data).unwrap();
            }
            dispatch({
                type: `accessoryItemMaster/invalidateTags`,
                payload: ['AccessoryItemMaster'],
            });
            dispatch({
                type: `CityMaster/invalidateTags`,
                payload: ['City/State Name'],
            });
            dispatch({
                type: `CurrencyMaster/invalidateTags`,
                payload: ['Currency'],
            });
            // let returnData = await callback(data).unwrap();
            setId(returnData.data.id)
            toast.success(text + "Successfully");
            if(projectForm){
                            dispatch(push({ name: "ORDER",projectForm: true ,projectId :true}));
                
            }
        } catch (error) {
            console.log("handle");
        }
    };

    function handleGroupRadioButton(e) {
        setAccessoryGroup(e.target.checked);
    }

    function handleItemRadioButton(e) {
        if (accessoryGroup) setAccessoryItemList([]);
        setAccessoryGroupPrev(accessoryGroup);
        setAccessoryGroup(!e.target.checked);
        setItemsPopup(true);
    }

    useEffect(() => {
        if (itemsPopup) {
            setBackUpItemsList(accessoryItemList);
        }
    }, [itemsPopup])
    useEffect(() => {
        if (accessoryGroup) {
            if (accessoryItemsMasterList) {
                setAccessoryItemList(accessoryItemsMasterList.data.map(item => parseInt(item.id)))
            }
        }
    }, [accessoryGroup,
        //  isItemsFetching, isItemsLoading, 
        accessoryItemsMasterList])



    const saveData = () => {

        if (!validateData(data)) {
            console.log("hit")

            toast.error("Please fill all required fields...!", { position: "top-center" })
            return
        }
        // if (!validateEmail(data.email)) {
        //     toast.error("Please enter proper email id!", { position: "top-center" })
        //     return
        // }
        // if (!validateMobile(data.mobile)) {
        //     toast.error("Please enter proper mobile number...!", { position: "top-center" })
        //     return
        // }
        // if (!validatePan(data.panNo)) {
        //     toast.error("Please enter proper pan number...!", { position: "top-center" })
        //     return
        // }
        // if (!validatePincode(data.localPincode)) {
        //     toast.error("Please enter proper local Pincode...!", { position: "top-center" })
        //     return
        // }
        // if (data.permPincode && !validatePincode(data.permPincode)) {
        //     toast.error("Please enter proper perm. Pincode...!", { position: "top-center" })
        //     return
        // }

        if (id) {
            handleSubmitCustom(updateData, data, "Updated");
        } else {
            handleSubmitCustom(addData, data, "Added");
        }
    }


    const deleteData = async () => {
        if (id) {
            if (!window.confirm("Are you sure to delete...?")) {
                return;
            }
            try {
                let deldata = await removeData(id).unwrap();
                if (deldata?.statusCode == 1) {
                    toast.error(deldata?.message)
                    return
                }
                dispatch({
                    type: `accessoryItemMaster/invalidateTags`,
                    payload: ['AccessoryItemMaster'],
                });
                setId("");
                dispatch({
                    type: `CityMaster/invalidateTags`,
                    payload: ['City/State Name'],
                });
                dispatch({
                    type: `CurrencyMaster/invalidateTags`,
                    payload: ['Currency'],
                });
                syncFormWithDb(undefined);
                toast.success("Deleted Successfully");
                setForm(false)
            } catch (error) {
                toast.error("something went wrong");
            }
        }
    };

    // Handle next step
    const handleNext = () => {
        // if (validateStep()) {
        setStep(step + 1);
        // }
    };

    // Handle previous step
    const handlePrevious = () => {
        setStep(step - 1);
    };

    const handleKeyDown = (event) => {
        let charCode = String.fromCharCode(event.which).toLowerCase();
        if ((event.ctrlKey || event.metaKey) && charCode === "s") {
            event.preventDefault();
            saveData();
        }
    };

    const onNew = () => {
        setReadOnly(false);
        setForm(true);
        setSearchValue("");
        setId("");
        syncFormWithDb(undefined);
    };

    function onDataClick(id) {
        setId(id);
        setForm(true);
    }
    function handleInputAddress(value, index, field) {
        const newBlend = structuredClone(shippingAddress);
        newBlend[index][field] = value;
        setShippingAddress(newBlend)
    }


    function deleteAddress(index) {
        setShippingAddress(prev => prev.filter((_, i) => i !== index))
    }
    function addNewAddress() {
        setShippingAddress(prev =>
            [...prev,
            { address: "" }]
        );
    }

    function removeItem(index) {
        setContactDetails(contactDetails => {
            return contactDetails.filter((_, i) => parseInt(i) !== parseInt(index))
        });
    }


    const tableHeaders = ["S.NO", "Name", "Alias Name", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "]
    const tableDataNames = ["index+1", "dataObj.name", 'dataObj.aliasName', " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "]

    //step
    const [step, setStep] = useState(1);
    // const [errors, setErrors] = useState({});

    // if (isItemsFetching || isItemsLoading || isProcessLoading || isProcessFetching) {
    //     return <Loader />
    // }


    return (
        <div
            onKeyDown={handleKeyDown}
        >

            <div className='w-full flex justify-between mb-2 items-center px-0.5'>
                <h5 className='my-1'>Party Master</h5>
                <div className='flex items-center'>
                    <button onClick={() => { setForm(true); onNew() }} className='bg-green-500 text-white px-3 py-1 button rounded shadow-md'>+ New</button>
                </div>
            </div>
            <div className='w-full flex items-start'>
                <Mastertable
                    header={'Party List'}
                    searchValue={searchValue}
                    setSearchValue={setSearchValue}
                    onDataClick={onDataClick}
                    // setOpenTable={setOpenTable}
                    tableHeaders={tableHeaders}
                    tableDataNames={tableDataNames}
                    data={allData?.data}
                    // loading={
                    //     isLoading || isFetching
                    // } 
                    />
            </div>
            {form === true && <Modal isOpen={form} form={form} widthClass={"w-[40%] h-[80%]"} onClose={() => { setForm(false); setErrors({}); setStep(1) }}>
                <Modal isOpen={itemsPopup} onClose={
                    () => {
                        setAccessoryGroup(accessoryGroupPrev);
                        setAccessoryItemList(structuredClone(backUpItemsList));
                        setItemsPopup(false);
                    }} widthClass={"w-[600px] h-[600px] overflow-auto flex justify-start item-center bg-blue-100 p-10"}>
                    <PartyOnItems readOnly={readOnly} setItemsPopup={setItemsPopup}
                        accessoryItemsMasterList={accessoryItemsMasterList} accessoryItemList={accessoryItemList} setAccessoryItemList={setAccessoryItemList} />
                </Modal>
                <MastersForm
                    onNew={onNew}
                    onClose={() => {
                        setForm(false);
                        setSearchValue("");
                        setId(false);
                    }}
                    model={MODEL}
                    childRecord={childRecord.current}
                    saveData={saveData}
                    setReadOnly={setReadOnly}
                    deleteData={deleteData}
                    readOnly={readOnly}
                    emptyErrors={() => setErrors({})}
                >
                    <fieldset className='rounded'>
                        <div className=''>

                            {step === 1 && (
                            <div className="flex flex-wrap justify-between gap-6">

                                <div className="w-full md:w-[50%]">
                                
                       

                                <fieldset className="mb-4">
                                    <div className={`my-2 ${readOnly ? "pointer-events-none" : ""}`}>
                                    <div className="flex flex-wrap items-center gap-6">
                                        <CheckBox 
                                        name="Is Supplier" 
                                        style={{ fontWeight: 'bold' }} 
                                        readOnly={readOnly} 
                                        value={isSupplier} 
                                        setValue={setSupplier} 
                                        />
                                        <CheckBox 
                                        name="Is Client" 
                                        readOnly={readOnly} 
                                        value={isClient} 
                                        setValue={setClient} 
                                        />
                                        <CheckBox 
                                        name="IGST" 
                                        readOnly={readOnly} 
                                        value={isIgst} 
                                        setValue={setGstNo} 
                                        />
                                    </div>
                                    </div>
                                </fieldset>
                                  <div className="flex flex-wrap justify-between w-full mb-4 gap-1">
                                    <div className="w-[48%] mb-3">
                                    <TextInput 
                                        name="Party Name" 
                                        width="w-full" 
                                        type="text" 
                                        value={name}
                                        setValue={setName} 
                                        required={true} 
                                        readOnly={readOnly} 
                                        disabled={(childRecord.current > 0)}
                                        onBlur={(e) => {
                                        if (aliasName) return;
                                        setAliasName(e.target.value);
                                        }}
                                    />
                                    </div>
                                    <div className="w-[48%] mb-3">
                                    <TextInput 
                                        name="Alias Name" 
                                        width="w-full" 
                                        type="text" 
                                        value={aliasName} 
                                        setValue={setAliasName} 
                                        required={true} 
                                        readOnly={readOnly} 
                                        disabled={(childRecord.current > 0)} 
                                    />
                                    </div>
                                </div>
                                   <div className="flex flex-wrap justify-between w-full mb-4 gap-1">
                                        <div className="w-[48%] mb-3">
                                            <TextInput 
                                                name="Email" 
                                                width="w-full" 
                                                type="text" 
                                                value={mailId} 
                                                setValue={setMailId} 
                                                required={true} 
                                                readOnly={readOnly} 
                                                disabled={(childRecord.current > 0)} 
                                            />
                                            </div>
                                        <div className="w-[48%] mb-4">
                                            <DropdownInput 
                                            readOnly={readOnly} 
                                            name="PartyType" 
                                            value={partyType} 
                                            setValue={setpartyType}
                                            options={PartyTypes} 
                                            />
                                        </div>
                                        </div>
                                </div>

                                <div className="w-full md:w-auto flex justify-center items-start">
                                <BrowseSingleImage 
                                    picture={image} 
                                    setPicture={setImage} 
                                    readOnly={readOnly} 
                                />
                                </div>

                            </div>
                            )}



                            {step === 2 && (
                                <fieldset >
                                    <div className='mt-2'>
                                  


                                     
                                        <div className="flex flex-wrap justify-between">
                                            <div className="w-[48%] mb-3">
                                                <TextInput name="Pan No" width={'w-[110px]'} type="pan_no" value={panNo} setValue={setPanNo} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                            </div>
                                            <div className="w-[48%] mb-3">
                                                <TextInput name="GST No" width={'w-[150px]'} type="text" value={isIgst} setValue={setGstNo} readOnly={readOnly} />
                                            </div>
                                        </div>
                                        <div className='flex flex-wrap justify-between w-[100%]'>
                                            <div className='mb-3 w-[48%]'>
                                                <TextInput name="Pincode" type="number" value={pincode} setValue={setPincode} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                            </div>
                                            <div className="w-[48%] mb-3">
                                                <TextInput name="Cost Code" width={'w-[150px]'} type="text" value={costCode} setValue={setCostCode} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                            </div>
                                        </div>
                                        <div className='flex flex-wrap justify-between w-[100%]'>
                                            <div className="w-[48%] mb-3">
                                                <TextInput name="CST No" width={'w-[150px]'} type="text" value={cstNo} setValue={setCstNo} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                            </div>

                                            <div className='mb-3 w-[48%]'>
                                                <TextInput name="Tin No" width={'w-[150px]'} type="text" value={tinNo} setValue={setTinNo} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                            </div>
                                        </div>
                                        <div className='flex flex-wrap justify-between w-[100%]'>

                                            <div className="w-[48%] mb-3">
                                                <DateInput name="CST Date" width={'w-[150px]'} value={cstDate} setValue={setCstDate} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                            </div>
                                            <div className="mb-2  w-[48%]">
                                                <DropdownInput name="City/State Name" options={dropDownListMergedObject(id ? cityList?.data : cityList?.data?.filter(item => item.active), "name", "id")} value={city} setValue={setCity} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap justify-between">
                                            <div className="w-[48%] mb-3">
                                                <TextInput name="Cin No" width={'w-[200px]'} type="text" value={cinNo} setValue={setCinNo} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                            </div>
                                            <div className="w-[48%] mb-3">
                                                <TextInput name="Fax No" width={'w-[150px]'} type="text" value={faxNo} setValue={setFaxNo} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                            </div>
                                        </div>
                                        <div className='mb-5'>
                                            <ToggleButton name="Status" options={statusDropdown} value={active} setActive={setActive} required={true} readOnly={readOnly} />
                                        </div>
                                    </div>
                                </fieldset>
                            )}


                            {step === 3 && (
                                <>

                                    <fieldset className=' my-1 h-[150px] overflow-y-auto '>
                                        <legend className='sub-heading'> Address</legend>
                                        <div className='grid grid-cols-1 gap-2 my-2 p-1 '>
                                            <table className=" border border-gray-500 text-xs  w-full">
                                                <thead className='bg-blue-200 top-0 border-b border-gray-500'>

                                                    <tr className=''>
                                                        <th className="table-data  py-2 w-5">S.No</th>

                                                        <th className="table-data  py-2 ">Address</th>



                                                        <th className="table-data  w-10 p-0.5">
                                                            <button onClick={() => {
                                                                addNewAddress()
                                                            }}>{PLUS}</button></th>

                                                    </tr>
                                                </thead>
                                                <tbody className=' h-full w-full'>


                                                    {(shippingAddress ? shippingAddress : []).map((item, index) =>
                                                        <tr className="w-full table-row">
                                                            <td className='table-data'>
                                                                {index + 1}
                                                            </td>


                                                            <td className='table-data'>
                                                                <input
                                                                    type="text"
                                                                    className="text-left rounded py-2 px-1 w-full table-data-input"

                                                                    value={item?.address ? item?.address : ""}

                                                                    disabled={readOnly}
                                                                    onChange={(e) =>
                                                                        handleInputAddress(e.target.value, index, "address")
                                                                    }
                                                                />
                                                            </td>
                                                            <td className="border border-gray-500 text-xs text-center">
                                                                <button
                                                                    type='button'
                                                                    onClick={() => {
                                                                        deleteAddress(index)
                                                                    }}
                                                                    className='text-xs text-red-600 '>{DELETE}
                                                                </button>
                                                            </td>


                                                        </tr>

                                                    )}

                                                </tbody>

                                            </table>
                                        </div>
                                    </fieldset>
                                    <fieldset className=' my-1 h-[150px] overflow-y-auto mt-5'>
                                        <legend className='sub-heading'>Contact Details</legend>
                                        <div className='grid grid-cols-1 gap-2 my-2'>
                                            <table className="border border-gray-500">
                                                <thead className='bg-blue-200 top-0 border-b border-gray-500'>
                                                    <tr>
                                                        <th className="border border-gray-500 text-sm">S.no</th>
                                                        <th className="border border-gray-500 text-sm">Contact Person Name</th>
                                                        <th className="border border-gray-500 text-sm">Mobile.no</th>

                                                        <th className="border border-gray-500 text-sm" >Email Id</th>
                                                        <th>
                                                            <button type='button' className="text-green-700" onClick={() => {
                                                                let newContactDetails = [...contactDetails];
                                                                newContactDetails.push({});
                                                                setContactDetails(newContactDetails);
                                                            }}> {<FontAwesomeIcon icon={faUserPlus} />}

                                                            </button>
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {(contactDetails || [])?.map((item, index) =>
                                                        <tr className="text-center table-row" key={index}>

                                                            <td className="table-data">
                                                                {index + 1}
                                                            </td>
                                                            <td className="table-data">
                                                                <input className="w-full p-1 capitalize table-data-input"
                                                                    type="text" value={item.contactPersonName} onChange={(e) => {
                                                                        const newContactDetails = structuredClone(contactDetails)
                                                                        newContactDetails[index]["contactPersonName"] = e.target.value;
                                                                        setContactDetails(newContactDetails);
                                                                    }} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} caseSensitive />

                                                            </td>
                                                            <td className="table-data">
                                                                <input className="w-full p-1 table-data-input" type="text" value={item.mobileNo} onChange={(e) => {
                                                                    const newContactDetails = structuredClone(contactDetails);
                                                                    newContactDetails[index]["mobileNo"] = e.target.value;
                                                                    setContactDetails(newContactDetails);
                                                                }} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />

                                                            </td>

                                                            <td className="table-data">
                                                                <input className="w-full table-data-input p-1" type="text" value={item.email} onChange={(e) => {
                                                                    const newContactDetails = structuredClone(contactDetails);
                                                                    newContactDetails[index]["email"] = e.target.value;
                                                                    setContactDetails(newContactDetails);
                                                                }} readOnly={readOnly} />

                                                            </td>
                                                            <td className="table-data">
                                                                <button
                                                                    type='button'
                                                                    onClick={() => removeItem(index)}
                                                                    className='text-md text-red-600 ml-1'>{<FontAwesomeIcon icon={faTrashCan} />}</button>
                                                            </td>

                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>



                                        </div>
                                    </fieldset>
                                </>


                            )}






                        </div>
                    </fieldset>
                </MastersForm>
                <div className="absolute top-[80%] -right-6.5 flex justify-between mt-auto w-[100%] px-10">

                    <button
                        type="button"
                        onClick={handlePrevious}
                        className={`  text-gray-900 field-text rounded-pill flex items-center pr-2 ${(step > 1) ? "visible" : "invisible"}`}
                    >
                        <ChevronLeft
                            size={24}
                            className=" transition-colors duration-200 "
                        />
                        {/* Prev */}
                    </button>


                    <button
                        type="button"
                        onClick={handleNext}
                        className={` text-gray-900 field-text rounded-pill flex items-center pl-2 ${(step < 3) ? "visible" : "invisible"}`}

                    >
                        {/* Next */}
                        <ChevronRight
                            size={24}
                            className=" transition-colors duration-200"
                        />
                    </button>

                </div>
            </Modal>}


        </div>
    )
}

