import React, { useEffect, useState } from 'react'
import RolesMaster from '../RoleMaster';
import UserMaster from './UserMaster';
import { Party } from '../../../Utils/DropdownData';
import { useDispatch, useSelector } from 'react-redux';
import { push } from '../../../redux/features/opentabs';
import secureLocalStorage from 'react-secure-storage';



const UserRoles = () => {
    const [activeNavBar, setActiveNavBar] = useState("");

    const userRole = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "userRole"
      );
      const userRoleId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "userRoleId"
      );
      console.log(userRoleId,"userRole", userRole);


if(activeNavBar === "")
    return (
        <div className='h-full flex flex-col'>
            <div className='md:flex md:items-center page-heading font-bold heading text-center py-2 justify-center'>
                User Allocation
            </div>
            <div className=''>
                <div className='border-2 bg-white'>
                    <div className='flex-col w-[50%]  items-center '>
                        {Party.map((item, index) =>
                            <div key={index} onClick={() => {
                                setActiveNavBar(item.show) 
                             }}
                         className={`${activeNavBar === item ? "sub-navbar-active" : "sub-navbar"} text-center`}>{item.show}</div>
                        )}
                    </div>
                </div>
                <div className='col-span-7'>
                </div>
            </div>
        </div>
    );


    return(
            <>
            <div className='flex-row justify-end  '> 
            <button className="px-6 py-2 rounded-lg shadow-md hover:bg-gray-600 transition duration-300 border border-gray-200 "
                                            onClick={() => setActiveNavBar("")}
                                    >
                                    BACK
                                        </button>     
                { <UserMaster activeNavBar={activeNavBar}  setActiveNavBar={setActiveNavBar}/>    } 
            </div>
        

            </>
    )
}

export default UserRoles

