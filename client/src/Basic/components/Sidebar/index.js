import React, { useCallback, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, LayoutDashboard, PanelLeftClose, PanelRightClose, Settings, Table, UserRoundPen, Grtransaction } from 'lucide-react';
import './Sidebar.css';
import secureLocalStorage from 'react-secure-storage';
import { toast } from 'react-toastify';
import { PAGES_API, ROLES_API } from '../../../Api';
import { ArrowRightCircle, ArrowLeftCircle } from "lucide-react";
import axios from 'axios';
import { useGetPageGroupQuery } from '../../../redux/services/PageGroupMasterServices';
import SidebarComponent from './SidebarComponent';
import { useNavigate } from 'react-router-dom';

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const Sidebar = ({ isOpen, setIsOpen, isMainDropdownOpen, setIsMainDropdownOpen }) => {
  const navigate = useNavigate()
  const [name, setName] = useState("");
  const [hideNavBar, sethideNavBar] = useState(true);
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
  
  const headers = [
    {
      heading: 'Masters',
      logo: <Table size={24} />,
      groups: mastersGroup,
      pages: masters
    },
    {
      heading: 'Transactions',
      logo: <PanelLeftClose size={24} />,
      groups: transactionsGroup,
      pages: transactions
    },
  ]

  return (
    <>
      {/* Toggle Button */}
      <div
        onClick={() => {
          if (isOpen && isMainDropdownOpen) {
            setIsOpen(false);
            setIsMainDropdownOpen(false);
          }
          setIsOpen(!isOpen);
        }}
        className="fixed z-[99] top-[28.5%] left-0 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white w-8 h-12 flex items-center justify-center rounded-r-xl shadow-lg cursor-pointer transition-all duration-300 hover:from-indigo-700 hover:to-indigo-600 hover:shadow-xl hover:w-9"
      >
        {isOpen ? (
          <ArrowLeftCircle size={22} className="text-white transition-all duration-300" />
        ) : (
          <ArrowRightCircle size={22} className="text-white transition-all duration-300" />
        )}
      </div>
      
      {isOpen && (
        <div
          className={`fixed z-[999] top-[16.5%] left-[1.5rem] bg-gradient-to-b from-indigo-700 to-indigo-600 text-white w-[80px] ${
            isMainDropdownOpen ? "h-[450px]" : "h-auto"
          } rounded-xl py-4 flex flex-col items-center shadow-xl transition-all duration-300`}
        >
          <div
            className="text-white hover:bg-indigo-500/30 cursor-pointer mb-4 flex flex-col items-center p-2 rounded-lg w-full transition-colors"
            onClick={() => navigate("/home")}
          >
            <LayoutDashboard size={22} className="mb-1" />
            <span className="text-xs text-center font-medium">Dashboard</span>
          </div>

          {headers.map((ele, index) => (
            <div
              key={index}
              onClick={() => {
                setIsMainDropdownOpen(true);
                setName(ele.heading);
              }}
              className={`hover:bg-indigo-500/30 cursor-pointer my-1 flex flex-col items-center p-2 rounded-lg w-full transition-colors ${
                name === ele.heading ? 'bg-indigo-500/30' : ''
              }`}
            >
              {React.cloneElement(ele.logo, { className: "mb-1" })}
              <span className="text-xs text-center font-medium">{ele.heading}</span>
            </div>
          ))}
        </div>
      )}

      <div className="my-0">
        <ul className='my-0 flex flex-col'>
          {headers.map((ele, index) => {
            return (
              <div key={index}>
                <li>
                  {name === ele.heading && (
                    <SidebarComponent 
                      setIsOpen={setIsOpen} 
                      heading={ele.heading} 
                      logo={ele.logo} 
                      groups={ele.groups} 
                      pages={ele.pages} 
                      isMainDropdownOpen={isMainDropdownOpen} 
                      setIsMainDropdownOpen={setIsMainDropdownOpen} 
                    />
                  )}
                </li>
              </div>
            )
          })}
        </ul>
      </div>
    </>
  )
}

export default Sidebar