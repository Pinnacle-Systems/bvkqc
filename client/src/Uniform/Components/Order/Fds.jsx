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

  // State for Construction Details
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

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFabricImage(URL.createObjectURL(file));
    }
  };

  const handleConstructionChange = (e) => {
    const { name, value } = e.target;
    setConstructionDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

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
              {/* Basic Information Card */}
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

                  <ReusableDropdown
                    label="Fab Type"
                    options={[
                      { value: "Knit", label: "Knit" },
                      { value: "Woven", label: "Woven" },
                      { value: "Denim", label: "Denim" },
                      { value: "Non-Woven", label: "Non-Woven" },
                    ]}
                    placeholder="Select fabric type"
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
                <h2 className="font-medium text-slate-700 text-base mb-4">Development Details</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                  <ReusableInput
                    label="Sur Charges"
                    value=""
                    className="[&>input]:py-1.5"
                  />

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
                            className="h-24 object-contain mb-2"
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
                  </div>
                </div>
              </div>
            </div>

            <div className="border w-1/2 border-slate-200 p-4 bg-white rounded-lg shadow-sm">
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
          </div>

          <div className="flex flex-col md:flex-row gap-2 justify-between mt-4">
            {/* Left Buttons */}
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

            {/* Right Buttons */}
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