

import moment from 'moment'
import React, { useState } from 'react'
import { CLOSE_ICON, DELETE, PLUS, VIEW } from '../../../icons';
import { getImageUrlPath } from '../../../helper';
import { renameFile } from '../../../Utils/helper';
import AttachementForm from './AttachmentForm';

const ArtDesignReport = ({ item, index, readOnly, leadId, setFormReport, formReport, setAttachments, attachments, setDueDate }) => {

  const today = new Date();
  const Model = "Art Design Attachment"


  function addNewComments() {
    setAttachments((prev) => [...prev, { log: "", date: today, filePath: "" }]);
    setDueDate(moment.utc(today).format("YYYY-MM-DD"));
  }
  return (
    <>
      {/* <div>

      <div className=" w-full  mt-[50px]  px-5 ">
        <div className=" h-[500px] grid grid-cols-1 gap-4 p-1 ">
          <table className=" border border-gray-300 text-sm table-auto w-full overflow-y-auto ">
            <thead className="bg-gray-300 border border-gray-400">
              <tr>
                <th className="py-1 px-3 w-10 text-left border border-gray-400">S.No</th>
                <th className="py-1 px-3 w-32 text-left border border-gray-400">Date</th>
                <th className="py-1 px-3 w-32 text-left border border-gray-400">User</th>
                <th className="py-1 px-3 text-left border border-gray-400">Comments</th>
                <th className="py-1 px-3 text-left w-20 border border-gray-400">File</th>

                <th className="py-1 px-3 w-10 text-center">
                  <button
                    onClick={addNewComments}
                    className="text-green-500 hover:text-green-700 transition duration-150"
                  >
                    {PLUS}
                  </button>
                </th>
              </tr>
            </thead>{console.log(attachments, "attachments")}
            <tbody className="overflow-y-auto">
              {(attachments ? attachments : []).map((item, index) => (
                <AttachementForm key={index} item={item} index={index} readOnly={false} setAttachments={setAttachments} attachments={attachments} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="h-[100px]">
              <button  onClick={()  =>  setFormReport(false)} >
                DONE
              </button>
      </div>
    </div> */}
      <div className="w-full  h-[calc(90vh-50px)] flex flex-col justify-between p-0">
        <div className='w-full p-2 bg-gray-200 text-center text-lg' >{Model}</div>
        <div className="flex-1 overflow-hidden">

          <div className="h-full grid grid-cols-1 gap-4 p-1">
            <div className="h-full overflow-hidden border border-gray-300">
              <table className="text-sm table-auto w-full">
                <thead className="bg-gray-300 border border-gray-400">
                  <tr>
                    <th className="py-1 px-3 w-7 text-left border border-gray-400">S.No</th>
                    <th className="py-1 px-3 w-32 text-left border border-gray-400">Date</th>
                    <th className="py-1 px-3 w-32 text-left border border-gray-400">User</th>
                    <th className="py-1 px-3 text-left border border-gray-400">Comments</th>
                    <th className="py-1 px-3 text-left w-20 border border-gray-400">File</th>
                    <th className="py-1 px-3 w-10 text-center">
                      <button
                        onClick={addNewComments}
                        className="text-green-500 hover:text-green-700 transition duration-150"
                      >
                        {PLUS}
                      </button>
                    </th>
                  </tr>
                </thead>
              </table>
              <div className="overflow-y-auto h-[440px]">
                <table className="text-sm table-auto w-full">
                  <tbody>
                    {(attachments ?? []).map((item, index) => (
                      <AttachementForm
                        key={index}
                        item={item}
                        index={index}
                        readOnly={false}
                        setAttachments={setAttachments}
                        attachments={attachments}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        {console.log(formReport, 'formReport')
        }
        <div className="h-[60px] flex items-center justify-end px-5">
          <button
            onClick={() => setFormReport?.(false)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            DONE
          </button>
        </div>
      </div>

    </>

  )
}

export default ArtDesignReport
