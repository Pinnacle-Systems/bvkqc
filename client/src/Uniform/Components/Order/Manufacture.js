import { HiPlus, HiShare, HiPrinter } from "react-icons/hi";
import { FaWhatsapp } from "react-icons/fa";
import { useState } from "react";
import { FaFileAlt } from "react-icons/fa";
import  {ReusableSearchableInput, ReusableDropdown, ReusableInput } from "./CommonInput"
import ItemList from "../common/ItemTable";

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
  <div className="w-full bg-[#f1f1f0] mx-auto rounded-md shadow-md px-2 py-1">
 <div className="flex justify-between items-center mb-1">
        <h1 className="text-2xl font-bold text-gray-800">Purchase Order</h1>
        <button
          onClick={onClose}
          className="text-indigo-600 hover:text-indigo-700"
          title="Open Report"
        >
          <FaFileAlt className="w-5 h-5" />
        </button>
      </div>
  
  <div className="space-y-3">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
      {/* Basic Information */}
      <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm">
        <h2 className="font-medium text-slate-700 mb-2">Basic Information</h2>
        <div className="space-y-2">
          <ReusableSearchableInput
            label="Supplier"
            placeholder="Search suppliers..."
            itemList={suppliers}
            onAddItem={handleAddSupplier}
          />
          <ReusableDropdown
            label="Copy from"
            options={[{value: "none", label: "None"}]}
          />
        </div>
      </div>

      {/* Party Details */}
      <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm">
        <h2 className="font-medium text-slate-700 mb-2">Party Details</h2>
        <div className="space-y-2">
          <ReusableInput
            label="Contact Person"
            placeholder="Contact name"
          />
          <div>
            <label className="block text-xs text-slate-500 mb-1">
              Source Address
            </label>
            <div className="p-1 text-sm border border-slate-300 rounded-md bg-slate-50 cursor-not-allowed text-slate-400">
              Add address
            </div>
          </div>
        </div>
      </div>

      {/* Document Details */}
      <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm">
        <h2 className="font-medium text-slate-700 mb-2">Document Details</h2>
        <div className="grid grid-cols-2 gap-1">
          <ReusableInput
            label="PO No."
            value="1"
            readOnly
          />
          <ReusableInput
            label="Reference"
          />
          <ReusableInput
            label="PO Date"
            type="date"
          />
          <ReusableInput
            label="Due Date"
            type="date"
          />
        </div>
      </div>
    </div>

    {/* Rest of your components */}
   <ItemList />

        {/* Terms & Conditions */}
        <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm">
          <h2 className="font-medium text-slate-700 mb-2">
            Terms & Conditions
          </h2>
          <button className="bg-slate-50 px-2 py-1 rounded-md hover:bg-indigo-50 flex items-center text-sm">
            <HiPlus className="w-3 h-3 mr-1 text-slate-500" />
            Add Term
          </button>
        </div>

        <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm">
          <h2 className="font-medium text-slate-700 mb-2">Notes</h2>
          <textarea
            className="w-full px-2 py-1 text-sm border border-slate-300 rounded-md h-20"
            placeholder="Additional notes..."
          />
        </div>

        <div className="flex flex-col md:flex-row gap-1 justify-between mt-4">
          <div className="flex gap-1">
            <button className="bg-indigo-600 text-white px-3 py-1 rounded-md hover:bg-indigo-700 text-sm">
              Save Template
            </button>
          </div>
          <div className="flex gap-1 flex-wrap">
            <button className="bg-emerald-600 text-white px-3 py-1 rounded-md hover:bg-emerald-700 flex items-center text-sm">
              <HiShare className="w-3 h-3 mr-1" />
              Email
            </button>
            <button className="bg-emerald-600 text-white px-3 py-1 rounded-md hover:bg-emerald-700 flex items-center text-sm">
              <FaWhatsapp className="w-3 h-3 mr-1" />
              WhatsApp
            </button>
            <button className="bg-slate-600 text-white px-3 py-1 rounded-md hover:bg-slate-700 flex items-center text-sm">
              <HiPrinter className="w-3 h-3 mr-1" />
              Print
            </button>
          </div>
        </div>  </div>
</div>
  );
};

export default Manufacture;