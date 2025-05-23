import { useState } from 'react';
import { FaPlus, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Manufacture from './Manufacture';

const PurchaseOrders = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('this-month');
  const [selectedFinYear, setSelectedFinYear] = useState('2023-2024');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showManufacturer, setShowManufacturer] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Sample data with only 2 entries
  const sampleData = [
    {
      id: 1,
      supplier: 'Anugraha Fashion',
      contact: 'manoj - manojpinnaclesystems.co.in',
      orderNo: 'PO-2023-001',
      orderDate: '2023-07-15',
      taxable: '₹45,000',
      amount: '₹53,100',
      status: 'pending'
    },
    {
      id: 2,
      supplier: 'Jiwin Supplier',
      contact: 'tamil - tamilpinnaclesystems.co.in',
      orderNo: 'PO-2023-002',
      orderDate: '2023-07-18',
      taxable: '₹12,500',
      amount: '₹14,750',
      status: 'processed'
    },
     {
      id: 1,
      supplier: 'Anugraha Fashion',
      contact: 'manoj - manojpinnaclesystems.co.in',
      orderNo: 'PO-2023-001',
      orderDate: '2023-07-15',
      taxable: '₹45,000',
      amount: '₹53,100',
      status: 'pending'
    },
    {
      id: 2,
      supplier: 'Jiwin Supplier',
      contact: 'tamil - tamilpinnaclesystems.co.in',
      orderNo: 'PO-2023-002',
      orderDate: '2023-07-18',
      taxable: '₹12,500',
      amount: '₹14,750',
      status: 'processed'
    },
     {
      id: 1,
      supplier: 'Anugraha Fashion',
      contact: 'manoj - manojpinnaclesystems.co.in',
      orderNo: 'PO-2023-001',
      orderDate: '2023-07-15',
      taxable: '₹45,000',
      amount: '₹53,100',
      status: 'pending'
    },
    {
      id: 2,
      supplier: 'Jiwin Supplier',
      contact: 'tamil - tamilpinnaclesystems.co.in',
      orderNo: 'PO-2023-002',
      orderDate: '2023-07-18',
      taxable: '₹12,500',
      amount: '₹14,750',
      status: 'processed'
    },
    
   
  
 
  ];

  const handleView = (id) => {
    alert(`Viewing order ${id}`);
  };

  const handleEdit = (id) => {
    alert(`Editing order ${id}`);
  };

  const handleDelete = (id) => {
    if (window.confirm(`Delete order ${id}?`)) {
      alert(`Deleting order ${id}`);
    }
  };

  const totalPages = Math.ceil(sampleData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sampleData.slice(indexOfFirstItem, indexOfLastItem);

  const paddedItems = [...currentItems];
  while (paddedItems.length < itemsPerPage) {
    paddedItems.push({ id: `empty-${paddedItems.length}`, empty: true });
  }

  const Pagination = () => (
    <div className="flex flex-col sm:flex-row justify-between items-center p-2 bg-white border-t border-gray-200">
      <div className="text-sm text-gray-600 mb-2 sm:mb-0">
        Showing {Math.min(indexOfFirstItem + 1, sampleData.length)} to {Math.min(indexOfLastItem, sampleData.length)} of {sampleData.length} entries
      </div>
      <div className="flex gap-1">
        <button
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
          className={`px-3 py-1 rounded-md ${
            currentPage === 1 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          <FaChevronLeft className="inline" />
        </button>
        
        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentPage(index + 1)}
            className={`px-3 py-1 rounded-md ${
              currentPage === index + 1
                ? 'bg-indigo-800 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            {index + 1}
          </button>
        ))}
        
        <button
          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
          className={`px-3 py-1 rounded-md ${
            currentPage === totalPages
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          <FaChevronRight className="inline" />
        </button>
      </div>
    </div>
  );

  return (
    <>
     {showManufacturer ? (
      
            <Manufacture onClose={() => setShowManufacturer(false)} />
       ) :
         <div className="p-2 bg-[#F1F1F0] min-h-screen">
        <h1 className="text-2xl font-bold text-gray-800">Purchase Order</h1>
      <div className="flex flex-col sm:flex-row justify-between bg-white py-1.5 px-1 items-start sm:items-center mb-6 gap-4 rounded-tl-lg rounded-tr-lg shadow-sm border border-gray-200">
        <div className="flex items-center gap-2">
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-1.5 border rounded-md text-sm"
          >
            <option value="this-month">This Month</option>
            <option value="last-month">Last Month</option>
          </select>
          <select 
            value={selectedFinYear}
            onChange={(e) => setSelectedFinYear(e.target.value)}
            className="px-3 py-1.5 border rounded-md text-sm"
          >
            <option value="2023-2024">2023-2024</option>
            <option value="2022-2023">2022-2023</option>
          </select>
          <select 
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 border rounded-md text-sm"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processed">Processed</option>
          </select>
        </div>
        <button className="hover:bg-green-700 bg-white border border-green-700
         hover:text-white text-green-800 px-4 py-1.5 rounded-md flex items-center gap-2 text-sm "
         onClick={()=>setShowManufacturer(true)}>
          <FaPlus /> Create New
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full border-collapse">
          <thead className="bg-gray-200 text-gray-800">
            <tr>
              <th className="px-4 py-2 text-left font-medium border-r border-white/50 text-[13px]">Supplier</th>
              <th className="px-4 py-2 text-left font-medium border-r border-white/50 text-[13px]">Contact</th>
              <th className="px-4 py-2 text-left font-medium border-r border-white/50 text-[13px]">Order No.</th>
              <th className="px-4 py-2 text-left font-medium border-r border-white/50 text-[13px]">Order Date</th>
              <th className="px-4 py-2 text-left font-medium border-r border-white/50 text-[13px]">Taxable (₹)</th>
              <th className="px-4 py-2 text-left font-medium border-r border-white/50 text-[13px]">Amount (₹)</th>
              <th className="px-4 py-2 text-left font-medium border-r  border-white/50 text-[13px]">Status</th>
              <th className="px-4 py-2 text-left font-medium text-[13px]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paddedItems.map((order,index) => (
              <tr 
                key={order.id} 
                className={`hover:bg-gray-50 transition-colors border-b border-gray-200 text-[12px] ${index % 2 === 0 ? "bg-white" : "bg-gray-100"
                }`}
              >
                <td className="px-4 py-1 border-r h-8 border-gray-200 uppercase">
                  {order.empty ? '' : order.supplier}
                </td>
                <td className="px-4 py-1 text-gray-800 border-r h-8 border-gray-200 uppercase">
                  {order.empty ? '' : order.contact}
                </td>
                <td className="px-4 py-1 font-medium text-gray-900 h-8 border-r border-gray-200">
                  {order.empty ? '' : order.orderNo}
                </td>
                <td className="px-4 py-1 border-r border-gray-200 h-8">
                  {order.empty ? '' : order.orderDate}
                </td>
                <td className="px-4 py-1 border-r border-gray-200 h-8">
                  {order.empty ? '' : order.taxable}
                </td>
                <td className="px-4 py-1 font-semibold border-r border-gray-200 h-8">
                  {order.empty ? '' : order.amount}
                </td>
                <td className="px-4 py-1 border-r border-gray-200 h-8">
                  {!order.empty && (
                    <div className="flex items-center">
                      <span className={`w-2 h-2 rounded-full mr-1 ${order.status === 'pending' ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
                      <span className={`capitalize ${order.status === 'pending' ? 'text-yellow-600' : 'text-green-600'}`}>
                        {order.status}
                      </span>
                    </div>
                  )}
                </td>
                <td className="px-2 py-1 w-[40px] border-gray-200 border-r border-gray-200 h-8">
                  {!order.empty && (
                    <div className="flex gap-2">
                      <button 
                        className="text-blue-600 text-blue-800 flex items-center gap-1 px-2 mx-2 py-1.5 bg-blue-50 rounded"
                        onClick={() => handleView(order.id)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-xs">view</span>
                      </button>
                      <button 
                        className="text-green-600 text-green-800 flex items-center gap-1 mx-2 px-2  py-1.5 bg-green-50 rounded"
                        onClick={() => handleEdit(order.id)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                        <span className="text-xs">edit</span>
                      </button>
                      <button 
                        className="text-red-600 text-red-800 flex items-center gap-1 mx-2 px-2  py-1.5 bg-red-50 rounded"
                        onClick={() => handleDelete(order.id)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span className="text-xs">delete</span>
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination />
      </div>
    </div>}
        </>
   
  );
};

export default PurchaseOrders;