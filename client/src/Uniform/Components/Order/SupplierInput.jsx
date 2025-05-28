import { useState } from 'react';
import { FaPlus, FaSearch, FaInfoCircle, FaEdit, FaTrash } from 'react-icons/fa';
import PartyDetailModal from './partyMaster';
import { useModal } from '../../../Basic/pages/home/context/ModalContext';

export default function ReusableSearchableInput({
  label = 'Supplier',
  placeholder = 'Search suppliers...',
  onAddItem = () => {},
  onEditItem = () => {},
  onDeleteItem = () => {},
}) {
  const [searchTerm, setSearchTerm] = useState('');
 const { openAddModal } = useModal();
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
   const itemList=[
    { id: 1, name: 'ABC Suppliers', code: 'SUP-001' },
    { id: 2, name: 'XYZ Distributors', code: 'SUP-002' },
  ]
  const filteredList = itemList.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.code && item.code.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  const handleEdit = (item, e) => {
    e.stopPropagation();
    setEditingItem(item);
    openAddModal()
  };

  const handleDelete = (item, e) => {
    e.stopPropagation();
    onDeleteItem(item);
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
              hover:bg-green-500 text-green-600 hover:text-white transition-colors flex items-center justify-center"
            onClick={openAddModal}
            onMouseEnter={() => setTooltipVisible(true)}
            onMouseLeave={() => setTooltipVisible(false)}
            aria-label="Add supplier"
          >
            <FaPlus className="text-sm" />
          </button>
          {tooltipVisible && (
            <div className="absolute z-10 top-full right-0 mt-1 w-48 bg-indigo-800 text-white text-xs rounded p-2 shadow-lg">
              <div className="flex items-start">
                <FaInfoCircle className="flex-shrink-0 mt-0.5 mr-1" />
                <span>Click to add a new supplier</span>
              </div>
              <div className="absolute -top-1 right-3 w-2.5 h-2.5 bg-indigo-800 transform rotate-45"></div>
            </div>
          )}
        </div>
      </div>

      {searchTerm && (
        <div className="border border-slate-200 rounded-md shadow-md bg-white mt-1 max-h-40 overflow-y-auto z-20 absolute w-full">
          {filteredList.length > 0 ? (
            filteredList.map((item) => (
              <div
                key={item.id}
                className="px-3 py-2 hover:bg-slate-50 cursor-pointer transition-colors flex justify-between items-center group"
                onClick={() => setSearchTerm(item.name)}
              >
                <div>
                  <div className="font-medium">{item.name}</div>
                  {item.code && (
                    <div className="text-xs text-slate-500">Code: {item.code}</div>
                  )}
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    className="text-indigo-600 hover:text-indigo-800 p-1"
                    onClick={(e) => handleEdit(item, e)}
                    title="Edit supplier"
                  >
                    <FaEdit className="text-sm" />
                  </button>
                  <button 
                    className="text-red-600 hover:text-red-800 p-1"
                    onClick={(e) => handleDelete(item, e)}
                    title="Delete supplier"
                  >
                    <FaTrash className="text-sm" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <button
              type="button"
              className="w-full px-3 py-2 text-left text-indigo-600 hover:bg-slate-50 flex items-center gap-2"
              onClick={() => {
                setEditingItem(null);
              }}
            >
              <FaPlus className="text-xs" />
              Create "{searchTerm}"
            </button>
          )}
        </div>
      )}
    
    </div>
  );
}