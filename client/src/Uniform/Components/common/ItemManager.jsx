import { useState } from 'react';
import {
  HiX, HiPlus, HiPencil, HiTrash, HiCheck,
  HiChevronUp, HiChevronDown, HiSearch, HiOutlineSelector
} from 'react-icons/hi';
import AddItemPopup from './AddItempopup';

export default function ItemManager({ onClose, onSave }) {
  const initialItems = [
    {
      id: '890123456789',
      name: 'Premium Product X',
      hsn: '1234',
      rate: 2499,
      unit: 'pcs',
      checked: false
    },
    {
      id: '890987654321',
      name: 'Standard Product Y',
      hsn: '5678',
      rate: 1299,
      unit: 'pcs',
      checked: false
    },
      {
      id: '891123456789',
      name: 'Premium Product Z',
      hsn: '1234',
      rate: 2499,
      unit: 'pcs',
      checked: false
    },
    {
      id: '892987654321',
      name: 'Standard Product A',
      hsn: '5678',
      rate: 1299,
      unit: 'pcs',
      checked: false
    },
    
  ];

  const [items, setItems] = useState(initialItems);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedItems = [...items].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
    if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const filteredItems = sortedItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.hsn.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleCheckbox = (index) => {
    setItems(prev =>
      prev.map((item, i) =>
        i === index ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const handleDelete = (index) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      setItems(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleEdit = (index) => {
    const item = items[index];
    const editedItem = { ...item };

    const newName = prompt('Edit item name:', item.name);
    if (newName !== null && newName.trim() !== '') editedItem.name = newName;

    const newHsn = prompt('Edit HSN code:', item.hsn);
    if (newHsn !== null) editedItem.hsn = newHsn;

    const newRate = prompt('Edit rate:', item.rate);
    if (newRate !== null && !isNaN(newRate)) editedItem.rate = parseFloat(newRate);

    const newUnit = prompt('Edit unit:', item.unit);
    if (newUnit !== null) editedItem.unit = newUnit;

    setItems(prev =>
      prev.map((it, i) =>
        i === index ? editedItem : it
      )
    );
  };

  const handleAddNew = () => {
    setIsAdding(true);
  };

  const handleAddItem = (newItem) => {
    setItems(prev => [...prev, {
      ...newItem,
      id: Date.now().toString(),
      checked: false
    }]);
    setIsAdding(false);
  };

  const handleSave = () => {
    const checkedItems = items.filter(item => item.checked);
    if (checkedItems.length === 0) {
      alert('Please select at least one item to add');
      return;
    }
    onSave(checkedItems);
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <HiOutlineSelector className="inline ml-1 opacity-30" />;
    return sortConfig.direction === 'asc' ?
      <HiChevronUp className="inline ml-1" /> :
      <HiChevronDown className="inline ml-1" />;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-[#f1f1f0] rounded-lg shadow-2xl w-[50%] max-h-[95vh] flex flex-col overflow-hidden border border-gray-300">
        <div className="flex justify-between items-center bg-[#f1f1f0] px-4 py-3 border-b border-gray-300 ">
          <h3 className="text-lg font-bold text-gray-800">Item Manager</h3>
            <button onClick={onClose} className="text-white bg-red-500 p-1 rounded-full hover:bg-red-700">
            <HiX className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 py-3 border-b border-gray-300bg-[#f1f1f0]">
          <div className="flex items-center gap-2">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <HiSearch className="text-gray-500 w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Search by name or HSN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-full border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleAddNew}
              className="flex items-center gap-1 px-3 py-1 border border-green-700 hover:text-white hover:bg-green-700 text-green-600 rounded-lg transition-colors text-sm"
            >
              <HiPlus className="w-4 h-4" />
              <span>Add Item</span>
            </button>
          </div>
        </div>

        {isAdding && (
          <AddItemPopup 
            onClose={() => setIsAdding(false)}
            onSave={handleAddItem}
          />
        )}

        <div className="flex-1 overflow-y-auto bg-[#f1f1f0]">
          <div className="min-w-full">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase w-8">
                    <input 
                      type="checkbox" 
                      className="h-3 w-3" 
                      checked={items.length > 0 && items.every(item => item.checked)}
                      onChange={() => {
                        const allChecked = items.every(item => item.checked);
                        setItems(items.map(item => ({ ...item, checked: !allChecked })));
                      }}
                    />
                  </th>
                  <th 
                    scope="col" 
                    onClick={() => requestSort('name')} 
                    className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase cursor-pointer hover:bg-gray-200"
                  >
                    <div className="flex items-center">
                      Name
                      {getSortIcon('name')}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    onClick={() => requestSort('hsn')} 
                    className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase cursor-pointer hover:bg-gray-200"
                  >
                    <div className="flex items-center">
                      HSN
                      {getSortIcon('hsn')}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    onClick={() => requestSort('rate')} 
                    className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase cursor-pointer hover:bg-gray-200"
                  >
                    <div className="flex items-center">
                      Rate
                      {getSortIcon('rate')}
                    </div>
                  </th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">
                    Unit
                  </th>
                  <th scope="col" className="px-3 py-2 text-right text-xs font-semibold text-gray-700 uppercase w-24">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-300">
                {filteredItems.length > 0 ? (
                  filteredItems.map((item, index) => (
                    <tr 
                      key={item.id} 
                      className={item.checked ? 'bg-green-50' : 'hover:bg-gray-100'}
                    >
                      <td className="px-3 py-2">
                        <input
                          type="checkbox"
                          checked={item.checked}
                          onChange={() => toggleCheckbox(index)}
                          className="h-3 w-3 text-green-600"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-sm font-medium text-gray-900 truncate max-w-[160px]">{item.name}</div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-sm text-gray-700">{item.hsn}</div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-sm font-semibold text-gray-900">₹{item.rate.toFixed(2)}</div>
                      </td>
                      <td className="px-3 py-2">
                        <span className="text-xs font-medium bg-gray-200 text-gray-800 px-1.5 py-0.5 rounded">
                          {item.unit}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <div className="flex justify-end gap-1">
                          <button 
                            onClick={() => handleEdit(index)} 
                            className="p-1.5 rounded-md text-blue-600 hover:bg-blue-100"
                            title="Edit"
                          >
                            <HiPencil className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(index)} 
                            className="p-1.5 rounded-md text-red-600 hover:bg-red-100"
                            title="Delete"
                          >
                            <HiTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-4 py-3 text-center text-sm text-gray-500">
                      {searchTerm ? 'No matching items found' : 'No items available'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="border-t border-gray-300 px-4 py-3 bg-[#f1f1f0] flex justify-between items-center">
          <div className="text-xs text-gray-600">
            {filteredItems.length} items shown
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1 text-sm text-red-700 bg-white border border-red-700 rounded-lg hover:bg-red-700 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1 text-sm  border border-green-700 hover:text-white hover:bg-green-700 text-green-600 rounded-lg hover:bg-green-700"
            >
              Add Selected
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}