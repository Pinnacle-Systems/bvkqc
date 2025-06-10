import "./Header.css";
import dp from "../../../assets/default-dp.png";
import { Bell } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import Profile from "./Profile";
<<<<<<< HEAD
import logo from "../../../assets/Anu (1).png";
=======
import logo from "../../../assets/Anu (1).png"
>>>>>>> 9750297963aa7d442e82b90147fdf60794ee56fe
import { useGetPageGroupQuery } from "../../../redux/services/PageGroupMasterServices";
import secureLocalStorage from "react-secure-storage";
import axios from "axios";
import { PAGES_API, ROLES_API } from "../../../Api";
import { toast } from "react-toastify";
import useOutsideClick from "../../../CustomHooks/handleOutsideClick";
import { getCommonParams } from "../../../Utils/helper";
import { useDispatch } from "react-redux";
import { useGetBranchByIdQuery } from "../../../redux/services/BranchMasterService";
import useLogout from "../../../CustomHooks/useLogout";
<<<<<<< HEAD
import { Building, GitBranch, User, Award, Sliders, ShoppingBag, Network } from 'lucide-react'; 
=======
import {  Network , Home,GitBranch,User,Award,Sliders,ShoppingBag,Building} from 'lucide-react'; 
>>>>>>> 9750297963aa7d442e82b90147fdf60794ee56fe
import { push } from "../../../redux/features/opentabs";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const Header = ({ profile, setProfile, setLogout, logout }) => {
  const [hideNavBar, sethideNavBar] = useState(true);
  const [allowedPages, setAllowedPages] = useState([]);
  const { data: pageGroup } = useGetPageGroupQuery({ searchParams: "" });
  const userName = secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "username");
  const dispatch = useDispatch();
  const { token } = getCommonParams();
  useLogout();

  const navBatItemsStyle = hideNavBar ? "hidden" : "";

  const toggleNavMenu = () => {
    setProfile(!profile);
  };

  const handleOutsideClick = () => {
    sethideNavBar(false);
  };

  const ref = useOutsideClick(handleOutsideClick);

  const userRole = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userRole"
  );

  const retrieveAllowedPages = useCallback(() => {
    if (
      JSON.parse(
        secureLocalStorage.getItem(
          sessionStorage.getItem("sessionId") + "defaultAdmin"
        )
      )
    ) {
      axios({
        method: "get",
        url: BASE_URL + PAGES_API,
        params: { active: true },
        headers: { Authorization: token }
      }).then(
        (result) => {
          setAllowedPages(result.data.data);
        },
        (error) => {
          console.log(error);
          toast.error("Server Down", { autoClose: 5000 });
        }
      );
    } else {
      axios({
        method: "get",
        url:
          BASE_URL +
          ROLES_API +
          `/${secureLocalStorage.getItem(
            sessionStorage.getItem("sessionId") + "userRoleId"
          )}`,
        headers: { Authorization: token }
      }).then(
        (result) => {
          if (result.status === 200) {
            if (result.data.statusCode === 0) {
              setAllowedPages(
                result.data.data.RoleOnPage.filter(
                  (page) => page.page.active && page.read
                ).map((page) => {
                  return {
                    active: true,
                    name: page.page.name,
                    type: page.page.type,
                    link: page.page.link,
                    id: page.page.id,
                    pageGroupId: page.page.pageGroupId
                  };
                })
              );
            }
          }
        },
        (error) => {
          console.log(error);
          toast.error("Server Down", { autoClose: 5000 });
        }
      );
    }
  }, [token]);

  useEffect(() => {
    retrieveAllowedPages();
  }, [retrieveAllowedPages]);

  const hideExpireWarning = () => {
    let expireWarningDiv = document.getElementById("expireWarning");
    if (expireWarningDiv) {
      expireWarningDiv.style.display = "none";
    }
  };

  function findElement(id, arr) {
    if (!arr) return "";
    let data = arr.find(item => parseInt(item.id) === parseInt(id));
    return data ? data.name : "";
  }

  const masters = allowedPages.filter((page) => page.type === "Masters");
  const mastersGroup = [...new Set(masters.map(page => page.pageGroupId))].map(pageId => { 
    return { id: pageId, name: findElement(pageId, pageGroup?.data) }; 
  });

  const transactions = allowedPages.filter((page) => page.type === "Transactions");
  const transactionsGroup = [...new Set(transactions.map(page => page.pageGroupId))].map(pageId => { 
    return { id: pageId, name: findElement(pageId, pageGroup?.data) }; 
  });

  const reports = allowedPages.filter((page) => page.type === "Reports");
  const reportGroups = [...new Set(reports.map(page => page.pageGroupId))].map(pageId => { 
    return { id: pageId, name: findElement(pageId, pageGroup?.data) }; 
  });

  const { branchId } = getCommonParams();
  const { data: branch } = useGetBranchByIdQuery(branchId, { skip: !branchId });

  const masterButtons = [
    { icon: <Building size={18} />, name: "Company", tooltip: "Company Master", onClick: () => dispatch(push({ name: "COMPANY MASTER" })) },
    { icon: <GitBranch size={18} />, name: "Branch", tooltip: "Branch Master", onClick: () => dispatch(push({ name: "BRANCH MASTER" })) },
    { icon: <User size={18} />, name: "Employee", tooltip: "Employee Master", onClick: () => dispatch(push({ name: "EMPLOYEE MASTER" })) },
    { icon: <Network size={18} />, name: "Department", tooltip: "Department Master", onClick: () => dispatch(push({ name: "DEPARTMENT MASTER" })) },
    { icon: <Award size={18} />, name: "Designation", tooltip: "Designation Master", onClick: () => dispatch(push({ name: "DESIGNATION MASTER" })) },
    { icon: <Sliders size={18} />, name: "Line", tooltip: "Line Master", onClick: () => dispatch(push({ name: "Line Master" })) },
    { icon: <ShoppingBag size={18} />, name: "Buyer", tooltip: "Buyer Master", onClick: () => dispatch(push({ name: "PARTY MASTER" })) },
  ];

  return (
<<<<<<< HEAD
    <div className='py-2 w-full flex justify-between items-center bg-[f1f1f0] shadow-sm fixed z-50 px-4 border-b border-gray-100'>
      <div className="w-32 transition-transform hover:scale-105">
        <img className="rounded-lg h-9 object-contain" src={logo} alt="Logo" />
      </div>

      <div className="flex items-center space-x-1 bg-gray-50 rounded-lg p-1 shadow-inner border border-gray-200">
        {masterButtons.map((item) => (
          <div key={item.name} className="relative group">
            <button 
              onClick={item.onClick}
              className="p-2 rounded-md bg-white hover:bg-indigo-50 transition-all duration-200 
                        border border-gray-200 hover:border-indigo-200 shadow-xs hover:shadow-sm
                        hover:-translate-y-0.5 transform transition
                        flex flex-col items-center relative
                        before:absolute before:inset-0 before:rounded-md before:pointer-events-none
                        before:transition before:duration-200
                        before:shadow-[0_2px_0_rgba(0,0,0,0.05)] hover:before:shadow-[0_4px_0_rgba(79,70,229,0.1)]
                        active:translate-y-0 active:before:shadow-[0_1px_0_rgba(0,0,0,0.05)]"
            >
              <span className="text-gray-600 group-hover:text-indigo-600 transition-colors duration-200">
                {item.icon}
              </span>
            </button>
            <div className="absolute left-1/2 -bottom-8 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none shadow-lg">
              {item.tooltip}
              <div className="absolute -top-1 left-1/2 w-2 h-2 bg-gray-800 transform -translate-x-1/2 rotate-45 z-0"></div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative group">
          <button className="p-1.5 rounded-full hover:bg-gray-100 transition-all relative">
            <Bell className="text-gray-600" size={16} />
            <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
          </button>
          <div className="absolute right-0 -bottom-7 bg-gray-800 text-white text-xs px-1.5 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none">
            Notifications
            <div className="absolute -top-1 right-2.5 w-2 h-2 bg-gray-800 transform rotate-45"></div>
          </div>
        </div>

        <div className="relative group">
          <div className="flex items-center space-x-1">
            <div className="text-right hidden md:block">
              <div className="text-xs font-medium text-gray-800">{userName?.toUpperCase()}</div>
              <div className="text-[10px] text-gray-500">Admin</div>
            </div>
            <img
              className="rounded-full border border-indigo-300 cursor-pointer w-8 h-8 object-cover hover:border-indigo-500 transition-all"
              onClick={() => setProfile(!profile)}
              src={dp}
              alt="Profile"
            />
          </div>
          <div className="absolute right-0 -bottom-7 bg-gray-800 text-white text-xs px-1.5 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none">
            Account Settings
            <div className="absolute -top-1 right-2.5 w-2 h-2 bg-gray-800 transform rotate-45"></div>
          </div>

          {profile && (
            <Profile
              dp={dp}
              setProfile={setProfile}
              items={allowedPages.filter((page) => page.type === "AdminAccess")}
              setLogout={setLogout}
              logout={logout}
            />
          )}
        </div>
      </div>
=======
<div className='py-2 w-full flex justify-between items-center bg-white shadow-sm fixed z-50 px-4 border-b border-gray-100'>
  {/* Logo with subtle animation - made smaller */}
  <div className="w-32 transition-transform hover:scale-105">
    <img className="rounded-lg h-10 object-contain" src={logo} alt="Logo" />
  </div>

  <div className="flex items-center space-x-1 bg-gray-50 rounded-lg p-1 shadow-inner border border-gray-200">
    {[
      { icon: <Building size={18} />, name: "Company", tooltip: "Company Master" },
      { icon: <GitBranch size={18} />, name: "Branch", tooltip: "Branch Master" },
      { icon: <User size={18} />, name: "Employee", tooltip: "Employee Master" },
      { icon: <Network  size={18} />, name: "Department", tooltip: "Department Master" },
      { icon: <Award size={18} />, name: "Designation", tooltip: "Designation Master" },
      { icon: <Sliders size={18} />, name: "Line", tooltip: "Line Master" },
      { icon: <ShoppingBag size={18} />, name: "Buyer", tooltip: "Buyer Master" },
      { icon: <Network  size={18} />, name: "Party", tooltip: "Party Master" },
    ].map((item) => (
      <div key={item.name} className="relative group">
        <button className="p-2 rounded-md bg-white hover:bg-indigo-50 transition-all duration-200 
                          border border-gray-200 hover:border-indigo-200 shadow-xs hover:shadow-sm
                          hover:-translate-y-0.5 transform transition
                          flex flex-col items-center relative
                          before:absolute before:inset-0 before:rounded-md before:pointer-events-none
                          before:transition before:duration-200
                          before:shadow-[0_2px_0_rgba(0,0,0,0.05)] hover:before:shadow-[0_4px_0_rgba(79,70,229,0.1)]
                          active:translate-y-0 active:before:shadow-[0_1px_0_rgba(0,0,0,0.05)]">
          <span className="text-gray-600 group-hover:text-indigo-600 transition-colors duration-200">
            {item.icon}
          </span>
        </button>
        <div className="absolute left-1/2 -bottom-8 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none shadow-lg">
          {item.tooltip}
          <div className="absolute -top-1 left-1/2 w-2 h-2 bg-gray-800 transform -translate-x-1/2 rotate-45 z-0"></div>
        </div>
      </div>
    ))}
  </div>

  <div className="flex items-center space-x-2">
    <div className="relative group">
      <button className="p-1.5 rounded-full hover:bg-gray-100 transition-all relative">
        <Bell className="text-gray-600" size={16} />
        <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
      </button>
      <div className="absolute right-0 -bottom-7 bg-gray-800 text-white text-xs px-1.5 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none">
        Notifications
        <div className="absolute -top-1 right-2.5 w-2 h-2 bg-gray-800 transform rotate-45"></div>
      </div>
>>>>>>> 9750297963aa7d442e82b90147fdf60794ee56fe
    </div>
  );
};

<<<<<<< HEAD
export default Header;
=======
    {/* User Avatar - made smaller */}
    <div className="relative group">
      <div className="flex items-center space-x-1">
        <div className="text-right hidden md:block">
          <div className="text-xs font-medium text-gray-800">{userName?.toUpperCase()}</div>
          <div className="text-[10px] text-gray-500">Admin</div>
        </div>
        <img
          className="rounded-full border border-indigo-300 cursor-pointer w-8 h-8 object-cover hover:border-indigo-500 transition-all"
          onClick={() => setProfile(!profile)}
          src={dp}
          alt="Profile"
        />
      </div>
      <div className="absolute right-0 -bottom-7 bg-gray-800 text-white text-xs px-1.5 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none">
        Account Settings
        <div className="absolute -top-1 right-2.5 w-2 h-2 bg-gray-800 transform rotate-45"></div>
      </div>

      {profile && (
        <Profile
          dp={dp}
          setProfile={setProfile}
          items={allowedPages.filter((page) => page.type === "AdminAccess")}
          setLogout={setLogout}
          logout={logout}
        />
      )}
    </div>
  </div>
</div>

  )
}

export default Header
>>>>>>> 9750297963aa7d442e82b90147fdf60794ee56fe
