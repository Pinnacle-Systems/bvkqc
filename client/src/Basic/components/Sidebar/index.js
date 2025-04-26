import { useCallback, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, LayoutDashboard, PanelLeftClose,  Table, Home } from 'lucide-react';
import './Sidebar.css';
import secureLocalStorage from 'react-secure-storage';
import { toast } from 'react-toastify';
import { PAGES_API, ROLES_API } from '../../../Api';
import axios from 'axios';
import { useGetPageGroupQuery } from '../../../redux/services/PageGroupMasterServices';
import SidebarComponent from './SidebarComponent';
import { useNavigate } from 'react-router-dom';
const BASE_URL = process.env.REACT_APP_SERVER_URL;



const Sidebar = ({ isOpen, setIsOpen, isMainDropdownOpen, setIsMainDropdownOpen }) => {

  const navigate = useNavigate()

  const [name, setName] = useState("");

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [hideNavBar, sethideNavBar] = useState(true);

  const navBatItemsStyle = hideNavBar ? "hidden" : "";

  const [allowedPages, setAllowedPages] = useState([]);

  const { data: pageGroup } = useGetPageGroupQuery({ searchParams: "" })

  const toggleNavMenu = () => {
    sethideNavBar(!hideNavBar);
  };



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
      }).then(
        (result) => {
          if (result.status === 200) {
            if (result.data.statusCode === 0) {
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
    return data?.name
  }



  const masters = allowedPages.filter((page) => page.type === "Masters" && page.active === true )
  const mastersGroup = [...new Set(masters.map(page => page.pageGroupId))].map(pageId => { return { id: pageId, name: findElement(pageId, pageGroup?.data) } })
  const transactions = allowedPages.filter((page) => page.type === "Transactions")
  const transactionsGroup = [...new Set(transactions.map(page => page.pageGroupId))].map(pageId => { return { id: pageId, name: findElement(pageId, pageGroup?.data) } })
  const reports = allowedPages.filter((page) => page.type === "Reports")
  const reportGroups = [...new Set(reports.map(page => page.pageGroupId))].map(pageId => { return { id: pageId, name: findElement(pageId, pageGroup?.data) } })


  console.log("masters", masters)


  const headers = [

    {
      heading: 'Masters',
      logo: <Table size={20} />,
      groups: mastersGroup,
      pages: masters
    },
    {
      heading: 'Transactions',
      logo: <PanelLeftClose size={20} />,
      groups: transactionsGroup,
      pages: transactions
    },

  ]


  return (
    <>
      <div onClick={() => {
        if (isOpen && isMainDropdownOpen) {
          setIsOpen(false);
          setIsMainDropdownOpen(false)
        }
        setIsOpen(!isOpen)
      }
      } 
      className='fixed z-[99] top-[16.5%]  bg-gray-600 opacity-50 px-0 h-[10%] flex items-center rounded-end cursor-pointer'
       >
           <div className='text-white'>{isOpen ? <ChevronLeft style={{ width: '12px' }} /> : <ChevronRight style={{ width: '12px' }} />}</div>
    </div>
      {isOpen && <div className={`sidebar  w-[70px] ${isMainDropdownOpen ? "h-[400px]" : ""} bg-[#495057] top-[16.5%] left-[1%] fixed z-[999] rounded-lg flex justify-center py-3`}>

      
    
        <div className=" " >
        <div className='text-white hover:text-gray-400 cursor-pointer mb-3 '
          
          >
            <a className=' mx-auto text-light flex justify-center hover:text-gray-400 ' type="button" ><Home size={20} /></a>
            <div className='text-[8.5px] w-full text-center'>Home</div>
          </div>
          <div className='text-white hover:text-gray-400 cursor-pointer mb-3'
          
          >
            <a className=' mx-auto text-light flex justify-center hover:text-gray-400 ' type="button" ><LayoutDashboard size={20} /></a>
            <div className='text-[8.5px] w-full text-center'>Dashboard</div>
          </div>
          { isOpen  && headers.map((ele, index) => {
            return (

              <div
                key={index}
                onClick={() => { setIsMainDropdownOpen(true); setName(ele.heading) }}
                className="text-white w-full cursor-pointer mt-3">

                <a className=" cursor-pointer text-white flex justify-center">{ele.logo}</a>
                <div className="text-[8.5px] text-center ">{ele.heading}</div>
              </div>

            )
          })}
 
        </div>


      </div>}

      <div className="my-0 ">

        <ul className='my-0 flex flex-col '>


          {headers.map((ele, index) => {
            return (
              <div key={index}>
                <li >
                  {name === ele.heading && <SidebarComponent setIsOpen={setIsOpen} heading={ele.heading} logo={ele.logo} groups={ele.groups} pages={ele.pages} isMainDropdownOpen={isMainDropdownOpen} setIsMainDropdownOpen={setIsMainDropdownOpen} />}
                </li>
              </div>
            )
          })}

        </ul>

      </div>
    
    </>
  )
}

export default Sidebar;
