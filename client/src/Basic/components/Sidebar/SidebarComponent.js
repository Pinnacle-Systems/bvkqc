import React, { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import secureLocalStorage from "react-secure-storage";
import { push } from "../../../redux/features/opentabs";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import country from "./images/flag.png";
import employee from "./images/employee.png";
import state from "./images/map.png";
import city from "./images/city.png";
import empcategory from "./images/empcategory.png";
import layers from "./images/layers.png";
import party from "./images/party.png";
import Line from "./images/line.png";
import imp from "./images/import.png"
import all from "./images/resource.png"
import aql from "./images/quality-control (1).png";
import bug from "./images/bug.png"
import corrected from "./images/corrected.png"
const SidebarComponent = ({
  logo,
  groups,
  pages,
  isMainDropdownOpen,
  setIsMainDropdownOpen,
  heading,
  setIsOpen,
}) => {
  const dispatch = useDispatch();
  const [hoveredGroupId, setHoveredGroupId] = useState(null);
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filteredData = pages.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const iconMapping = {
    "COUNTRY MASTER": (
      <img
        src={country}
        alt="country"
        className="w-10 h-10 object-contain p-0.5 bg-white rounded border border-gray-200 shadow-sm"
      />
    ),
     "DEFECT MASTER": (
      <img
        src={bug}
        alt="Defect"
        className="w-10 h-10 object-contain p-0.5 bg-white rounded border border-gray-200 shadow-sm"
      />
    ),
        "DEFECT CORRECTION": (
      <img
        src={corrected}
        alt="Defect"
        className="w-10 h-10 object-contain p-0.5 bg-white rounded border border-gray-200 shadow-sm"
      />
    ),
    "EMPLOYEE MASTER": (
      <img
        src={employee}
        alt="employee"
        className="w-10 h-10 object-contain p-0.5 bg-white rounded border border-gray-200 shadow-sm"
      />
    ),
    "STATE MASTER": (
      <img
        src={state}
        alt="state"
        className="w-10 h-10 object-contain p-0.5 bg-white rounded border border-gray-200 shadow-sm"
      />
    ),
    "CITY MASTER": (
      <img
        src={city}
        alt="city"
        className="w-10 h-10 object-contain p-0.5 bg-white rounded border border-gray-200 shadow-sm"
      />
    ),
    "DEPARTMENT MASTER": (
      <img
        src={layers}
        alt="department"
        className="w-10 h-10 object-contain p-0.5 bg-white rounded border border-gray-200 shadow-sm"
      />
    ),
    "DESIGNATION MASTER": (
      <img
        src={empcategory}
        alt="designation"
        className="w-10 h-10 object-contain p-0.5 bg-white rounded border border-gray-200 shadow-sm"
      />
    ),
    "BUYER MASTER": (
      <img
        src={party}
        alt="party"
        className="w-10 h-10 object-contain p-0.5 bg-white rounded border border-gray-200 shadow-sm"
      />
    ),

    "LINE MASTER": (
      <img
        src={Line}
        alt="party category"
        className="w-10 h-10 object-contain p-0.5 bg-white rounded border border-gray-200 shadow-sm"
      />
    ),
        "ORDER IMPORT": (
      <img
        src={imp}
        alt="Order Import"
        className="w-10 h-10 object-contain p-0.5 bg-white rounded border border-gray-200 shadow-sm"
      />
    ),
        "ALLOCATION": (
      <img
        src={all}
        alt="Allocation"
        className="w-10 h-10 object-contain p-0.5 bg-white rounded border border-gray-200 shadow-sm"
      />
    ),
      "AQL": (
      <img
        src={aql}
        alt="Aql"
        className="w-10 h-10 object-contain p-0.5 bg-white rounded border border-gray-200 shadow-sm"
      />
    ),
  };

  return (
    <div className="fixed top-[3.5%] left-[87px] z-50 bg">
      {isMainDropdownOpen && (
        <div
          onClick={() => setIsMainDropdownOpen(false)}
          className="fixed inset-0 bg-[ff1f0] z-40"
        ></div>
      )}

      <div className="fixed top-[3.5%] left-[87px] z-50">
        {isMainDropdownOpen && (
          <>
            <div
              onClick={() => setIsMainDropdownOpen(false)}
              className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40 transition-opacity duration-300"
            ></div>

            <div className="bg-white p-4 rounded-2xl shadow-xl border border-gray-200 h-[650px] overflow-y-auto w-[360px] transition-all duration-200 space-y-4 z-50 relative">
              <div className="sticky top-0 bg-white z-20 pb-3 pt-2 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-800 mb-3 tracking-wide">
                  {heading}
                </h2>
                <div className="relative">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={`Search ${heading.toLowerCase()}...`}
                    className="w-full pl-4 pr-10 py-2.5 text-sm text-gray-700 bg-gray-100 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  />
                  <div className="absolute inset-y-0 right-3 flex items-center text-gray-500">
                    <Search size={18} />
                  </div>
                </div>
              </div>

              <ul className="space-y-5">
                {groups?.map((group) => (
                  <li key={group?.id} className="space-y-3">
                    {search.length === 0 && (
                      <h3 className="text-xs font-bold text-gray-600 px-2 uppercase tracking-wider flex items-center">
                        <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                        {group?.name.replace(/\b[a-z]/g, (char) =>
                          char.toUpperCase()
                        )}
                      </h3>
                    )}
                    <ul className="grid grid-cols-3 gap-3">
                      {filteredData
                        .filter(
                          (page) =>
                            parseInt(page.pageGroupId) === parseInt(group.id)
                        )
                        .map((page) => (
                          <li
                            key={page.id}
                            onClick={() => {
                              dispatch(push(page));
                              secureLocalStorage.setItem(
                                sessionStorage.getItem("sessionId") +
                                  "currentPage",
                                page?.id
                              );
                              setIsMainDropdownOpen(false);
                              setIsOpen(false);
                            }}
                            className="bg-gray-50 hover:bg-indigo-100 border border-gray-200 rounded-xl p-3 text-xs text-center cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md"
                          >
                            <div className="flex flex-col items-center justify-center space-y-2">
                              <div className="flex items-center justify-center bg-white rounded-lg  shadow-inner">
                                {iconMapping[page?.name] || (
                                  <span className="text-gray-400 text-xl">
                                    •
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] font-medium text-gray-700 leading-tight text-wrap break-words">
                                {(() => {
                                  const cleanedName = page?.name
                                    .replace(/\bMASTER\b/g, "")
                                    .trim();
                                  if (cleanedName.toUpperCase() === "PARTY")
                                    return "Buyer";
                                  return cleanedName
                                    .split(" ")
                                    .map(
                                      (word) =>
                                        word.charAt(0).toUpperCase() +
                                        word.slice(1).toLowerCase()
                                    )
                                    .join(" ");
                                })()}
                              </div>
                            </div>
                          </li>
                        ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SidebarComponent;
