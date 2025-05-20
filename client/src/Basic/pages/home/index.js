import React, { useState } from "react";
import { Sidebar, Dashboard, Header } from "../../components";
import Modal from "../../../UiComponents/Modal";
import { BranchAndFinyearForm, LogoutConfirm } from "../../components";
import ActiveTabList from "../../components/ActiveTabList";
import secureLocalStorage from "react-secure-storage";
import SuperAdminHeader from "../../components/SuperAdminHeader";
import { useDispatch, useSelector } from "react-redux";

import { MaxHomePage, Order } from "../../../Uniform/Components";
import SlackStyleUI from "../../../Uniform/Components/HomePage";
import { push } from "../../../redux/features/opentabs";

const Home = () => {
  const [isGlobalOpen, setIsGlobalOpen] = useState(false);
  const [logout, setLogout] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isMainDropdownOpen, setIsMainDropdownOpen] = useState(false);
  const [profile, setProfile] = useState(false);
  
  const isSuperAdmin = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "superAdmin"
  );
  const userRole = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userRole"
  );
  const dispatch = useDispatch();


  const openTabs = useSelector((state) => state.openTabs);

  return (
    <>
      <Modal
        isOpen={isGlobalOpen}
        onClose={() => {
          setIsGlobalOpen(false);
        }}
        widthClass={""}
      >
        <BranchAndFinyearForm setIsGlobalOpen={setIsGlobalOpen} />
      </Modal>
      <Modal
        isOpen={logout}
        onClose={() => {
          setLogout(false);
          setProfile(false)
        }}
        widthClass={""}
      >
        <LogoutConfirm setLogout={setLogout} />
      </Modal>
      <div style={{ backgroundColor: '#F1F1F0' }}>
        {isSuperAdmin ? (
          <>
            <SuperAdminHeader
              setIsGlobalOpen={setIsGlobalOpen}
              setLogout={setLogout}
            />
            <div className=" bg-[#F1F1F0]">
              <ActiveTabList />

            </div>

          </>
        ) :


          userRole === "MANUFACTURE" || userRole === "VENDOR" ?
            <>
              <div className="h-[100vh]" style={{ backgroundColor: '#F1F1F0' }}
           onClick={()  => { 
                        
                    if( isOpen  &&   isMainDropdownOpen  ){
                    setIsOpen(true)   

                    }
                    if(isOpen){
                    setIsOpen(!isOpen);
                    }
                    if(profile){
                       setProfile(false)

                    }
                    }
                  }

                                              
              >

                <Header profile={profile} setProfile={setProfile}  logout={logout}  setLogout={setLogout}  />

                <Sidebar isOpen={isOpen} setIsOpen={setIsOpen}
                  isMainDropdownOpen={isMainDropdownOpen}
                  setIsMainDropdownOpen={setIsMainDropdownOpen} />
                <div className="p-2 h-[screen]" style={{ backgroundColor: '#F1F1F0' }}>
                  <ActiveTabList />
                </div>
                  {openTabs.tabs.length === 0 ? <Dashboard setProfile={setProfile} /> : ''}


              </div>

            </>



            :

            (
              <div className="h-[100vh] " 
                      onClick={()  => { 
                        
                         if( isOpen  &&   isMainDropdownOpen  ){
                                    setIsOpen(true)   
                                    
                        }
                             if(isOpen){
                          setIsOpen(!isOpen);
                        }
                        if(profile){
                                setProfile(false)

                              }
                           
                      }}
                        
                        >
          
                          <Header profile={profile} setProfile={setProfile}  setLogout={setLogout} logout={logout} />
          
                          <Sidebar isOpen={isOpen} setIsOpen={setIsOpen}
                            isMainDropdownOpen={isMainDropdownOpen}
                            setIsMainDropdownOpen={setIsMainDropdownOpen} />
                          <div className=" p-2 ">
                            <ActiveTabList />
                          </div>
                            {openTabs.tabs.length === 0 ? <Dashboard setProfile={setProfile} /> : ''}
          
          
                        </div>
                      )
                  }
          
                </div>
              </>
            );
          };
          export default Home;
                   
         
          
