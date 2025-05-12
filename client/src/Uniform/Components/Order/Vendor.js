import { findFromList, getDateFromDateTime } from "../../../Utils/helper"

export default function Vendor({ allData, setForm, setId, setPoNo, partyData, poSentForApproval }) {
  return (
    <>
      <div className=" bg-white shadow rounded-lg">
        <table className="min-w-full text-left overflow-x-auto" >
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs leading-normal border border-black-100">
            <tr >
              <th className="py-3 px-6">S No</th>
              <th className="py-3 px-6">Po Number</th>
              <th className="py-3 px-6">Order date</th>
              <th className="py-3 px-6">Delivery date</th>
              <th className="py-3 px-6">Manufacture</th>
              <th className="py-3 px-6">Approval Status</th>


            </tr>
          </thead>

          <tbody className="text-gray-700 text-xs">





            {(allData ? allData?.data : [])?.map((item, index) =>




              <tr className="border-b transition-all duration-300 hover:shadow-lg  hover:bg-gray-300 transform  table-row "
                onClick={() => {
                  setForm(true)
                  setId(item?.id)
                  setPoNo(item?.docId)
                }}
              >
                <td className="p-2 font-semibold">{parseInt(index) + 1}</td>
                <td className="p-2">{item?.docId}</td>
                <td className="p-3">{getDateFromDateTime(item?.orderdate)}</td>
                <th className="py-3 px-6">{getDateFromDateTime(item?.deliverydate)}</th>
                <td className="p-3">{findFromList(item.manufactureId, partyData?.data, "name")}</td>

                <td className="p-2 items-end ">
                  {item?.isSave ? (
                    <span className="inline-flex  text-sm font-semibold bg-green-300 text-white-500  px-1 w-20 rounded">
                      Progress
                    </span>
                  ) : (
                    <span className="inline-flex   text-sm font-semibold bg-red-300 text-white-500 px-1 w-20 rounded ">
                      Pending
                    </span>
                  )}
                </td>







              </tr>

            )}

          </tbody>
        </table>
      </div>
    </>
  )
}