import { useState } from 'react';
import { FaPlus, FaSearch, FaInfoCircle } from 'react-icons/fa';
import { FaChevronRight } from 'react-icons/fa';
import PartyDetailModal from './partyMaster';

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
  const [isAddressExpanded, setIsAddressExpanded] = useState(false);
const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
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
        <div className="relative flex-grow">
          <FaSearch className="absolute left-3 top-3 text-slate-400 text-xs" />
          <input
            className="w-full pl-8 pr-2 py-1.5 text-sm border border-slate-300 rounded-md 
              focus:border-indigo-300 focus:outline-none transition-all duration-200
              hover:border-slate-400"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

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
            <div className="absolute z-10 top-full right-0 mt-1 w-48 bg-indigo-800 text-white text-xs rounded p-2 shadow-lg">
              <div className="flex items-start">
                <FaInfoCircle className="flex-shrink-0 mt-0.5 mr-1" />
                <span>Click to add a new item</span>
              </div>
              <div className="absolute -top-1 right-3 w-2.5 h-2.5 bg-indigo-800 transform rotate-45"></div>
            </div>
          )}
        </div>
      </div>

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
              className="w-full px-3 py-2 text-left text-indigo-600 hover:bg-slate-50 flex items-center gap-2"
              onClick={() => setShowAddModal(true)}
            >
              <FaPlus className="text-xs" />
              Create "{searchTerm}"
            </button>
          )}
        </div>
      )}

   {showAddModal && (
    <PartyDetailModal />
)}
    </div>
  );
}