import { getDateFromDateTime } from "../../../Utils/helper";

export default function Manufacture({ allData, setForm, setId, setPoNo }) {
  const stageDefinitions = [
    {key: "" , lable:"In Progress" , color : "bg-violet=500"},
    { key: "isSave", label: "Po Created", color: "bg-blue-500" },
    { key: "poSentForApproval", label: "Sent to Approval", color: "bg-orange-500" },
    { key: "isApproved" },
  ];
  const getStageColor = (stageKey, item) => {
    switch (stageKey) {
    case "":
         return  "bg-violet-300";
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
    <div className="bg-white shadow rounded-lg">
      <table className="min-w-full text-left overflow-x-auto">
        <thead className="bg-gray-100 text-gray-600 uppercase text-xs leading-normal border border-black-100">
          <tr>
            <th className="py-1 px-1">S No</th>
            <th className="py-1 px-1">PO Number</th>
            <th className="py-1 px-1">Order date</th>
            <th className="py-1 px-1">Manufacture</th>
             <th className="py-1 px-1">Assigned Date</th>

            <th className="py-1 px-1">Vendor</th>
            {/* <th className="py-1 px-6">Delivery date</th> */}
            <th className="py-1 px-1 text-end">PO Status</th>
          </tr>
        </thead>
        <tbody className="text-gray-700 text-xs">
          {(allData?.data || []).map((item, index) => {
            const completedStages = stageDefinitions
              .filter((stage) => item?.[stage.key])
              .reverse();
              {console.log(completedStages,'completedStages')}
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
                className="border-b transition-all duration-300 hover:shadow-lg hover:bg-gray-200 cursor-pointer"
                onClick={() => {
                  setForm(true);
                  setId(item?.id);
                  setPoNo(item?.docId);
                }}
              >
                <td className="p-1 font-semibold">{index + 1}</td>
                <td className="p-1">{item?.docId}</td>
                <td className="p-1">{getDateFromDateTime(item?.orderdate)}</td>
                <td className="p-1">{item?.Manufacture?.name}</td>
                <td className="p-1">{item?.createdAt  ?  getDateFromDateTime(item?.createdAt) : "" }</td>
                <td className="p-1">{item?.Vendor?.name}</td>
                {/* <td className="p-1">{item?.deliverydate  ?  getDateFromDateTime(item?.deliverydate)  :  ""} </td> */}
                

        
                <td className="p-1">
                  <div className="flex flex-row-reverse items-center overflow-x-auto">
                    {completedStages.map((stage, i) => {
                      const label = stage.key === "isApproved" ? approvalStatus : stage.label;
                      const color = getStageColor(stage.key, item);


                      return (
                        <div
                          key={i}
                          className={`flex items-center justify-center text-xs font-semibold text-white ${color} px-4 py-1 ${i !== 0 ? "mr-[-10px]" : ""
                            }`}
                          style={{
                            clipPath:
                              i === 0
                                ? "polygon(0 0, 100% 0, 100% 100%, 10px 100%, 0 100%)"
                                : "polygon(0 0, calc(100% - 10px) 0, 100% 50%, calc(100% - 10px) 100%, 0 100%)",
                          }}
                        >
                          {label}
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
  );
}
