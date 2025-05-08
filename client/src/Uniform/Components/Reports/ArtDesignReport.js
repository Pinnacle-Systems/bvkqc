export default function ArtDesignFormreport({}){
    return (
        <>
           <div className="flex flex-col w-full h-[95%] overflow-auto" >
                 <div className="md:flex md:items-center md:justify-between page-heading ">
                   <div className="heading text-center md:mx-10">Art design </div>
                   <div className=" sub-heading justify-center md:justify-start items-center">
                     <label className="text-white text-sm rounded-md m-1  border-none">Show Entries</label>
                     {/* <select value={dataPerPage}
                       onChange={(e) => setDataPerPage(e.target.value)} className='h-6 w-40 border border-gray-500 rounded mr-9'>
                       {showEntries.map((option) => <option value={option.value} >{option.show}</option>)}
                     </select> */}
                   </div>
           
                 </div>
                 <>
                   <div
                     className="h-[500px] overflow-auto"
                   >
                     {/* <table className="table-fixed text-center w-full">
                       <thead className="border-2 table-header">
                         <tr className='h-2'>
                           <th
                             className="border-2  top-0 stick-bg w-10">
                             S. no.
                           </th>
                           <th
                             className="border-2  top-0 stick-bg"
                           >
                             <label>Po.No</label><input
                               type="text"
                               className="text-black h-6 focus:outline-none border md:ml-3 border-gray-400 rounded-lg"
                               placeholder="Search"
                               value={poNo}
                               onChange={(e) => {
                                 setPoNo(e.target.value);
                               }}
                             />
                           </th>
                           <th
                             className="border-2  top-0 stick-bg"
                           >
                             <label>Po.Date</label><input
                               type="text"
                               className="text-black h-6 focus:outline-none border md:ml-3 border-gray-400 rounded-lg"
                               placeholder="Search"
                               value={searchPoDate}
                               onChange={(e) => {
                                 setPoDate(e.target.value);
                               }}
                             />
                           </th>
                           <th
           
                             className="border-2  top-0 stick-bg"
                           >
                             <label>Supplier</label><input
                               type="text"
                               className="text-black h-6 focus:outline-none border md:ml-3 border-gray-400 rounded-lg"
                               placeholder="Search"
                               value={supplier}
                               onChange={(e) => {
                                 setSupplier(e.target.value);
                               }}
                             />
                           </th>
                           <th
                             className="border-2  top-0 stick-bg"
                           >
                             <label>Po Type</label><input
                               type="text"
                               className="text-black h-6 focus:outline-none border md:ml-3 border-gray-400 rounded-lg"
                               placeholder="Search"
                               value={searchPoType}
                               onChange={(e) => {
                                 setSearchPoType(e.target.value);
                               }}
                             />
                           </th>
           
                           <th className="border-2  top-0 stick-bg">
                             <label>Due Date</label><input
                               type="text"
                               className="text-black h-6 focus:outline-none border md:ml-3 border-gray-400 rounded-lg"
                               placeholder="Search"
                               value={searchDueDate}
                               onChange={(e) => {
                                 setDueDate(e.target.value);
                               }}
                             />
                           </th>
           
                         </tr>
                       </thead>
                       {isLoadingIndicator ?
                         <tbody>
                           <tr>
                             <td>
                               <Loader />
                             </td>
                           </tr>
                         </tbody>
                         :
                         <tbody className="border-2">
                           {allData?.data?.map((dataObj, index) => (
                             <tr
                               key={dataObj.id}
                               className="border-2 table-row "
                               onClick={() => onClick(dataObj.id)}>
                               <td className='py-1'> {(index + 1) + (dataPerPage * (currentPageNumber - 1))}</td>
                               <td className='py-1'> {dataObj.docId}</td>
                               <td className='py-1'>{getDateFromDateTimeToDisplay(dataObj.createdAt)} </td>
                               <td className='py-1'>{findFromList(dataObj.supplierId, supplierList?.data, "name")}</td>
                               <td className='py-1'>{dataObj.transType}</td>
                               <td className='py-1'>{getDateFromDateTimeToDisplay(dataObj.dueDate)}</td>
                             </tr>
                           ))}
                         </tbody>
                       }
                     </table> */}
                   </div>
                 </>
                 {/* <ReactPaginate
                   previousLabel={"<"}
                   nextLabel={">"}
                   breakLabel={"..."}
                   breakClassName={"break-me"}
                   forcePage={pageNumberToReactPaginateIndex(currentPageNumber)}
                   pageCount={Math.ceil(totalCount / dataPerPage)}
                   marginPagesDisplayed={1}
                   onPageChange={handleOnclick}
                   containerClassName={"flex justify-center m-2 gap-5 items-center"}
                   pageClassName={"border custom-circle text-center"}
                   disabledClassName={"p-1 bg-gray-200"}
                   previousLinkClassName={"border p-1 text-center"}
                   nextLinkClassName={"border p-1"}
                   activeClassName={"bg-blue-900 text-white px-2"} /> */}
               </div>     
        </>
    )
}