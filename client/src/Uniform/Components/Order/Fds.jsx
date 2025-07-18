import React, { useState } from 'react';
import { useGetSizeTableMasterQuery,  useGetSizeTableMasterByReferenceQuery,
 } from "../../../redux/uniformService/SizeTableMasterService";
import secureLocalStorage from 'react-secure-storage';

export default function AQLForm() {
  const [selectedReference, setSelectedReference] = useState('');
  const [inspectionDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedAge, setSelectedAge] = useState('');
  const [measurementYear, setMeasurementYear] = useState('');
  const [tolerance, setTolerance] = useState('');
  const [checkList, setCheckList] = useState(Array(7).fill(''));
  const [showAgeDropdown, setShowAgeDropdown] = useState(false);
  const [showMeasurementDropdown, setShowMeasurementDropdown] = useState(false);
   console.log(selectedReference,"selectedReference")
  const companyId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userCompanyId"
  );
  
const { data: sizeData } = useGetSizeTableMasterQuery(
  { productReference: selectedReference },
  {
    skip: !selectedReference,
  }
);

    const {
      data: sizeTableData,

    } = useGetSizeTableMasterByReferenceQuery();
  

const references = [
  ...new Set(sizeData?.data?.map(item => item.productReference) || [])
];

  const selectedProduct = sizeData?.data?.find(item => item.productReference === selectedReference);
  const availableAges = selectedProduct 
    ? [...new Set(selectedProduct.measurements.flatMap(m => m.values.map(v => v.size)))] 
    : [];

const availableYears = selectedProduct && selectedAge
  ? [...new Set(
      selectedProduct.measurements
        .filter(m => m.values.some(v => v.size === selectedAge))
        .map(m => m.description)
    )]
  : [];

  const selectedMeasurement = selectedProduct && measurementYear
    ? selectedProduct.measurements.find(m => m.description === measurementYear)
    : null;
  
  React.useEffect(() => {
    if (selectedMeasurement) {
      setTolerance(`${selectedMeasurement.toleranceMin || '0'} / ${selectedMeasurement.toleranceMax || '0'}`);
    } else {
      setTolerance('');
    }
  }, [selectedMeasurement]);

  const handleCheckListChange = (index, value) => {
    const newCheckList = [...checkList];
    newCheckList[index] = value;
    setCheckList(newCheckList);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({
      selectedReference,
      inspectionDate,
      selectedAge,
      measurementYear,
      tolerance,
      checkList
    });
    alert('AQL Form submitted successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">AQL Inspection Form</h1>
            <p className="text-blue-100">Quality control measurement form</p>
          </div>
          
          <div className="p-6">
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Reference <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedReference}
                    onChange={(e) => setSelectedReference(e.target.value)}
                    className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none bg-white"
                    required
                  >
                    <option value="">Select a reference</option>
                    {sizeTableData?.data?.map((ref, index) => (
                      <option key={index} value={ref.references}>{ref.reference}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Inspection Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={inspectionDate}
                    readOnly
                    className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg shadow-sm bg-gray-100 cursor-not-allowed"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Age <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowAgeDropdown(!showAgeDropdown)}
                    className="w-full px-4 py-3 text-left text-sm border border-gray-300 rounded-lg shadow-sm bg-white flex justify-between items-center"
                  >
                    <span>{selectedAge || 'Select age'}</span>
                    <svg className={`h-5 w-5 text-gray-400 transition-transform ${showAgeDropdown ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {showAgeDropdown && (
                    <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 max-h-60 overflow-auto focus:outline-none sm:text-sm">
                      {availableAges.length > 0 ? (
                        availableAges.map((age, index) => (
                          <div
                            key={index}
                            className="px-4 py-2 hover:bg-blue-50 cursor-pointer"
                            onClick={() => {
                              setSelectedAge(age);
                              setShowAgeDropdown(false);
                              setMeasurementYear('');
                            }}
                          >
                            {age} Years
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-2 text-gray-500">No ages available</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Measurement Year <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => selectedAge && setShowMeasurementDropdown(!showMeasurementDropdown)}
                    disabled={!selectedAge}
                    className={`w-full px-4 py-3 text-left text-sm border border-gray-300 rounded-lg shadow-sm flex justify-between items-center ${
                      !selectedAge ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
                    }`}
                  >
                    <span>{measurementYear || 'Select measurement'}</span>
                    <svg className={`h-5 w-5 text-gray-400 transition-transform ${showMeasurementDropdown ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {showMeasurementDropdown && (
                    <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 max-h-60 overflow-auto focus:outline-none sm:text-sm">
                      {availableYears.length > 0 ? (
                        availableYears.map((year, index) => (
                          <div
                            key={index}
                            className="px-4 py-2 hover:bg-blue-50 cursor-pointer"
                            onClick={() => {
                              setMeasurementYear(year);
                              setShowMeasurementDropdown(false);
                            }}
                          >
                            {year}
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-2 text-gray-500">No measurements available</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tolerance
                </label>
                <input
                  type="text"
                  value={tolerance}
                  readOnly
                  className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg shadow-sm bg-gray-100"
                />
              </div>
              
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Check List (7 Pieces)
                </label>
                <div className="space-y-3">
                  {checkList.map((value, index) => (
                    <div key={index} className="flex items-center">
                      <span className="w-8 text-sm font-medium text-gray-700">#{index + 1}</span>
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => handleCheckListChange(index, e.target.value)}
                        className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder={`Enter value for piece ${index + 1}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedReference('');
                    setSelectedAge('');
                    setMeasurementYear('');
                    setTolerance('');
                    setCheckList(Array(7).fill(''));
                  }}
                  className="px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={!selectedReference || !selectedAge || !measurementYear}
                  className={`px-6 py-3 rounded-lg shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all ${
                    !selectedReference || !selectedAge || !measurementYear
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  Submit Inspection
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}