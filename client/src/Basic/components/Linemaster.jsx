import React, { useEffect, useState, useRef, useCallback } from "react";
import secureLocalStorage from "react-secure-storage";
import {
    useGetLineMasterQuery,
    useGetLineMasterByIdQuery,
    useAddLineMasterMutation,
    useUpdateLineMasterMutation,
    useDeleteLineMasterMutation
} from "../../redux/services/LineMasterService";
import { useGetEmployeeQuery } from "../../redux/services/EmployeeMasterService";

import { toast } from "react-toastify";

import Mastertable from "./MasterTable/Mastertable";
import { TextInput, CheckBox, ToggleButton, Modal } from "../../Inputs";
import MastersForm from "./MastersForm/MastersForm";
import { statusDropdown } from "../../Utils/DropdownData";
import { DropdownInput } from "../../Inputs";

const MODEL = "Line Detail Master";

export default function Form() {
    const [readOnly, setReadOnly] = useState(false);
    const [id, setId] = useState("");
    const [lineNo, setLineNo] = useState("");
    const [lineName, setLineName] = useState("");
    const [active, setActive] = useState(true);
    const [empId, setEmpId] = useState("");

    const [errors, setErrors] = useState({});
    const [form, setForm] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const childRecord = useRef(0);

    const sessionId = sessionStorage;
    console.log(sessionId, "session");

    const companyId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "currentBranchId"
    )

    console.log(companyId, "companyId");


    const params = {
        companyId: companyId,
    };

    const {
        data: allData,
        isLoading,
        isFetching,
        error: lineError
    } = useGetLineMasterQuery({ params, searchParams: searchValue });

    const {
        data: EmpData,
        error: empError,
        isLoading: empLoading
    } = useGetEmployeeQuery({ params })

    // Handle API errors
    useEffect(() => {
        if (lineError) {
            toast.error("Failed to load line data");
            console.error(lineError);
        }
        if (empError) {
            toast.error("Failed to load employee data");
            console.error(empError);
        }
    }, [lineError, empError]);

    // Ensure options are always arrays
    const employeeOptions = EmpData?.data?.map(emp => ({
        value: emp.id,
        show: `${emp.name}`,
    })) || [];

    const {
        data: singleData,
        isFetching: isSingleFetching,
        isLoading: isSingleLoading,
        error: singleError
    } = useGetLineMasterByIdQuery(id, { skip: !id });

    useEffect(() => {
        if (singleError) {
            toast.error("Failed to load line details");
            console.error(singleError);
        }
    }, [singleError]);

    const [addData] = useAddLineMasterMutation();
    const [updateData] = useUpdateLineMasterMutation();
    const [removeData] = useDeleteLineMasterMutation();

    const syncFormWithDb = useCallback((data) => {
        if (!id) {
            setReadOnly(false);
            setLineNo("");
            setLineName("");
            setActive(true);
            setEmpId("");
        } else {
            setReadOnly(true);
            setLineNo(data?.lineNo || "");
            setLineName(data?.lineName || "");
            setActive(data?.active ?? false);
            setEmpId(data?.empId || "");
        }
    }, [id]);

    useEffect(() => {
        if (singleData?.data) {
            syncFormWithDb(singleData.data);
        }
    }, [singleData, syncFormWithDb]);

    const data = {
        lineNo,
        lineName,
        id,
        active,
        companyId: params.companyId,
        empId,
    }

    const validateData = (data) => {
        if (data.lineNo && data.lineName) {
            return true;
        }
        return false;
    }

    const handleSubmitCustom = async (callback, data, text) => {
        try {
            const returnData = await callback(data).unwrap();
            setId(returnData.data.id)
            toast.success(text + " Successfully");
            return true;
        } catch (error) {
            console.log("Error:", error);
            toast.error("Operation failed");
            return false;
        }
    };

    const saveData = async (exitAfterSave = false) => {
        if (!validateData(data)) {
            toast.error("Please fill all required fields");
            return;
        }
        if (!window.confirm("Are you sure you want to save?")) return;

        const success = id
            ? await handleSubmitCustom(updateData, data, "Updated")
            : await handleSubmitCustom(addData, data, "Added");

        if (success) {
            if (!exitAfterSave) {
                onNew();
            } else {
                setForm(false);
                setId("");
            }
        }
    };

    const deleteData = async () => {
        if (!id) return;

        if (!window.confirm("Are you sure you want to delete?")) return;

        try {
            const result = await removeData(id).unwrap();
            if (result?.statusCode === 1) {
                toast.error(result?.message);
            } else {
                toast.success("Deleted Successfully");
            }
            setId("");
            setForm(false);
        } catch (error) {
            toast.error("Deletion failed");
            console.error(error);
        }
    };

    const handleKeyDown = (event) => {
        if ((event.ctrlKey || event.metaKey) && event.key === 's') {
            event.preventDefault();
            saveData();
        }
    };

    const onNew = () => {
        setId("");
        setReadOnly(false);
        setForm(true);
        setSearchValue("");
        setLineNo("");
        setLineName("");
        setActive(true);
        setEmpId("");
    };

    function onDataClick(id) {
        setId(id);
        setForm(true);
    }

    const tableHeaders = [
        "S.NO", "Line No", "Line Name", "Status"
    ];

    const tableDataNames = [
        "index+1",
        "dataObj.lineNo",
        "dataObj.lineName",
        "dataObj.active ? 'ACTIVE' : 'INACTIVE'",
    ];

    return (
        <div onKeyDown={handleKeyDown} className="p-4">
            <div className="w-full bg-white px-2 py-1 flex justify-between mb-4 items-center">
                <h1 className="text-2xl font-bold text-gray-800">Line Master</h1>
                <button
                    onClick={onNew}
                    className="hover:bg-indigo-600 text-[12px] px-4 py-1 border border-indigo-600 text-indigo-600 hover:text-white rounded-md shadow "
                >
                    + Add New Line
                </button>
            </div>

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


            {form && (
                <Modal
                    isOpen={form}
                    widthClass={"w-[40%] h-[50%]"}
                    onClose={() => {
                        setForm(false);
                        setErrors({});
                        setId("");
                    }}
                >
                    <MastersForm
                        onNew={onNew}
                        onClose={() => {
                            setForm(false);
                            setSearchValue("");
                            setId("");
                        }}
                        model={MODEL}
                        saveData={() => saveData(true)}
                        saveAndNew={() => saveData(false)}
                        setReadOnly={setReadOnly}
                        deleteData={deleteData}
                        readOnly={readOnly}
                        emptyErrors={() => setErrors({})}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <TextInput
                                name="Line No"
                                value={lineNo}
                                setValue={setLineNo}
                                required
                                readOnly={readOnly}
                                disabled={childRecord.current > 0}
                            />

                            <TextInput
                                name="Line Name"
                                value={lineName}
                                setValue={setLineName}
                                required
                                readOnly={readOnly}
                            />

                            <DropdownInput
                                name="Line Incharge"
                                options={employeeOptions}
                                value={empId}
                                setValue={setEmpId}
                                required
                                readOnly={readOnly}
                                disabled={childRecord.current > 0}
                                loading={empLoading}
                            />

                            <ToggleButton
                                name="Status"
                                options={statusDropdown}
                                value={active}
                                setActive={setActive}
                                required
                                readOnly={readOnly}
                            />
                        </div>
                    </MastersForm>
                </Modal>
            )}
        </div>
    )
}