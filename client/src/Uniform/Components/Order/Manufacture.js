import { HiPlus, HiShare, HiPrinter , HiTrash,HiMinus, HiLocationMarker } from "react-icons/hi";
import { FaWhatsapp } from "react-icons/fa";
import { useState } from "react";
import { FaFileAlt } from "react-icons/fa";
import { HiX } from "react-icons/hi";
import {
  ReusableSearchableInput,
  ReusableDropdown,
  ReusableInput,
} from "./CommonInput";
import ItemList from "../common/ItemTable";

const Manufacture = ({ onClose }) => {
  const [suppliers, setSuppliers] = useState([
    "Supplier One",
    "Supplier Two",
    "Supplier Three",
  ]);
 const [showExtraCharge,setShowExtraCharge] = useState(false)
const [showDiscount,setShowDiscount] = useState(false)
const [showAddressPopup,setShowAddressPopup] = useState(false)
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
          <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm">
            <h2 className="font-medium text-slate-700 mb-2">
              Basic Information
            </h2>
            <div className="space-y-2">
              <ReusableSearchableInput
                label="Supplier"
                placeholder="Search suppliers..."
                itemList={suppliers}
                onAddItem={handleAddSupplier}
              />
              <ReusableDropdown
                label="Copy from"
                options={[{ value: "none", label: "None" }]}
              />
            </div>
          </div>

          <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm">
            <h2 className="font-medium text-slate-700 mb-2">Party Details</h2>
            <div className="space-y-2">
              <ReusableInput
                label="Contact Person"
                placeholder="Contact name"
              />
           <div className="mb-3">
  <label className="block text-xs font-medium text-slate-600 mb-1">
    Source Address
  </label>
  <div className="relative">
    <input
      type="text"
      className="w-full pl-2.5 pr-8 py-2 text-sm border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
      placeholder="Select address"
      readOnly
      onClick={() => setShowAddressPopup(true)}
    />
    <div 
      className="absolute inset-y-0 right-0 flex items-center pr-2.5 cursor-pointer text-slate-400 hover:text-indigo-600 transition-colors"
      onClick={() => setShowAddressPopup(true)}
    >
      <HiLocationMarker className="w-4 h-4" />
    </div>
  </div>

  {showAddressPopup && (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center border-b border-slate-200 p-4">
          <h3 className="text-lg font-medium text-slate-800">Select Address</h3>
          <button 
            onClick={() => setShowAddressPopup(false)}
            className="text-slate-400 hover:text-slate-600"
          >
            <HiX className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          <div className="space-y-3">
            <div 
              className="p-3 border border-slate-200 rounded-md hover:border-indigo-300 cursor-pointer transition-colors"
              onClick={() => {
                setShowAddressPopup(false);
              }}
            >
              <h4 className="font-medium text-slate-800">Main Office</h4>
              <p className="text-sm text-slate-600 mt-1">123 Business St, Suite 100, San Francisco, CA 94107</p>
            </div>
            
            <div 
              className="p-3 border border-slate-200 rounded-md hover:border-indigo-300 cursor-pointer transition-colors"
              onClick={() => {
                setShowAddressPopup(false);
              }}
            >
              <h4 className="font-medium text-slate-800">Warehouse</h4>
              <p className="text-sm text-slate-600 mt-1">456 Industrial Ave, Oakland, CA 94601</p>
            </div>
          </div>
          
          <button className="mt-4 w-full flex items-center justify-center py-2 px-3 border border-dashed border-slate-300 rounded-md text-indigo-600 hover:bg-indigo-50 transition-colors">
            <HiPlus className="w-4 h-4 mr-2" />
            <span>Add New Address</span>
          </button>
        </div>
        
        <div className="border-t border-slate-200 p-4 flex justify-end">
          <button 
            onClick={() => setShowAddressPopup(false)}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )}
</div>
            </div>
          </div>

          {/* Document Details */}
          <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm">
            <h2 className="font-medium text-slate-700 mb-2">
              Document Details
            </h2>
            <div className="grid grid-cols-2 gap-1">
              <ReusableInput label="PO No." value="1" readOnly />
              <ReusableInput label="Reference" />
              <ReusableInput label="PO Date" type="date" />
              <ReusableInput label="Due Date" type="date" />
            </div>
          </div>
        </div>
        {/* Rest of your components */}
        <ItemList />
<div className="grid grid-cols-3 gap-3">
  <div className="border border-slate-200 p-3 bg-white rounded-md shadow-sm">
    <h2 className="font-medium text-slate-700 mb-2 text-base">
      Terms & Conditions
    </h2>
    <button className="bg-indigo-100 px-2.5 py-1.5 rounded-md hover:bg-indigo-200 flex items-center text-xs text-indigo-700 transition-colors">
      <HiPlus className="w-3 h-3 mr-1.5" />
      Add Term
    </button>
    <div className="mt-3 space-y-1.5">
      <div className="flex justify-between items-center p-1.5 bg-slate-50 rounded text-[12px]">
        <span>Payment due within 30 days</span>
        <button className="text-red-400 hover:text-red-500">
          <HiTrash className="w-4 h-4" />
        </button>
      </div>
      <div className="flex justify-between items-center p-1.5 bg-slate-50 rounded text-[12px]">
        <span>Late fee of 2% per month</span>
        <button className="text-red-400 hover:text-red-500">
          <HiTrash className="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>

  <div className="border border-slate-200 p-3 bg-white rounded-md shadow-sm">
    <h2 className="font-medium text-slate-700 mb-2 text-base">Notes</h2>
    <textarea
      className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-md h-24 focus:ring-1 focus:ring-indigo-200 focus:border-indigo-500"
      placeholder="Additional notes..."
    />
  </div>

  {/* Pricing Summary (Grand Total) Section */}
  <div className="border border-slate-200 p-3 bg-white rounded-md shadow-sm">
    <h2 className="font-semibold text-slate-800 mb-2 text-base">
      Pricing Summary
    </h2>

    <div className="space-y-1.5">
      <div className="flex justify-between py-1 text-sm">
        <span className="text-slate-600">Subtotal</span>
        <span className="font-medium">$1,250.00</span>
      </div>

      <div className="bg-slate-50 p-2 rounded">
        
        <div className="flex justify-between items-center mb-1 text-xs">
          <button
            className="text-green-600 hover:text-green-800 flex items-center"
            onClick={() => setShowDiscount(true)}
          >
            <HiMinus className="w-2.5 h-2.5 mr-1" />
            <span>Add Discount</span>
          </button>
          <span className="font-medium">-$50.00</span>
        </div>
        
        <div className="flex justify-between items-center text-xs">
          <button
            className="text-indigo-600 hover:text-indigo-800 flex items-center"
            onClick={() => setShowExtraCharge(true)}
          >
            <HiPlus className="w-2.5 h-2.5 mr-1" />
            <span>Add Extra Charge</span>
          </button>
          <span className="font-medium">$0.00</span>
        </div>
      </div>

      <div className="border-t border-slate-200 pt-2 flex justify-between text-sm">
        <span className="text-slate-800 font-semibold">Grand Total</span>
        <span className="font-bold text-indigo-700">$1,200.00</span>
      </div>
    </div>
  </div>

  {showExtraCharge && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl p-4 w-full max-w-sm">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-base font-semibold">Add Extra Charge</h3>
          <button onClick={() => setShowExtraCharge(false)} className="text-slate-400 hover:text-slate-600">
            <HiX className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
            <input 
              type="text" 
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="e.g. Delivery fee"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Amount</label>
            <input 
              type="number" 
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="0.00"
            />
          </div>
          <button className="w-full bg-indigo-600 text-white py-1.5 px-3 rounded text-sm hover:bg-indigo-700 transition">
            Apply Charge
          </button>
        </div>
      </div>
    </div>
  )}

  {showDiscount && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl p-4 w-full max-w-sm">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-base font-semibold">Add Discount</h3>
          <button onClick={() => setShowDiscount(false)} className="text-slate-400 hover:text-slate-600">
            <HiX className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
            <input 
              type="text" 
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="e.g. Summer promotion"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Type</label>
              <select className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500">
                <option>Percentage</option>
                <option>Fixed Amount</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Value</label>
              <input 
                type="number" 
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="0.00"
              />
            </div>
          </div>
          <button className="w-full bg-green-600 text-white py-1.5 px-3 rounded text-sm hover:bg-green-700 transition">
            Apply Discount
          </button>
        </div>
      </div>
    </div>
  )}
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
        </div>{" "}
      </div>
    </div>
  );
};

export default Manufacture;
