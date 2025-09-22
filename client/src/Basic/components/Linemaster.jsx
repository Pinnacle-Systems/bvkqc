import React, { useEffect, useState, useRef, useCallback } from "react";
import secureLocalStorage from "react-secure-storage";
import {
  useGetLineMasterQuery,
  useGetLineMasterByIdQuery,
  useAddLineMasterMutation,
  useUpdateLineMasterMutation,
  useDeleteLineMasterMutation
} from "../../redux/services/LineMasterService";
import { useGetBranchQuery } from "../../redux/services/BranchMasterService";
import { useGetEmployeeQuery } from "../../redux/services/EmployeeMasterService";
import { toast } from "react-toastify";
import Mastertable from "./MasterTable/Mastertable";
import { TextInput, CheckBox, ToggleButton, Modal } from "../../Inputs";
import MastersForm from "./MastersForm/MastersForm";
import { statusDropdown } from "../../Utils/DropdownData";
import { DropdownInput } from "../../Inputs";

const MODEL = "Line Detail Master";

export default function LineMaster() {
  const [readOnly, setReadOnly] = useState(false);
  const [id, setId] = useState("");
  const [branchId,setBranchId ] = useState("")
  const [lineNo, setLineNo] = useState("");
  const [lineName, setLineName] = useState("");
  const [active, setActive] = useState(true);
  const [empId, setEmpId] = useState("");
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const childRecord = useRef(0);

  const companyId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "currentBranchId"
  );

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
  } = useGetEmployeeQuery({ params });
   const {
      data: branches = [],
      isLoading: branchesLoading,
      error: branchesError,
    } = useGetBranchQuery({ params: { companyId } });
    console.log(branches,"branches")

  useEffect(() => {
    if (lineError) toast.error("Failed to load line data");
    if (empError) toast.error("Failed to load employee data");
  }, [lineError, empError]);

  const employeeOptions = EmpData?.data?.map(emp => ({
    value: emp.id,
    show: `${emp.name}`,
  })) || [];
  const branchOptions = branches?.data?.map(branch=>({
    value:branch.id,
    show: `${branch.branchName}`
  }))


  const {
    data: singleData,
    error: singleError
  } = useGetLineMasterByIdQuery(id, { skip: !id });

  useEffect(() => {
    if (singleError) toast.error("Failed to load line details");
    if (singleData?.data) syncFormWithDb(singleData.data);
  }, [singleError, singleData]);

  const [addData] = useAddLineMasterMutation();
  const [updateData] = useUpdateLineMasterMutation();
  const [removeData] = useDeleteLineMasterMutation();

  const data = {
    lineNo,
    branchId,
    lineName,
    id,
    active,
    companyId: params.companyId,
    empId,
  };

  const syncFormWithDb = useCallback((data) => {
    if (!id) {
      resetForm();
    } else {
      setReadOnly(true);
      setLineNo(data?.lineNo || "");
      setLineName(data?.lineName || "");
      setActive(data?.active ?? false);
      setEmpId(data?.empId || "");
      setBranchId(data?.branchId || "")
    }
  }, [id]);

  const resetForm = () => {
    setReadOnly(false);
    setLineNo("");
    setLineName("");
    setBranchId("")
    setActive(true);
    setEmpId("");
  };

  const validateData = () => {
    const newErrors = {};
    if (!lineNo) newErrors.lineNo = "Line No is required";
    if (!lineName) newErrors.lineName = "Line Name is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleApiCall = async (callback, data, successMessage) => {
    try {
      const result = await callback(data).unwrap();
      setId(result.data.id);
      toast.success(successMessage);
      return true;
    } catch (error) {
      toast.error(error.data?.message || "Operation failed");
      return false;
    }
  };

  const saveData = async (exitAfterSave = false) => {
    if (!validateData()) return;
    if (!window.confirm("Are you sure you want to save?")) return;

    const success = id
      ? await handleApiCall(updateData, data, "Updated successfully")
      : await handleApiCall(addData, data, "Added successfully");

    if (success) {
      if (exitAfterSave) {
        setForm(false);
        setId("");
      } else {
        resetForm();
      }
    }
  };

  const deleteData = async (idToDelete = id) => {
    if (!idToDelete) return;
    if (!window.confirm("Are you sure you want to delete?")) return;

    try {
      const result = await removeData(idToDelete).unwrap();
      if (result?.statusCode === 1) {
        toast.error(result?.message);
      } else {
        toast.success("Deleted successfully");
      }
      setId("");
      setForm(false);
    } catch (error) {
      toast.error("Deletion failed");
    }
  };

  const handleKeyDown = (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
      event.preventDefault();
      saveData();
    }
  };

  const tableHeaders = ["S.NO", "Line No", "Line Name", "Status"];
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
          onClick={() => {
            resetForm();
            setForm(true);
          }}
          className="hover:bg-indigo-600 text-[12px] px-4 py-1 border border-indigo-600 text-indigo-600 hover:text-white rounded-md shadow"
        >
          + Add New Line
        </button>
      </div>

      <Mastertable
        header={'Line Detail List'}
        searchValue={searchValue}
        setSearchValue={setSearchValue}
        onDataClick={(id) => {
          setId(id);
          setForm(true);
        }}
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
            onNew={resetForm}
            onClose={() => {
              setForm(false);
              setId("");
            }}
            model={MODEL}
            saveData={() => saveData(true)}
            saveAndNew={() => saveData(false)}
            setReadOnly={setReadOnly}
            deleteData={() => deleteData(id)}
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
                error={errors.lineNo}
              />

              <TextInput
                name="Line Name"
                value={lineName}
                setValue={setLineName}
                required
                readOnly={readOnly}
                error={errors.lineName}
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
                 <DropdownInput
                name="Branch"
                options={branchOptions}
                value={branchId}
                setValue={setBranchId}
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
  );
}