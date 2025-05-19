import "./Header.css"
import dp from "../../../assets/default-dp.png"
import { Bell, Search } from "lucide-react"
import { useCallback, useEffect, useState } from "react";
import Profile from "./Profile";
import logo from "../../../assets/max'.png"
import { useGetPageGroupQuery } from "../../../redux/services/PageGroupMasterServices";
import { useGetProjectQuery } from "../../../redux/services/ProjectService";
import secureLocalStorage from "react-secure-storage";
import axios from "axios";
import { PAGES_API, ROLES_API } from "../../../Api";
import { toast } from "react-toastify";
import useOutsideClick from "../../../CustomHooks/handleOutsideClick";
import { getCommonParams } from "../../../Utils/helper";
import { useDispatch } from "react-redux";
import { useGetBranchByIdQuery } from "../../../redux/services/BranchMasterService";
import useLogout from "../../../CustomHooks/useLogout";


const BASE_URL = process.env.REACT_APP_SERVER_URL;


const Header = ({ profile, setProfile , setLogout , logout}) => {
    const [hideNavBar, sethideNavBar] = useState(true);

    const navBatItemsStyle = hideNavBar ? "hidden" : "";
  
    const [allowedPages, setAllowedPages] = useState([]);

  console.log(allowedPages, "allowedPages")
    const { data: pageGroup } = useGetPageGroupQuery({ searchParams: "" })
  
    const toggleNavMenu = () => {
        setProfile(!profile);
    };
    const userName  =   secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "username")

     const handleOutsideClick = () => {
                 sethideNavBar(false);
          };
        
      const ref = useOutsideClick(handleOutsideClick);
  
    const { token } = getCommonParams()
  
    useLogout()

  
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
     
      )    {
        axios({
          method: "get",
          url: BASE_URL + PAGES_API,
          params: { active: true },
          headers: { Authorization: token }
  
        }).then(
          (result) => {
            console.log("result", result.data.data);
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
                 console.log(result.data.data.RoleOnPage,"result.data.data.RoleOnPage")
                setAllowedPages(
                  result.data.data.RoleOnPage.filter(
                    (page) => page.page.active && page.read
                  ).map((page) => {
                    return {
                      active:true,
                      name: page.page.name,
                      type: page.page.type,
                      link: page.page.link,
                      id: page.page.id,
                      pageGroupId: page.page.pageGroupId
                    };
                  })
                );
              }
            } else {
              console.log(result);
            }
          },
          (error) => {
            console.log(error);
            toast.error("Server Down", { autoClose: 5000 });
          }
        );
      }
    }, []);
    useEffect(retrieveAllowedPages, [retrieveAllowedPages]);
    const hideExpireWarning = () => {
      let expireWarningDiv = document.getElementById("expireWarning");
      expireWarningDiv.style.display = "none";
    };
    function findElement(id, arr) {
      if (!arr) return ""
      let data = arr.find(item => parseInt(item.id) === parseInt(id))
      return data ? data.name : ""
    }
    const masters = allowedPages.filter((page) => page.type === "Masters")
    const mastersGroup = [...new Set(masters.map(page => page.pageGroupId))].map(pageId => { return { id: pageId, name: findElement(pageId, pageGroup?.data) } })
    const transactions = allowedPages.filter((page) => page.type === "Transactions")
    const transactionsGroup = [...new Set(transactions.map(page => page.pageGroupId))].map(pageId => { return { id: pageId, name: findElement(pageId, pageGroup?.data) } })
    const reports = allowedPages.filter((page) => page.type === "Reports")
    const reportGroups = [...new Set(reports.map(page => page.pageGroupId))].map(pageId => { return { id: pageId, name: findElement(pageId, pageGroup?.data) } })
  
    const dispatch = useDispatch()
  
    const { userId, branchId } = getCommonParams()
    const { data: branch } = useGetBranchByIdQuery(branchId, { skip: !branchId });
    


    return (
        <div className='py-1  w-full flex justify-between items-center bg-white shadow-sm fixed z-50'>
            <div className="w-32 ms-3">
                <img className="rounded-lg"
                    src={logo}
                    alt="" />
            </div>
            <div className="mr-9 flex items-center  justify-content-between">
                <div className='flex items-center text-[12px] border rounded-full relative mr-3'>
                    <input className=' px-2 py-1 w-60 text-[12px] rounded-full' placeholder='search' type='text' name='password' id='password' />
                    <div className='absolute right-2  text-neutral-500'>
                        <Search size={15} />
                    </div>
                </div>
                {/* <div className="mr-3 bg-beige p-2 rounded-full ">
                    <Bell size={17}  />
                </div> */}
                  <div className="text-sm text-black my-0 px-3">
                                        {userName.toUpperCase()}
                                    </div>
               <div className="flex items-center gap-4">
<div className="flex items-center space-x-2">
  <img
    className="rounded-full border-2 border-indigo-500 cursor-pointer 
               hover:border-indigo-700 transition-all duration-200
               shadow-sm hover:shadow-md focus:outline-none 
               focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
    onClick={() => setProfile(!profile)}
    width={35}
    height={35}
    src={dp}
    alt="Profile"
  />
<div className="text-lg font-semibold text-gray-900 tracking-wide">
    {secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "username"
    )}
</div>

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
