import { HiPlus, HiShare, HiPrinter } from "react-icons/hi";
import { FaWhatsapp } from "react-icons/fa";
import { useState } from "react";
import { FaFileAlt } from "react-icons/fa";
import ReusableSearchableInput from "./SupplierInput";

const Manufacture = ({ onClose }) => {
  const [suppliers, setSuppliers] = useState([
    'Supplier One',
    'Supplier Two',
    'Supplier Three',
  ]);

  const handleAddSupplier = (newName) => {
    if (!suppliers.includes(newName)) {
      setSuppliers([...suppliers, newName]);
    }
  };

  return (
    <div className="w-full bg-[#f1f1f0] mx-auto rounded-md shadow-md px-3 py-1">
      <div className="flex justify-between items-center mb-1">
        <h1 className="text-2xl font-bold text-slate-800 mx-2">
          Purchase Order
        </h1>
        <button
          onClick={onClose}
          className="text-sky-600 hover:text-sky-700 transition-colors duration-200"
          title="Open Report"
        >
          <FaFileAlt className="w-6 h-6" />
        </button>
      </div>

      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 px-2">
          {/* Basic Information Card */}
          <div className="border border-slate-200 p-4 bg-white rounded-lg shadow-sm">
            <h2 className="text-lg font-medium text-slate-700 mb-3">
              Basic Information
            </h2>
            <div className="space-y-3">
              <ReusableSearchableInput
                label="Supplier"
                placeholder="Search suppliers..."
                itemList={suppliers}
                onAddItem={handleAddSupplier}
              />
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Copy from
                </label>
                <select className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-md focus:border-sky-300 focus:outline-none transition-all duration-200 hover:border-slate-400">
                  <option>None</option>
                </select>
              </div>
            </div>
          </div>

          {/* Party Details Card */}
          <div className="border border-slate-200 p-4 bg-white rounded-lg shadow-sm">
            <h2 className="text-lg font-medium text-slate-700 mb-3">
              Party Details
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Contact Person
                </label>
                <input
                  className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-md focus:border-sky-300 focus:outline-none transition-all duration-200 hover:border-slate-400"
                  placeholder="Contact name"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Source Address
                </label>
                <div className="p-2 text-sm border border-slate-300 rounded-md bg-slate-50 cursor-not-allowed text-slate-400">
                  Add address
                </div>
              </div>
            </div>
          </div>

          {/* Document Details Card */}
          <div className="border border-slate-200 p-4 bg-white rounded-lg shadow-sm">
            <h2 className="text-lg font-medium text-slate-700 mb-3">
              Document Details
            </h2>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  PO No.
                </label>
                <input
                  value="1"
                  className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-md bg-slate-100"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Reference
                </label>
                <input className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-md focus:border-sky-300 focus:outline-none transition-all duration-200 hover:border-slate-400" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  PO Date
                </label>
                <input
                  type="date"
                  className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-md focus:border-sky-300 focus:outline-none transition-all duration-200 hover:border-slate-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-md focus:border-sky-300 focus:outline-none transition-all duration-200 hover:border-slate-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Item List Section */}
        <div className="border border-slate-200 p-4 bg-white rounded-lg shadow-sm mx-2">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-medium text-slate-700">Item List</h2>
            <button className="bg-sky-600 text-white px-3 py-1.5 rounded-md hover:bg-sky-700 flex items-center text-sm transition-colors">
              <HiPlus className="w-4 h-4 mr-1" />
              Add Item
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-slate-50">
                <tr>
                  {[
                    "No.",
                    "Item & Description",
                    "HSN/SAC",
                    "Qty",
                    "Unit",
                    "Rate (₹)",
                    "Discount (₹)",
                    "Taxable (₹)",
                    "CGST (₹)",
                    "SGST (₹)",
                    "Amt (₹)",
                  ].map((header) => (
                    <th
                      key={header}
                      className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase border-b"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200"></tbody>
            </table>
          </div>
        </div>

        {/* Terms & Conditions */}
        <div className="border border-slate-200 p-4 bg-white rounded-lg shadow-sm mx-2">
          <h2 className="text-lg font-medium text-slate-700 mb-3">
            Terms & Conditions
          </h2>
          <button className="bg-slate-50 px-3 py-1.5 rounded-md hover:bg-sky-50 flex items-center text-sm transition-colors">
            <HiPlus className="w-4 h-4 mr-1 text-slate-500" />
            Add Term
          </button>
        </div>

        {/* Notes */}
        <div className="border border-slate-200 p-4 bg-white rounded-lg shadow-sm mx-2">
          <h2 className="text-lg font-medium text-slate-700 mb-3">Notes</h2>
          <textarea
            className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-md focus:border-sky-300 focus:outline-none transition-all duration-200 hover:border-slate-400 h-24"
            placeholder="Additional notes..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-2 justify-between mt-6 px-2">
          <div className="flex gap-2">
            <button className="bg-sky-600 text-white px-4 py-1.5 rounded-md hover:bg-sky-700 text-sm transition-colors">
              Save Template
            </button>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button className="bg-emerald-600 text-white px-4 py-1.5 rounded-md hover:bg-emerald-700 flex items-center text-sm transition-colors">
              <HiShare className="w-4 h-4 mr-1" />
              Email
            </button>
            <button className="bg-emerald-600 text-white px-4 py-1.5 rounded-md hover:bg-emerald-700 flex items-center text-sm transition-colors">
              <FaWhatsapp className="w-4 h-4 mr-1" />
              WhatsApp
            </button>
            <button className="bg-slate-600 text-white px-4 py-1.5 rounded-md hover:bg-slate-700 flex items-center text-sm transition-colors">
              <HiPrinter className="w-4 h-4 mr-1" />
              Print
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Manufacture;