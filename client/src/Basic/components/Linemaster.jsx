import React, { useState, useEffect } from 'react';

const GarmentLineMaster = () => {
  // State variables
  const [garmentLines, setGarmentLines] = useState([]);
  const [formData, setFormData] = useState({
    id: '',
    lineCode: '',
    lineName: '',
    productionCapacity: '',
    status: 'Active'
  });
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Load data from localStorage on component mount
  useEffect(() => {
    const storedData = localStorage.getItem('garmentLines');
    if (storedData) {
      setGarmentLines(JSON.parse(storedData));
    }
  }, []);

  // Save data to localStorage whenever garmentLines change
  useEffect(() => {
    localStorage.setItem('garmentLines', JSON.stringify(garmentLines));
  }, [garmentLines]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isEditing) {
      // Update existing line
      setGarmentLines(prev =>
        prev.map(line => line.id === formData.id ? formData : line)
      );
    } else {
      // Create new line
      const newLine = { ...formData, id: Date.now().toString() };
      setGarmentLines(prev => [...prev, newLine]);
    }
    
    resetForm();
  };

  // Edit garment line
  const handleEdit = (line) => {
    setFormData(line);
    setIsEditing(true);
  };

  // Delete garment line
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this line?')) {
      setGarmentLines(prev => prev.filter(line => line.id !== id));
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      id: '',
      lineCode: '',
      lineName: '',
      productionCapacity: '',
      status: 'Active'
    });
    setIsEditing(false);
  };

  // Filter garment lines based on search term
  const filteredLines = garmentLines.filter(line =>
    line.lineCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    line.lineName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Garment Line Master</h1>
      
      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by code or name..."
          className="w-full p-2 border rounded"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Line Code*</label>
            <input
              type="text"
              name="lineCode"
              value={formData.lineCode}
              onChange={handleChange}
              className="mt-1 p-2 w-full border rounded"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Line Name*</label>
            <input
              type="text"
              name="lineName"
              value={formData.lineName}
              onChange={handleChange}
              className="mt-1 p-2 w-full border rounded"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Production Capacity</label>
            <input
              type="number"
              name="productionCapacity"
              value={formData.productionCapacity}
              onChange={handleChange}
              className="mt-1 p-2 w-full border rounded"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="mt-1 p-2 w-full border rounded"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
        
        <div className="mt-4 flex space-x-2">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {isEditing ? 'Update Line' : 'Add Line'}
          </button>
          
          {isEditing && (
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Data Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b">Code</th>
              <th className="py-2 px-4 border-b">Name</th>
              <th className="py-2 px-4 border-b">Capacity</th>
              <th className="py-2 px-4 border-b">Status</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLines.length > 0 ? (
              filteredLines.map(line => (
                <tr key={line.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{line.lineCode}</td>
                  <td className="py-2 px-4 border-b">{line.lineName}</td>
                  <td className="py-2 px-4 border-b">{line.productionCapacity || '-'}</td>
                  <td className="py-2 px-4 border-b">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      line.status === 'Active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {line.status}
                    </span>
                  </td>
                  <td className="py-2 px-4 border-b flex space-x-2">
                    <button
                      onClick={() => handleEdit(line)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(line.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="py-4 px-4 text-center text-gray-500">
                  No garment lines found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GarmentLineMaster;