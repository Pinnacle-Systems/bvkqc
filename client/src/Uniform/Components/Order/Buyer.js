import { useState } from "react";
import { findFromList, getDateFromDateTime } from "../../../Utils/helper"
import { Modal } from "../../../Inputs";


export default function Buyer({ allData, setForm, setId, setPoNo }) {


  const stageDefinitions = [
    { key: "sa", label: "1", title: "Po Received" },
    { key: "isSave", label: "2", title: "Assigned" },
    { key: "poSentForApproval", label: "3", title: "Sent to Aproval" },
    { key: "isApproved", label: "4", title: "Po Received" },
  ];
  const getProgressIndex = (item) => {
    const keys = stageDefinitions.map(s => s.key);
    let index = -1;

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (key === "isApproved") {
        if (item?.isApproved) index = i;
      } else {
        console.log(item?.[key] === true, 'item?.[key] === true');

        if (item?.[key] === true || item?.[key] === 1) {
          index = i;
        }
      }
    }

    return index;
  };

  return (
    <>

      <div className=" bg-white shadow rounded-lg ">
        <table className="min-w-full  text-left overflow-y-auto" >
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs leading-normal border border-black-100">
            <tr >
              <th className="py-1 px-6">S No</th>
              <th className="py-1 px-6" >Po Number </th>
              <th className="py-1 px-6">Po Date</th>
              <th className="py-1 px-6">Manufacture</th>
              <th className="py-1 px-6">Received Date</th>
              <th className="py-1 px-6">Vendor</th>
              <th className="py-1 px-6">Assigned Date</th>
              <th className="py-1 px-6">Delivery Date</th>
              <th className="py-1 px-6 ">Status</th>


            </tr>
          </thead>

          <tbody className="text-gray-700 text-xs">





            {(allData ? allData?.data : [])?.map((item, index) => {


              const rawStatus = item?.isApproved || "In Progress";

              const approvalStatusMap = {
                Approve: "Approved",
                Reject: "Rejected",
                Hold: "On Hold",
                "In Progress": "In Progress",
              };

              const approvalStatus = approvalStatusMap[rawStatus] || "In Progress";



              return (



                <tr className="border-b transition-all duration-300 hover:shadow-lg  hover:bg-gray-300 transform  table-row px-2"
                  onClick={() => {
                    setForm(true)
                    setId(item?.id)
                    setPoNo(item?.docId)
                  }}
                >
                  <td className="p-1">{parseInt(index) + 1}</td>
                  <td className="p-1">{item?.docId}</td>
                  <td className="p-1 text-center">{item?.createdAt ? getDateFromDateTime(item?.createdAt) : ""}</td>
                  <td className="p-1">{item?.Manufacture?.name}</td>
                  <td className="p-1 text-center">{item?.orderdate ? getDateFromDateTime(item?.orderdate) : ""} </td>

                  <td className="p-1">{item?.Vendor?.name}  </td>
                  <td className="p-1 text-center" >{item?.docDate ? getDateFromDateTime(item?.docDate) : ""}</td>
                  <td className="p-1 text-center">{item?.deliverydate ? getDateFromDateTime(item?.deliverydate) : ""}</td>
                  <td className="p-1">
                    <div className="relative w-full flex items-center justify-between px-2">

                      <div className="absolute  h-[3px]  bg-gray-300 z-0" />


                      <div
                        className="absolute top-1/2 h-[3px] bg-green-500 z-10 transition-all duration-300"
                        style={{
                          left: '16px',
                          width: `calc(${(getProgressIndex(item) / (stageDefinitions.length - 1)) * 100}% - 32px)`,
                          transform: 'translateY(-50%)',
                        }}
                      />




                      {stageDefinitions.map((stage, i) => {
                        const progressIndex = getProgressIndex(item);
                        const stageIndex = i;
                        const isReached = progressIndex >= stageIndex;

                        let bgColor = "bg-white text-gray-600";

                        if (stage.key === "isApproved") {
                          switch (item?.isApproved) {
                            case "Approve":
                              bgColor = "bg-green-500 text-white";
                              break;
                            case "Reject":
                              bgColor = "bg-red-500 text-white";
                              break;
                            case "Hold":
                              bgColor = "bg-yellow-400 text-black";
                              break;
                            default:
                              bgColor = "bg-gray-300 text-gray-600";
                          }
                        } else {
                          bgColor = isReached ? "bg-green-500 text-white" : "bg-gray-300 text-gray-600";

                        }

                        return (
                          <div key={i} className="relative z-20 flex flex-col items-center w-1/4 group">

                            <div className="absolute -top-8 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-30">
                              {stage.key === "isApproved"
                                ? item?.isApproved === "Approve"
                                  ? "Approved"
                                  : item?.isApproved === "Reject"
                                    ? "Rejected"
                                    : item?.isApproved === "Hold"
                                      ? "Hold"
                                      : "Pending"
                                : stage.title}

                            </div>


                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold shadow-md ${bgColor}`}
                            >
                              {stage.label}
                            </div>


                          </div>

                        );
                      })}
                    </div>
                  </td>




                </tr>


              )


            })}



          </tbody>
        </table>

      </div>

    </>
  )
}