import { getDateFromDateTime } from "../../../Utils/helper";
import StatusSidebar from "../StatusSideBar";

export default function Manufacture({ allData, setForm, setId, setPoNo }) {
  const stageDefinitions = [
    { key: "sa", title: "Po Received", label: 'PR' },
    { key: "isSave", title: "Assigned", label: 'AS' },
    { key: "poSentForApproval", title: "Sent to Approval", label: 'SA' },
    { key: "isApproved", },
  ];
  const getProgressIndex = (item) => {
    console.log(typeof (item?.isSave, "item"))
    const keys = stageDefinitions.map(s => s.key);
    let index = -1;

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (key === "isApproved") {
        if (item?.isApproved) index = i;
      } else {
        console.log(typeof (item?.[key], "key"))
        if (Boolean(item?.[key]) === true || item?.[key] === 1) {
          index = i;
        }
      }
    }

    return index;
  };
  const getStageColor = (stageKey, item) => {
    switch (stageKey) {
      case "":
        return "bg-violet-300";
      case "isApproved":
        switch (item?.isApproved) {
          case "Reject":
            return "bg-red-500";
          case "Hold":
            return "bg-yellow-500";
          case "Approved":
            return "bg-green-500";
          default:
            return "bg-gray-300";
        }

      case "poSentForApproval":
        return item?.poSentForApproval ? "bg-yellow-400" : "bg-gray-300";

      case "isSave":
        return item?.isSave ? "bg-blue-500" : "bg-gray-300";

      default:
        return "bg-gray-300";
    }
  };

  return (
    <>
      <StatusSidebar />
        <div className="bg-[#F1F1F0] shadow rounded-lg">
      <table className="table-fixed w-full text-xs rounded-lg border border-gray-300 mt-6">
          <thead className="bg-white text-gray-800 border-b border-gray-300">
          <tr>
           <th className="text-[11px] font-semibold p-1 border border-gray-300 w-[50px]">S No</th>
           <th className="text-[11px] font-semibold p-1 border border-gray-300 w-[160px]">Po Number</th>
            <th className="text-[11px] font-semibold p-1 border border-gray-300 w-[100px]">Po Date</th>
           <th className="text-[11px] font-semibold p-1 border border-gray-300">Manufacture</th>
            <th className="text-[11px] font-semibold p-1 border border-gray-300 w-[100px]">Received Date</th>
           <th className="text-[11px] font-semibold p-1 border border-gray-300">Vendor</th>
           <th className="text-[11px] font-semibold p-1 border border-gray-300 w-[100px]">Assigned Date</th>
          <th className="text-[11px] font-semibold p-1 border border-gray-300 w-[100px]">Delivery Date</th>
           <th className="text-[11px] font-semibold p-1 border border-gray-300">PO Status</th>
          </tr>
        </thead>
            <tbody className="text-gray-700 text-xs">
          {(allData?.data || []).map((item, index) => {
            console.log(typeof (item?.isSave, "AlldatIsSave"))
            const completedStages = stageDefinitions
              .filter((stage) => item?.[stage.key])
              .reverse();
            const approvalStatus = item?.isApproved || "In Progress";

            const approvalColor = approvalStatus === "Approved"
              ? "bg-green-500 text-white"
              : approvalStatus === "Rejected"
                ? "bg-red-500 text-white"
                : approvalStatus === "Hold"
                  ? "bg-yellow-500 text-black"
                  : "bg-gray-300 text-black";

            return (
              <tr
                key={item?.id}
                   className={`border-b transition-all duration-300 text-[11px] hover:shadow-lg transform table-row px-2 ${
                    index % 2 === 0 ? "bg-gray-100" : "bg-gray-300"
                  }`}
                onClick={() => {
                  setForm(true);
                  setId(item?.id);
                  setPoNo(item?.docId);
                }}
              >
                <td className="p-1 font-semibold text-center border-r-2 text-[11px]">{index + 1}</td>
                <td className="p-1 border-r-2 text-center text-[11px]">{item?.docId}</td>
                <td className="p-1 border-r-2 text-center text-[11px]">{getDateFromDateTime(item?.orderdate)}</td>
                <td className="p-1 border-r-2 text-center text-[11px]">{item?.Manufacture?.name}</td>
                <td className="p-1 border-r-2 text-center text-[11px]">{item?.createdAt ? getDateFromDateTime(item?.createdAt) : ""}</td>
                <td className="p-1 border-r-2 text-center text-[11px]">{ item?.Vendor?.name }</td>
                <td className="p-1 border-r-2 text-center text-[11px]">{item?.isSave && item?.updatedAt ? getDateFromDateTime(item?.updatedAt) : ""}</td>
                <td className="p-1 border-r-2 text-center text-[11px]">{item?.deliverydate ? getDateFromDateTime(item?.deliverydate) : ""}</td>
                
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

                      // const label = item.isApproved.toUpperCase().slice(0, 2); 

                      return (
                        <div
                          key={i}
                          title={
                            stage.key === "isApproved"
                              ? ` ${item?.isApproved || "In Progress"}`
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
            );
          })}
        </tbody>
      </table>
    </div>
    </>
  
  );
}
