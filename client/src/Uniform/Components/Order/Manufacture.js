import { HiPlus, HiShare, HiPrinter } from 'react-icons/hi';
import { FaWhatsapp } from 'react-icons/fa';
import SupplierInput from './SupplierInput';

const Manufacture = ({onClose }) => {
  return (
    <div className="w-full bg-[#f1f1f0] mx-auto rounded-lg shadow-sm px-2 ">
      <h1 className="text-2xl font-bold text-gray-800 px-3 pb-3">Purchase Order Form</h1>
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4">
          <div className="border p-5 bg-white rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Basic Information</h2>
            <div className="space-y-4">
              <SupplierInput />
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Copy from</label>
                <select className="w-full px-3 py-2 border rounded-md bg-white focus:ring-2 focus:ring-blue-500">
                  <option>None</option>
                </select>
              </div>
            </div>
          </div>

          <div className="border p-5 bg-white rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Party Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Contact Person</label>
                <input 
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter contact name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Source Address</label>
                <div className="p-3 border rounded-md bg-gray-50 cursor-not-allowed text-gray-500">
                  Click here to add an address
                </div>
              </div>
            </div>
          </div>
            <div className="border p-5 bg-white rounded-xl shadow-sm mx-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Document Details</h2>
          <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">PO No.</label>
              <input value="1" className="w-full px-3 py-2 border rounded-md bg-gray-50" readOnly />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Reference</label>
              <input className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">PO Date</label>
              <input type="date" className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Due Date</label>
              <input type="date" className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>
        </div>

      

        {/* Item List */}
        <div className="border p-5 bg-white rounded-xl shadow-sm mx-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Item List</h2>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center">
              <HiPlus className="w-5 h-5 mr-1" />
              Add Item
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  {['No.', 'Item & Description', 'HSN/SAC', 'Qty', 'Unit', 'Rate (₹)', 'Discount (₹)', 
                    'Taxable (₹)', 'CGST (₹)', 'SGST (₹)', 'Amt (₹)'].map((header) => (
                    <th key={header} className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {/* Add table rows here */}
              </tbody>
            </table>
          </div>
        </div>

        {/* Terms & Conditions */}
        <div className="border p-5 bg-white rounded-xl shadow-sm mx-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Terms & Conditions</h2>
          <button className="bg-gray-100 px-4 py-2 rounded-md hover:bg-gray-200 flex items-center">
            <HiPlus className="w-5 h-5 mr-1 text-gray-600" />
            Add Term / Condition
          </button>
        </div>

        {/* Notes */}
        <div className="border p-5 bg-white rounded-xl shadow-sm mx-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Notes</h2>
          <textarea 
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 h-32"
            placeholder="Enter any additional notes..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-4 justify-between mt-8 px-4">
          <div className="flex gap-3">
            <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
              Save as Template
            </button>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 flex items-center">
              <HiShare className="w-5 h-5 mr-2" />
              Share by Email
            </button>
            <button className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 flex items-center">
              <FaWhatsapp className="w-5 h-5 mr-2" />
              Share by Whatsapp
            </button>
            <button className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 flex items-center">
              <HiPrinter className="w-5 h-5 mr-2" />
              Print Document
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Manufacture;