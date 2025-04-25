import {  SpecialInput } from "../../../Inputs"



export default function GeneralSummary({}){

        const Model = "Summary"

    return(
        <>
         
            <div className="flex flex-col mt-3  w-[100%]">
                <div className="p-3 bg-blue-200 text-center mb-5">{Model}</div>
                    <div className="flex flex-col p-2 w-[50%] bg-gray-300 ">
                            General Information   
                    </div>
                 </div>
                <div className="grid grid-cols-2 justify-between">
                    
                 <div className="mt-5 ">
                    <SpecialInput  name={"Order  Number"}  value />
                    <SpecialInput  name={"Customer"} />
                    <SpecialInput  name={"Inv Address"} />
                    <SpecialInput  name={"Del  Address"} />
                    <SpecialInput  name={"Sales Ex"} />
                    <SpecialInput  name={"Remarks"} />
                    <SpecialInput  name={"Required Approval"} />
                 </div>
                 <div className="mt-5 justify-end ">
                    <SpecialInput  name={"Order  Cancelled"} />
                    <SpecialInput  name={"Reason"} />
                    <SpecialInput  name={"Cancelled By"} />
                    <SpecialInput  name={"Cancel Date"} />
                    <SpecialInput  name={"Approval Status"} />
                    <SpecialInput  name={"Approved By"} />
                    <SpecialInput  name={"Reason"} />
                 </div>
               
            </div> 



        </>
    )
}