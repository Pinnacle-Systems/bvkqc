import { useState } from "react";
import { findFromList, getDateFromDateTime } from "../../../Utils/helper"
import { Modal } from "../../../Inputs";


export default function Buyer({ allData, setForm, setId, setPoNo }) {


  const stageDefinitions = [
    { key: "sa", title: "Po Received", label: 'PR' },
    { key: "isSave", title: "Assigned", label: 'AS' },
    { key: "poSentForApproval", title: "Sent to Approval", label: 'SA' },
    { key: "isApproved", },
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
                  <td className="p-1 text-center" >{item?.updatedAt ? getDateFromDateTime(item?.updatedAt) : ""}</td>
                  <td className="p-1 text-center">{item?.deliverydate ? getDateFromDateTime(item?.deliverydate) : ""}</td>
                  <td className="p-1">
                    <div className="flex items-center space-x-0">
                      {stageDefinitions.map((stage, i) => {
                        const progressIndex = getProgressIndex(item);
                        const isAlwaysActive = i === 0;
                        const isReached = isAlwaysActive || progressIndex >= i;

                        let bgColor = "bg-gray-300 text-gray-600 shadow-inner";
                        let gradient = "";

                        if (stage.key === "isApproved") {
                          switch (item?.isApproved) {
                            case "Approve":
                              bgColor = "bg-green-600 text-white";
                              gradient = "bg-gradient-to-br from-green-400 to-green-700";
                              break;
                            case "Reject":
                              bgColor = "bg-red-600 text-white";
                              gradient = "bg-gradient-to-br from-red-400 to-red-700";
                              break;
                            case "Hold":
                              bgColor = "bg-yellow-400 text-black";
                              gradient = "bg-gradient-to-br from-yellow-300 to-yellow-500";
                              break;
                            default:
                              bgColor = "bg-gray-300 text-gray-600";
                              gradient = "";
                          }
                        } else {
                          if (isReached) {
                            bgColor = "bg-green-600 text-white";
                            gradient = "bg-gradient-to-br from-green-400 to-green-700";
                          }
                        }

                        // const label = item.isApproved.toUpperCase().slice(0, 2); // short code

                        return (
                          <div
                            key={i}
                            title={
                              stage.key === "isApproved"
                                ? `Approval Status: ${item?.isApproved || "In Progress"}`
                                : stage.title
                            }
                            className={`relative flex items-center justify-center text-xs font-semibold ${bgColor} ${gradient} px-4 py-1 shadow-md ${i !== 0 ? "mr-[-10px]" : ""
                              }`}
                            style={{
                              clipPath:
                                "polygon(0 0, calc(100% - 10px) 0, 100% 50%, calc(100% - 10px) 100%, 0 100%)",
                              zIndex: 50 - i,
                            }}
                          >
                            {stage.label
                              ? stage.label
                              : i === stageDefinitions.length - 1
                                ? item?.isApproved === "Approve"
                                  ? "A"
                                  : item?.isApproved === "Reject"
                                    ? "R"
                                    : item?.isApproved === "Hold"
                                      ? "H"
                                      : "N"
                                : ""}
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