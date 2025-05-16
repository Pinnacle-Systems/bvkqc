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
      <div className="flex font-sans bg-gary-300 px-0  h-[85%] w-full mt-3 first-line:" >

     
<aside className="flex flex-col items-center py-4 bg-gray-100 backdrop-blur-md w-20 h-full border-r border-gray-200 shadow-lg transition-all duration-300 ease-in-out">
  {menuItems.map(({ name, label, icon, action }) => (
    <button
      key={name}
      onClick={() => {
        setActive(name);
        action?.();
      }}
      className={`group relative flex flex-col items-center text-xs font-medium tracking-tight transition-all duration-300 ease-in-out ${
        active === name
          ? 'text-indigo-700'
          : 'text-gray-600 hover:text-indigo-600'
      } w-full px-1 py-2 mb-1`}
    >
      {/* Active Indicator */}
      {active === name && (
        <div className="absolute left-0 w-1 h-8 bg-indigo-600 rounded-r-md shadow-md" />
      )}

      {/* Icon Wrapper */}
      <div
        className={`relative p-1.5 rounded-md transition-transform duration-300 ${
          active === name
            ? 'bg-indigo-100 scale-105 shadow-md'
            : 'group-hover:bg-gray-200 group-hover:scale-100'
        }`}
      >
        <span className="w-5 h-5">{icon}</span>
        {active === name && (
          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-indigo-600 rounded-full border-2 border-white shadow-sm" />
        )}
      </div>

      {/* Label */}
      <span
        className={`mt-1 transition-all duration-300 ${
          active === name
            ? 'font-semibold scale-100 opacity-100'
            : 'opacity-80 group-hover:scale-100 group-hover:opacity-100'
        }`}
      >
        {label}
      </span>

      {/* Hover Effect */}
      <div className="absolute inset-0 -z-10 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-b from-white to-gray-100 shadow-md" />
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












