import { useCallback, useEffect, useState } from "react"
import { useAddPercentageMutation, useGetPercentageByIdQuery, useGetPercentageQuery, useUpdatePercentageMutation } from "../../../redux/uniformService/Percentage";
import { params } from "../../../Utils/helper";
import { CheckBox, Modal, MultiSelectDropdown, TextInput, ToggleButton } from "../../../Inputs";
import Mastertable from "../MasterTable/Mastertable";
import { MultiSelectPartytype, Party, statusDropdown } from "../../../Utils/DropdownData";
import toast from "react-hot-toast";
import MastersForm from "../MastersForm/MastersForm";
import { useGetPartyQuery } from "../../../redux/services/PartyMasterService";
import { multiSelectOption } from "../../../Utils/contructObject";
import { useGetRolesQuery } from "../../../redux/services/RolesMasterService";
import { useGetUserQuery } from "../../../redux/services/UsersMasterService";



export default function Approval() {
    const [id, setId] = useState("")
    const [form, setForm] = useState(false);

    const [active, setActive] = useState(true);
    const [partytype, setPartyType] = useState([])
    const [role, setRole] = useState([])
    const [users, setUsers] = useState([])
    const [readOnly, setReadOnly] = useState(false);

    // const { data: allData, isLoading, isFetching } = useGetPercentageQuery({ params });
    const { data: roleData } = useGetRolesQuery({ params });
    const { data: userData } = useGetUserQuery({ params });

    const { data: singleData, isFetching: isSingleFetching, isLoading: isSingleLoading } = useGetPercentageByIdQuery(id, { skip: !id });

    const [addData] = useAddPercentageMutation();
    const [updateData] = useUpdatePercentageMutation();

    console.log(partytype, role, "partytype")

    const syncFormWithDb = useCallback(
        (data) => {
            if (id) {
                setReadOnly(true);
                setPartyType(data?.qty)
                setActive(data?.active)
            }
        }, [id])


    useEffect(() => {
        syncFormWithDb(singleData?.data);
    }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData])


    const handleSubmitCustom = async (callback, data, text) => {
        try {
            let returnData = await callback(data).unwrap();
            setId(returnData.data.id)
            // syncFormWithDb(undefined)
            toast.success(text + "Successfully");

        } catch (error) {
            console.log("handle")
        }
    }


    const validateOneActiveFinYear = (active) => {
        if (Boolean(active)) {
            // return !allData.data.some((qty) => id === qty.id ? false : Boolean(qty.active))
        }
        return true
    }
    const data = {
        active,
        id, qty: partytype
    }
    const saveData = () => {
        console.log("hit")
        if (!validateOneActiveFinYear(data.active)) {
            toast.error("Only one Fin year can be active...!", { position: "top-center" })
            return
        }
        // if (!validateData(data)) {
        //     toast.error("Please fill all required fields...!", { position: "top-center" })
        //     return
        // }
        if (!window.confirm("Are you sure save the details ...?")) {
            return
        }
        if (id) {
            handleSubmitCustom(updateData, data, "Updated")
        } else {
            handleSubmitCustom(addData, data, "Added")
        }
    }

    const onNew = () => { setId(""); setReadOnly(false); setForm(true); setPartyType([]) }
    const tableHeaders = ["S.NO", "qty", "Status", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "]
    const tableDataNames = ["index+1", "dataObj.qty", 'dataObj.active ? ACTIVE : INACTIVE', " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "]

    function onDataClick(id) {
        setId(id);
        setForm(true);
    }
    const multiSelectOptio = (data, label, value) => {
        const outputData = [];
        for (let i of data) {
            outputData.push({ label: i[label], value: i[value] });
        }
        return outputData;
    };

    const [selectedApprover, setSelectedApprover] = useState('');
    const approvers = ['Buyer', 'Manufacture'];
    return (
        <>

            <div>
                <div className='w-full flex justify-between mb-2 items-center px-0.5 text-[14px] font-semibold'>
                    <h5 className='my-1 bg-gray-300 px-1 rounded'>Select Approver</h5>
                    <div className='flex items-center'>
                        <button onClick={() => { setForm(true); onNew() }} className='bg-green-500 text-white px-3 py-1 button rounded shadow-md'>+ New</button>
                    </div>
                </div>

                <div className="w-full flex flex-col   items-start gap-3">
                    <div className="p-4  bg-white rounded-xl shadow-md">
                        <h2 className="text-lg font-semibold mb-4">Select Approver</h2>
                        <form>
                            {approvers.map((approver, index) => (
                                <label key={index} className="flex  mb-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="approver"
                                        value={approver}
                                        checked={selectedApprover === approver}
                                        onChange={() => setSelectedApprover(approver)}
                                        className="form-radio text-blue-600 mr-2"
                                    />
                                    <span className="text-gray-700">{approver}</span>
                                </label>
                            ))}
                        </form>
                        {selectedApprover && (
                            <div className="w-full flex pr-1">
                                <span>     Selected Approver: </span>
                                <p className=" text-green-600 font-medium px-1">
                                    {selectedApprover}
                                </p>
                            </div>
                        )}
                    </div>

                </div>

                {/* <div className='w-full flex items-start'>
                                <Mastertable
                                    header={'Excess Qty'}
                                    // searchValue={searchValue}
                                    // setSearchValue={setSearchValue}
                                    onDataClick={onDataClick}
                                    // setOpenTable={setOpenTable}
                                    tableHeaders={tableHeaders}
                                    tableDataNames={tableDataNames}
                                    // data={allData?.data}
                                    // loading={
                                    //     isLoading || isFetching
                                    // } 
                                    />
                            </div>
                            {form === true && <Modal isOpen={form} form={form} widthClass={"w-[80%] h-[70%]"} onClose={() => { setForm(false);  }}>
                                <MastersForm
                                    onNew={onNew}
                                    onClose={() => {
                                        setForm(false);
                                        // setSearchValue("");
                                        setId(false);
                                    }}
                                    // model={MODEL}
                                    // childRecord={childRecord.current}
                                    saveData={saveData}
                                    setReadOnly={setReadOnly}
                                    // deleteData={deleteData}
                                    readOnly={readOnly}
                                    // emptyErrors={() => setErrors({})}
                                >
                                    <fieldset className=' rounded mt-2'>
                                        <div className='grid grid-cols-3'>
                                         
                                          < div className='mb-5'>
                                                <MultiSelectDropdown name="PartyType"  selected={partytype} setSelected={setPartyType} required={true} readOnly={readOnly} 
                                                options={multiSelectOption(MultiSelectPartytype ? MultiSelectPartytype : [], "name", "value")}   />
                                            </div>
                
                                            <div className='mb-5'>
                                             <MultiSelectDropdown name="Role"  selected={role} setSelected={setRole} required={true} readOnly={readOnly} 
                                                options={multiSelectOption(roleData ? roleData?.data : [], "name", "id")}    />                                                   
                                            </div>
                
                                        
                                              <div className='mb-5'>
                                             <MultiSelectDropdown name="Users"  selected={users} setSelected={setUsers} required={true} readOnly={readOnly} 
                                                options={multiSelectOption(userData ? userData?.data : [], "username", "id")}    />                                             
                                              </div>
                
                                             </div>
                                         
                                    </fieldset>
                                </MastersForm>
                            </Modal>} */}

            </div>
        </>
    )
}