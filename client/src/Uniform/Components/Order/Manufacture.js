import { findFromList, getDateFromDateTime } from "../../../Utils/helper"


export default function Manufacture({ allData, setForm, setId, setPoNo }) {
  const poStages = [
    { name: "Created", completed: true },
    { name: "Sent to Supplier", completed: false },
    { name: "Approved", completed: true },

  ];
  return (
    <>

      <div className=" bg-white shadow rounded-lg">
        <table className="min-w-full text-left overflow-x-auto" >
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs leading-normal border border-black-100">
            <tr >
              <th className="py-1 px-1">S No</th>
              <th className="py-1 px-1">PO Number </th>
              <th className="py-1 px-1">Order date</th>
              <th className="py-1 px-1">Vendor</th>
              <th className="py-1 px-6">Delivery date</th>
              <th className="py-1 px-1">Approval Status</th>
              <th className="py-1 px-1">PO Status</th>


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
                <td className="p-1 font-semibold">{parseInt(index) + 1}</td>
                <td className="p-1">{item?.docId}</td>
                <td className="p-1">{getDateFromDateTime(item?.orderdate)}</td>
                <td className="p-1">{item?.Vendor?.name}</td>
                <td className="p-1">{getDateFromDateTime(item?.deliverydate)}</td>
                <td className="p-1 items-end ">
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
                <td>
                  <td>
                    <div className="flex text-white text-xs font-medium">

                      <div
                        key={index}
                        className={`flex items-center px-3 py-1 relative ${item.isSave ? 'bg-green-500' : 'bg-gray-400'
                          } ${index !== poStages.length - 1 ? 'mr-2' : ''}
        after:content-[''] after:absolute after:right-[-10px] after:top-0 after:w-0 after:h-0 after:border-y-[16px] after:border-y-transparent 
        after:border-l-[10px] ${index !== poStages.length - 1
                            ? item.isSave
                              ? 'after:border-l-green-500'
                              : 'after:border-l-gray-400'
                            : 'after:hidden'
                          }`}
                        style={{ clipPath: index === 0 ? 'polygon(0 0, calc(100% - 10px) 0, 100% 50%, calc(100% - 10px) 100%, 0 100%)' : 'polygon(10px 0, calc(100% - 10px) 0, 100% 50%, calc(100% - 10px) 100%, 10px 100%, 0 50%)' }}
                      >
                        {item.isSave}
                      </div>

                    </div>
                  </td>

                </td>

              </tr>

            )}

          </tbody>
        </table>
      </div>
    </>
  )
}







