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
        return data?.filter(item => parseInt(item?.SalesBill?.length) === 0)
    }



}



async function get(req) {
    const { branchId, pagination, pageNumber, dataPerPage, searchDocId, searchBillDate, searchCustomerName, searchMobileNo, finYearId, isTaxBill, salesReport, IsorderFilter = false, orderFilter } = req.query
    const { companyId, userRole, userId, partyId } = req.query


    let data = await prisma.order.findMany({
        where: {

            docId: Boolean(searchDocId) ?
                {
                    contains: searchDocId
                }
                : undefined,


        }
    });



    data = manualFilterSearchData(searchBillDate, searchMobileNo, data)
    if (IsorderFilter) {
        data = isFilterOrder(data, orderFilter)
    }
    if (userRole === "VENDOR") {
        data = data.filter(item => item.vendorId === parseInt(partyId))
    }
    else if (userRole === "MANUFACTURE") {
        data = data?.filter(item => item.manufactureId === parseInt(partyId))

    }
    else (
        data = data?.filter(item => item.id)
    )

    const totalCount = data.length
    if (pagination) {
        data = data.slice(((pageNumber - 1) * parseInt(dataPerPage)), pageNumber * dataPerPage)
    }
    let finYearDate = await getFinYearStartTimeEndTime(finYearId);
    const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startDateStartTime, finYearDate?.endDateEndTime) : "";
    let newDocId = finYearDate ? (await getNextDocId(branchId, shortCode, finYearDate?.startDateStartTime, finYearDate?.endDateEndTime, isTaxBill)) : "";
    return { statusCode: 0, nextDocId: newDocId, data, totalCount };
}





async function getOne(req) {

    const id = req.params.id
    const salesReport = req.query.salesReport


    let data = await prisma.order.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            orderBillItems: true,
            attachments: true,
            Manufacture: {
                select: {
                    id: true,
                    name: true
                }
            },
            Vendor: {
                select: {
                    id: true,
                    name: true
                }
            }
        }
    });

    if (!data) return NoRecordFound("Order Bill");

    let percentage = await findPercentageValue()

    data["orderBillItems"] = data["orderBillItems"]?.map((val) => {
        return {
            ...val, excessQty: val?.excessQty ? val?.excessQty : val?.orderQty ? percentage : "",
            qty: getQty(val.excessQty, val?.orderQty)
        }
    })

    return { statusCode: 0, data };
}
function getQty(excessQty, orderQty) {
    const percentage = parseFloat((orderQty * excessQty) / 100);
    const updatedQty = parseFloat(orderQty) + percentage;
    return updatedQty
}

async function findPercentageValue() {
    let data = await prisma.percentage.findMany({
        where: {
            active: true,
        }
    });

    return data?.find(v => v.active)?.qty

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
    const { id } = req.body
    const { isDelete } = req.body



    const data = await prisma.email.create({

        data: {
            poExcelFileName: (isDelete && JSON.parse(isDelete)) ? "" : req.files[0].filename,
            orderId: id ? parseInt(id) : undefined,
        }
    }
    )
    return { statusCode: 0, data };
}

async function attach(req) {
    const { id } = req.body
    const { fileName, date, gridUser } = req.body


    const data = await prisma.attachments.createMany({

        data: {
            data: JSON.parse(comments || []).map(temp => ({
                date: temp.date ? new Date(temp.date) : undefined,
                log: temp.log ? temp.log : "",
                gridUser: temp.gridUser ? temp.gridUser : "",
                filePath: temp.filePath ? temp.filePath : undefined,
            }))
        }
    }
    )
    return { statusCode: 0, data };
}

async function createOrderBillItems(tx, orderDetails, order) {
    const promises = orderDetails.map(async (item) => {
        return await tx.orderDetails.create({
            data: {
                orderId: parseInt(order.id) || null,
                barCode: item?.barCode ? item?.barCode : null,
                class: item?.class ? item?.class : null,
                color: item?.color ? item?.color : null,
                department: item?.department ? item?.department : null,
                itemCode: item?.itemCode ? item?.itemCode.toString() : null,
                mrp: item?.mrp ? parseInt(item.mrp) : null,
                orderQty: item?.orderQty ? parseFloat(item?.orderQty) : null,
                product: item?.product ? item?.product : null,
                qty: item?.qty ? parseFloat(item.qty) : null,
                size: item?.size ? item.size : null,
                sizeDesc: item?.sizeDesc ? item.sizeDesc : null,
                styleCode: item?.styleCode ? item?.styleCode : null,
                supplierCode: item?.supplierCode ? item?.supplierCode : null,
                excessQty: item?.excessQty ? parseFloat(item?.excessQty) : null,

            }
        })
    }
    )
    return Promise.all(promises)
}


async function create(body) {
    let data;
    const { branchId, id, userId, vendor, active, orderQty, noOfSet, isTaxBill,
        finYearId, Department, date, orderDetails, className, isSave, attachments,
        seasonCode, styleCode, Product, Color, ponumber, isApproved } = await body
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
                    orderdate: date ? new Date(date) : null,
                    poNumber: ponumber ? ponumber : null,
                    isSave,
                    vendorId: vendor ? parseInt(vendor) : null,



                    attachments: {
                        createMany: attachments ? {
                            data: JSON.parse(attachments || []).map(temp => ({
                                date: temp.date ? new Date(temp.date) : undefined,
                                log: temp.log ? temp.log : "",
                                gridUser: temp.gridUser ? temp.gridUser : "",
                                filePath: temp.filePath ? temp.filePath : undefined,
                            }))
                        } : undefined
                    }

                }
            })
        await createOrderBillItems(tx, orderDetails, data)
    })
    return { statusCode: 0, data };
}


async function updateOrderBillItems(tx, orderDetails, order) {
    if (!Array.isArray(orderDetails) || !order?.id) {
        throw new Error('Invalid order or orderDetails data');
    }

    await tx.orderBillItems.deleteMany({
        where: { orderId: parseInt(order.id) }
    });

    // Parse and clean orderDetails
    const parsedOrderImportItems = orderDetails
        .map((item) => {
            // Handle valid JSON strings
            if (typeof item === 'string' && item.trim().startsWith('{') && item.trim().endsWith('}')) {
                try {
                    return JSON.parse(item);
                } catch (err) {
                    console.error("Failed to parse item:", item, err);
                    return null;
                }
            }
            if (typeof item === 'object' && item !== null) {
                return item;
            }
            return null;
        })
        .filter(item => item !== null);





    // Create DB entries
    const insertPromises = parsedOrderImportItems.map((item) => {
        if (!item) return;

        return tx.orderBillItems.create({
            data: {
                orderId: parseInt(order.id),
                barCode: item.barCode,
                class: item.class,
                color: item.color,
                department: item.department,
                date: item.date ? new Date(item.date) : null,
                itemCode: item.itemCode,
                mrp: parseFloat(item.mrp),
                orderQty: parseInt(item.orderQty),
                product: item.product,
                qty: parseInt(item.qty),
                size: item.size,
                sizeDesc: item.sizeDesc,
                styleCode: item.styleCode,
                supplierCode: item.supplierCode,
                excessQty: parseFloat(item.excessQty)
            }
        });
    });

    return Promise.all(insertPromises);
}



async function update(id, body) {
    let data;


    const { branchId, userId, isSave, excessQty, attachments, isManufactureAttachments,
        excessQtyAmount, date, orderDetails, vendor, orderId, cc,
        ponumber, isAttachments, isApproved, mailTransaction, poSentForApproval, fromAddress, sendorName, sendorId, toEmail,
        receiverName, receiverId, subject, message, ccList, fileName } = await body



    const dataFound = await prisma.order.findUnique({
        where: {
            id: parseInt(id)
        }
    })

    if (!dataFound) return NoRecordFound("orderBill");

    if (isAttachments) {


        await prisma.$transaction(async (tx) => {
            data = await tx.order.update({
                where: {
                    id: parseInt(id),
                },
                data: {
                    attachments: {
                        deleteMany: {},
                        createMany: attachments ? {
                            data: JSON.parse(attachments || []).map(temp => ({
                                date: temp.date ? new Date(temp.date) : undefined,
                                log: temp.log ? temp.log : "",
                                gridUser: temp.gridUser ? temp.gridUser : "",
                                filePath: temp.filePath ? temp.filePath : undefined,

                            }))
                        } : undefined
                    }

                },
                include: {
                    orderBillItems: true
                }
            })

        })

        return { statusCode: 0, data };

    }

    if (mailTransaction) {

        data = await prisma.order.update({
            where: {
                id: parseInt(orderId),
            },
            data: {
                poSentForApproval: poSentForApproval ? Boolean(poSentForApproval) : undefined,

            },

        })


        data = await prisma.mailTransaction.create(
            {
                data: {

                    orderId: parseInt(orderId),

                    createdById: parseInt(userId),
                    date: new Date(), cc,
                    from: fromAddress, senderName: sendorName,
                    receiverName, to: receiverName,
                    receiverId: receiverId ? parseInt(receiverId) : null, subject, messages: message,
                    senderId: parseInt(sendorId),
                    mailTransAttachments: {
                        createMany: attachments ? {
                            data: JSON.parse(attachments || []).map(temp => ({
                                fileName: temp.filePath ? temp.filePath : undefined,

                            }))
                        } : undefined
                    }

                }
            })

        return { statusCode: 0, data };

    }

    await prisma.$transaction(async (tx) => {
        data = await tx.order.update({
            where: {
                id: parseInt(id),
            },
            data: {
                branchId: parseInt(branchId),
                isSave: isSave ? JSON.parse(isSave) : false,
                vendorId: vendor ? parseInt(vendor) : null,
                excessQty: excessQty ? parseFloat(excessQty) : null,
                netAmount: excessQtyAmount ? parseFloat(excessQtyAmount) : null,
                isApproved: isApproved ?? undefined,
                // attachments: {
                //     deleteMany: {},
                //     createMany: attachments ? {
                //         data: attachments.map(temp => ({
                //             date: temp.date ? new Date(temp.date) : undefined,
                //             log: temp.log ? temp.log : "",
                //             gridUser: temp.gridUser ? temp.gridUser : "",
                //             filePath: temp.filePath ? temp.filePath : undefined,

                //         }))
                //     } : undefined
                // }

            },

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
    attach,
    uploadBillProofImage
}