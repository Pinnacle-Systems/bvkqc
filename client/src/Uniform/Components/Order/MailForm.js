import { useState } from "react";
import { handleMailSendWithMultipleAttachments } from "../../../Utils/helper";
import { useGetUserByIdQuery } from "../../../redux/services/UsersMasterService";
import secureLocalStorage from "react-secure-storage";
import { Button, Card, CardContent, Input } from "@mui/material";
import { DELETE } from "../../../icons";





export default function MailForm() {
        const id = secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userId")

  const {
        data: singleData,isFetching: isSingleFetching,isLoading: isSingleLoading,} = useGetUserByIdQuery(id);

  const Model = "Mail Form";
  const [toEmail, setToEmail] = useState("");
  const [subject, setSubject] = useState('');
  const [Message,setMessage] =  useState("")

    
    const FromEmailAddress =  singleData?.data?.email
    const passskey  = singleData?.data?.passKey

    const [ccList, setCcList] = useState([""]);
    const handleCcChange = (index, value) => {
      const updated = [...ccList];
      updated[index] = value;
      setCcList(updated);
    };
  
    const addCcField = () => {
      setCcList([...ccList, ""]);
    };

    const removeCcField = (index) => {
        const updated = ccList.filter((_, i) => i !== index);
        setCcList(updated);
      };
console.log(ccList,"ccList")

  return (
                
                   <>
                     
        
                 

                    
                         <div className=" p-3 rounded mb-4 h-[90%] ">
                         <div>
                             <label className="block  text-black text-sm mb-1" htmlFor="to">To:</label>
                             <input
                             type="email"
                             id="to"
                             placeholder="recipient@example.com"
                             name="username" value={toEmail}  onChange={(e) => setToEmail(e.target.value)}
                             className="w-2/4 text-black p-1 rounded border border-gray-600 placeholder-gray-400 focus:outline-none"
                             />
                 
                         </div>
                         <div className="mb-4 flex flex-row gap-2 mt-3">
                            <div className="flex flex-col ">
                            <label className="block  text-black text-sm mb-1 mt-1">Cc:</label>
                            {ccList.map((cc, index) => (
                                <div key={index} className="flex items-center mb-1 ">
                                    <input
                                    className="flex-1 border border-gray-600 px-2 py-1 w-96 rounded"
                                    placeholder={`Cc recipient ${index + 1}`}
                                    value={cc}
                                    onChange={(e) => handleCcChange(index, e.target.value)}
                                    />
                                    <button
                                    onClick={() => removeCcField(index)}
                                    className="ml-2 text-red-600 text-sm hover:underline"
                                    >{DELETE}
                                    </button>
                                </div>
                                ))}
                            </div>
                            <div>
                            <button
                                          variant="ghost" className="text-blue-600" onClick={addCcField}>
                                  + Add Cc
                                 </button>
                            </div>
                                         
                        </div>
                 
                         <div>
                             <label className="block  text-black text-sm mb-1" htmlFor="subject">Subject:</label>
                             <input
                             type="text"
                             id="subject"
                             placeholder="Subject"
                             name="Subject" value={subject}  onChange={(e) => setSubject(e.target.value)}
                             className="w-2/4 text-black p-1 rounded border border-gray-600 placeholder-gray-400 focus:outline-none"
                 
                             />
                         </div>
                 
                         <div className="">
                             <label className="block  text-black text-sm mb-1" htmlFor="message">Message:</label>
                             <textarea
                             id="message"
                             rows="7"
                             placeholder="Write your message..."
                             name="Subject" value={Message}  onChange={(e) => setMessage(e.target.value)}
                 
                             className="w-2/4  text-black p-2 rounded border border-gray-600 placeholder-gray-400 focus:outline-none"
                             ></textarea>
                         </div>
                         </div> 
             
                 
                             <div className="mt-auto flex justify-center">
                                 <button className="bg-blue-600 hover:bg-blue-700 text-black px-4 py-2 rounded" 
                                         onClick={() => {
                                             handleMailSendWithMultipleAttachments(FromEmailAddress,toEmail,passskey,subject,Message);
                                             // handlUpdateMail()
                                         }}
                                     >
                                 Send
                                 </button>
                             </div>
                        
                                   
                                             
                     </>     
                    
  );
}   