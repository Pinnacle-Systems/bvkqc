import React, { useEffect, useState, useRef, useCallback } from "react";
import secureLocalStorage from "react-secure-storage";
import { toast } from "react-toastify";
import {
  useAddCountryMutation,
  useDeleteCountryMutation,
  useGetCountriesQuery,
  useGetCountryByIdQuery,
  useUpdateCountryMutation,
} from "../../../redux/services/CountryMasterService";
import { TextInput, Modal, ToggleButton } from "../../../Inputs";
import { statusDropdown } from "../../../Utils/DropdownData";
import Mastertable from "../MasterTable/Mastertable";
import MastersForm from "../MastersForm/MastersForm";

const MODEL = "Country Master";
const PARTIAL_SAVE_KEY = "partialCountrySaves";

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
  const [errors, setErrors] = useState({});
  const [searchValue, setSearchValue] = useState("");
  const childRecord = useRef(0);

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

  // Existing queries and mutations
  const {
    data: allData,
    isLoading,
    isFetching,
  } = useGetCountriesQuery({ params, searchParams: searchValue });

  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetCountryByIdQuery(id, { skip: !id });

  const [addData] = useAddCountryMutation();
  const [updateData] = useUpdateCountryMutation();
  const [removeData] = useDeleteCountryMutation();

  const handlePartialSave = () => {
    const partialData = {
      name,
      code,
      active,
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

    toast.success("Partially saved successfully!");
  };

  const loadPartialSave = (partial) => {
    setName(partial.name);
    setCode(partial.code);
    setActive(partial.active);
    setPartialId(partial.id);
    setForm(true);
    setPartialReportOpen(false);
  };

  const deletePartialSave = (idToDelete) => {
    setPartialSaves((prev) => prev.filter((item) => item.id !== idToDelete));
    if (idToDelete === partialId) {
      setPartialId(null);
    }
  };

  const syncFormWithDb = useCallback(
    (data) => {
      if (!id) {
        setReadOnly(false);
        setName("");
        setCode("");
        setActive(id ? data?.active : true);
      } else {
        setReadOnly(true);
        setName(data?.name || "");
        setCode(data?.code || "");
        setActive(id ? data?.active : true);
        childRecord.current = data?.childRecord ? data?.childRecord : 0;
      }
    },
    [id]
  );

  useEffect(() => {
    syncFormWithDb(singleData?.data);
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

  const data = {
    name,
    code,
    active,
    companyId: params.companyId,
    id,
  };

  const validateData = (data) => {
    if (data.name && data.code) {
      return true;
    }
    return false;
  };

  const handleSubmitCustom = async (callback, data, text) => {
    try {
      let returnData = await callback(data).unwrap();
      onNew();

      if (partialId) {
        deletePartialSave(partialId);
        setPartialId(null);
      }

      toast.success(text + " Successfully");
    } catch (error) {
      console.log("handle");
    }
  };

  const saveData = async (exitAfterSave = false) => {
    if (!validateData(data)) {
      toast.error("Please fill all required fields...!");
      return;
    }
    if (!window.confirm("Are you sure save the details ...?")) return;

    try {
      if (id) {
        await handleSubmitCustom(updateData, data, "Updated");
      } else {
        await handleSubmitCustom(addData, data, "Added");
      }
      if (!exitAfterSave) {
        onNew();
      } else {
        setForm(false);
        setId("");
      }
    } catch (error) {
      console.error("Save failed:", error);
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
          toast.error(deldata?.message);
          setForm(false);
          return;
        }
        setId("");
        toast.success("Deleted Successfully");
        setForm(false);
      } catch (error) {
        toast.error("something went wrong");
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
    setForm(true);
    setSearchValue("");
  };

  function onDataClick(id) {
    setId(id);
    setForm(true);
  }

  const PartialReport = () => (
    <Modal
      isOpen={partialReportOpen}
      widthClass={"w-3/4"}
      onClose={() => setPartialReportOpen(false)}
    >
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-3">Partially Saved Countries</h2>
        {partialSaves.length === 0 ? (
          <p className="text-gray-600 text-sm">No partially saved countries</p>
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
                {partialSaves.map((save) => (
                  <tr key={save.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{save.name}</td>
                    <td className="px-4 py-3 text-sm font-mono text-gray-600">
                      {save.code}
                    </td>
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Modal>
  );

  const tableHeaders = [
    "S.NO",
    "Code",
    "Country Name",
    "Status",
    " ",
    " ",
    " ",
    " ",
    " ",
    " ",
    " ",
    " ",
    " ",
    " ",
    " ",
  ];

  const tableDataNames = [
    "index+1",
    "dataObj.code",
    "dataObj.name",
    "dataObj.active ? ACTIVE : INACTIVE",
    " ",
    " ",
    " ",
    " ",
    " ",
    " ",
    " ",
    " ",
    " ",
    " ",
    " ",
  ];

  return (
    <div onKeyDown={handleKeyDown} className="px-5">
      <div className="w-full flex justify-between mb-2 my-2 py-1 bg-white mx-1 px-1 items-center px-0.5">
        <h1 className="text-2xl font-bold text-gray-800">Country Master</h1>
        <div className="flex items-center">
          <button
            onClick={() => setPartialReportOpen(true)}
            className="mr-3 hover:bg-yellow-500 hover:text-white text-xs px-3 py-1 border border-yellow-500 text-yellow-600 rounded shadow-md"
          >
            Partial Saves ({partialSaves.length})
          </button>
          <button
            onClick={() => {
              setForm(true);
              onNew();
            }}
            className="hover:bg-indigo-500 bg-white hover:text-white text-xs px-3 py-1 border border-indigo-600 text-indigo-600 rounded shadow-md"
          >
            + Add New Country
          </button>
        </div>
      </div>
      <div className="w-full flex items-start">
        <Mastertable
          header={"Country List"}
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
          {form === true && (
            <Modal
              isOpen={form}
              form={form}
              widthClass={"w-[40%] h-[50%]"}
              onClose={() => {
                setForm(false);
                setErrors({});
                setPartialId(null);
              }}
            >
              <MastersForm
                onNew={onNew}
                onClose={() => {
                  setForm(false);
                  setSearchValue("");
                  setId(false);
                  setPartialId(null);
                }}
                model={MODEL}
                childRecord={childRecord.current}
                saveData={saveData}
                setForm={setForm}
                setReadOnly={setReadOnly}
                deleteData={deleteData}
                readOnly={readOnly}
                emptyErrors={() => setErrors({})}
                partialSave={handlePartialSave}
                partialId={partialId}
              >
                <fieldset className="rounded border border-gray-300 p-4 mt-4 shadow-sm bg-white">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TextInput
                      name="Country Name"
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

                  <div className="mt-4">
                    <ToggleButton
                      name="Status"
                      options={statusDropdown}
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