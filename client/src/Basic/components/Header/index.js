import "./Header.css";
import dp from "../../../assets/default-dp.png";
import { Bell } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import Profile from "./Profile";
import logo from "../../../assets/Anu (1).png";
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
import {  Users, Briefcase } from 'lucide-react'; 
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

<div className='py-2 w-full flex justify-between items-center bg-white shadow-sm fixed z-50 px-4'>
  {/* Logo */}
  <div className="w-32">
    <img className="rounded-lg" src={logo} alt="Logo" />
  </div>

  {/* Center Search Bar */}
  <div className="flex items-center space-x-3">
    <div className='relative'>
      <input
        className='pl-3 pr-8 py-1 w-60 text-sm rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400'
        placeholder='Search'
        type='text'
      />
      <Search className='absolute right-2 top-1.5 text-neutral-500' size={16} />
    </div>

    {/* Party Icon */}
   <button
  className="flex items-center space-x-1 text-sm px-3 py-1 bg-gray-100 hover:bg-indigo-100 text-indigo-600 rounded-full shadow-sm transition"
  title="Party"
  onClick={() => dispatch(push({ name: "PARTY MASTER" }))}
>
  <Users size={16} />
  <span>Party</span>
</button>


    {/* Employee Icon */}
    <button
      className="flex items-center space-x-1 text-sm px-3 py-1 bg-gray-100 hover:bg-indigo-100 text-indigo-600 rounded-full shadow-sm transition"
      title="Employee"
    >
      <Briefcase size={16} />
      <span>Employee</span>
    </button>
  </div>

  {/* Right Side */}
  <div className="flex items-center space-x-4 text-sm">
    <div className="text-black">{userName?.toUpperCase()}</div>
    <img
      className="rounded-full border-2 border-indigo-500 cursor-pointer hover:border-indigo-700 transition-all duration-200 shadow-sm"
      onClick={() => setProfile(!profile)}
      width={35}
      height={35}
      src={dp}
      alt="Profile"
    />

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

  )
}

export default Header;