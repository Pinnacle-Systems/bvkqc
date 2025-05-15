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
    backgroundColor: active === name ? "##212E89" : "transparent",
    borderRadius: "8px",
    Padding: "4px"
  });

  const menuItems = [
    { name: 'home', label: 'Home', icon: <Home className="h-6 w-6" /> },
    { name: 'order', label: 'Order', icon: <RiOrderPlayFill className="h-6 w-6" />, action: () => setisOpen(true) },
    { name: 'Mail', label: 'Mail', icon: <MessageCircle className="h-6 w-6" /> },
    { name: 'Report', label: 'Report', icon: <ClipboardList className="h-6 w-6" /> },
    { name: 'More', label: 'OrderImport', icon: <MoreHorizontal className="h-6 w-6" /> },
  ];


 return (



    <>



      <div className="flex font-sans bg-gary-300 px-0  h-[90vh]  mt-3 first-line:" >

        {/* <div className="flex flex-col ">
          <aside className=" flex flex-col items-center py-4 h-full  bg-zinc-300  ">
        

            <button className="flex flex-col items-center "
              onClick={() => setActive("home")}


            >
              <div style={getButtonStyle("home")}   >
                <Home className="h-10 w-6 maxBlue" />

              </div>
              <span className="text-[10px] mt-1 maxBlue">Home</span>
            </button>

            <button className="flex flex-col items-center "
              onClick={() => {
                setActive("order")
                setisOpen(true)
              }}


            >
              <div style={getButtonStyle("order")}   >
                <RiOrderPlayFill className="h-10 w-6 text-indigo-600" />

              </div>
              <span className="text-[10px] mt-1   maxBlue">Order</span>
            </button>



            <button className="flex flex-col items-center"
              onClick={() => setActive("Mail")}
            >
              <div style={getButtonStyle("Mail")}>
                <MessageCircle className="h-10 w-6 text-indigo-600" />

              </div>
              <span className="text-[10px] mt-1  maxBlue">Mail</span>
            </button>
            <button className="flex flex-col items-center"
              onClick={() => setActive("Report")}
            >
              <div style={getButtonStyle("Report")}>
                <ClipboardList className="h-10 w-6 text-indigo-600" />

              </div>
              <span className="text-[10px] mt-1  maxBlue">Report</span>
            </button>


            <button className="flex flex-col items-center"
              onClick={() => setActive("More")}
            >
              <div style={getButtonStyle("More")}>
                <MoreHorizontal className="h-10 w-7 text-indigo-600 " />
              </div>
              <span className="text-[10px] mt-1  maxBlue">OrderImport</span>

            </button>


          </aside>

        </div> */}
          <aside className="flex flex-col items-center py-6 bg-gray-300 w-14  space-y-3 h-[90vh] ">
                {menuItems.map(({ name, label, icon, action }) => (
                  <button
                    key={name}
                    onClick={() => {
                      setActive(name);
                      if (action) action();
                    }}
                    className={`flex flex-col items-center text-[10px] transition-colors ${
                      active === name ? 'text-[#303AB2]' : 'text-gray-600'
                    } hover:text-[#303AB2]`}
                  >
                    <div className={`p-2 rounded-full ${active === name ? 'bg-white shadow' : ''}`}>
                      {icon}
                    </div>
                    <span className="mt-1">{label}</span>
                  </button>
                ))}
    </aside>
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
            {active === "order" && <Order setEmailId={setEmailId}  active={active}
              setActive={setActive} setForm={setForm} form={form} setMailform={setMailform} setCurrentId={setCurrentId}

            />}

          </div>

        </main>


      </div>





    </>










  )

}












