import React from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import secureLocalStorage from "react-secure-storage";
import { useGetPagePermissionsByIdQuery } from "../../../redux/services/PageMasterService";


const FormHeader = ({
  setNavigateProjectId = null,
  quotesData = null,
  projectOpen = null,
  model,
  saveData = null,
  setReadOnly = null,
  deleteData = null,
  onClose = null,
  onNew = null,
  childRecord = 0,
  onPrint = null,
  openReport = null,
  viewReport = null,
  childRecordValidationActions = ["edit", "delete"],
}) => {

  const openTabs = useSelector((state) => state?.openTabs);

  const activeTab = openTabs?.tabs?.find(tab => tab.active);

  // const currentPageId = activeTab.id
  const currentPageId = activeTab?.name

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
          callback();
        } else if (currentPagePermissions?.data[type]) {
          callback();
        } else {
          toast.info(`No Permission to ${type}...!`, {
            position: "top-center",
          });
        }
      } else {
        toast.info(" Past Fin Year Only can view!", { position: "top-center" });
      }
    }
  };
  return (
    <>

        <div className="bg-gray-300 w-full P-1">{model}</div>   

  
    </>
  );
};

export default FormHeader;
