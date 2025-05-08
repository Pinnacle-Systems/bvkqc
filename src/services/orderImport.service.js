import { PrismaClient } from '@prisma/client'
import { NoRecordFound } from '../configs/Responses.js';
import { read, utils } from "xlsx";
import { convertToImportFormat } from "../utils/excelDataTransform.js";
import { getFinYearStartTimeEndTime } from "../utils/finYearHelper.js";
import { getDateFromDateTime, getDateTimeRangeForCurrentYear, getYearShortCode, getYearShortCodeForFinYear } from "../utils/helper.js";
import { getTableRecordWithId } from "../utils/helperQueries.js";
import { createAllClass, createAllColor, createAllSize, getAllClass, getAllColor, getAllSize } from '../query/masters.js';
const prisma = new PrismaClient()


async function getNextDocId(branchId) {

    const { startTime, endTime } = getDateTimeRangeForCurrentYear(new Date());
    let lastObject = await prisma.orderImport.findFirst({
        where: {
            branchId: parseInt(branchId),
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
    const branchObj = await getTableRecordWithId(branchId, "branch")
    let newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/ORDI/1`
    if (lastObject) {
        newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/ORDI/${parseInt(lastObject.docId.split("/").at(-1)) + 1}`

    }
    return newDocId
}




const xprisma = prisma.$extends({
    result: {
        orderImport: {
            docDate: {
                needs: { createdAt: true },
                compute(orderImport) {
                    return getDateFromDateTime(orderImport?.createdAt)
                },
            },
        }
    },
})

async function get(req) {
    const { pagination, pageNumber, dataPerPage, branchId, finYearId, searchOrderId, searchDocId, searchDocDate, searchSupplierName, orderId
    } = req.query


    let finYearDate = await getFinYearStartTimeEndTime(finYearId);
    const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startTime, finYearDate?.endTime) : "";
    // let docId = await getNextDocId(branchId, shortCode, finYearDate?.startTime, finYearDate?.endTime);
    let newDocId = await getNextDocId(branchId)
    let data = await xprisma.orderImport.findMany({
        where: {
            docId: searchDocId ? { contains: searchDocId } : undefined,

            // Party: searchSupplierName ? { name: { contains: searchSupplierName } } : undefined,

            // Order: searchOrderId ? { docId: { contains: searchOrderId } } : undefined,

            // orderId: orderId ? parseInt(orderId) : undefined,
        },

    });

    let totalCount = data.length;
    if (searchDocDate) {
        data = data.filter(i => i.docDate.includes(searchDocDate))
    }
    if (pagination) {
        data = data.slice(((pageNumber - 1) * parseInt(dataPerPage)), pageNumber * dataPerPage)
    }

    return { statusCode: 0, data, totalCount, nextDocId: newDocId };
}


async function getOne(id) {
    const childRecord = 0;
    const data = await prisma.orderImport.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            Party: {
                select: {
                    name: true
                }
            },
            orderImportItems: true,


        }
    })
    if (!data) return NoRecordFound("orderImport");

    return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}


async function createAdditionalImportData(tx, additionalImportData, orderImportId) {
    const promises = additionalImportData.map(async (item) => {
        await tx.additionalImportData.create({
            data: {
                orderImportId: parseInt(orderImportId),
                // sizeId: item.sizeId ? parseInt(item.sizeId) : undefined,
                // bottomSizeId: item?.bottomSizeId ? parseInt(item?.bottomSizeId) : undefined,
                bottomColorId: item?.colorId ? parseInt(item?.colorId) : undefined,
                colorId: item?.colorId ? parseInt(item?.colorId) : undefined,
                itemId: item?.itemId ? parseInt(item?.itemId) : undefined,
                itemTypeId: item?.itemTypeId ? parseInt(item?.itemTypeId) : undefined,
                gender: item?.gender ? item?.gender : null,
                qty: item?.qty ? item?.qty : undefined,
                classIds: {
                    createMany: {
                        data: item.classIds.map(temp => ({
                            classId: temp.classId ? parseInt(temp.classId) : undefined,
                            qty: temp.qty ? parseInt(temp.qty) : undefined,
                            sizeId: temp.sizeId ? parseInt(temp.sizeId) : undefined,
                            bottomSizeId: temp?.sizeId ? parseInt(temp?.sizeId) : undefined,
                        }))
                    }
                },
            }
        })
    }
    )
    return Promise.all(promises)
}





async function createOrderImportItems(additionalImportData) {

    let orderImportArray = [];
    for (let i = 0; i < additionalImportData?.length; i++) {
        let obj = additionalImportData[i]
        let colorName = await getTableRecordWithId(parseInt(obj?.colorId), "color")
        colorName = colorName ? colorName.name : "";
        let bottomColor = await getTableRecordWithId(parseInt(obj?.colorId), "color")
        bottomColor = bottomColor ? bottomColor.name : "";
        let genderobj;
        if (obj?.gender === "MALE") {
            genderobj = "M"
        }
        else if (obj?.gender === "FEMALE") {
            genderobj = "F"
        }
        else {
            genderobj = "O"
        }


        for (let j = 0; j < obj?.classIds?.length; j++) {
            let newObj = obj?.classIds[j]

            let className = await getTableRecordWithId(newObj?.classId, "class")
            className = className ? className.name : "";
            let sizeName = await getTableRecordWithId(parseInt(newObj?.sizeId), "size")
            sizeName = sizeName ? sizeName.name : "";
            let bottomSize = await getTableRecordWithId(parseInt(newObj?.sizeId), "size")
            bottomSize = bottomSize ? bottomSize.name : "";

            for (let k = 0; k < newObj?.qty; k++) {


                let readyObj = {
                    classId: parseInt(newObj?.classId),
                    sizeId: parseInt(newObj?.sizeId),
                    bottomSizeId: parseInt(newObj?.sizeId),
                    bottomColorId: parseInt(obj?.colorId),
                    colorId: parseInt(obj?.colorId),
                    bottomColor: colorName,
                    student_name: "samplename",
                    class: className,
                    color: colorName,
                    size: sizeName,
                    bottomsize: sizeName,
                    gender: genderobj,
                }

                orderImportArray?.push(readyObj)

            }
        }
    }

    return orderImportArray

}




async function create(req) {

    const { userId, branchId, partyId, companyId, orderId } = await req.body

    let docId = await getNextDocId(branchId);
    let data;



    let file = new Uint8Array(req.file.buffer)
    let workbook = read(file, { type: "array" });
    var sheet_name_list = workbook.SheetNames;
    const importedData = utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
    let headerNames = importedData;


    const orderImportItems = convertToImportFormat(importedData, headerNames);


    console.log(orderImportItems, "orderImportItems")

    await prisma.$transaction(async (tx) => {
        data = await tx.orderImport.create(
            {
                data: {

                    companyId: companyId ? parseInt(companyId) : undefined,
                    branchId: branchId ? parseInt(branchId) : undefined,
                    docId,
                    createdById: parseInt(userId),
                    orderImportItems: {
                        createMany: {
                            data: orderImportItems
                        }
                    }
                }
            }
        )
    })
    return { statusCode: 0, data: orderImportItems };

}



async function update(id, body) {
    const { name, code, active, orderId } = await body


    const dataFound = await prisma.orderImport.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!dataFound) return NoRecordFound("orderImport");
    const data = await prisma.orderImport.update({
        where: {
            id: parseInt(id),
        },
        data:
        {
            name, code, active, orderId: parseInt(orderId)
        },
    })
    return { statusCode: 0, data };
};

async function remove(id) {
    const data = await prisma.orderImport.delete({
        where: {
            id: parseInt(id)
        },
    })
    return { statusCode: 0, data };
}

export {
    get,
    getOne,
    create,
    update,
    remove
}
