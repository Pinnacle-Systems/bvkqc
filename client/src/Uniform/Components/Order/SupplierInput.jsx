import { useState } from 'react';
import { FaPlus, FaSearch, FaInfoCircle } from 'react-icons/fa';

export default function ReusableSearchableInput({
  label = 'Label',
  placeholder = 'Search...',
  itemList = [],
  onAddItem = () => {},
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState('');
  const [tooltipVisible, setTooltipVisible] = useState(false);

  const filteredList = itemList.filter(item =>
    item.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = () => {
    const trimmed = newItem.trim();
    if (trimmed) {
      onAddItem(trimmed);
      setSearchTerm(trimmed);
      setShowAddModal(false);
      setNewItem('');
    }
  };

  return (
    <div className="relative text-sm w-full">
      <label className="block text-xs font-medium text-slate-500 mb-1">{label}</label>

      <div className="flex gap-2">
        {/* Input Field */}
        <div className="relative flex-grow">
          <FaSearch className="absolute left-3 top-3 text-slate-400 text-xs" />
          <input
            className="w-full pl-8 pr-2 py-1.5 text-sm border border-slate-300 rounded-md 
              focus:border-sky-300 focus:outline-none transition-all duration-200
              hover:border-slate-400"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Add Button with Tooltip */}
        <div className="relative">
          <button
            className="h-full px-3 py-1.5 border border-green-500 rounded-md bg-green-100
              hover:bg-green-500 text-green-600 hover:text-white  transition-colors flex items-center justify-center"
            onClick={() => setShowAddModal(true)}
            onMouseEnter={() => setTooltipVisible(true)}
            onMouseLeave={() => setTooltipVisible(false)}
            aria-label="Add item"
          >
            <FaPlus className="  text-sm" />
          </button>
          {tooltipVisible && (
            <div className="absolute z-10 top-full right-0 mt-1 w-48 bg-sky-800 text-white text-xs rounded p-2 shadow-lg">
              <div className="flex items-start">
                <FaInfoCircle className="flex-shrink-0 mt-0.5 mr-1" />
                <span>Click to add a new item</span>
              </div>
              <div className="absolute -top-1 right-3 w-2.5 h-2.5 bg-sky-800 transform rotate-45"></div>
            </div>
          )}
        </div>
      </div>

      {/* Dropdown Suggestions */}
      {searchTerm && (
        <div className="border border-slate-200 rounded-md shadow-md bg-white mt-1 max-h-40 overflow-y-auto z-20 relative">
          {filteredList.length > 0 ? (
            filteredList.map((item, idx) => (
              <div
                key={idx}
                className="px-3 py-2 hover:bg-slate-50 cursor-pointer transition-colors"
                onClick={() => setSearchTerm(item)}
              >
                {item}
              </div>
            ))
          ) : (
            <button
              type="button"
              className="w-full px-3 py-2 text-left text-sky-600 hover:bg-slate-50 flex items-center gap-2"
              onClick={() => setShowAddModal(true)}
            >
              <FaPlus className="text-xs" />
              Create "{searchTerm}"
            </button>
          )}
        </div>
      )}

      {/* Modal */}
   {showAddModal && (
  <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-xl w-[95%] max-w-md">
      <h2 className="text-xl font-semibold mb-4 text-slate-800 border-b pb-2">
        Business Details
      </h2>
      
      <div className="space-y-4">
        {/* Name Section */}
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-1">
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <select className="w-full px-3 py-2 border border-slate-300 rounded-md 
              focus:border-sky-300 focus:outline-none text-sm">
              <option>Mr.</option>
              <option>Mrs.</option>
              <option>Ms.</option>
              <option>Dr.</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Business Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-slate-300 rounded-md 
                focus:border-sky-300 focus:outline-none text-sm"
              placeholder="Enter business name"
            />
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Mobile <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <select className="w-1/4 px-2 py-2 border border-slate-300 rounded-md 
                focus:border-sky-300 focus:outline-none text-sm">
                <option>+91</option>
                <option>+1</option>
                <option>+44</option>
              </select>
              <input
                type="tel"
                className="w-3/4 px-3 py-2 border border-slate-300 rounded-md 
                  focus:border-sky-300 focus:outline-none text-sm"
                placeholder="Enter mobile number"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full px-3 py-2 border border-slate-300 rounded-md 
                focus:border-sky-300 focus:outline-none text-sm"
              placeholder="Enter email address"
            />
          </div>
        </div>

        {/* Business Details */}
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Industry & Segment
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-slate-300 rounded-md 
                focus:border-sky-300 focus:outline-none text-sm"
              placeholder="Enter industry type"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Website
            </label>
            <input
              type="url"
              className="w-full px-3 py-2 border border-slate-300 rounded-md 
                focus:border-sky-300 focus:outline-none text-sm"
              placeholder="https://example.com"
            />
          </div>
        </div>

        {/* Address Section */}
        <div className="border-t pt-4 mt-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold text-slate-700">
              Address & GST Details
            </h3>
            <button className="text-sky-600 hover:text-sky-700 text-sm flex items-center">
              <FaPlus className="mr-1 text-xs" />
              Add Address
            </button>
          </div>

          <div className="space-y-3">
            <div className="grid md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Country
                </label>
                <select className="w-full px-3 py-2 border border-slate-300 rounded-md 
                  focus:border-sky-300 focus:outline-none text-sm">
                  <option>India</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  State
                </label>
                <select className="w-full px-3 py-2 border border-slate-300 rounded-md 
                  focus:border-sky-300 focus:outline-none text-sm">
                  <option>Select State</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  City
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md 
                    focus:border-sky-300 focus:outline-none text-sm"
                  placeholder="Enter city"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  MSME No.
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md 
                    focus:border-sky-300 focus:outline-none text-sm"
                  placeholder="Enter MSME number"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  PAN No.
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md 
                    focus:border-sky-300 focus:outline-none text-sm"
                  placeholder="Enter PAN number"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-6 border-t mt-4">
          <button
            onClick={() => setShowAddModal(false)}
            className="px-5 py-2 text-slate-600 hover:text-slate-800 rounded-md 
              hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white 
              rounded-md transition-colors shadow-sm"
          >
            Save Details
          </button>
        </div>
      </div>

      <p className="text-xs text-slate-500 mt-4">
        Fields marked with <span className="text-red-500">*</span> are required
      </p>
    </div>
  </div>
)}
    </div>
  );
}