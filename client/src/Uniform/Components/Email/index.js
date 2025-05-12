import { useEffect, useState } from "react";
import { findFromList, getCommonParams, handleMailSendWithMultipleAttachments } from "../../../Utils/helper";
import { useGetUserByIdQuery } from "../../../redux/services/UsersMasterService";
import secureLocalStorage from "react-secure-storage";
import { Button, Card, CardContent, Input, Modal } from "@mui/material";
import { DELETE } from "../../../icons";
import { AttachFile } from "@mui/icons-material";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { toast } from 'react-toastify';
import { useGetOrderByIdQuery, useUpdateOrderMutation, useUploadMutation } from "../../../redux/uniformService/OrderService";
import { useGetEmailByIdQuery, useGetEmailQuery } from "../../../redux/uniformService/Email.Services";
import { getImageUrlPath } from "../../../Constants";
import { useGetPartyByIdQuery } from "../../../redux/services/PartyMasterService";
import { LongDropdownInput } from "../../../Inputs";
import ArtDesignReport from "../MultipleAttachment/ArtDesignReport";
import { useDispatch } from "react-redux";




export default function MailForm({ currentId, emailId, userRole, singleUserPartyData, poSentForApproval, setPoSentForApproval }) {

  const user = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userType"
  );
  console.log(user, 'user');
  const [toEmail, setToEmail] = useState("manojbharathi00@gmail.com");
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState("")
  const [ccList, setCcList] = useState(['']);
  const [attachments, setattachments] = useState([]);
  const [fileName, setfileName] = useState('')
  const [files, setFiles] = useState([]);
  const [userId, setUserId] = useState("")
  const [fromAddress, setFromAddress] = useState("")
  const [sendorName, setSendorName] = useState("")
  const [receiverName, setReceiverName] = useState("")
  const [sendorId, setSendorId] = useState("")
  const [receiverId, setReceiverId] = useState("")
  const dispatch = useDispatch()
  const [formReport, setFormReport] = useState(false)
  const [multiAttach, setmultiAttach] = useState([])

  const id = currentId



  const { data: Emaildata } = useGetEmailByIdQuery(emailId, { skip: !emailId });





  const { data: SigleOrderdata, isLoading, isFetching } = useGetOrderByIdQuery(id, { skip: !id });
  const { data: partyData } = useGetPartyByIdQuery(userId, { skip: !userId });
  const FromEmailAddress = partyData?.data?.email;
  const passskey = SigleOrderdata?.data?.passKey;



  const [updateData] = useUpdateOrderMutation();


  useEffect(() => {
    setUserId(SigleOrderdata?.data?.vendorId)
    setattachments(emailId ? [] : SigleOrderdata?.data?.attachments)
    setfileName(Emaildata?.data?.poExcelFileName)
    setReceiverName(SigleOrderdata?.data?.Vendor?.name)
    setSendorName(SigleOrderdata?.data?.Manufacture?.name)
    setSendorId(SigleOrderdata?.data?.Manufacture?.id)
    setReceiverId(SigleOrderdata?.data?.Vendor?.id)
  }, [SigleOrderdata, isLoading, isFetching])

  useEffect(() => {
    if (Emaildata?.data?.poExcelFileName) {
      setattachments([{ filePath: Emaildata.data.poExcelFileName }]);
    }
  }, [Emaildata]);



  useEffect(() => {
    if (Emaildata?.data?.poExcelFileName) {
      setattachments([{ filePath: Emaildata.data.poExcelFileName }]);
    }
  }, [Emaildata]);

  useEffect(() => {
    setFromAddress(singleUserPartyData?.data?.mailId)
  }, [singleUserPartyData])


  const handleRemove = (indexToRemove) => {
    setattachments((prev) => prev.filter((_, i) => i !== indexToRemove));
  };
  const addCcField = () => {
    setCcList([...ccList, ""]);
  };

  const handleCcChange = (index, value) => {
    const updated = [...ccList];
    updated[index] = value;
    setCcList(updated);
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

  const data = {
    mailTransaction: true, orderId: id,
    fromAddress, sendorName, sendorId, toEmail, receiverName, receiverId, subject, message, cc: ccList.map(item => item).join(','), attachments, fileName, userId, poSentForApproval
  }
  console.log(poSentForApproval, 'poSentForApproval');
  console.log("mailTransaction", id,
    fromAddress, sendorName, sendorId, toEmail, receiverName, receiverId, subject, message, ccList, attachments, fileName, userId);

  const handleSubmitCustom = async (callback, data, text) => {

    try {
      const formData = new FormData();
      for (let key in data) {
        // if (key === "attachments") {
        //   data[key].forEach(item =>
        //     formData.append(key, JSON.stringify(item))
        //   );
        // }
        if (key === 'attachments') {
          formData.append(key, JSON.stringify(data[key].map(i => ({ ...i }))));
          // data[key].forEach(option => {
          //   if (option?.filePath instanceof File) {
          //     formData.append('images', option.filePath);
          //   }
          // });
        }
        else {
          formData.append(key, data[key]);
        }
      }


      let returnData;
      if (text === "Updated") {
        returnData = await callback({ id, body: formData }).unwrap();
      } else {
        returnData = await callback(formData).unwrap();
      }
      if (returnData.statusCode === 0) {


        toast.success(text + "Successfully");
      } else {
        toast.error(returnData?.message);
      }

    } catch (error) {
      console.log("handle", error);
    }
  };


  // const handleSubmitCustom = async (callback, data, text) => {
  //   try {
  //     let returnData = await callback(data).unwrap();
  //     if (returnData.statusCode === 0) {
  //       // setId(returnData?.data?.id)
  //       toast.success(text + "Successfully");
  //       dispatch({
  //         type: `partyMaster/invalidateTags`,
  //         payload: ['Party'],
  //       });
  //     } else {
  //       toast.error(returnData?.message)
  //     }
  //   } catch (error) {
  //     console.log(error)
  //   }

  // }

  const saveData = () => {

    if (id) {
      console.log(currentId, 'current');
      handleSubmitCustom(updateData, data, "Updated")

    }
    // else {

    //   handleSubmitCustom(addData, data, "Added")

    // }

  }





  return (

    <>
      <div className="grid grid-cols-2">
        <Modal isOpen={formReport}
          onClose={() => setFormReport(false)} widthClass={"px-2 h-[90%] w-[70%]"}

        >
          <ArtDesignReport
            setFormReport={setFormReport}
            tableWidth="100%"
            // data={allData?.data}
            // onClick={(id) => {
            // setId(id);
            // setFormReport(false);
            // }
            // }
            setAttachments={setattachments}
            attachments={attachments}

          />
        </Modal>
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
                name="Subject" value={message} onChange={(e) => setMessage(e.target.value)}

                className="w-full border border-gray-300 px-3 py-2 rounded shadow-sm"
              ></textarea>
            </div>




          </div>

          <div className="flex w-full items-center">
            {/* {userRole === "" ?


              <div className=" p-1">
                <button
                  className="relative px-1 text-[14px] bg-gradient-to-r from-blue-800 to-red-600  text-white font-medium rounded shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-300 ease-in-out overflow-hidden"
                  onClick={() => setFormReport(true)}
                >
                  <span className="absolute inset-0 bg-white opacity-10 blur-sm rounded-xl"></span>
                  <span className="relative z-10"> Attach  Design</span>
                </button>
              </div> : ''} */}

            <div className=" flex justify-end w-full">
              <button className="relative px-1 text-[14px] bg-gradient-to-r from-blue-800 to-red-600  text-white font-medium rounded shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-300 ease-in-out overflow-hidden"
                onClick={() => {
                  saveData()
                  setPoSentForApproval(true)
                  handleMailSendWithMultipleAttachments(FromEmailAddress, toEmail, passskey, subject, message, fileName, files, ccList);
                }}

              >

                Send
              </button>
            </div>
          </div>
        </div>





        <div className="flex flex-col mt-5 p-5 gap-4">
          <div className="border-b border-gray-400 w-64">
            <label>Po Number: </label>
            {SigleOrderdata?.data?.docId}
          </div>

          <div className="border-b border-gray-400 w-64">
            <label>Vendor: </label>
            {SigleOrderdata?.data?.vendorName ?? 'N/A'}
            <ul>
              {files.map((file, index) => (
                <li key={index}>{file.name}</li>
              ))}
            </ul>
          </div>

          <span>{Emaildata?.data?.poExcelFileName}</span>
          <div className="flex flex-col mt-5 p-5 gap-4">


            <div className="flex flex-col gap-2 text-sm text-gray-700">
              {attachments?.map((item, index) => (
                // const fileName = item.filePath?.split('/').pop();

                <div key={index} className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h5v-2H4V5h12v3h2V5a2 2 0 00-2-2H4z" />
                    <path d="M14 11v2h-3v3h-2v-3H6v-2h3V8h2v3h3z" />
                  </svg>

                  <span>{item.filePath?.split('/').pop()}</span>

                  <button
                    onClick={async () => {
                      const response = await fetch(getImageUrlPath(item.filePath));
                      const blob = await response.blob();
                      const url = window.URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      // link.download = fileName;
                      link.download = item.filePath?.split('/').pop();
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

              ))}
            </div>
          </div>

        </div>


      </div>
    </>


  );
}   