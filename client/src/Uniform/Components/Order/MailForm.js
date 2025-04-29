import { useState } from "react";
import { handleMailSendWithMultipleAttachments } from "../../../Utils/helper";
import { useGetUserByIdQuery } from "../../../redux/services/UsersMasterService";
import secureLocalStorage from "react-secure-storage";
import { Button, Card, CardContent, Input } from "@mui/material";
import { DELETE } from "../../../icons";
import { AttachFile } from "@mui/icons-material";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { useGetOrderByIdQuery, useGetOrderQuery } from "../../../redux/uniformService/OrderService";




export default function MailForm({fileName,poNo,id,singleData}) {
    console.log(singleData,"id");
    
 
  const [toEmail, setToEmail] = useState("");
  const [subject, setSubject] = useState('');
  const [Message,setMessage] =  useState("")
  const [excelData, setExcelData] = useState([]);

  console.log(excelData,"excelData")
    
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


      const handleViewExcel = async () => {
        console.log(fileName,"fileName")
        try {
            const fileUrl = `http://localhost:3000/uploads/Order_1745821075529.xlsx`;
            const response = await fetch(fileUrl);
            const blob = await response.blob();
            const arrayBuffer = await blob.arrayBuffer();

            const data = new Uint8Array(arrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            setExcelData(jsonData);
        } catch (error) {
            console.error("Error reading Excel file", error);
        }
    };
 
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
                 
                         <div className="">
                             <label className="block  text-black text-sm mb-1" htmlFor="subject">Subject:</label>
                             <input
                             type="text"
                             id="subject"
                             placeholder="Subject"
                             name="Subject" value={subject}  onChange={(e) => setSubject(e.target.value)}
                             className="w-2/4 text-black p-1 rounded border border-gray-600 placeholder-gray-400 focus:outline-none mb-3"
                 
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
                                         }}
                                     >
                                 Send
                                 </button>
                             </div>
                              <div>
                              <button onClick={() =>  handleViewExcel()} className="bg-blue-500 text-white px-4 py-2 rounded">
                                  View Excel Data
                              </button>
                                
                            </div>
{/* 
                 

                    
                 <table className="table-auto w-full mt-4">
                    <thead>
                        <tr>
                             {Object.keys(excelData[0]).map((key) => (
                                <th key={key} className="px-4 py-2">{key}</th>
                              ))}
                        </tr>
                    </thead>
                    <tbody>
                        {excelData.map((row, idx) => (
                            <tr key={idx}>
                                {Object.values(row).map((value, idy) => (
                                    <td key={idy} className="border px-4 py-2">{value}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table> 
   */}
     
                                   
                                             
                     </>     
                    
  );
}   