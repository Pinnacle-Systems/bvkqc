import { HiPlus, HiShare, HiTrash, HiMinus, HiLocationMarker, HiCheck } from "react-icons/hi";
import { FaQuestionCircle, FaUpload, FaWhatsapp } from "react-icons/fa";
import { FaFileAlt } from "react-icons/fa";
import { HiOutlineRefresh } from "react-icons/hi";
import {
  ReusableDropdown,
  ReusableInput,
} from "./CommonInput";
import { useState, useMemo } from 'react';
import { FiSave, FiPrinter, FiShare2 } from "react-icons/fi";
import Select from 'react-select';
import { Country } from 'country-state-city';

const Manufacture = ({ onClose }) => {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [fabricImage, setFabricImage] = useState(null);
  const [showImageTooltip, setShowImageTooltip] = useState(false);

  const [constructionDetails, setConstructionDetails] = useState({
    construction: '',
    fiberContent: '',
    yarnDetails: '',
    weightGSM: '',
    weightOpposite: '',
    weftWalesCount: '',
    widthFinished: '',
    widthCuttale: '',
    wrapCoursesCount: ''
  });

  const [processFinishing, setProcessFinishing] = useState({
    dyedMethod: '',
    printingMethod: '',
    surfaceFinish: '',
    otherPerformanceFunction: ''
  });

  const [testPerformance, setTestPerformance] = useState({
    testName: '',
    testResult: '',
    testStandard: '',
    additionalTests: [],
    careInstructions: '',
    qualityLimitations: ''
  });

  const [productionDetails, setProductionDetails] = useState({
    reportData: '',
    supportingDocs: []
  });

  const customSelectStyles = {
    control: (provided) => ({
      ...provided,
      minHeight: '32px',
      height: '32px',
      fontSize: '14px',
      borderColor: '#cbd5e1',
      '&:hover': {
        borderColor: '#94a3b8'
      }
    }),
    valueContainer: (provided) => ({
      ...provided,
      height: '32px',
      padding: '0 8px'
    }),
    input: (provided) => ({
      ...provided,
      margin: '0px',
    }),
    indicatorsContainer: (provided) => ({
      ...provided,
      height: '32px',
    }),
    option: (provided) => ({
      ...provided,
      fontSize: '14px',
      padding: '8px 12px'
    }),
  };



  const handleConstructionChange = (e) => {
    const { name, value } = e.target;
    setConstructionDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProcessFinishingChange = (e) => {
    const { name, value } = e.target;
    setProcessFinishing(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const [showModal, setShowModal] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 5 * 1024 * 1024) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFabricImage(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      alert("Please select an image under 5MB.");
    }
  };

  const handleTestPerformanceChange = (e) => {
    const { name, value } = e.target;
    setTestPerformance(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // const handleAddTestResult = () => {
  //   if (testPerformance.testName && testPerformance.testResult) {
  //     setTestPerformance(prev => ({
  //       ...prev,
  //       additionalTests: [
  //         ...prev.additionalTests,
  //         {
  //           name: prev.testName,
  //           result: prev.testResult,
  //           standard: prev.testStandard
  //         }
  //       ],
  //       testName: '',
  //       testResult: '',
  //       testStandard: ''
  //     }));
  //   }
  // };

  // const handleRemoveTestResult = (index) => {
  //   setTestPerformance(prev => ({
  //     ...prev,
  //     additionalTests: prev.additionalTests.filter((_, i) => i !== index)
  //   }));
  // };

  // const handleProductionDetailsChange = (e) => {
  //   const { name, value } = e.target;
  //   setProductionDetails(prev => ({
  //     ...prev,
  //     [name]: value
  //   }));
  // };

  // const handleSupportingDocsUpload = (e) => {
  //   const files = Array.from(e.target.files);
  //   setProductionDetails(prev => ({
  //     ...prev,
  //     supportingDocs: [...prev.supportingDocs, ...files]
  //   }));
  // };

  // const handleRemoveSupportingDoc = (index) => {
  //   setProductionDetails(prev => ({
  //     ...prev,
  //     supportingDocs: prev.supportingDocs.filter((_, i) => i !== index)
  //   }));
  // };

  const countryOptions = useMemo(() => {
    return Country.getAllCountries().map(country => ({
      label: country.name,
      value: country.isoCode,
      ...country
    }));
  }, []);


  return (
    <>
      <div className="w-full bg-[#f1f1f0] mx-auto rounded-md shadow-md px-2 py-1">
        <div className="flex justify-between items-center mb-1">
          <h1 className="text-2xl font-bold text-gray-800">Fabric Description Sheet</h1>
          <button
            onClick={onClose}
            className="text-indigo-600 hover:text-indigo-700"
            title="Open Report"
          >
            <FaFileAlt className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-slate-200 p-4 bg-white rounded-lg shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-medium text-slate-700 text-base">Basic Information</h2>
                  <div className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                    Required fields
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4">
                  <ReusableInput
                    label="FDS Date"
                    type="date"
                    className="[&>input]:py-1.5"
                  />

                  <ReusableInput
                    label="Fab Code"
                    placeholder="Enter fabric code"
                    className="[&>input]:py-1.5"
                  />
                  <ReusableInput
                    label="Fab Type"
                    placeholder="Enter fabric Type"
                    className="[&>input]:py-1.5"
                  />


                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Country Of Origin (Fabric)
                    </label>
                    <Select
                      styles={customSelectStyles}
                      options={countryOptions}
                      value={selectedCountry}
                      onChange={(option) => setSelectedCountry(option)}
                      placeholder="Select Country"
                      className="text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Country Of Origin (Yarn)
                    </label>
                    <Select
                      styles={customSelectStyles}
                      options={countryOptions}
                      value={selectedCountry}
                      onChange={(option) => setSelectedCountry(option)}
                      placeholder="Select Country"
                      className="text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Country Of Origin (Fiber)
                    </label>
                    <Select
                      styles={customSelectStyles}
                      options={countryOptions}
                      value={selectedCountry}
                      onChange={(option) => setSelectedCountry(option)}
                      placeholder="Select Country"
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Capacity / Lead Times Card */}
              <div className="border border-slate-200 p-4 bg-white rounded-lg shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-medium text-slate-700 text-base">Capacity / Lead Times</h2>
                  <div className="text-xs text-slate-500">
                    In days
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4">
                  <ReusableInput
                    label="SMS MCQ"
                    placeholder="Enter MCQ"
                    type="number"
                    className="[&>input]:py-1.5"
                  />
                  <ReusableInput
                    label="SMS MOQ"
                    placeholder="Enter MOQ"
                    type="number"
                    className="[&>input]:py-1.5"
                  />
                  <ReusableInput
                    label="SMS Lead Time"
                    placeholder="Enter lead time"
                    type="number"
                    className="[&>input]:py-1.5"
                  />
                  <ReusableInput
                    label="BULK MCQ"
                    placeholder="Enter MCQ"
                    type="number"
                    className="[&>input]:py-1.5"
                  />
                  <ReusableInput
                    label="BULK MOQ"
                    placeholder="Enter MOQ"
                    type="number"
                    className="[&>input]:py-1.5"
                  />
                  <ReusableInput
                    label="BULK Lead Time"
                    placeholder="Enter lead time"
                    type="number"
                    className="[&>input]:py-1.5"
                  />
                </div>
              </div>

              {/* Development Details Card */}
              <div className="border border-slate-200 p-4 bg-white rounded-lg shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                  {/* Left Column - Input Fields */}
                  <div className="flex flex-col gap-4">
                    <h2 className="font-medium text-slate-700 text-base mb-4">Development Details</h2>

                    <ReusableInput
                      label="Sur Charges"
                      value=""
                      className="[&>input]:py-1.5"
                      placeholder="Enter sur charges"
                    />

                    <ReusableInput
                      label="Price FOB"
                      value=""
                      className="[&>input]:py-1.5"
                      placeholder="Enter Price FOB"
                    />
                  </div>

                  {/* Right Column - Fabric Image Upload */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium text-slate-700">Fabric Image Upload</h3>
                      <div
                        className="relative"
                        onMouseEnter={() => setShowImageTooltip(true)}
                        onMouseLeave={() => setShowImageTooltip(false)}
                      >
                        <FaQuestionCircle className="text-slate-400 text-sm cursor-help" />
                        {showImageTooltip && (
                          <div className="absolute z-10 left-full ml-2 w-48 bg-slate-800 text-white text-xs rounded p-2 shadow-lg">
                            Upload high-quality fabric images (max 5MB)
                            <div className="absolute -left-1 top-2 w-2.5 h-2.5 bg-slate-800 transform rotate-45"></div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 flex flex-col items-center">
                      {fabricImage ? (
                        <>
                          <img
                            src={fabricImage}
                            alt="Fabric preview"
                            className="h-48 object-contain mb-2 cursor-pointer"
                            onClick={() => setShowModal(true)}
                          />
                          <button
                            onClick={() => setFabricImage(null)}
                            className="text-xs text-red-600 hover:text-red-800"
                          >
                            Remove Image
                          </button>
                        </>
                      ) : (
                        <>
                          <FaUpload className="text-slate-400 text-2xl mb-2" />
                          <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-3 py-1.5 rounded transition-colors">
                            Choose File
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={handleImageUpload}
                            />
                          </label>
                          <p className="text-xs text-slate-500 mt-1">JPEG, PNG (max 5MB)</p>
                        </>
                      )}
                    </div>

                    {/* Modal */}
                    {showModal && (
                      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                        <div className="bg-white p-4 rounded shadow-lg max-w-full max-h-full">
                          <img
                            src={fabricImage}
                            alt="Full preview"
                            className="max-h-[80vh] max-w-[90vw] object-contain"
                          />
                          <button
                            onClick={() => setShowModal(false)}
                            className="block mt-4 mx-auto text-sm text-blue-600 hover:text-blue-800"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>


              </div>
            </div>


            <div className="space-y-3">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border col-span-2 border-slate-200 p-4 bg-white rounded-lg shadow-sm">
                    <h2 className="font-medium text-slate-700 text-base mb-4">Construction Details</h2>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <ReusableInput
                        label="Construction"
                        name="construction"
                        value={constructionDetails.construction}
                        onChange={handleConstructionChange}
                        placeholder="Enter construction details"
                        className="[&>input]:py-1.5"
                      />
                      <div className="col-span-2">
                        <ReusableInput
                          label="Fiber Content"
                          name="fiberContent"
                          value={constructionDetails.fiberContent}
                          onChange={handleConstructionChange}
                          placeholder="Enter fiber content"
                          className="[&>input]:py-1.5"
                        />
                      </div>

                      <div className="col-span-2">
                        <ReusableInput
                          label="Yarn Details"
                          name="yarnDetails"
                          value={constructionDetails.yarnDetails}
                          onChange={handleConstructionChange}
                          placeholder="Enter yarn details"
                          className="[&>input]:py-1.5"
                        />
                      </div>


                      <div className="grid grid-cols-2 gap-4">
                        <ReusableInput
                          label="Weight (GSM)"
                          name="weightGSM"
                          value={constructionDetails.weightGSM}
                          onChange={handleConstructionChange}
                          placeholder="Enter GSM"
                          type="number"
                          className="[&>input]:py-1.5"
                        />
                        <ReusableInput
                          label="Weft/Wales Count"
                          name="weftWalesCount"
                          value={constructionDetails.weftWalesCount}
                          onChange={handleConstructionChange}
                          placeholder="Enter count"
                          className="[&>input]:py-1.5"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <ReusableInput
                            label="Width (Finished)"
                            name="widthFinished"
                            value={constructionDetails.widthFinished}
                            onChange={handleConstructionChange}
                            placeholder="Enter width"
                            className="[&>input]:py-1.5"
                          />
                        </div>

                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <ReusableInput
                          label="Width (Cuttale)"
                          name="widthCuttale"
                          value={constructionDetails.widthCuttale}
                          onChange={handleConstructionChange}
                          placeholder="Enter cuttale width"
                          className="[&>input]:py-1.5"
                        />
                        <ReusableInput
                          label="Wrap/Count"
                          name="wrapCoursesCount"
                          value={constructionDetails.wrapCoursesCount}
                          onChange={handleConstructionChange}
                          placeholder="Enter count"
                          className="[&>input]:py-1.5"
                        />
                      </div>
                    </div>

                  </div>
                  <div className="border border-slate-200 w-full p-4 bg-white rounded-lg shadow-sm">
                    <h2 className="font-medium text-slate-700 text-base mb-4">Process Finishing</h2>

                    <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-4">
                      <ReusableInput
                        label="Dyed Method"
                        placeholder="Enter Dyed Method"
                        onChange={handleProcessFinishingChange}
                        className="[&>input]:py-1.5"
                      />
                      <ReusableInput
                        label="Printing Method"
                        placeholder="Enter Printing Method"
                        onChange={handleProcessFinishingChange}
                        className="[&>input]:py-1.5"
                      />

                      <ReusableInput
                        label="Surface Finish"
                        placeholder="Enter Surface Finish"
                        onChange={handleProcessFinishingChange}
                        className="[&>input]:py-1.5"
                      />
                      <ReusableInput
                        label="Other Performance Function"
                        name="otherPerformanceFunction"
                        value={processFinishing.otherPerformanceFunction}
                        onChange={handleProcessFinishingChange}
                        placeholder="Enter other functions"
                        className="[&>input]:py-1.5"
                      />
                    </div>
                  </div>
                </div>

                {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border border-slate-200 col-span-2 p-4 bg-white rounded-lg shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="font-medium text-slate-700 text-base">Test Performance</h2>
                      <div className="text-xs text-slate-500">
                        Add test results
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                      <ReusableInput
                        label="Test Name"
                        name="testName"
                        value={testPerformance.testName}
                        onChange={handleTestPerformanceChange}
                        placeholder="Enter test name"
                        className="[&>input]:py-1.5"
                      />

                      <ReusableInput
                        label="Test Result"
                        name="testResult"
                        value={testPerformance.testResult}
                        onChange={handleTestPerformanceChange}
                        placeholder="Enter test result"
                        className="[&>input]:py-1.5"
                      />

                      <ReusableInput
                        label="Test Standard"
                        name="testStandard"
                        value={testPerformance.testStandard}
                        onChange={handleTestPerformanceChange}
                        placeholder="Enter test standard"
                        className="[&>input]:py-1.5"
                      />
                    </div>

                    <div className="flex justify-end mb-4">
                      <button
                        onClick={handleAddTestResult}
                        className="bg-indigo-600 text-white px-3 py-1 rounded-md hover:bg-indigo-700 flex items-center text-sm"
                      >
                        <HiPlus className="w-4 h-4 mr-1" />
                        Add Test Result
                      </button>
                    </div>

                    {testPerformance.additionalTests.length > 0 && (
                      <div className="overflow-x-auto mb-6">
                        <table className="min-w-full divide-y divide-slate-200">
                          <thead className="bg-slate-50">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Test Name</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Result</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Standard</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-slate-200">
                            {testPerformance.additionalTests.map((test, index) => (
                              <tr key={index}>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-slate-500">{test.name}</td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-slate-500">{test.result}</td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-slate-500">{test.standard}</td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-slate-500">
                                  <button
                                    onClick={() => handleRemoveTestResult(index)}
                                    className="text-red-600 hover:text-red-800"
                                    title="Remove"
                                  >
                                    <HiTrash className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ReusableInput
                        label="Recommended Care Instruction"
                        name="careInstructions"
                        value={testPerformance.careInstructions}
                        onChange={handleTestPerformanceChange}
                        placeholder="Enter care instructions"
                        className="[&>input]:py-1.5"
                        multiline
                        rows={3}
                      />

                      <ReusableInput
                        label="Quality/Technical Limitations"
                        name="qualityLimitations"
                        value={testPerformance.qualityLimitations}
                        onChange={handleTestPerformanceChange}
                        placeholder="List any limitations"
                        className="[&>input]:py-1.5"
                        multiline
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="border border-slate-200 p-4 bg-white rounded-lg shadow-sm">
                    <h2 className="font-medium text-slate-700 text-base mb-4">
                      Production Details (Report Test Performance Data Below)
                      <span className="text-xs text-red-500 ml-2">** Supporting Documentation Must Be Attached</span>
                    </h2>

                    <div className="mb-4">
                      <ReusableInput
                        label="Report Data"
                        name="reportData"
                        value={productionDetails.reportData}
                        onChange={handleProductionDetailsChange}
                        placeholder="Enter production details and test performance data"
                        className="[&>textarea]:py-1.5"
                        multiline
                        rows={4}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Supporting Documentation</label>
                      <div className="border-2 border-dashed border-slate-200 rounded-lg p-4">
                        {productionDetails.supportingDocs.length > 0 ? (
                          <div className="space-y-2">
                            {productionDetails.supportingDocs.map((file, index) => (
                              <div key={index} className="flex items-center justify-between bg-slate-50 p-2 rounded">
                                <div className="flex items-center">
                                  <FaFileAlt className="text-slate-400 mr-2" />
                                  <span className="text-sm text-slate-700 truncate max-w-xs">{file.name}</span>
                                </div>
                                <button
                                  onClick={() => handleRemoveSupportingDoc(index)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <HiTrash className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center">
                            <FaUpload className="mx-auto text-slate-400 text-2xl mb-2" />
                            <p className="text-sm text-slate-500 mb-2">No documents uploaded</p>
                          </div>
                        )}

                        <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-3 py-1.5 rounded transition-colors flex items-center justify-center mt-4">
                          <span>Upload Documents</span>
                          <input
                            type="file"
                            className="hidden"
                            onChange={handleSupportingDocsUpload}
                            multiple
                          />
                        </label>
                        <p className="text-xs text-slate-500 mt-2">PDF, DOC, XLS, JPG, PNG (max 10MB each)</p>
                      </div>
                    </div>
                  </div>
                </div> */}
              </div>


            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-2 justify-between mt-4">
            <div className="flex gap-2 flex-wrap">
              <button className="bg-indigo-600 text-white px-4 py-1 rounded-md hover:bg-indigo-700 flex items-center text-sm">
                <FiSave className="w-4 h-4 mr-2" />
                Save
              </button>
              <button className="bg-indigo-500 text-white px-4 py-1 rounded-md hover:bg-indigo-600 flex items-center text-sm">
                <HiOutlineRefresh className="w-4 h-4 mr-2" />
                Save & Next
              </button>
            </div>

            <div className="flex gap-2 flex-wrap">
              <button className="bg-emerald-600 text-white px-4 py-1 rounded-md hover:bg-emerald-700 flex items-center text-sm">
                <FiShare2 className="w-4 h-4 mr-2" />
                Email
              </button>
              <button className="bg-emerald-600 text-white px-4 py-1 rounded-md hover:bg-emerald-700 flex items-center text-sm">
                <FaWhatsapp className="w-4 h-4 mr-2" />
                WhatsApp
              </button>
              <button className="bg-slate-600 text-white px-4 py-1 rounded-md hover:bg-slate-700 flex items-center text-sm">
                <FiPrinter className="w-4 h-4 mr-2" />
                Print
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Manufacture;