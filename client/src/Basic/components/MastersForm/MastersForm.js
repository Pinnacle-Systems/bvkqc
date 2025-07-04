import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import {
  SaveButton,
  EditButton,
  DeleteButton,
  CloseButton,
  SaveExitButton,
  PartialSaveButton,
 
} from "../../../UiComponents/Buttons/Buttons";
import toast from "react-hot-toast";
import secureLocalStorage from "react-secure-storage";
import { useGetPagePermissionsByIdQuery } from "../../../redux/services/PageMasterService";
const MastersForm = ({
  model,
  saveData,
  setReadOnly,
  deleteData,
  onClose = null,
  setForm,
  childRecord = 0,
  childRecordValidationActions = ["edit", "delete"],
  children,
  readOnly,
  emptyErrors,
  partialSave,
  
}) => {


  const openTabs = useSelector((state) => state?.openTabs);

  const activeTab = openTabs?.tabs?.find(tab => tab.active);

  const currentPageId = activeTab?.id

  const userRoleId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userRoleId"
  );
  const {
    data: currentPagePermissions,
    isLoading,
    isFetching,
  } = useGetPagePermissionsByIdQuery({ currentPageId, userRoleId }, { skip: !(currentPageId && userRoleId) });

  const IsSuperAdmin = () => {
    return JSON.parse(
      secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "superAdmin"
      )
    );
  };

  const IsDefaultAdmin = () => {
    return JSON.parse(
      secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "defaultAdmin"
      )
    );
  };


  const isCurrentFinYearActive = () => {
    return Boolean(
      secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "currentFinYearActive"
      )
    );
  };

  const hasPermission = (callback, type) => {
    if (childRecordValidationActions.includes(type) && childRecord !== 0) {
      toast.error("Child Record Exists", { position: "top-center" });
      return;
    }
    if (IsSuperAdmin()) {
      callback();
    } else {
      if (isCurrentFinYearActive()) {
        if (IsDefaultAdmin()) {
          console.log("Hit Masterform")
          callback();

        } else if (currentPagePermissions?.data[type]) {
          callback();
        } else {
          toast.error(`No Permission to ${type}...!`, {
            position: "top-center",
          });
        }
      } else {
        toast.error(" Past Fin Year Only can view!", { position: "top-center" });
      }
    }
  };

return (
  <div className="h-full px-6 py-4 bg-gray-50 rounded-md shadow-inner">
    <div className="flex flex-col h-full">
      {model && (
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">{model}</h2>
      )}

      <div className="bg-white rounded-md p-4 shadow-md mb-4">
        {children}
      </div>

      <div className="flex gap-3 justify-end items-center mt-auto pt-4 border-t  border-gray-200">
        <CloseButton
          onClick={() => {
            onClose();
            emptyErrors();
          }}
        />
        {!readOnly ? <>
       {/* <PartialSaveButton onClick={partialSave} /> */}

  <SaveButton
    onClick={() => {
      if (hasPermission(saveData, "edit")) {
        saveData();
      }
    }}
  />
  <SaveExitButton
    onClick={() => {
      if (hasPermission(() => saveData(true), "edit"))  {
        saveData(); 
        setForm(false)
      }
    }}
  />
</>
 : (
          <div className="flex space-x-3">
            <DeleteButton
              onClick={() => {
                hasPermission(deleteData, "delete");
              }}
            />
            <EditButton
              onClick={() => {
                hasPermission(setReadOnly, "edit");
              }}
            />
          </div>
        )}
      </div>
    </div>
  </div>
);

};


export default MastersForm;
