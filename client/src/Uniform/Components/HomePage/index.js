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
import EmailReport from "../Email/EmailReport"export default function Form() {
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

     
 <aside className="flex flex-col items-center py-4 bg-gradient-to-b from-white to-gray-50 w-14 h-full shadow-[5px_0_15px_-5px_rgba(0,0,0,0.1)] border-r border-gray-100">
  {menuItems.map(({ name, label, icon, action }) => (
    <button
      key={name}
      onClick={() => {
        setActive(name);
        action?.();
      }}
      className={`group flex flex-col items-center text-[0.6rem] font-medium tracking-tight transition-all duration-200 ease-in-out ${
        active === name 
          ? 'text-primary-600' 
          : 'text-gray-500 hover:text-gray-700'
      } w-full px-1 py-1.5 mb-1 relative`}
    >
      {active === name && (
        <div className="absolute -left-1 w-1 h-4 bg-gradient-to-b from-primary-500 to-primary-400 rounded-r-full shadow-[2px_0_4px_-1px_rgba(0,0,0,0.1)]" />
      )}

      <div className={`relative p-1.5 rounded-lg transition-all duration-300 ${
        active === name 
          ? 'bg-primary-500/10 scale-[1.15]' 
          : 'group-hover:bg-gray-200/20 group-hover:scale-105'
      }`}>
        {icon}
        {active === name && (
          <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary-500 rounded-full border border-white shadow-sm" />
        )}
      </div>
      
      <span className={`mt-1 transition-transform duration-300 ${
        active === name ? 'font-bold scale-100' : 'scale-90 opacity-80'
      }`}>
        {label}
      </span>

      {/* Hover effect line */}
      <div className="absolute bottom-0 w-6 h-[2px] bg-primary-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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












