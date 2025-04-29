import { Eye, Plus } from "lucide-react";
import { useGetOrderByIdQuery, useGetOrderQuery } from "../../../redux/uniformService/OrderService";
import secureLocalStorage from "react-secure-storage";
import { useEffect, useState } from "react";
import GeneralSummary from "./GeneralSummary";
import MailForm from "./MailForm";


export default  function Order({setForm,form,setMailform,mailForm}){

    const [id,setId] = useState("") 
    const [fileName, setFileName] = useState("");
      const [poItems, setPoItems] = useState([]);
      const [poNo, setPoNo] = useState(null)
    
    const params = { 
        
        companyId: secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userCompanyId"),
        userRole : secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userRole"),
        userId: secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userId"),
     }


    const { data: singleData,isSingleFetching, isSingleLoading } = useGetOrderByIdQuery( id, { skip: !id } );

   useEffect(() => {
     if (id) {
      setPoItems(singleData?.data?.orderBillItems  ||  []);
     } else {
      setPoItems([]);
     }
   }, [isSingleFetching, isSingleLoading, id, singleData]);
      const { data: allData } = useGetOrderQuery({ params });

       
        

   

    return(
    
        
          <> 
 
              { form === true   ?  <GeneralSummary  setForm={setForm} singleData={singleData}  poItems={poItems}  setPoItems={setPoItems}
                setMailform={setMailform} orderId={id}  setFileName={setFileName} setPoNo={setPoNo} poNo={poNo}/>   :
    
                                        
             mailForm  === true ?     <MailForm  singleData={singleData} setForm={setForm}  fileName={fileName}  poNo={poNo} id={id}/>  :
                    
       
      
      
        <div className="flex-1 flex flex-col">

        {/* Top Bar */}
        {/* <header className="flex justify-between items-center bg-white px-6 py-4 shadow">
          <h1 className="text-2xl font-bold text-green-600">PLANT</h1>
          <div className="flex items-center space-x-4">
            <button className="bg-gray-100 p-2 rounded-full hover:bg-gray-200">🔔</button>
            <button className="bg-gray-100 p-2 rounded-full hover:bg-gray-200">👤</button>
          </div>
        </header> */}

        {/* Content Area */}
        <main className="p-2 space-y-6">

          {/* Tabs */}
          {/* <div className="flex space-x-6 border-b">
            <button className="pb-2 border-b-2 border-blue-600 text-blue-600 font-semibold">I</button>
            <button className="pb-2 text-gray-500 hover:text-blue-600">Outside Plant</button>
            <button className="pb-2 text-gray-500 hover:text-blue-600">Flower Pots</button>
            <button className="pb-2 text-gray-500 hover:text-blue-600">Fertilizers and Soil</button>
          </div> */}

          {/* Search and Actions */}
          <div className="flex justify-between items-center mt-2">
            <div className="flex items-center space-x-4">
              <input
                type="text"
                placeholder="Search"
                className="px-2 bg-gray-100 rounded-md focus:outline-none w-64"
              />
              <select className="px-2 bg-white border rounded-md focus:outline-none">
                <option>Filter by</option>
              </select>
              <select className=" px-2 bg-white border rounded-md focus:outline-none">
                <option>Sort by</option>
              </select>
            </div>
            {/* <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-md">
              Add new product
            </button> */}
          </div>

          <div className="overflow-x-auto bg-white shadow rounded-lg">
            <table className="min-w-full text-left">
              <thead className="bg-gray-100 text-gray-600 uppercase text-xs leading-normal">
                <tr>
                  <th className="py-3 px-6">S No</th>
                  <th className="py-3 px-6">Po Number</th>
                  <th className="py-3 px-6">Department</th>
                  <th className="py-3 px-6">Set</th>
                  <th className="py-3 px-6">Style No</th>
                  <th className="py-3 px-6">Product Ref</th>
                  <th className="py-3 px-6">Product Id</th>
                  <th className="py-3 px-6">Product</th>
                  <th className="py-3 px-6">Approval Status</th>
                  <th className="py-3 px-6"></th>
                 
                </tr>
              </thead>
             
              <tbody className="text-gray-700 text-xs">
         {(allData ? allData?.data : [])?.map((item, index) =>

<tr className="border-b transition-all duration-300 hover:shadow-lg  hover:bg-blue-200 transform "
        onClick={() =>{
                     setForm(true)
                    setId(item?.id)
                    setPoNo(item?.docId) }}
                >
                  <td className="p-3 font-semibold">{parseInt(index)  + 1}</td>
                  <td className="p-3">{item?.docId}</td>
                  <td className="p-3">{item?.department}</td>
                  <td className="p-3">{item?.class}</td>
                  <td className="p-3">{item?.supplierCode}</td>
                  <td className="p-3">{item?.product}</td>
                  <td className="p-3">{item.poNumber}</td>
                  <td className="p-3">{item.color}</td>
                  <td className="p-3 items-center text-center">
                      {item?.isDeleted ? (
                        <span className="inline-flex items-center  text-sm font-semibold bg-green-200 text-white-500  px-1 w-20 rounded">
                          Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center  text-sm font-semibold bg-red-200 text-white-500 px-1 w-20 rounded ">
                          Pending
                        </span>
                      )}
                    </td>
                  <td className="flex space-x-2">
                    <button className="mt-2 hover:bg-blue-600  rounded"><Eye/></button>
                  </td>

                </tr>



         )}
            

              </tbody>
            </table>
          </div>

        </main>
      </div>
      
            }
    </>                
                       
)

}

                      
// (
//     <div className="bg-gray-100 min-h-screen flex">

//       {/* Sidebar */}
//       <aside className="w-16 md:w-20 bg-blue-700 flex flex-col items-center py-6 space-y-8">
//         <div className="text-white text-2xl font-bold">🌿</div>
//         <nav className="flex flex-col space-y-6">
//           <button className="text-white hover:text-green-300">🏠</button>
//           <button className="text-white hover:text-green-300">📦</button>
//           <button className="text-white hover:text-green-300">📈</button>
//           <button className="text-white hover:text-green-300">⚙️</button>
//         </nav>
//       </aside>

//       {/* Main Content */}
//       <div className="flex-1 flex flex-col">

//         {/* Top Bar */}
//         <header className="flex justify-between items-center bg-white px-6 py-4 shadow">
//           <h1 className="text-2xl font-bold text-green-600">PLANT</h1>
//           <div className="flex items-center space-x-4">
//             <button className="bg-gray-100 p-2 rounded-full hover:bg-gray-200">🔔</button>
//             <button className="bg-gray-100 p-2 rounded-full hover:bg-gray-200">👤</button>
//           </div>
//         </header>

//         {/* Content Area */}
//         <main className="p-6 space-y-6">

//           {/* Tabs */}
//           <div className="flex space-x-6 border-b">
//             <button className="pb-2 border-b-2 border-blue-600 text-blue-600 font-semibold">Indoor Plant</button>
//             <button className="pb-2 text-gray-500 hover:text-blue-600">Outside Plant</button>
//             <button className="pb-2 text-gray-500 hover:text-blue-600">Flower Pots</button>
//             <button className="pb-2 text-gray-500 hover:text-blue-600">Fertilizers and Soil</button>
//           </div>

//           {/* Search and Actions */}
//           <div className="flex justify-between items-center">
//             <div className="flex items-center space-x-4">
//               <input
//                 type="text"
//                 placeholder="Search a product"
//                 className="px-4 py-2 bg-gray-100 rounded-md focus:outline-none w-64"
//               />
//               <select className="px-4 py-2 bg-white border rounded-md focus:outline-none">
//                 <option>Filter by</option>
//               </select>
//               <select className="px-4 py-2 bg-white border rounded-md focus:outline-none">
//                 <option>Sort by</option>
//               </select>
//             </div>
//             <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-md">
//               Add new product
//             </button>
//           </div>

//           {/* Table */}
//           <div className="overflow-x-auto bg-white shadow rounded-lg">
//             <table className="min-w-full text-left">
//               <thead className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
//                 <tr>
//                   <th className="py-3 px-6">Name</th>
//                   <th className="py-3 px-6">Gross</th>
//                   <th className="py-3 px-6">Net</th>
//                   <th className="py-3 px-6">VAT (%)</th>
//                   <th className="py-3 px-6">Stock</th>
//                   <th className="py-3 px-6">Available</th>
//                   <th className="py-3 px-6">Sold</th>
//                   <th className="py-3 px-6">Expire Date</th>
//                   <th className="py-3 px-6">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="text-gray-700 text-sm">

//                 {/* Row 1 */}
//                 <tr className="border-b hover:bg-gray-50">
//                   <td className="py-4 px-6 font-semibold">Monstera</td>
//                   <td className="py-4 px-6">48.00</td>
//                   <td className="py-4 px-6">39.02</td>
//                   <td className="py-4 px-6">8.98</td>
//                   <td className="py-4 px-6">A22</td>
//                   <td className="py-4 px-6 text-red-500">10 pcs.</td>
//                   <td className="py-4 px-6">
//                     <div className="w-32 bg-gray-200 rounded-full h-2.5">
//                       <div className="bg-green-500 h-2.5 rounded-full" style={{ width: "10%" }}></div>
//                     </div>
//                   </td>
//                   <td className="py-4 px-6">10-09-2019</td>
//                   <td className="py-4 px-6 flex space-x-2">
//                     <button className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded">✏️</button>
//                     <button className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded">🗑️</button>
//                   </td>
//                 </tr>

//                 {/* Row 2 */}
//                 <tr className="border-b hover:bg-gray-50">
//                   <td className="py-4 px-6 font-semibold">Angelonia</td>
//                   <td className="py-4 px-6">32.00</td>
//                   <td className="py-4 px-6">28.16</td>
//                   <td className="py-4 px-6">8.98</td>
//                   <td className="py-4 px-6">B01</td>
//                   <td className="py-4 px-6 text-green-500">200 pcs.</td>
//                   <td className="py-4 px-6">
//                     <div className="w-32 bg-gray-200 rounded-full h-2.5">
//                       <div className="bg-green-500 h-2.5 rounded-full" style={{ width: "92%" }}></div>
//                     </div>
//                   </td>
//                   <td className="py-4 px-6">12-12-2019</td>
//                   <td className="py-4 px-6 flex space-x-2">
//                     <button className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded">✏️</button>
//                     <button className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded">🗑️</button>
//                   </td>
//                 </tr>

//                 {/* You can add more rows */}
//               </tbody>
//             </table>
//           </div>

//         </main>
//       </div>
//     </div>
//   );