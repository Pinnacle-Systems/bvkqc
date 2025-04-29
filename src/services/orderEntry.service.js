import { NoRecordFound } from '../configs/Responses.js';
import { getDateFromDateTime, getYearShortCodeForFinYear } from '../utils/helper.js';
import { getTableRecordWithId } from '../utils/helperQueries.js';
import { getFinYearStartTimeEndTime } from '../utils/finYearHelper.js';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient()


async function getNextDocId(branchId, shortCode, startTime, endTime, isTaxBill) {
    let lastObject = await prisma.order.findFirst({
        where: {
            // branchId: parseInt(branchId),
            // isTaxBill: typeof (isTaxBill) === "undefined" ? undefined : JSON.parse(isTaxBill),
            AND: [
                {
                    createdAt: {
                        gte: startTime

                    }
                },
                {
                    createdAt: {
                        lte: endTime
                    }
                }
            ],
        },
        orderBy: {
            id: 'desc'
        }
    });
    const code = (typeof (isTaxBill) === "undefined" ? undefined : JSON.parse(isTaxBill)) ? "ORD" : "ORD";
    const branchObj = await getTableRecordWithId(branchId, "branch")
    let newDocId = `${branchObj.branchCode}/${shortCode}/${code}/1`
    if (lastObject) {
        newDocId = `${branchObj.branchCode}/${shortCode}/${code}/${parseInt(lastObject.docId.split("/").at(-1)) + 1}`
    }

    return newDocId
}


function manualFilterSearchData(searchBillDate, searchMobileNo, data) {
    return data.filter(item =>
        (searchBillDate ? String(getDateFromDateTime(item.createdAt)).includes(searchBillDate) : true)
        && (searchMobileNo ? String(item.contactMobile).includes(searchMobileNo) : true)
    )
}

function isFilterOrder(data, field) {


    if (field == "ALL") {
        return data
    }
    else if (field == "ACTIVE") {
        return data?.filter(item =>  parseInt(item?.SalesBill?.length) === 0)
    }
  


}



async function get(req) {
    const { branchId, pagination, pageNumber, dataPerPage, searchDocId, searchBillDate, searchCustomerName, searchMobileNo, finYearId, isTaxBill, partyId,salesReport,IsorderFilter = false,orderFilter } = req.query
    const {companyId , userRole , userId } = req.query
    console.log(userRole,"userRole",userId)
    let data = await prisma.order.findMany({
        where: {

            docId: Boolean(searchDocId) ?
                {
                    contains: searchDocId
                }
                : undefined,
                // vendorId:userRole  ===  "VENDOR" ? parseInt(userId) :  userRole  ===  "MANUFACTURE" ? parseInt(0) : undefined,
                }
    });
    
   

    data = manualFilterSearchData(searchBillDate, searchMobileNo, data)
    if(IsorderFilter){
       data= isFilterOrder(data,orderFilter)
     }
     if(userRole === "VENDOR")  {
        data = data.filter(item => item.vendorId === parseInt(userId))
     }
     else if( userRole === "MANUFACTURE") {
        data = data.filter(item => item.manufactureId === parseInt(userId))

     }
    
    const totalCount = data.length
    if (pagination) {
        data = data.slice(((pageNumber - 1) * parseInt(dataPerPage)), pageNumber * dataPerPage)
    }
    let finYearDate = await getFinYearStartTimeEndTime(finYearId);
    const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startDateStartTime, finYearDate?.endDateEndTime) : "";
    let newDocId = finYearDate ? (await getNextDocId(branchId, shortCode, finYearDate?.startDateStartTime, finYearDate?.endDateEndTime, isTaxBill)) : "";
    return { statusCode: 0, nextDocId: newDocId, data, totalCount};
}





async function getOne(req) {
    
    const id = req.params.id
    const salesReport=req.query.salesReport

    
    const data = await prisma.order.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            orderBillItems: true,
           
        }
    });

    if (!data) return NoRecordFound("Order Bill");


 
    return { statusCode: 0, data };
}

async function getSearch(req) {
    const { searchKey } = req.params
    const { companyId, active } = req.query
    const data = await prisma.order.findMany({
        where: {
            companyId: companyId ? parseInt(companyId) : undefined,
            active: active ? Boolean(active) : undefined,
            OR: [
                {
                    name: {
                        contains: searchKey,
                    },
                },
            ],
        }
    })
    return { statusCode: 0, data: data };
}

 async function upload(req) {
    const { id } = req.params
    const { isDelete } = req.body
    console.log(id,"id")
    const data = await prisma.email.create({
      
        data: {
            poExcelFileName: (isDelete && JSON.parse(isDelete)) ? "" : req.file.filename,
            orderId:id  ? parseInt(id) : undefined,
        }
    }
    )
    return { statusCode: 0, data };
}


async function createOrderBillItems(tx, orderBillItems, order) {
    const promises = orderBillItems.map(async (item) => {
        return await tx.orderBillItems.create({
            data: {
                orderId: parseInt(order.id) || null,
                itemCode: item?.Itemcode ? item?.Itemcode.toString() : null,
                barCode: item?.Barcode ? item.Barcode : null,
                sizeDesc: item?.sizeDescription ? item.sizeDescription : null,
                size: item?.size ? item.size : null,
                mrp: item?.MRP ? parseInt(item.MRP) : null,
                qty: item?.qty ? parseInt(item.qty) : null,
                orderQty : item?.orderQty   ? parseInt(item?.orderQty)  : null

            }
        })
    }
    )
    return Promise.all(promises)
}


async function create(body) {
    let data;
    const {       branchId, id, userId, companyId, active, orderQty, noOfSet,isTaxBill,
         finYearId, Department, date, orderDetails,className,
        seasonCode,styleCode,Product,Color,ponumber} = await body
    let finYearDate = await getFinYearStartTimeEndTime(finYearId);
    const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startTime, finYearDate?.endTime) : "";
    let newDocId = finYearDate ? (await getNextDocId(branchId, shortCode, finYearDate?.startTime, finYearDate?.endTime, isTaxBill)) : "";
    await prisma.$transaction(async (tx) => {
        data = await tx.order.create(
            {
                data: {
                    docId: newDocId,
                    branchId: parseInt(branchId),
                    createdById: parseInt(userId),
                    department : Department ? Department: null,
                    orderdate : date ? new Date(date): null,
                    class : className ? className : null,
                    supplierCode : seasonCode ?seasonCode : null,
                    styleCode : styleCode ? styleCode : null,
                    product : Product ? Product : null,
                    color : Color ? Color : null,
                    poNumber : ponumber ? ponumber : null
             

                }
            })
        await createOrderBillItems(tx, orderDetails, data)
    })
    return { statusCode: 0, data };
}


async function updateOrderBillItems(tx, orderBillItems, orderBill) {
    let removedItems = order.OrderBillItems.filter(oldItem => {
        let result = orderBillItems.find(newItem => newItem.id === oldItem.id)
        if (result) return false
        return true
    })
    let removedItemsId = removedItems.map(item => parseInt(item.id))
    await tx.orderBillItems.deleteMany({
        where: {
            id: {
                in: removedItemsId
            }
        }
    })

    const promises = orderBillItems.map(async (item) => {
        if (item?.id) {
            return await tx.orderBillItems.update({
                where: {
                    id: parseInt(item.id)
                },
                data: {
                    docId: newDocId,
                    branchId: parseInt(branchId),
                    createdById: parseInt(userId),
                    department : Department ? Department: null,
                    orderdate : date ? new Date(date): null,
                    class : className ? className : null,
                    supplierCode : seasonCode ?seasonCode : null,
                    styleCode : styleCode ? styleCode : null,
                    product : Product ? Product : null,
                    color : Color ? Color : null,
                    poNumber : ponumber ? ponumber : null
                }
            })
        } else {
            return await tx.orderBillItems.create({
                data: {
                    docId: newDocId,
                    branchId: parseInt(branchId),
                    createdById: parseInt(userId),
                    department : Department ? Department: null,
                    orderdate : date ? new Date(date): null,
                    class : className ? className : null,
                    supplierCode : seasonCode ?seasonCode : null,
                    styleCode : styleCode ? styleCode : null,
                    product : Product ? Product : null,
                    color : Color ? Color : null,
                    poNumber : ponumber ? ponumber : null
                }
            })
        }
    })
    return Promise.all(promises)
}

async function update(id,body) {

    let data;
    const {  branchId, userId, companyId, active, orderQty, noOfSet,isTaxBill,
        finYearId, Department, date, orderDetails,className,
       seasonCode,styleCode,Product,Color,ponumber} = await body
    
 
   const dataFound = await prisma.orderBill.findUnique({
           where: {
            id: parseInt(id)
        }
    })

    if (!dataFound) return NoRecordFound("orderBill");
    await prisma.$transaction(async (tx) => {
        data = await tx.orderBill.update({
            where: {
                id: parseInt(id),
            },
            data: {
                docId: newDocId,
                branchId: parseInt(branchId),
                createdById: parseInt(userId),
                department : Department ? Department: null,
                orderdate : date ? new Date(date): null,
                class : className ? className : null,
                supplierCode : seasonCode ?seasonCode : null,
                styleCode : styleCode ? styleCode : null,
                product : Product ? Product : null,
                color : Color ? Color : null,
                poNumber : ponumber ? ponumber : null

            },
            include: {
                OrderBillItems: true
            }
        })
        await updateOrderBillItems(tx, orderDetails, data)
    })
    return { statusCode: 0, data };
}
    

    

async function uploadBillProofImage(id, req) {
    const images = req.files?.images || [];
    const dataFound = await prisma.orderBillItems.findUnique({
        where: {
            id: parseInt(id)
        },
    })
    if (!dataFound) return NoRecordFound("orderBill");
    const data = await prisma.orderBillItems.update({
        where: {
            id: parseInt(id)
        },
        data: {
            BillProofItems: {
                createMany:
                    { data: images.map(i => ({ image: i.filename })) }
            }
        }
    })
    return { statusCode: 0 };
};

async function remove(id) {
    const data = await prisma.order.update({
        where: {
            id: parseInt(id)
        },
        data: {
            isDeleted: true
        }
    })
    return { statusCode: 0, data };

}

export {
    get,
    getOne,
    getSearch,
    create,
    update,
    remove,
    upload,
    uploadBillProofImage
}