import { findFromList, getDateFromDateTime } from "../../../Utils/helper"


export default function Buyer({ allData, setForm, setId, setPoNo, partyData, poSentForApproval }) {
  console.log();

  return (
    <>
      <div className=" bg-white shadow rounded-lg">
        <table className="min-w-full text-left overflow-x-auto" >
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs leading-normal border border-black-100">
            <tr >
              <th className="py-1 px-6">S No</th>
              <th className="py-1 px-6">Po Number</th>
              <th className="py-1 px-6">Manufacture</th>
              <th className="py-1 px-6">Orderdate</th>
              <th className="py-1 px-6">Vendor</th>
              <th className="py-1 px-6">Delivery date</th>
              <th className="py-1 px-6">Approval Status</th>
            </tr>
          </thead>

          <tbody className="text-gray-700 text-xs">





            {(allData ? allData?.data : [])?.map((item, index) =>

              <>

                {/* {poSentForApproval ? */}
                <tr className="border-b transition-all duration-300 hover:shadow-lg  hover:bg-gray-300 transform  table-row "
                  onClick={() => {
                    setForm(true)
                    setId(item?.id)
                    setPoNo(item?.docId)
                  }}
                >
                  <td className="p-1 ">{parseInt(index) + 1}</td>
                  <td className="p-1">{item?.docId}</td>
                  <td className="p-1">{findFromList(item?.manufactureId, partyData?.data, "name")}</td>
                  <td className="p-1">{getDateFromDateTime(item?.orderdate)}</td>
                  <td className="p-1">{findFromList(item?.vendorId, partyData?.data, "name")}  </td>
                  <th className="p-1 ">{getDateFromDateTime(item?.deliverydate)}</th>



                  {/* <td className="p-1 items-end ">
                  {item?.isSave ? (
                    <span className="inline-flex  text-sm  bg-green-300 text-white-500  px-1 w-10 rounded">
                      Progress
                    </span>
                  ) : (
                    <span className="inline-flex   text-sm  bg-red-300 text-white-500 px-1 w-10 rounded ">
                      Pending
                    </span>
                  )}
                </td> */}
                  <div>
                    <select
                      className='px-1 py-1 border rounded'
                      value={item.isApproved}
                      // onChange={(e) =>
                      //   setIsApproved(e.target.value)
                      // }
                      disabled
                    >
                      <option value=''>Not Yet sent</option>
                      <option value='approve'>Approve</option>
                      <option value='reject'>Reject</option>
                      <option value='hold'>Hold</option>
                    </select>
                  </div>


                </tr>
                {/* : ''
                } */}
              </>


            )}

          </tbody>
        </table>
      </div>
    </>
  )
}