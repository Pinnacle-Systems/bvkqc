import { useCallback, useEffect, useRef, useState } from "react";
import secureLocalStorage from "react-secure-storage";
import { useGetLineMasterQuery } from "../../../redux/services/LineMasterService";
import { useAddlineAllocationMasterMutation, useDeletelineAllocationMasterMutation, useGetlineAllocationMasterByIdQuery, useGetlineAllocationMasterQuery, useUpdatelineAllocationMasterMutation } from "../../../redux/services/InchargeLineListMaster";
import { toast } from "react-toastify";
import { useGetEmployeeQuery } from "../../../redux/services/EmployeeMasterService";
import Mastertable from "../MasterTable/Mastertable";
import MastersForm from "../MastersForm/MastersForm";
import {  DropdownWithSearchNew, MultiSelectDropdown, ToggleButton } from "../../../Inputs";
import { statusDropdown } from "../../../Utils/DropdownData";
import Modal from "../../../UiComponents/Modal";
import { multiSelectOption } from "../../../Utils/contructObject";
import { useGetEmployeeCategoryQuery } from "../../../redux/services/EmployeeCategoryMasterService";
import { useGetBranchQuery } from "../../../redux/services/BranchMasterService";
import { useGetOrderImportQuery } from "../../../redux/services/OrderImportService";
import {  useGetSizeTableMasterByReferenceQuery } from "../../../redux/uniformService/SizeTableMasterService";
import { useGetOrderByIdQuery } from "../../../redux/uniformService/OrderService";


const MODEL = "Line Allocation Master";

export default function LineMaster() {
  const [readOnly, setReadOnly] = useState(false);
  const [id, setId] = useState("");
  const [lineNo, setLineNo] = useState("");
  const [lineName, setLineName] = useState("");
  const [active, setActive] = useState(true);
  const [empId, setEmpId] = useState("");
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const [employeeCategoryId,setEmployeeCategoryId]  = useState("")
  const [orderId,setOrderId]  = useState('')
  const [branchId,setBranchId] = useState("")
  const childRecord = useRef(0);
  const [selectedLineList,setSelectedLineList] = useState([]);
  const [selectedSizeList,setSelectedSizeList] = useState([]);

  const companyId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "currentBranchId"
  );

  const params = {
    companyId: companyId,
  };

  // API Calls
  const {
    data: allData,
    isLoading,
    isFetching,
    error: lineAllocationError,
    refetch
  } = useGetlineAllocationMasterQuery({ params, searchParams: searchValue });

  const {
    data: EmpData,
    error: empError,
    isLoading: empLoading
  } = useGetEmployeeQuery({ params });

    const {
    data: lineData,
    // isLoading,
    // isFetching,
    error: lineError,
    
  } = useGetLineMasterQuery({ params, searchParams: searchValue });



  const {
    data: sizeTableData,
    isLoading: sizeTableLoading,
    error: sizeTableError,
  } = useGetSizeTableMasterByReferenceQuery();


// let sizeList;
//   useEffect (()  => {
//       if (sizeTableData) {
//    sizeList = sizeTableData ? sizeTableData?.data?.filter(item =>  item.id === orderId)?.[0]?.measurements[0]  :  []
//    setSelectedSizeList( multiSelectOption(sizeList ? sizeList : [], "size", "id") )
//       }
//   },[sizeTableData])


  const lineOptions =   multiSelectOption(lineData ? lineData?.data : [], "lineName", "id") 


  const sizeList = sizeTableData ? sizeTableData?.data?.filter(item =>  item.id === orderId)?.[0]?.measurements[0]?.values  :  []




  console.log(selectedSizeList,"selectedSizeList")

        const {
    data: branchList,
    // isLoading,
    // isFetching,
  } = useGetBranchQuery({ params, searchParams: searchValue });

  useEffect(() => {
    if (lineError) toast.error("Failed to load line data");
    if (empError) toast.error("Failed to load employee data");
  }, [lineError, empError]);

  // Employee dropdown options
  const employeeOptions = EmpData?.data?.filter(item  =>  item?.employeeCategoryId == "5")

  const {
    data: singleData,
    error: singleError
  } = useGetlineAllocationMasterByIdQuery(id, { skip: !id });

  useEffect(() => {
    if (singleError) toast.error("Failed to load line details");
    if (singleData?.data) syncFormWithDb(singleData.data);
  }, [singleError, singleData]);

  const [addData] = useAddlineAllocationMasterMutation();
  const [updateData] = useUpdatelineAllocationMasterMutation();
  const [removeData] = useDeletelineAllocationMasterMutation();

  const data = {
    lineNo,
    lineName,
    id,
    active,
    companyId: params.companyId,
    empId,
    employeeCategoryId,
    selectedLineList,
    branchId
    
  };



  const syncFormWithDb = useCallback((data) => {
    if (!id) {
      resetForm();
    } else {
      setReadOnly(true);
      setBranchId(data?.branchId ? data?.branchId  : "" )
      setEmployeeCategoryId(data?.empId || "");
      setSelectedLineList(data ? data?.InchargeLineListMaster.map((line) => { return { value: line.lineMasterId, label: line?.LineMaster?.lineName } }) : [])
      // setSelectedSizeList()
    }
  }, [id]);

  const resetForm = () => {
    setReadOnly(false);
    setBranchId("");
    setLineName("");
    setActive(true);
    setEmployeeCategoryId("");
    setSelectedLineList([])
  };

  // Validation
  const validateData = () => {
    const newErrors = {};
    if (!lineNo) newErrors.lineNo = "Line No is required";
    if (!lineName) newErrors.lineName = "Line Name is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // API call handler
  const handleApiCall = async (callback, data, successMessage) => {
    console.log("hiotSave Dat")
    try {
      const result = await callback(data).unwrap();
      setId(result.data.id);
      refetch()
      toast.success(successMessage);
      
      return true;
    } catch (error) {
      toast.error(error.data?.message || "Operation failed");
      return false;
    }
  };

  // Save data
  const saveData = async (exitAfterSave = false) => {

    // if (!validateData()) return;
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

  // Delete data
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
      refetch()

    } catch (error) {
      toast.error("Deletion failed");
    }
  };

  // Keyboard shortcut
  const handleKeyDown = (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
      event.preventDefault();
      saveData();
    }
  };

  // Table configuration
  const tableHeaders = ["S.NO", "Line No", "Line Name", "Status"];
  const tableDataNames = [
    "index+1",
    "dataObj.Employee.name",
    "dataObj.Branch.branchName",
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
          + Add New Line Allocation
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

      { form && (
        <Modal
          isOpen={form}
          widthClass={"w-[55%] h-[60%]"}
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
              
             <DropdownWithSearchNew
                label={"Branch"}
                options={branchList?.data}
                value = {branchId}
                setValue = {setBranchId}
                labelField={"branchName"}
                readOnly={readOnly}

            />

        <DropdownWithSearchNew
                label={"Reference No  "}
                options={sizeTableData?.data}
                value = {orderId}
                setValue = {setOrderId}
                labelField={"reference"}
                readOnly={readOnly}
              
            />
    <MultiSelectDropdown
                name = {"Size List"}
                options={ multiSelectOption(sizeList ? sizeList : [], "size", "id") }
                labelField={"size"}
                selected={selectedSizeList ||  []}
                setSelected={setSelectedSizeList}
                readOnly={readOnly}

                />
  <MultiSelectDropdown
                name = {"line List"}
                options={lineOptions}
                labelField={"name"}
                selected={selectedLineList}
                setSelected={setSelectedLineList}
                readOnly={readOnly}

                />
            <DropdownWithSearchNew
                label={"Qc Incharge"}
                options={employeeOptions}
                value = {employeeCategoryId}
                setValue = {setEmployeeCategoryId}
                labelField={"name"}
                readOnly={readOnly}
              
            />
          

    

           {/* <div className="mt-10">
            
              <ToggleButton
                name="Status"
                options={statusDropdown}
                value={active}
                setActive={setActive}
                required
                readOnly={readOnly}
              />
            </div>        */}
            </div>

          </MastersForm>
        </Modal>
      )}
    </div>
  );
}