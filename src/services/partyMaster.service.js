import { PrismaClient } from '@prisma/client'
import { NoRecordFound } from '../configs/Responses.js';
import { exclude, getRemovedItems } from '../utils/helper.js';


const prisma = new PrismaClient()


async function get(req) {
    const { companyId, active } = req.query


    const data = await prisma.party.findMany({
        where: {
            active: active ? Boolean(active) : undefined,
        },
        include: {

            City: {
                select: {
                    name: true,
                    state: true
                }
            },
        }

    });
    return { statusCode: 0, data };
}


async function getOne(id) {
    const childRecord = 0;
    const data = await prisma.party.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            City: {
                select: {
                    name: true,
                    state: true
                }
            },


        }
    })
    if (!data) return NoRecordFound("party");
    return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

async function getSearch(req) {
    const { searchKey } = req.params
    const { companyId, active } = req.query
    const data = await prisma.party.findMany({
        where: {
            companyId: companyId ? parseInt(companyId) : undefined,
            active: active ? Boolean(active) : undefined,
            OR: [
                {
                    name: {
                        contains: searchKey,
                    },
                },
                {
                    code: {
                        contains: searchKey,
                    },
                },
            ],
        }
    })
    return { statusCode: 0, data: data };
}



export async function upload(req) {
    const { id } = req.params

    const { isDelete } = req.body
    const data = await prisma.party.update({
        where: {
            id: parseInt(id)
        },
        data: {
            logo: (isDelete && JSON.parse(isDelete)) ? "" : req.file.filename,
        }
    }
    )
    return { statusCode: 0, data };
}

async function create(body) {
  const {
    name, code, aliasName, displayName,
    isSupplier, isBuyer, isClient, isIgst,
    processDetails, mailId, cityId, pincode,
    panNo, tinNo, cstNo, cstDate, yarn, fabric,
    cinNo, faxNo, website, partyType, gstNo,
    currencyId, costCode, 
    accessoryGroup, 
    companyId, active, userId,
  } = await body;

  const data = await prisma.party.create({
    data: {
      name,
      code: code || null,
      aliasName: aliasName || null,
      displayName: displayName || null,
      isSupplier: isSupplier ?? false,
  isClient: isClient ?? false,
      isIgst: isIgst ?? false,
      mailId: mailId || null,
City: cityId ? { connect: { id: parseInt(cityId) } } : undefined,
      pincode: pincode ? parseInt(pincode) : undefined,
      panNo: panNo || null,
      tinNo: tinNo || null,
      cstNo: cstNo || null,
      cstDate: cstDate ? new Date(cstDate) : null,
      cinNo: cinNo || null,
      faxNo: faxNo || null,
      website: website || null,
      gstNo: gstNo || null,
      costCode: costCode || null,
      active: active ?? true,
      yarn: yarn ?? false,
      fabric: fabric ?? false,
      accessoryGroup: accessoryGroup ?? false,
      partyType: partyType || null,
      Company: companyId ? { connect: { id: parseInt(companyId) } } : undefined,
      createdBy: userId ? { connect: { id: parseInt(userId) } } : undefined,
      Currency: currencyId ? { connect: { id: parseInt(currencyId) } } : undefined,
      // You can include City connect like this if needed:
      // City: cityId ? { connect: { id: parseInt(cityId) } } : undefined,
    },
  });

  return { statusCode: 0, data };
}

async function update(id, body) {
  const {
    name, code, aliasName, displayName, address,
    isSupplier, isBuyer, isClient, isIgst,
    processDetails, mailId, cityId, pincode,
    panNo, tinNo, cstNo, cstDate, yarn, fabric,
    accessoryGroup, accessoryItemList, cinNo, faxNo,
    email, website, shippingAddress, contactDetails,
    isContactOnly = false, partyType, gstNo,
    isLeadForm = false, companyId, active, userId
  } = await body;

  const dataFound = await prisma.party.findUnique({
    where: { id: parseInt(id) },
    include: {
      City: { select: { name: true, state: true } },
    },
  });

  if (!dataFound) return NoRecordFound("party");

  const baseData = {
    name,
    code: code || null,
    aliasName: aliasName || null,
    displayName: displayName || null,
    address: address || null,
    isSupplier: isSupplier ?? false,
    isClient: isClient ?? false,
    isIgst: isIgst ?? false,
    mailId: mailId || null,
City: cityId ? { connect: { id: parseInt(cityId) } } : undefined,
    pincode: pincode ? parseInt(pincode) : undefined,
    panNo: panNo || null,
    tinNo: tinNo || null,
    cstNo: cstNo || null,
    cstDate: cstDate ? new Date(cstDate) : null,
    cinNo: cinNo || null,
    faxNo: faxNo || null,
    email: email || null,
    website: website || null,
    gstNo: gstNo || null,
    yarn: yarn ?? false,
    fabric: fabric ?? false,
    accessoryGroup: accessoryGroup ?? false,
    partyType: partyType || null,
    active: active ?? true,
      ...(userId && {
      createdBy: { connect: { id: parseInt(userId) } },
    }),
  };

  const data = await prisma.$transaction(async (tx) => {
    return await tx.party.update({
      where: { id: parseInt(id) },
      data: baseData,
    });
  });

  return { statusCode: 0, data };
}


async function remove(id) {
    const data = await prisma.party.delete({
        where: {
            id: parseInt(id)
        },
    })
    return { statusCode: 0, data };
}

export {
    get,
    getOne,
    getSearch,
    create,
    update,
    remove
}
