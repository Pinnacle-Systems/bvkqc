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
        }}
        widthClass={""}
      >
        <LogoutConfirm setLogout={setLogout} />
      </Modal>
      <div>
        {isSuperAdmin ? (
          <>
            <SuperAdminHeader
              setIsGlobalOpen={setIsGlobalOpen}
              setLogout={setLogout}
            />
            <div className="">
              <ActiveTabList />

            </div>

          </>
        ) :


          userRole === "MANUFACTURE" || userRole === "VENDOR" ?
            <>
              <div className="h-[100vh] mt-5">

                <Header profile={profile} setProfile={setProfile} />

                <Sidebar isOpen={isOpen} setIsOpen={setIsOpen}
                  isMainDropdownOpen={isMainDropdownOpen}
                  setIsMainDropdownOpen={setIsMainDropdownOpen} />
                <div className="mt-[30px]  p-5 bg-gray-100  ">
                  <ActiveTabList />
                  {openTabs.tabs.length === 0 ? <Dashboard setProfile={setProfile} /> : ''}
                </div>


              </div>

            </>



            :

            (
              <div className="h-[100vh] mt-5">

                <Header profile={profile} setProfile={setProfile} />

                <Sidebar isOpen={isOpen} setIsOpen={setIsOpen}
                  isMainDropdownOpen={isMainDropdownOpen}
                  setIsMainDropdownOpen={setIsMainDropdownOpen} />
                <div className=" p-2 bg-gray-100  ">
                  <ActiveTabList />
                  {openTabs.tabs.length === 0 ? <Dashboard setProfile={setProfile} /> : ''}
                </div>


              </div>
            )
        }

      </div>
    </>
  );
};
export default Home;
