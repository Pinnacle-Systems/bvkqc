import moment from 'moment'
import React from 'react'
import { CLOSE_ICON, DELETE, VIEW } from '../../../icons';
import { getImageUrlPath } from '../../../helper';
import { renameFile } from '../../../Utils/helper';

const AttachementForm = ({ item, index, readOnly, leadId, dueDate, userName, setAttachments, attachments, setDueDate }) => {


    const today = new Date();
    function handleInputChange(value, index, field) {

        const newBlend = structuredClone(attachments);
        newBlend[index][field] = value;
        setAttachments(newBlend);
        // setDueDate(moment.utc(today).format("YYYY-MM-DD"));
    };

    function deleteRow(index) {
        setAttachments(prev => prev.filter((_, i) => i !== index))
    }

    function openPreview() {
        window.open(item?.filePath instanceof File ? URL.createObjectURL(item?.filePath) : getImageUrlPath(item.filePath))
    }
    return (
        <>

            <tr
                key={index}
                className="hover:bg-gray-100 transition duration-150"
            >
                <td className="py-0.5 px-3 w-10 border border-gray-400">
                    {index + 1}
                </td>
                <td className="py-0.5 px-3 w-32 border border-gray-400">
                    <input
                        type="date"
                        disabled={readOnly}
                        className="text-center rounded py-1 px-2 w-full border border-gray-300 focus:outline-none focus:ring focus:border-blue-300"
                        value={
                            moment(item?.date).format("YYYY-MM-DD")
                        }
                        onChange={(e) =>
                            handleInputChange(e.target.value, index, "date")
                        }
                    />
                </td>
                <td className="py-0.5 px-3  w-32 border border-gray-400">
                    <input
                        type="text"
                        className="text-left rounded py-1 px-2 w-full border border-gray-300 focus:outline-none focus:ring focus:border-blue-300"
                        value={item?.gridUser}
                        onChange={(e) =>
                            handleInputChange(e.target.value, index, "gridUser")
                        }

                    />
                </td>
                <td className="py-0.5 px-3 border border-gray-400">
                    <input
                        type="text"
                        className="text-left rounded py-1 px-2 w-full border border-gray-300 focus:outline-none focus:ring focus:border-blue-300"
                        value={item?.log}
                        disabled={readOnly}
                        onChange={(e) =>
                            handleInputChange(e.target.value, index, "log")
                        }
                    />
                </td>

                <td className="py-0.5 px-3  w-20 border border-gray-400">
                    <div className='flex gap-2'>
                        {(!readOnly && !item.filePath) &&
                            <input
                                title=" "
                                type="file"
                                disabled={readOnly}
                                onChange={(e) =>
                                    e.target.files[0] ? handleInputChange(renameFile(e.target.files[0]), index, "filePath") : () => { }
                                }
                            />

                        }
                        {item.filePath &&
                            <>

                                <button onClick={() => { openPreview() }}>
                                    {VIEW}
                                </button>
                                {!readOnly &&
                                    <button onClick={() => { handleInputChange('', index, "filePath") }}>{CLOSE_ICON}</button>
                                }
                            </>
                        }
                 


                    </div>
                </td>

                {!readOnly &&
                    <td className="py-0.5 px-3  w-10 border border-gray-400 text-center ">
                        <button
                            type='button'
                            onClick={() => deleteRow(index)}
                            className='text-xs text-red-600 '>{DELETE}
                        </button>
                    </td>
                }



            </tr>

        </>
    )
}

export default AttachementForm;
