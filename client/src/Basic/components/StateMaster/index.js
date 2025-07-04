import React, { useEffect, useState, useRef, useCallback } from "react";
import secureLocalStorage from "react-secure-storage";
import {
  useGetStateQuery,
  useGetStateByIdQuery,
  useAddStateMutation,
  useUpdateStateMutation,
  useDeleteStateMutation,
} from "../../../redux/services/StateMasterService";
import { useGetCountriesQuery } from "../../../redux/services/CountryMasterService";
import { toast } from "react-toastify";
import { TextInput, DropdownInput, ToggleButton, Modal } from "../../../Inputs";
import { dropDownListObject } from '../../../Utils/contructObject';
import { useDispatch } from "react-redux";
import Mastertable from "../MasterTable/Mastertable";
import MastersForm from '../MastersForm/MastersForm';

const MODEL = "State Master";
const PARTIAL_SAVE_KEY = "partialStateSaves";

export default function Form() {
  const [form, setForm] = useState(false);
  const [partialReportOpen, setPartialReportOpen] = useState(false);
  const [partialSaves, setPartialSaves] = useState([]);
  const [partialId, setPartialId] = useState(null);
  const [readOnly, setReadOnly] = useState(false);
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [active, setActive] = useState(true);
  const [country, setCountry] = useState("");
  const [gstNo, setGstNo] = useState("");
  const [errors, setErrors] = useState({});
  const [searchValue, setSearchValue] = useState("");

  const childRecord = useRef(0);
  const dispatch = useDispatch();

  // Load and save partial saves from secureLocalStorage
  useEffect(() => {
    const savedPartial = secureLocalStorage.getItem(PARTIAL_SAVE_KEY);
    if (savedPartial) {
      setPartialSaves(JSON.parse(savedPartial));
    }
  }, []);

  useEffect(() => {
    secureLocalStorage.setItem(PARTIAL_SAVE_KEY, JSON.stringify(partialSaves));
  }, [partialSaves]);

  const params = {
    companyId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userCompanyId"
    ),
  };

  // API Queries
  const { data: countriesList, isLoading: isCountryLoading } = useGetCountriesQuery({ params });
  const { data: allData, isLoading, isFetching } = useGetStateQuery({ params, searchParams: searchValue });
  const { data: singleData, isFetching: isSingleFetching } = useGetStateByIdQuery(id, { skip: !id });

  // API Mutations
  const [addData] = useAddStateMutation();
  const [updateData] = useUpdateStateMutation();
  const [removeData] = useDeleteStateMutation();

  // Partial Save Functions
  const handlePartialSave = () => {
    const partialData = {
      name,
      code,
      active,
      country,
      gstNo,
      timestamp: new Date().toISOString(),
    };

    if (partialId) {
      setPartialSaves((prev) =>
        prev.map((item) =>
          item.id === partialId ? { ...partialData, id: partialId } : item
        )
      );
    } else {
      const newId = Date.now().toString();
      setPartialSaves((prev) => [...prev, { ...partialData, id: newId }]);
      setPartialId(newId);
    }

    toast.success("State partially saved successfully!");
  };

  const loadPartialSave = (partial) => {
    setName(partial.name);
    setCode(partial.code);
    setActive(partial.active);
    setCountry(partial.country);
    setGstNo(partial.gstNo);
    setPartialId(partial.id);
    setId(""); // Clear any existing ID when loading partial save
    setReadOnly(false); // Allow editing of partial saves
    setForm(true);
    setPartialReportOpen(false);
  };

  const deletePartialSave = (idToDelete) => {
    setPartialSaves((prev) => prev.filter((item) => item.id !== idToDelete));
    if (idToDelete === partialId) {
      setPartialId(null);
    }
  };

  // Form Sync and Data Handling
  const syncFormWithDb = useCallback((data) => {
    if (!id) {
      // When no ID, it's a new form
      setReadOnly(false);
      setName("");
      setCode("");
      setActive(true);
      setCountry("");
      setGstNo("");
    } else {
      // When ID exists, it's an existing record
      setReadOnly(true); // Start in read-only mode for existing records
      setName(data?.name || "");
      setCode(data?.code || "");
      setActive(data?.active ?? false);
      setCountry(data?.countryId || "");
      setGstNo(data?.gstNo || "");
      childRecord.current = data?.childRecord ? data?.childRecord : 0;
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      syncFormWithDb(singleData?.data);
    }
  }, [isSingleFetching, id, syncFormWithDb, singleData]);

  const data = {
    name,
    code,
    active,
    countryId: country,
    gstNo,
    id,
    companyId: params.companyId,
  };

  const validateData = (data) => {
    if (data.name && data.code && data.countryId) {
      return true;
    }
    return false;
  };

  const handleSubmitCustom = async (callback, data, text) => {
    try {
      const returnData = await callback(data).unwrap();
      onNew();
      
      if (partialId) {
        deletePartialSave(partialId);
        setPartialId(null);
      }

      toast.success(`${text} Successfully`);
      dispatch({
        type: `countryMaster/invalidateTags`,
        payload: ['Countries'],
      });
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.data?.message || "An error occurred");
    }
  };

  const saveData = async (exitAfterSave = false) => {
    if (!validateData(data)) {
      toast.error("Please fill all required fields (Name, Code, and Country)!");
      return;
    }
    if (!window.confirm("Are you sure you want to save the details?")) return;

    try {
      if (id) {
        await handleSubmitCustom(updateData, data, "Updated");
      } else {
        await handleSubmitCustom(addData, data, "Added");
      }
      
      if (exitAfterSave) {
        setForm(false);
        setId("");
      }
    } catch (error) {
      console.error("Save failed:", error);
    }
  };

  const deleteData = async () => {
    if (id) {
      if (!window.confirm("Are you sure you want to delete this state?")) return;
      
      try {
        const result = await removeData(id).unwrap();
        if (result.statusCode === 1) {
          toast.error(result.message);
          return;
        }
        setId("");
        toast.success("Deleted Successfully");
        setForm(false);
        dispatch({
          type: `countryMaster/invalidateTags`,
          payload: ['Countries'],
        });
      } catch (error) {
        toast.error(error.data?.message || "Something went wrong");
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
    setPartialId(null);
    setReadOnly(false);
    setName("");
    setCode("");
    setActive(true);
    setCountry("");
    setGstNo("");
    setForm(true);
    setSearchValue("");
  };

  const onDataClick = (id) => {
    setId(id);
    setForm(true);
    setReadOnly(true); // Start in read-only mode when clicking on existing record
  };

  // Partial Report Component
  const PartialReport = () => (
    <Modal
      isOpen={partialReportOpen}
      widthClass={"w-3/4"}
      onClose={() => setPartialReportOpen(false)}
    >
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-3">Partially Saved States</h2>
        {partialSaves.length === 0 ? (
          <p className="text-gray-600 text-sm">No partially saved states</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Country
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    GST No
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Saved
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {partialSaves.map((save) => {
                  const countryName = countriesList?.data?.find(c => c.id === save.country)?.name || '';
                  return (
                    <tr key={save.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{save.name}</td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-600">
                        {save.code}
                      </td>
                      <td className="px-4 py-3 text-sm">{countryName}</td>
                      <td className="px-4 py-3 text-sm">{save.gstNo || '-'}</td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            save.active
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {save.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(save.timestamp).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm space-x-2">
                        <button
                          onClick={() => loadPartialSave(save)}
                          className="text-indigo-600 hover:text-indigo-800 hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deletePartialSave(save.id)}
                          className="text-red-600 hover:text-red-800 hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Modal>
  );

  const tableHeaders = [
    "S.NO", "Code", "Name", "Country", "Status", " ", " ", " ", " ", " ", " ", " ", " ", " "
  ];

  const tableDataNames = [
    "index+1", "dataObj.code", "dataObj.name", "dataObj.country.name", 
    "dataObj.active ? ACTIVE : INACTIVE", " ", " ", " ", " ", " ", " ", " ", " ", " "
  ];

  return (
    <div onKeyDown={handleKeyDown} className="px-5">
      <div className="w-full flex justify-between mb-2 my-2 py-1 bg-white mx-1 px-1 items-center">
        <h1 className="text-2xl font-bold text-gray-800">State Master</h1>
        <div className="flex items-center">
          <button
            onClick={() => setPartialReportOpen(true)}
            className="mr-3 hover:bg-yellow-500 hover:text-white text-xs px-3 py-1 border border-yellow-500 text-yellow-600 rounded shadow-md"
          >
            Partial Saves ({partialSaves.length})
          </button>
          <button
            onClick={onNew}
            className="hover:bg-indigo-500 bg-white hover:text-white text-xs px-3 py-1 border border-indigo-600 text-indigo-600 rounded shadow-md"
          >
            + Add New State
          </button>
        </div>
      </div>

      <div className="w-full flex items-start">
        <Mastertable
          header={"State List"}
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

        <div>
          {form && (
            <Modal
              isOpen={form}
              form={form}
              widthClass={"w-[40%] h-[60%]"}
              onClose={() => {
                setForm(false);
                setErrors({});
                setPartialId(null);
                setId(""); // Clear ID when closing form
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
                childRecord={childRecord.current}
                saveData={saveData}
                setReadOnly={setReadOnly}
                deleteData={deleteData}
                readOnly={readOnly}
                emptyErrors={() => setErrors({})}
                handlePartialSave={handlePartialSave}
              >
                <fieldset className="rounded border border-gray-300 p-4 mt-4 shadow-sm bg-white">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TextInput
                      name="State Name"
                      type="text"
                      value={name}
                      setValue={setName}
                      required={true}
                      readOnly={readOnly}
                      disabled={childRecord.current > 0}
                    />

                    <TextInput
                      name="Code"
                      type="text"
                      value={code}
                      setValue={setCode}
                      required={true}
                      readOnly={readOnly}
                      disabled={childRecord.current > 0}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <TextInput
                      name="GST No"
                      type="text"
                      value={gstNo}
                      setValue={setGstNo}
                      readOnly={readOnly}
                      disabled={childRecord.current > 0}
                    />

                    <DropdownInput
                      name="Country"
                      options={dropDownListObject(
                        id ? countriesList?.data : countriesList?.data?.filter(item => item.active), 
                        "name", 
                        "id"
                      )}
                      value={country}
                      setValue={setCountry}
                      required={true}
                      readOnly={readOnly}
                      disabled={childRecord.current > 0}
                      loading={isCountryLoading}
                    />
                  </div>

                  <div className="mt-4">
                    <ToggleButton
                      name="Status"
                      value={active}
                      setActive={setActive}
                      required={true}
                      readOnly={readOnly}
                    />
                  </div>
                </fieldset>
              </MastersForm>
            </Modal>
          )}
        </div>
      </div>

      <PartialReport />
    </div>
  );
}