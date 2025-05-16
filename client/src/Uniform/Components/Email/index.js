import { useEffect, useState } from "react";
import { findFromList, getCommonParams, handleMailSendWithMultipleAttachments } from "../../../Utils/helper";
import { useGetUserByIdQuery } from "../../../redux/services/UsersMasterService";
import secureLocalStorage from "react-secure-storage";
import { Button, Card, CardContent, Input, Modal } from "@mui/material";
import { DELETE } from "../../../icons";
import { ArrowBack, AttachFile } from "@mui/icons-material";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { useGetOrderByIdQuery, useUpdateOrderMutation, useUploadMutation } from "../../../redux/uniformService/OrderService";
import { useGetEmailByIdQuery, useGetEmailQuery } from "../../../redux/uniformService/Email.Services";
import { getImageUrlPath } from "../../../Constants";
import { useGetPartyByIdQuery } from "../../../redux/services/PartyMasterService";
import { LongDropdownInput } from "../../../Inputs";
import ArtDesignReport from "../MultipleAttachment/ArtDesignReport";
import { useDispatch } from "react-redux";
import { Backpack, DeleteIcon, Send } from "lucide-react";




export default function MailForm({ currentId, emailId, userRole, singleUserPartyData, poSentForApproval, setPoSentForApproval, setActive }) {

  const user = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userType"
  );
  const [toEmail, setToEmail] = useState(["manojbharathi00@gmail.com"]);
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
  const [formReport, setFormReport] = useState(false)
  const [poNumber, setPoNumber] = useState()

  const id = currentId


  const SyncformwithDb = () => {
    setToEmail("");
    setSubject("");
    setMessage("");
    setCcList([""]);
    setattachments([]);
    setfileName("");
    setFromAddress('');
    setSendorName("");
    setReceiverName("");
  }


  const { data: Emaildata, isLoading: isEmailLoading, isFetching: isEmailFetching } = useGetEmailByIdQuery(emailId, { skip: !emailId });


  const { data: SigleOrderdata, isLoading, isFetching } = useGetOrderByIdQuery(id, { skip: !id });
  const { data: partyData } = useGetPartyByIdQuery(userId, { skip: !userId });
  const FromEmailAddress = partyData?.data?.email;
  const passskey = SigleOrderdata?.data?.passKey;

  const [updateData] = useUpdateOrderMutation();

  const styleNumber = SigleOrderdata?.data?.orderBillItems?.[0]?.styleCode




  useEffect(() => {
    setPoNumber(SigleOrderdata?.data?.docId)
    setSubject(SigleOrderdata?.data?.docId)
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
  }, [Emaildata, isEmailLoading, isEmailFetching]);

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

const handleSubmitCustom = async (callback, data, text) => {
  try {
    const formData = new FormData();
    for (let key in data) {
      if (key === 'attachments') {
        formData.append(key, JSON.stringify(data[key].map(i => ({ ...i }))));
      } else {
        formData.append(key, data[key]);
      }
    }

    let returnData;
    if (text === "Updated") {
      returnData = await callback({ id, body: formData }).unwrap();
    } else {
      returnData = await callback(formData).unwrap();
    }
   
   
  } catch (error) {
    alert(`An error occurred: ${error.message}`);
    console.log("handle", error);
  }
};

  const MailIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  );

  const PlusCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  const XCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  const PaperClipIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
    </svg>
  );

  const PhotoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  );

  const PaperAirplaneIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
    </svg>
  );

  const saveData = () => {

    if (id) {
      console.log(currentId, 'current');
      handleSubmitCustom(updateData, data, "Updated")


    }


  }
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true); // Show loader
    try {
      await saveData();
      setPoSentForApproval(true);
      await handleMailSendWithMultipleAttachments(FromEmailAddress, toEmail, passskey, subject, message, fileName, attachments, ccList);
      await SyncformwithDb();
    } catch (error) {
      console.error("Error occurred:", error);
    } finally {
      setLoading(false); // Hide loader
    }
  };


  return (

    <>
      <div className="grid grid-cols-3 gap-3 h-full bg-gray-100 p-3 overflow-hidden">
        {loading && (
          <div className="fixed inset-0 z-50 bg-white bg-opacity-80 flex items-center justify-center">
            <div className="flex items-center gap-3">
              <svg
                className="animate-spin h-8 w-8 text-blue-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                />
              </svg>
              <span className="text-sm text-gray-700 font-medium">Mail Sending, please wait...</span>
            </div>
          </div>
        )}

        <Modal
          isOpen={formReport}
          onClose={() => setFormReport(false)}
          widthClass={"px-2 h-[90%] w-[70%]"}
        >
          <ArtDesignReport
            setFormReport={setFormReport}
            tableWidth="100%"
            setAttachments={setattachments}
            attachments={attachments}
          />
        </Modal>

  <div className="col-span-2 h-full flex flex-col gap-3 overflow-hidden">
  <div className="flex-1 bg-white rounded-lg shadow-sm p-4 overflow-y-auto">
  <div className="flex items-center space-x-2 pb-3 border-b border-gray-200 mb-4">
    <div className="p-1.5 bg-blue-50 rounded-full">
      <MailIcon className="w-5 h-5 text-blue-600" />
    </div>
    <h2 className="text-lg font-semibold text-gray-800">New Mail</h2>
  </div>

  <div className="space-y-4">
    <div className="flex border rounded-md border-gray-300">
      <label className="w-20 text-sm text-gray-600 p-2 border-r border-gray-300 bg-gray-50 ">To</label>
      <input
        type="email"
        placeholder="Recipient email"
        value={toEmail}
        onChange={(e) => setToEmail(e.target.value)}
        className="flex-1 px-3  text-sm focus:outline-none bg-white"
      />
    </div>

 <div className="space-y-1 mt-2">
  {ccList.map((cc, index) => (
    <div key={index} className="flex border rounded-md border-gray-300">
      <label className="w-20 text-sm text-gray-600 p-2 border-r border-gray-300 bg-gray-50">
        CC
      </label>
      <textarea
        rows={1} 
        placeholder={`cc${index + 1}@example.com`}
        value={cc}
        onChange={(e) => handleCcChange(index, e.target.value)}
        onInput={(e) => {
          e.target.style.height = 'auto'; 
          e.target.style.height = `${e.target.scrollHeight}px`;
        }}
        className="flex-1 px-3 text-sm focus:outline-none bg-white resize-none  pt-2 overflow-hidden"
      />
    </div>
  ))}
</div>


    <div className="flex border rounded-md border-gray-300">
      <label className="w-20 text-sm text-gray-600 p-2 border-r border-gray-300 bg-gray-50">Subject</label>
      <input
        type="text"
        placeholder="Email subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        className="flex-1 px-3  text-sm focus:outline-none bg-white"
      />
    </div>

    <div className="border rounded-md border-gray-300 h-[170px]">
      <label className="block text-sm text-gray-600 p-2 border-b border-gray-300 bg-gray-50">Message</label>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Compose your message..."
        className="w-full h-[calc(100%-40px)] px-3  text-sm focus:outline-none resize-none"
      />
    </div>
  </div>

  <div className="flex justify-between items-center pt-4 mt-4 border-t border-gray-200">
    {/* <div className="flex items-center gap-2">
      <button className="p-2 hover:bg-gray-100 rounded-md text-gray-600 border border-gray-300">
        <PaperClipIcon className="w-5 h-5" />
      </button>
      
    </div> */}
  <button className="bg-blue-600 text-white px-4 py-1 rounded-md hover:bg-blue-700 transition-colors text-[12px] font-medium flex items-center space-x-1.5"
       onClick={() => {
            handleMailSendWithMultipleAttachments(FromEmailAddress, toEmail, passskey, subject, message, fileName, attachments, ccList,setActive);
              saveData()
                 if ( userRole === "MANUFACTURE") {
              setPoSentForApproval(true)}
              handleMailSendWithMultipleAttachments(FromEmailAddress, toEmail, passskey, subject, message, fileName, attachments, ccList);
              SyncformwithDb()
            }}

              >
                <PaperAirplaneIcon className="w-4 h-4" />
                <span>Send</span>

              </button>
            </div>
          </div>

          <div className="flex justify-between">
            <div className="flex w-full items-center">
              <button
                className="px-3 py-1.5 text-sm bg-gradient-to-r from-blue-800 to-red-600 text-white font-medium rounded shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-300 ease-in-out flex items-center gap-2"
                onClick={() => setActive("order")}
              >
                <ArrowBack />
                Back
              </button>
            </div>
          </div>
        </div>

  {/* PO Details Column */}
  <div className="h-[533px] flex flex-col gap-3 ">
    <div className="flex-1 bg-white rounded-lg shadow-sm p-6 overflow-y-auto">
      <div className="flex flex-col space-y-1 pb-3 border-b border-gray-200">
        <div className="flex items-center justify-between"> 
          <span className="text-xs font-medium text-gray-600">PO Number</span>
          {poNumber &&
          <span className="text-xs font-bold text-white bg-gray-800 border border-gray-800 rounded px-2 py-1">
  {`${poNumber} (${styleNumber})`}
</span>
          }


              </div>
            </div>

            <div className="flex flex-col space-y-3 mt-3">
              {userRole === "MANUFACTURE" && (
                <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                  <span className="text-xs font-medium text-gray-600">Vendor</span>
                  <span className="text-xs text-gray-800">{receiverName}</span>
                </div>
              )}

              {userRole === "VENDOR" && (
                <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                  <span className="text-xs font-medium text-gray-600">Manufacturer</span>
                  <span className="text-xs text-gray-800">{sendorName}</span>
                </div>
              )}

              {!userRole && (
                <>
                  <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                    <span className="text-xs font-medium text-gray-600">Manufacturer</span>
                    <span className="text-xs text-gray-800">{sendorName}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                    <span className="text-xs font-medium text-gray-600">Vendor</span>
                    <span className="text-xs text-gray-800">{receiverName}</span>
                  </div>
                </>
              )}
            </div>

            <div className="mt-4">
              <h3 className="text-xs font-semibold text-gray-700 mb-3">Attachments</h3>

              <div className="flex flex-col gap-2">
                {attachments?.map((item, index) => {
                  const fileName = item.filePath?.split('/').pop();
                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 bg-white rounded-md border border-gray-200">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h5v-2H4V5h12v3h2V5a2 2 0 00-2-2H4z" />
                            <path d="M14 11v2h-3v3h-2v-3H6v-2h3V8h2v3h3z" />
                          </svg>
                        </div>

                        <span className="text-xs text-gray-700 font-medium truncate max-w-[200px]">
                          {fileName}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
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
                          className="text-blue-600 hover:text-blue-800 text-xs font-medium flex items-center gap-1 px-3 py-1.5 rounded-md bg-blue-50 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </button>

                        <button
                          onClick={() => handleRemove(index)}
                          className="text-red-600 hover:text-red-800 text-xs font-medium flex items-center gap-1 px-3 py-1.5 rounded-md bg-red-50 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

    </>


  );
}   