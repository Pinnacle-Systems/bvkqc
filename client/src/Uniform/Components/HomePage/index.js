import React, { useEffect, useState, } from "react";
import {
  Home,
  MessageCircle,
  Bell,
  MoreHorizontal,
  Plus,
  UserCircle,
  Search,
  ClipboardList,
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
import { useGetOrderByIdQuery } from "../../../redux/uniformService/OrderService";
import EmailReport from "../Email/EmailReport";



export default function Form() {
  const user = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userType"
  );

  const [active, setActive] = useState(user === null ? "order" : "home");
  const [isOpen, setisOpen] = useState(false)
  const [form, setForm] = useState(false)
  const [mailForm, setMailform] = useState(false)
  const [emailId, setEmailId] = useState("")
  const [currentId, setCurrentId] = useState("")   // current id is a  Order Id
  const [partyId, setPartyId] = useState("")
  const [attachments, setattachments] = useState([]);

  const [poSentForApproval, setPoSentForApproval] = useState(false)


  const userId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userId")

  const { data: singleuserData } = useGetUserByIdQuery(userId, { skip: !userId });
  const userRole = singleuserData?.data?.userType || ""
  const { data: singleUserPartyData } = useGetPartyByIdQuery(partyId, { skip: !userId });
  const { data: SigleOrderdata, isLoading, isFetching } = useGetOrderByIdQuery(currentId, { skip: !currentId });

  useEffect(() => {
    setPartyId(singleuserData?.data?.partyType)
  }, [singleUserPartyData])

  useEffect(() => {
    setattachments(SigleOrderdata?.data?.attachments)
  }, [SigleOrderdata])



  const getButtonStyle = (name) => ({
    backgroundColor: active === name ? "#E9D5FF" : "transparent",
    borderRadius: "8px",
    Padding: "4px"
  });







  return (



    <>



      <div className="flex font-sans bg-gary-300 px-0  h-[85%] w-full mt-3" >

        <div className="flex flex-col ">
          <aside className=" flex flex-col items-center py-4 h-full   ">
            <footer className=" flex flex-col items-center ml-1">
              {active === "order" && form === true || mailForm === true ?
                <div className="flex flex-col">
                  <button
                    onClick={() => {
                      setForm(false)
                      setMailform(false)
                      setActive("order")
                    }}
                    style={getButtonStyle("order")}
                  >
                    <svg class="w-5 h-7 text-gray-500 mr-2" fill="none" stroke="currentColor" stroke-width="2"
                      viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <span className="text-[10px]   text-purple-400">Back</span>
                </div>
                : <></>
              }
            </footer>

            <button className="flex flex-col items-center "
              onClick={() => setActive("home")}


            >
              <div style={getButtonStyle("home")}   >
                <Home className="h-10 w-6 text-purple-600" />

              </div>
              <span className="text-[10px] mt-1   text-purple-400">Home</span>
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
              onClick={() => setActive("Report")}
            >
              <div style={getButtonStyle("Report")}>
                <ClipboardList className="h-10 w-6 text-purple-600" />

              </div>
              <span className="text-[10px] mt-1 text-purple-400">Report</span>
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

        </div>
        <main className="flex-1 flex flex-col   shadow-2xl bg-white  pb-2  h-full  w-[70%] ">


          <div className=" ">

            {active === "home" && <HomePage />}
            {active === "Mail" && <MailForm
              setPoSentForApproval={setPoSentForApproval}
              poSentForApproval={poSentForApproval}
              emailId={emailId} currentId={currentId} userRole={userRole}
              singleUserPartyData={singleUserPartyData}
              setActive={setActive}

            />}
            {active === "Report" && <EmailReport attachments={attachments} />}
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












