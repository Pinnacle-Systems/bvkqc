import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { push, remove } from "../../../redux/features/opentabs";
import { useModal } from "../../pages/home/context/ModalContext";
import {
  CountryMaster, PageMaster, StateMaster, CityMaster,
  DepartmentMaster, EmployeeCategoryMaster, FinYearMaster, UserAndRolesMaster,
  AccountSettings, ControlPanel, EmployeeMaster,
  PartyMaster,
  PartyCategorymaster,
  CurrencyMaster,
  ColorMaster,
  PayTermMaster,
  SizeMaster,
  LocationMaster,
  MachineMaster,
  PageGroupMaster,
  CompanyMaster,
  Dashboard,
  Role,
  LineMaster,OrderImport,Allocation,Aql,
  LineAllocation,
  InchargeLineListMaster

} from "../../components";
import useOutsideClick from "../../../CustomHooks/handleOutsideClick";
import secureLocalStorage from "react-secure-storage";

const ActiveTabList = () => {
  const openTabs = useSelector((state) => state.openTabs);

  const dispatch = useDispatch();
  const [showHidden, setShowHidden] = useState(false);
  const [isAllowableUser, setIsAllowableUser] = useState(false)
  const { showAddModal } = useModal()
  const ref = useOutsideClick(() => { setShowHidden(false) })


  const tabs = {
    "PAGE MASTER": <PageMaster />,
    "COMPANY MASTER": <CompanyMaster />,
    "PAGE GROUP MASTER": <PageGroupMaster />,
    "COUNTRY MASTER": <CountryMaster />,
    "MACHINE MASTER": <MachineMaster />,
    "STATE MASTER": <StateMaster />,
    "CITY MASTER": <CityMaster />,
    "DEPARTMENT MASTER": <DepartmentMaster />,
    "DESIGNATION MASTER": <EmployeeCategoryMaster />,
    "FIN YEAR MASTER": <FinYearMaster />,
    "USERS & ROLES": <UserAndRolesMaster />,
    "ROLE": <Role />,
    "ACCOUNT SETTINGS": <AccountSettings />,
    "CONTROL PANEL": <ControlPanel />,
    "EMPLOYEE MASTER": <EmployeeMaster />,
    "BUYER MASTER": <PartyMaster />,
    "PARTY CATEGORY MASTER": <PartyCategorymaster />,
    "CURRENCY MASTER": <CurrencyMaster />,
    "COLOR MASTER": <ColorMaster />,
    "PAY TERM MASTER": <PayTermMaster />,
    "SIZE MASTER": <SizeMaster />,
    "LOCATION MASTER": <LocationMaster />,
    "DASHBOARD": <Dashboard />,
    "LINE MASTER": <LineMaster />,
    "ORDER IMPORT": <OrderImport />,
    "ALLOCATION" : <Allocation />,
    "AQL" : <Aql />,
    "INCHARGE LINE LIST MASTER" :  <InchargeLineListMaster/>





  };
  const innerWidth = window.innerWidth;
  const itemsToShow = innerWidth / 130;

  let currentShowingTabs = openTabs.tabs.slice(0, parseInt(itemsToShow));

  const hiddenTabs = openTabs.tabs.slice(parseInt(itemsToShow));
  const userId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userId"
  )
  return (
    <>

      <div className="relative mt-[55px] bg-[f1f1f0] p-1 rounded-md">
        <div className="flex justify-between items-center">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            {(currentShowingTabs)?.map((tab, index) => (
              <div
                key={index}
                className={`flex items-center rounded-md transition-all ${tab.active
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                  }`}
              >
                <button
                  onClick={() => dispatch(push({ name: tab.name }))}
                  className={`px-2 py-1 text-xs font-medium ${tab.active ? "text-white" : "text-gray-700"
                    }`}
                >
                  {tab.name}
                </button>
                <button
                  className="px-1 py-1 rounded-r-md hover:bg-opacity-20 hover:bg-white"
                  onClick={() => dispatch(remove({ name: tab.name }))}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {hiddenTabs.length !== 0 && (
            <button
              onClick={() => setShowHidden(!showHidden)}
              className="ml-1 p-1 rounded hover:bg-gray-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
                />
              </svg>
            </button>
          )}
        </div>

        {showHidden && (
          <div
            ref={ref}
            className="absolute right-0 top-8 bg-white shadow-md rounded-sm z-50 border border-gray-200 w-40"
          >
            <div className="py-0.5">
              {hiddenTabs.map(tab => (
                <div
                  key={tab.name}
                  className={`flex justify-between items-center px-2 py-1 text-xs ${tab.active
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-gray-700 hover:bg-gray-100"
                    }`}
                >
                  <button
                    className="flex-grow text-left"
                    onClick={() => {
                      dispatch(push({ name: tab.name }));
                      setShowHidden(false);
                    }}
                  >
                    {tab.name}
                  </button>
                  <button
                    className="ml-1 p-0.5 rounded hover:bg-gray-200"
                    onClick={() => dispatch(remove({ name: tab.name }))}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-1">
          {(openTabs?.tabs)?.map((tab, index) => (
            <div key={index} className={`${tab.active ? "block" : "hidden"}`}>
              {tabs[tab.name]}
            </div>
          ))}
        </div>
      </div>
    </>

  );
};


export default ActiveTabList;
