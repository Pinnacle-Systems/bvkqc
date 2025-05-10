import { useEffect, useState } from "react";
import { findFromList, handleMailSendWithMultipleAttachments } from "../../../Utils/helper";
import { useGetUserByIdQuery } from "../../../redux/services/UsersMasterService";
import secureLocalStorage from "react-secure-storage";
import { Button, Card, CardContent, Input } from "@mui/material";
import { DELETE } from "../../../icons";
import { AttachFile } from "@mui/icons-material";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { toast } from 'react-toastify';
import { useGetOrderByIdQuery, useUploadMutation } from "../../../redux/uniformService/OrderService";
import { useGetEmailByIdQuery, useGetEmailQuery } from "../../../redux/uniformService/Email.Services";
import { getImageUrlPath } from "../../../Constants";
import { useGetPartyByIdQuery } from "../../../redux/services/PartyMasterService";




export default function MailForm({ currentId, emailId }) {

  const user = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userType"
  );
  console.log(user, 'user');
  const [toEmail, setToEmail] = useState("max@gmail.com");
  const [subject, setSubject] = useState('');
  const [Message, setMessage] = useState("")
  const [attachments, setattachments] = useState([]);
  const [filename, setfileName] = useState('')
  const [files, setFiles] = useState([]);
  const [userId, setUserId] = useState("")


  const id = currentId


  const { data: singleData, isLoading, isFetching } = useGetOrderByIdQuery(id, { skip: !id });
  const { data: partyData } = useGetPartyByIdQuery(userId, { skip: !userId });
  const FromEmailAddress = partyData?.data?.email;
  const passskey = singleData?.data?.passKey;

  useEffect(() => {
    setattachments(singleData?.data?.attachments)
    setUserId(singleData?.data?.vendorId)
  }, [singleData, isLoading, isFetching])


  const handleRemove = (indexToRemove) => {
    setattachments((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

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



  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files).map(file => ({
      filePath: file.name,
    })); setattachments((prevFiles) => [...prevFiles, ...selectedFiles]);
    setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
  };


  console.log(attachments, 'attachments')





  return (

    <>
      <div className="grid grid-cols-2">
        <div className="flex flex-col" >
          <div className=" p-1 rounded mb-4 h-[90%] w-full">
            <div>
              <label className="block  text-black text-sm mb-1" htmlFor="to">To:</label>
              <input
                type="email"
                id="to"
                placeholder="recipient@example.com"
                name="username" value={toEmail} onChange={(e) => setToEmail(e.target.value)}
                className="w-full border border-gray-300 px-3 py-1 rounded shadow-sm"
              />

            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Cc:</label>
              {ccList.map((cc, index) => (
                <div key={index} className="flex items-center space-x-2 mt-1">
                  <input
                    type="email"
                    placeholder={`Cc recipient ${index + 1}`}
                    value={cc}
                    onChange={(e) => handleCcChange(index, e.target.value)}
                    className="w-full border border-gray-300 px-3 py-1 rounded shadow-sm"
                  />
                  <button
                    onClick={() => removeCcField(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    🗑
                  </button>
                </div>
              ))}
              <button
                onClick={addCcField}
                className="mt-1 text-sm text-blue-600 hover:underline"
              >
                + Add Cc
              </button>
            </div>

            <div className="">
              <label className="block  text-black text-sm mb-1" htmlFor="subject">Subject:</label>
              <input
                type="text"
                id="subject"
                placeholder="Subject"
                name="Subject" value={subject} onChange={(e) => setSubject(e.target.value)}
                className="w-full border border-gray-300 px-3 py-1 rounded shadow-sm"

              />
            </div>

            <div className="">
              <label className="block  text-black text-sm mb-1" htmlFor="message">Message:</label>
              <textarea
                id="message"
                rows="7"
                placeholder="Write your message..."
                name="Subject" value={Message} onChange={(e) => setMessage(e.target.value)}

                className="w-full border border-gray-300 px-3 py-2 rounded shadow-sm"
              ></textarea>
            </div>




          </div>
          <div className="mt-auto flex justify-end w-full">
            <button className="bg-blue-600 hover:bg-blue-700 text-black px-4 py-2 rounded"
              onClick={() => {
                handleMailSendWithMultipleAttachments(FromEmailAddress, toEmail, passskey, subject, Message, filename, files);
              }}
            >
              Send
            </button>
          </div>
          {user === null ? <input
            type="file"
            multiple
            onChange={(e) => handleFileChange(e)}
            className="mb-4"
          /> : ''}


        </div>





        <div className="flex flex-col mt-5 p-5 gap-4">
          <div className="border-b border-gray-400 w-64">
            <label>Po Number: </label>
            {singleData?.data?.docId}
          </div>

          <div className="border-b border-gray-400 w-64">
            <label>Vendor: </label>
            {singleData?.data?.vendorName ?? 'N/A'}
            <ul>
              {files.map((file, index) => (
                <li key={index}>{file.name}</li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col mt-5 p-5 gap-4">


            <div className="flex flex-col gap-2 text-sm text-gray-700">
              {attachments?.map((item, index) => {
                const fileName = item.filePath?.split('/').pop();

                return (
                  <div key={index} className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h5v-2H4V5h12v3h2V5a2 2 0 00-2-2H4z" />
                      <path d="M14 11v2h-3v3h-2v-3H6v-2h3V8h2v3h3z" />
                    </svg>

                    <span>{fileName}</span>

                    <button
                      onClick={async () => {
                        const response = await fetch(getImageUrlPath(item.filePath));
                        const blob = await response.blob();
                        const url = window.URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = fileName;
                        document.body.appendChild(link);
                        link.click();
                        link.remove();
                        window.URL.revokeObjectURL(url);
                      }}
                      className="text-blue-600 underline"
                    >
                      Download
                    </button>
                    <button
                      onClick={() => handleRemove(index)}
                      className="text-red-500 underline text-sm"
                    >Remove</button>


                  </div>
                );
              })}
            </div>
          </div>

        </div>


      </div>
    </>









  );
}   