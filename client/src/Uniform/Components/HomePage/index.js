import React, { useEffect, useState, } from "react";
import {
  Home,
  MessageCircle,
  Bell,
  MoreHorizontal,
  Plus,
  UserCircle,
  Search,
} from "lucide-react";
import { HomePage } from "./homePage";
import { Message } from "./Message";
import { Activity } from "./Activity";
import { More } from "./More";
import { RiOrderPlayFill } from "react-icons/ri";
import secureLocalStorage from "react-secure-storage";
import Order from "../Order";
import MailForm from "../Email";
import { OrderImport } from "..";
import { useGetPartyByIdQuery } from "../../../redux/services/PartyMasterService";
import { useGetUserByIdQuery } from "../../../redux/services/UsersMasterService";



export default function Form() {
  const user = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userType"
  );

  const [active, setActive] = useState(user === null ? "order" : "home");
  const [isOpen, setisOpen] = useState(false)
  const [form, setForm] = useState(false)
  const [mailForm, setMailform] = useState(false)
  const [emailId, setEmailId] = useState("")
  const [currentId, setCurrentId] = useState("")
  const [partyId, setPartyId] = useState("")
  const [poSentForApproval, setPoSentForApproval] = useState(false)


  const userId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userId")

  const { data: singleuserData } = useGetUserByIdQuery(userId, { skip: !userId });
  const userRole = singleuserData?.data?.userType || ""
  const { data: singleUserPartyData } = useGetPartyByIdQuery(partyId, { skip: !userId });

  useEffect(() => {

    setPartyId(singleuserData?.data?.partyType)
  }, [singleUserPartyData])





  const getButtonStyle = (name) => ({
    backgroundColor: active === name ? "#E9D5FF" : "transparent",
    borderRadius: "8px",
    Padding: "2px"
  });







  return (



    <>

      <div className="flex font-sans bg-gary-300 px-0  h-[85%] w-full mt-3" >

        <aside className="w-[4%] flex flex-col items-center py-4 space-y-6   h-full   ">

          <button className="flex flex-col items-center "
            onClick={() => setActive("home")}


          >
            <div style={getButtonStyle("home")}   >
              <Home className="h-10 w-6 text-purple-600" />

            </div>
            <span className="text-[10px] mt-1  text-purple-400">Home</span>
          </button>

          <button className="flex flex-col items-center "
            onClick={() => {
              setActive("order")
              setisOpen(true)
            }}


          >
            <div style={getButtonStyle("order")}   >
              <RiOrderPlayFill className="h-10 w-6 text-purple-600" />

            </div>
            <span className="text-[10px] mt-1  text-purple-400">Order</span>
          </button>



          <button className="flex flex-col items-center"
            onClick={() => setActive("Mail")}
          >
            <div style={getButtonStyle("Mail")}>
              <MessageCircle className="h-10 w-6 text-purple-600" />

            </div>
            <span className="text-[10px] mt-1 text-purple-400">Mail</span>
          </button>



          <button className="flex flex-col items-center"
            onClick={() => setActive("More")}
          >
            <div style={getButtonStyle("More")}>
              <MoreHorizontal className="h-10 w-7 text-purple-600 " />

            </div>
            <span className="text-[10px] mt-1 text-purple-400">OrderImport</span>
          </button>


        </aside>
        <footer className="">
          {active === "order" && form === true || mailForm === true ?
            <div className="ml-5 p-1">
              <button
                onClick={() => {
                  setForm(false)
                  setMailform(false)
                  setActive("order")
                }}
                style={getButtonStyle("order")}
              >
                <svg class="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" stroke-width="2"
                  viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </div>
            : <></>
          }
        </footer>
        <main className="flex-1 flex flex-col   shadow-2xl bg-white  pb-2  h-full  w-[50%] ">


          <div>

            {active === "home" && <HomePage />}
            {active === "Mail" && <MailForm
              setPoSentForApproval={setPoSentForApproval}
              poSentForApproval={poSentForApproval}
              emailId={emailId} currentId={currentId} userRole={userRole}
              singleUserPartyData={singleUserPartyData}

            />}
            {active === "Activity" && <Activity />}
            {active === "More" && <OrderImport />}
            {active === "order" && <Order setEmailId={setEmailId}
              setActive={setActive} setForm={setForm} form={form} setMailform={setMailform} setCurrentId={setCurrentId}

            />}

          </div>

        </main>


      </div>















    </>
  )

}












