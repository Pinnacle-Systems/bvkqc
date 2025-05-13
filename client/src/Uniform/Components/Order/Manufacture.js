import { findFromList, getDateFromDateTime } from "../../../Utils/helper"


export default function Manufacture({ allData, setForm, setId, setPoNo, partyData, userRole
}) {
  console.log(allData, "hit manufacture")
  return (
    <>

      <div className=" bg-white shadow rounded-lg">
        <table className="min-w-full text-left overflow-x-auto" >
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs leading-normal border border-black-100">
            <tr >
              <th className="py-3 px-6">S No</th>
              <th className="py-3 px-6">Buyer PO</th>
              <th className="py-3 px-6">Internal PO</th>
              <th className="py-3 px-6">Order date</th>

              <th className="py-3 px-6">Vendor</th>

              <th className="py-3 px-6">Product</th>
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
                <th className="py-3 px-6">{item?.poNumber}</th>
                <td className="p-2">{item?.docId}</td>
                <td className="p-3">{getDateFromDateTime(item?.orderdate)}</td>

                <td className="p-3">{findFromList(item.vendorId, partyData?.data, "name")}</td>
                <td className="p-3">{item?.isApproval === 1 ? "TSHIRT AND SHORTS" : "TSHIRT AND SHORTS"} </td>
                <td className="p-2 items-end ">
                  {!item?.isApproved ? (
                    <span className="inline-flex  text-sm font-semibold bg-green-300 text-white-500  px-1 w-20 rounded">
                      Progress
                    </span>
                  ) : (
                    <span className="inline-flex   text-sm font-semibold bg-red-300 text-white-500 px-1 w-20 rounded ">

                      {item?.isApproved}
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