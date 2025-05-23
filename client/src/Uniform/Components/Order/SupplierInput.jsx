import { useState } from 'react';
import { FaPlus, FaSearch, FaInfoCircle } from 'react-icons/fa';

export default function SupplierInput() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [supplierList, setSupplierList] = useState([
    'Supplier One',
    'Supplier Two',
    'Supplier Three',
  ]);
  const [newSupplierName, setNewSupplierName] = useState('');
  const [showTooltip, setShowTooltip] = useState(false);

  const filteredSuppliers = supplierList.filter(s =>
    s.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveSupplier = () => {
    if (newSupplierName.trim()) {
      setSupplierList([...supplierList, newSupplierName.trim()]);
      setSearchTerm(newSupplierName.trim());
      setShowAddSupplier(false);
      setNewSupplierName('');
    }
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">Supplier</label>

      {/* Combined Input with Search and Add buttons */}
      <div className="flex gap-2">
        {/* Search Input with icon */}
        <div className="relative flex-grow">
          <FaSearch className="absolute left-3 top-3.5 text-gray-400 text-sm" />
          <input
            className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            placeholder="Type to search suppliers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Add Supplier Button with Tooltip */}
        <div className="relative">
          <button
            className="h-full px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
            onClick={() => setShowAddSupplier(true)}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            aria-label="Add new supplier"
          >
            <FaPlus className="text-gray-600" />
          </button>
          
          {/* Tooltip */}
          {showTooltip && (
            <div className="absolute z-10 top-full right-0 mt-2 w-48 bg-gray-800 text-white text-sm rounded p-2 shadow-lg">
              <div className="flex items-start">
                <FaInfoCircle className="flex-shrink-0 mt-0.5 mr-1" />
                <span>Click to add a new supplier</span>
              </div>
              <div className="absolute -top-1 right-3 w-3 h-3 bg-gray-800 transform rotate-45"></div>
            </div>
          )}
        </div>
      </div>

      {/* Dropdown results */}
      {searchTerm && (
        <div className="mt-2 border border-gray-200 rounded-lg overflow-hidden shadow-lg max-h-48 overflow-y-auto bg-white animate-fadeIn">
          {filteredSuppliers.length > 0 ? (
            filteredSuppliers.map((supplier, idx) => (
              <div  
                key={idx}
                className="px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors"
                onClick={() => setSearchTerm(supplier)}
              >
                <span className="text-gray-700">{supplier}</span>
              </div>
            ))
          ) : (
            <button
              type="button"
              className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-2 text-blue-600 font-medium"
              onClick={() => setShowAddSupplier(true)}
            >
              <FaPlus className="text-sm" />
              Create "{searchTerm}"
            </button>
          )}
        </div>
      )}

      {/* Add Supplier Modal */}
      {showAddSupplier && (
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-[95%] max-w-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">New Supplier</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Supplier Name
                </label>
                <input
                  type="text"
                  placeholder="Enter supplier name"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={newSupplierName}
                  onChange={(e) => setNewSupplierName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveSupplier()}
                  autoFocus
                />
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  className="px-5 py-2.5 text-gray-600 hover:text-gray-800 font-medium rounded-lg transition-colors"
                  onClick={() => setShowAddSupplier(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  onClick={handleSaveSupplier}
                >
                  Save Supplier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}