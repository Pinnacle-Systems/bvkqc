import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSave,
  faClose,
  faUserPlus,
  faEdit,
  faTrashCan,
  faPlusCircle,
  faRefresh,
  faPrint,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";

export const AddNewButton = ({ onClick, disabled = false }) => {
  return (
    <button
      className="text-green-600 py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      onClick={() => onClick()}
      disabled={disabled}
    >
      {<FontAwesomeIcon icon={faUserPlus} />} Add New
    </button>
  );
};

export const New = ({ name, setFormHidden }) => {
  return (
    <button
      className="text-green-600 py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      onClick={() => {
        setFormHidden(false);
      }}
    >
      {<FontAwesomeIcon icon={faPlusCircle} />} Add {name}
    </button>
  );
};

export const GenerateButton = ({ onClick, hidden, name = "Generate" }) => {
  return (
    <button
      className="text-green-600 py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      onClick={() => {
        onClick();
      }}
      hidden={hidden}
    >
      {<FontAwesomeIcon icon={faRefresh} />} {name}
    </button>
  );
};

export const Delete = ({ onClick }) => {
  return (
    <button
      className="text-red-500 px-3 py-1.5 rounded focus:outline-none focus:shadow-outline"
      onClick={() => onClick()}
    >
      {<FontAwesomeIcon icon={faTrashCan} />}
    </button>
  );
};

export const NewButton = ({ onClick }) => {
  return (
    <button
      className="text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      onClick={() => {
        onClick();
      }}
    >
      {<FontAwesomeIcon icon={faUserPlus} />} New
    </button>
  );
};



export const EditButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 hover:bg-blue-600 hover:text-white text-[12px] border border-blue-600 text-blue-600 font-medium px-3 py-1.5 rounded-md transition duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
    >
      <FontAwesomeIcon icon={faEdit} />
      Edit
    </button>
  );
};


export const EditButtonOnly = ({ onClick }) => {
  return (
    <button
      className="text-white px-3 pb-1  mt-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-200 bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
      onClick={() => onClick()}
    >
      {<FontAwesomeIcon icon={faEdit} />}
    </button>
  );
};

export const SaveButton = ({ onClick }) => {
  const [isDisabled, setIsDisabled] = useState(false);

  const handleClick = () => {
    if (isDisabled) return;
    onClick();
    setIsDisabled(true);
    setTimeout(() => {
      setIsDisabled(false);
    }, 5000);
  };

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      className={`flex items-center gap-2 hover:bg-green-600   hover:text-white text-[12px] border border-green-600 text-green-600 font-medium px-3 py-1.5 rounded-md transition duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      <FontAwesomeIcon icon={faSave} />
      Save
    </button>
  );
};
export const CloseButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-red-600 border border-red-600 text-red-600   hover:text-white rounded transition duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
    >
      <FontAwesomeIcon icon={faClose} />
      Cancel
    </button>
  );
};

export const OpenTable = ({ onClick }) => {
  return (
    <button
      className="text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline button"
      onClick={() => onClick()}
    >
      {<FontAwesomeIcon icon={faSearch} />} Search
    </button>
  );
};



export const DeleteButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 hover:bg-red-600 hover:text-white text-[12px] border border-red-600 text-red-600 font-medium px-3 py-1.5 rounded-md transition duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400"
    >
      <FontAwesomeIcon icon={faTrashCan} />
      Delete
    </button>
  );
};


export const CloseButtonOnly = ({ onClick }) => {
  return (
    <button
      className="text-black px-3 py-1.5 rounded focus:outline-none focus:shadow-outline"
      onClick={() => onClick()}
    >
      {<FontAwesomeIcon icon={faClose} />}
    </button>
  );
};

export const PrintButtonOnly = ({ onClick }) => {
  return (
    <button
      className="text-pink-500 px-3 py-1.5 rounded focus:outline-none focus:shadow-outline"
      onClick={() => onClick()}
    >
      {<FontAwesomeIcon icon={faPrint} />} Print
    </button>
  );
};

export const SearchButton = ({ onClick }) => {
  return (
    <button
      className="text-gray-300 py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      onClick={() => onClick()}
    >
      {<FontAwesomeIcon icon={faSearch} />} Search
    </button>
  );
};

export const ExcelButton = ({ onClick, width = 18, height = 18 }) => {
  return (
    <button
      className="rounded focus:outline-none focus:shadow-outline"
      onClick={(e) => onClick(e)}
    >
      <img alt="" width={width} height={height} />
    </button>
  );
};
