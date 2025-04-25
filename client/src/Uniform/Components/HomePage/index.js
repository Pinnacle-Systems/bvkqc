import React, {  useState, } from "react";
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



const SlackStyleUI = () => {

      const [active, setActive] = useState("home");
      const [isOpen,setisOpen]  =  useState(false)
      const [form,setForm] = useState(false)
      const [mailForm,setMailform] = useState(false)

      const getButtonStyle = (name) => ({
         backgroundColor: active === name ? "#E9D5FF" : "transparent", // light purple bg
         borderRadius: "8px", // optional: adds rounding
         Padding: "2px" // optional: improves click area
         
       });
 
       const userRole = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "userRole"
      );

console.log(isOpen,active,"active");


       return (



        <>
        
                  <div className="flex font-sans bg-gary-300 py-2 px-0  h-[85%] w-full">
        
                            <aside className="w-[4%] flex flex-col items-center py-4 space-y-6   h-[100%]   rounded-2xl  ">
        
                                      <button className="flex flex-col items-center "
                                              onClick={() => setActive("home")}
                                         
        
                                      >
                                        <div style={getButtonStyle("home")}   >
                                        <Home className="h-10 w-6 text-purple-600   "    />
        
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
                                        <RiOrderPlayFill className="h-10 w-6 text-purple-600   "    />
        
                                        </div>
                                        <span className="text-[10px] mt-1  text-purple-400">Order</span>
                                      </button>
                                  
                                      
        
                                      <button className="flex flex-col items-center"
                                       onClick={() => setActive("DMs")}
                                       >
                                        <div style={getButtonStyle("DMs")}>
                                        <MessageCircle className="h-10 w-6 text-purple-600" />
        
                                        </div>
                                        <span className="text-[10px] mt-1 text-purple-400">DMs</span>
                                      </button>
        
                                  
        
                                      <button className="flex flex-col items-center"
                                       onClick={() => setActive("More")}
                                        >
                                        <div style={getButtonStyle("More")}>
                                        <MoreHorizontal className="h-10 w-7 text-purple-600 " />
        
                                        </div>
                                        <span className="text-[10px] mt-1 text-purple-400">More</span>
                                      </button>
        
                           
                           </aside>
        
               <main className="flex-1 flex flex-col  p-6 shadow-2xl bg-white rounded-2xl pb-2  h-[100%] overflow-x-auto w-[50%] ">
                {active  === "order"  &&   form === true  ||   mailForm === true ?
               <div className="pb-2">
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
                    </div>     :  <></>
                    }     
                {/* <div class="flex items-center justify-end  bg-white  rounded-md w-full max-w-3xl mx-auto  ">
                                    
                    <div class="flex items-center border rounded-md px-3 py-1 w-full max-w-md">
                                  <svg class="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" stroke-width="2"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                      d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
                                  </svg>
                              <input type="text" placeholder="Search "
                                class="w-full outline-none bg-transparent text-sm placeholder-gray-500" />
                    </div>

                    <div class="ml-3">
                      <button
                      onClick={() => setActive("Activity")}
                      style={getButtonStyle("Activity")} 
                      >
                                <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" stroke-width="2"
                                  viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round"
                                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                      
                          <span
                            class="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 rounded-full">
                            </span>
                          
                      </button>
                  
                    </div>
               
                </div> */}
                <div>

                          {active === "home"    && <HomePage/>   } 
                      { active  ===  "DMs"  &&  <Message/>  }     
                     {active === "Activity" && <Activity />}
                    {active === "More" && <More />}
                  {active === "order"  &&  isOpen  &&  <Order   setisOpen={setisOpen}   
                  setActive={setActive}   setForm={setForm}   form={form}   mailForm={mailForm}  setMailform={setMailform} />}
                 
                 </div>          
                           
                 </main>
               </div>


                     
                     
                  
                  
             
                               
                                                     
        
        
                   
        
            
             
           </> 
       )
        
    }
    export default SlackStyleUI;




    
  
    
    
  


