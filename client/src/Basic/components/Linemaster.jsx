import React, { useEffect, useState, useRef, useCallback } from "react";
import secureLocalStorage from "react-secure-storage";
import {  useGetLineMasterQuery,
    useGetLineMasterByIdQuery,
    useAddLineMasterMutation,
    useUpdateLineMasterMutation,
    useDeleteLineMasterMutation } from "../../redux/services/LineMasterService";

import { toast } from "react-toastify";

import Mastertable from "./MasterTable/Mastertable";
import { TextInput, CheckBox, ToggleButton, Modal } from "../../Inputs";
import MastersForm from "./MastersForm/MastersForm";
import { statusDropdown } from "../../Utils/DropdownData";

const MODEL = "Line Detail Master";

export default function Form() {
    const [readOnly, setReadOnly] = useState(false);
    const [id, setId] = useState("");
    const [lineNo, setLineNo] = useState("");
    const [lineName, setLineName] = useState("");
    const [sewingMachineQty, setSewingMachineQty] = useState("");
    const [helperQty, setHelperQty] = useState("");
    const [operatorQty, setOperatorQty] = useState("");
    const [active, setActive] = useState(true);
    const [errors, setErrors] = useState({});
    const [form, setForm] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const childRecord = useRef(0);

    const params = {
        companyId: secureLocalStorage.getItem(
            sessionStorage.getItem("sessionId") + "userCompanyId"
        ),
    };
    
    const { data: allData, isLoading, isFetching } = useGetLineMasterQuery({ params, searchParams: searchValue });
    
    const {
        data: singleData,
        isFetching: isSingleFetching,
        isLoading: isSingleLoading,
    } = useGetLineMasterByIdQuery(id, { skip: !id });

    const [addData] = useAddLineMasterMutation();
    const [updateData] = useUpdateLineMasterMutation();
    const [removeData] = useDeleteLineMasterMutation();

    const syncFormWithDb = useCallback((data) => {
        if (!id) {
            setReadOnly(false);
            setLineNo("");
            setLineName("");
            setSewingMachineQty("");
            setHelperQty("");
            setOperatorQty("");
            setActive(false);
        } else {
            setReadOnly(true);
            setLineNo(data?.lineNo || "");
            setLineName(data?.lineName || "");
            setSewingMachineQty(data?.sewingMachineQty || "");
            setHelperQty(data?.helperQty || "");
            setOperatorQty(data?.OperationQty || "");
            setActive(data?.active ?? false);
        }
    }, [id]);

    useEffect(() => {
        syncFormWithDb(singleData?.data);
    }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

    const data = {
        lineNo,
        lineName,
        sewingMachineQty,
        helperQty,
        operatorQty,id,
        active,
        companyId: params.companyId
    }

    const validateData = (data) => {
        if (data.lineNo && data.lineName && data.sewingMachineQty && data.helperQty && data.operatorQty) {
            return true;
        }
        return false;
    }

    const handleSubmitCustom = async (callback, data, text) => {
        try {
            let returnData = await callback(data).unwrap();
            setId(returnData.data.id)
            toast.success(text + " Successfully");
        } catch (error) {
            console.log("Error:", error);
            toast.error("Operation failed");
        }
    };

    const saveData = () => {
        if (!validateData(data)) {
            toast.error("Please fill all required fields...!", {
                position: "top-center",
            });
            return;
        }
        if (!window.confirm("Are you sure save the details ...?")) {
            return;
        }
        if (id) {
            handleSubmitCustom(updateData, data, "Updated");
        } else {
            handleSubmitCustom(addData, data, "Added");
        }
    };

    const deleteData = async () => {
        if (id) {
            if (!window.confirm("Are you sure to delete...?")) {
                return;
            }
            try {
                const deldata = await removeData(id).unwrap();
                if (deldata?.statusCode == 1) {
                    toast.error(deldata?.message)
                    setForm(false)
                    return
                }
                setId("");
                toast.success("Deleted Successfully");
                setForm(false)
            } catch (error) {
                toast.error("Something went wrong");
            }
        }
    };

    const handleKeyDown = (event) => {
        let charCode = String.fromCharCode(event.which).toLowerCase();
        if ((event.ctrlKey || event.metaKey) && charCode === "s") {
            event.preventDefault();
            saveData();
        }
    };

    const onNew = () => {
        setId("");
        setReadOnly(false);
        setForm(true);
        setSearchValue("");
    };

    function onDataClick(id) {
        setId(id);
        setForm(true);
    }

    const tableHeaders = [
        "S.NO", "Line No", "Line Name", "Sewing Machines", "Helpers", "Operators", "Status", " ", " ", " ", " ", " ", " ", " ", " "
    ];
    
    const tableDataNames = [
        "index+1", 
        "dataObj.lineNo", 
        "dataObj.lineName", 
        "dataObj.sewingMachineQty",
        "dataObj.helperQty",
        "dataObj.OperationQty",
        "dataObj.active ? ACTIVE : INACTIVE", 
        " ", " ", " ", " ", " ", " ", " ", " "
    ];

    return (
        <div onKeyDown={handleKeyDown}>
            <div className='w-full flex justify-between mb-2 items-center px-0.5'>
                <h5 className='my-1'>Line Detail Master</h5>
                <div className='flex items-center'>
                    <button onClick={() => { setForm(true); onNew() }} className='bg-green-500 text-white px-3 py-1 button rounded shadow-md'>+ New</button>
                </div>
            </div>
            <div className='w-full flex items-start'>
                <Mastertable
                    header={'Line Detail List'}
                    searchValue={searchValue}
                    setSearchValue={setSearchValue}
                    onDataClick={onDataClick}
                    tableHeaders={tableHeaders}
                    tableDataNames={tableDataNames}
                    data={allData?.data}
                    loading={isLoading || isFetching}
                    setReadOnly={setReadOnly}
                    deleteData={deleteData}
                />
            </div>
            
            {form === true && (
                <Modal isOpen={form} form={form} widthClass={"w-[50%] h-[60%]"} onClose={() => { setForm(false); setErrors({}); }}>
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
                        <fieldset className='rounded mt-2'>
                            <div className=''>
                                <div className="flex flex-wrap">
                                    <div className='mb-3 w-[30%]'>
                                        <TextInput 
                                            name="Line No" 
                                            type="text" 
                                            value={lineNo} 
                                            setValue={setLineNo} 
                                            required={true} 
                                            readOnly={readOnly} 
                                            disabled={childRecord.current > 0} 
                                        />
                                    </div>
                                    <div className='mb-3 w-[60%] ml-6'>
                                        <TextInput 
                                            name="Line Name" 
                                            type="text" 
                                            value={lineName} 
                                            setValue={setLineName} 
                                            required={true} 
                                            readOnly={readOnly} 
                                        />
                                    </div>
                                </div>
                                
                                <div className="flex flex-wrap mt-4">
                                    <div className='mb-3 w-[30%]'>
                                        <TextInput 
                                            name="Sewing Machine Qty" 
                                            type="number" 
                                            value={sewingMachineQty} 
                                            setValue={setSewingMachineQty} 
                                            required={true} 
                                            readOnly={readOnly} 
                                        />
                                    </div>
                                    <div className='mb-3 w-[30%] ml-6'>
                                        <TextInput 
                                            name="Helper Qty" 
                                            type="number" 
                                            value={helperQty} 
                                            setValue={setHelperQty} 
                                            required={true} 
                                            readOnly={readOnly} 
                                        />
                                    </div>
                                    <div className='mb-3 w-[30%] ml-6'>
                                        <TextInput 
                                            name="Operator Qty" 
                                            type="number" 
                                            value={operatorQty} 
                                            setValue={setOperatorQty} 
                                            required={true} 
                                            readOnly={readOnly} 
                                        />
                                    </div>
                                </div>
                                
                                <div className='mb-3 mt-4'>
                                    <ToggleButton 
                                        name="Status" 
                                        options={statusDropdown} 
                                        value={active} 
                                        setActive={setActive} 
                                        required={true} 
                                        readOnly={readOnly} 
                                    />
                                </div>
                            </div>
                        </fieldset>
                    </MastersForm>
                </Modal>
            )}
        </div>
    )
}