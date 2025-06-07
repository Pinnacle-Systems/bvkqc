import { FaQuestionCircle, FaUpload, FaWhatsapp } from "react-icons/fa";
import { FaFileAlt } from "react-icons/fa";
import { HiOutlineRefresh } from "react-icons/hi";
import { ReusableInput } from "./CommonInput";
import Swal from 'sweetalert2';
import { useState, useMemo, useRef } from 'react';
import { FiSave, FiPrinter, FiShare2 } from "react-icons/fi";
import Select from 'react-select';
import { Country } from 'country-state-city';
import { useAddStyleSheetMutation, useUpdateStyleSheetMutation } from "../../../redux/services/StyleSheet";

const Manufacture = ({ onClose }) => {
  const [formData, setFormData] = useState({
    fdsDate: '',
    fabCode: '',
    materialCode: '',
    fabType: '',
    countryOriginFabric: null,
    countryOriginYarn: null,
    countryOriginFiber: null,
    smsMcq: '',
    smsMoq: '',
    smsLeadTime: '',
    bulkMcq: '',
    bulkMoq: '',
    bulkLeadTime: '',
    surCharges: '',
    priceFob: '',
    construction: '',
    fiberContent: '',
    yarnDetails: '',
    weightGSM: '',
    weightOpposite: '',
    weftWalesCount: '',
    widthFinished: '',
    widthCuttale: '',
    wrapCoursesCount: '',
    dyedMethod: '',
    printingMethod: '',
    surfaceFinish: '',
    otherPerformanceFunction: '',
 
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageRemoved, setImageRemoved] = useState(false);
  const [id, setId] = useState("");
  const [showImageTooltip, setShowImageTooltip] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [addData] = useAddStyleSheetMutation();
  const [updateData] = useUpdateStyleSheetMutation();
  const fileInputRef = useRef(null);
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
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const handleCountryChange = (field, selectedOption) => {
    setFormData(prev => ({
      ...prev,
      [field]: selectedOption
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 5 * 1024 * 1024) {
      setImageFile(file);
      setImageRemoved(false);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      alert("Please select an image under 5MB.");
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageRemoved(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmitCustom = async (callback, data, text) => {
    try {
      let returnData;
      const formData = new FormData();
      for (let key in data) {
        formData.append(key, data[key]);
      } 
      if (imageFile instanceof File) {
        formData.append("image", imageFile);
      }
      if (imageRemoved) {
        formData.append("removeImage", "true");
      }

      if (text === "Updated") {
        returnData = await callback({ id, body: formData }).unwrap();
      } else {
        returnData = await callback(formData).unwrap();
      }

      setId(returnData.data.id);
      setImageRemoved(false);

      Swal.fire({
        icon: 'success',
        title: `${text} Successfully`,
        showConfirmButton: false,
        timer: 2000
      });

    } catch (error) {
      console.error("Submission error:", error);
      Swal.fire({
        icon: 'error',
        title: 'Submission Failed',
        text: error.data?.message || 'Something went wrong!',
      });
    }
  };

  const validateData = (data) => {
    return true;
  }

  const saveData = () => {
    if (!validateData(formData)) {
      Swal.fire({
        icon: 'warning',
        title: 'Please fill all required fields!',
        position: 'top',
        showConfirmButton: false,
        timer: 2000
      });
      return;
    }

    if (id) {
      handleSubmitCustom(updateData, formData, "Updated");
    } else {
      handleSubmitCustom(addData, formData, "Added");
    }
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
          <h1 className="text-2xl font-bold text-gray-800">Style Sheet Master</h1>
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
                    value={formData.fdsDate}
                    onChange={(e) => handleInputChange('fdsDate', e.target.value)}
                    className="[&>input]:py-1.5"
                  />
                      <ReusableInput
                    label="Customer Material Code"
                    placeholder="Enter Fabric code"
                    value={formData.materialCode}
                    onChange={(e) => handleInputChange('materialCode', e.target.value)}
                    className="[&>input]:py-1.5"
                  />

                 <div className="col-span-2">
  <ReusableInput
                    label="Fab Code"
                    placeholder="Enter fabric code"
                    value={formData.fabCode}
                    onChange={(e) => handleInputChange('fabCode', e.target.value)}
                    className="[&>input]:py-1.5"
                  />
                    
                 </div>
                
                  <ReusableInput
                    label="Fab Type"
                    placeholder="Enter fabric Type"
                    value={formData.fabType}
                    onChange={(e) => handleInputChange('fabType', e.target.value)}
                    className="[&>input]:py-1.5"
                  />

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Country Of Origin (Fabric)
                    </label>
                    <Select
                      styles={customSelectStyles}
                      options={countryOptions}
                      value={formData.countryOriginFabric}
                      onChange={(option) => handleCountryChange('countryOriginFabric', option)}
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
                      value={formData.countryOriginYarn}
                      onChange={(option) => handleCountryChange('countryOriginYarn', option)}
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
                      value={formData.countryOriginFiber}
                      onChange={(option) => handleCountryChange('countryOriginFiber', option)}
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
                    value={formData.smsMcq}
                    onChange={(e) => handleInputChange('smsMcq', e.target.value)}
                    className="[&>input]:py-1.5"
                  />
                  <ReusableInput
                    label="SMS MOQ"
                    placeholder="Enter MOQ"
                    value={formData.smsMoq}
                    onChange={(e) => handleInputChange('smsMoq', e.target.value)}
                    className="[&>input]:py-1.5"
                  />
                  <ReusableInput
                    label="SMS Lead Time"
                    placeholder="Enter lead time"
                    value={formData.smsLeadTime}
                    onChange={(e) => handleInputChange('smsLeadTime', e.target.value)}
                    className="[&>input]:py-1.5"
                  />
                  <ReusableInput
                    label="BULK MCQ"
                    placeholder="Enter MCQ"
                    value={formData.bulkMcq}
                    onChange={(e) => handleInputChange('bulkMcq', e.target.value)}
                    className="[&>input]:py-1.5"
                  />
                  <ReusableInput
                    label="BULK MOQ"
                    placeholder="Enter MOQ"
                    value={formData.bulkMoq}
                    onChange={(e) => handleInputChange('bulkMoq', e.target.value)}
                    className="[&>input]:py-1.5"
                  />
                  <ReusableInput
                    label="BULK Lead Time"
                    placeholder="Enter lead time"
                    value={formData.bulkLeadTime}
                    onChange={(e) => handleInputChange('bulkLeadTime', e.target.value)}
                    className="[&>input]:py-1.5"
                  />
                </div>
              </div>

              {/* Development Details Card */}
              <div className="border border-slate-200 p-4 bg-white rounded-lg shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                  <div className="flex flex-col gap-4">
                    <h2 className="font-medium text-slate-700 text-base mb-4">Development Details</h2>

                    <ReusableInput
                      label="Sur Charges"
                      value={formData.surCharges}
                      onChange={(e) => handleInputChange('surCharges', e.target.value)}
                      className="[&>input]:py-1.5"
                      placeholder="Enter sur charges"
                    />

                    <ReusableInput
                      label="Price FOB"
                      value={formData.priceFob}
                      onChange={(e) => handleInputChange('priceFob', e.target.value)}
                      className="[&>input]:py-1.5"
                      placeholder="Enter Price FOB"
                    />
                  </div>

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
                      {imagePreview ? (
                        <>
                          <img
                            src={imagePreview}
                            alt="Fabric preview"
                            className="h-48 object-contain mb-2 cursor-pointer"
                            onClick={() => setShowModal(true)}
                          />
                          <button
                            onClick={handleRemoveImage}
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
                              ref={fileInputRef}
                            />
                          </label>
                          <p className="text-xs text-slate-500 mt-1">JPEG, PNG (max 5MB)</p>
                        </>
                      )}
                    </div>

                    {showModal && (
                      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                        <div className="bg-white p-4 rounded shadow-lg max-w-full max-h-full">
                          <img
                            src={imagePreview}
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
                        value={formData.construction}
                        onChange={(e) => handleInputChange('construction', e.target.value)}
                        placeholder="Enter construction details"
                        className="[&>input]:py-1.5"
                      />
                      <div className="col-span-2">
                        <ReusableInput
                          label="Fiber Content"
                          name="fiberContent"
                          value={formData.fiberContent}
                          onChange={(e) => handleInputChange('fiberContent', e.target.value)}
                          placeholder="Enter fiber content"
                          className="[&>input]:py-1.5"
                        />
                      </div>

                      <div className="col-span-2">
                        <ReusableInput
                          label="Yarn Details"
                          name="yarnDetails"
                          value={formData.yarnDetails}
                          onChange={(e) => handleInputChange('yarnDetails', e.target.value)}
                          placeholder="Enter yarn details"
                          className="[&>input]:py-1.5"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <ReusableInput
                          label="Weight (GSM)"
                          name="weightGSM"
                          value={formData.weightGSM}
                          onChange={(e) => handleInputChange('weightGSM', e.target.value)}
                          placeholder="Enter GSM"
                          type="number"
                          className="[&>input]:py-1.5"
                        />
                        <ReusableInput
                          label="Weft/Wales Count"
                          name="weftWalesCount"
                          value={formData.weftWalesCount}
                          onChange={(e) => handleInputChange('weftWalesCount', e.target.value)}
                          placeholder="Enter count"
                          className="[&>input]:py-1.5"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <ReusableInput
                            label="Width (Finished)"
                            name="widthFinished"
                            value={formData.widthFinished}
                            onChange={(e) => handleInputChange('widthFinished', e.target.value)}
                            placeholder="Enter width"
                            className="[&>input]:py-1.5"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <ReusableInput
                          label="Width (Cuttale)"
                          name="widthCuttale"
                          value={formData.widthCuttale}
                          onChange={(e) => handleInputChange('widthCuttale', e.target.value)}
                          placeholder="Enter cuttale width"
                          className="[&>input]:py-1.5"
                        />
                        <ReusableInput
                          label="Wrap/Count"
                          name="wrapCoursesCount"
                          value={formData.wrapCoursesCount}
                          onChange={(e) => handleInputChange('wrapCoursesCount', e.target.value)}
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
                        name="dyedMethod"
                        value={formData.dyedMethod}
                        onChange={(e) => handleInputChange('dyedMethod', e.target.value)}
                        placeholder="Enter Dyed Method"
                        className="[&>input]:py-1.5"
                      />
                      <ReusableInput
                        label="Printing Method"
                        name="printingMethod"
                        value={formData.printingMethod}
                        onChange={(e) => handleInputChange('printingMethod', e.target.value)}
                        placeholder="Enter Printing Method"
                        className="[&>input]:py-1.5"
                      />

                      <ReusableInput
                        label="Surface Finish"
                        name="surfaceFinish"
                        value={formData.surfaceFinish}
                        onChange={(e) => handleInputChange('surfaceFinish', e.target.value)}
                        placeholder="Enter Surface Finish"
                        className="[&>input]:py-1.5"
                      />
                      <ReusableInput
                        label="Other Performance Function"
                        name="otherPerformanceFunction"
                        value={formData.otherPerformanceFunction}
                        onChange={(e) => handleInputChange('otherPerformanceFunction', e.target.value)}
                        placeholder="Enter other functions"
                        className="[&>input]:py-1.5"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-2 justify-between mt-4">
            <div className="flex gap-2 flex-wrap">
              <button onClick={saveData} className="bg-indigo-600 text-white px-4 py-1 rounded-md hover:bg-indigo-700 flex items-center text-sm">
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