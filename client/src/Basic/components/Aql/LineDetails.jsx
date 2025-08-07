import { DropdownWithSearchNew, MultiSelectDropdown } from "../../../Inputs"

const LineDeatils = ()  => {
    return   (
        <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        
                     <DropdownWithSearchNew
                        // label={"Branch"}
                        // options={branchList?.data}
                        // value = {branchId}
                        // setValue = {setBranchId}
                        // labelField={"branchName"}
                        // readOnly={readOnly}
        
                    />
                    <DropdownWithSearchNew
                        // label={"Incharge"}
                        // options={employeeOptions}
                        // value = {employeeCategoryId}
                        // setValue = {setEmployeeCategoryId}
                        // labelField={"name"}
                        // readOnly={readOnly}
                      
                    />
                    <MultiSelectDropdown
                        // name = {"lineName"}
                        // options={lineOptions}
                        // labelField={"name"}
                        // selected={selectedLineList}
                        // setSelected={setSelectedLineList}
                        // readOnly={readOnly}
        
                        />
        
            
              
                    </div>
        </>
    )
}

export default LineDeatils