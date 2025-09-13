import { PrismaClient } from '@prisma/client'
import { NoRecordFound } from '../configs/Responses.js';

const prisma = new PrismaClient()


async function get(req) {
    const { companyId, active } = req.query
    const data = await prisma.defectCorrection.findMany({
        where: {
                       active: active ? Boolean(active) : undefined,
        },
        include: {
            Defect: true
        }
    });
    return { statusCode: 0, data };
}


async function getOne(id) {
    // const childRecord = await prisma.city.count({ where: { defectCorrectionId: parseInt(id) } });
    const data = await prisma.defectCorrection.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!data) return NoRecordFound("defectCorrection");
    return { statusCode: 0, data:data };
}

async function getSearch(req) {
    const { companyId, active } = req.query
    const { searchKey } = req.params
    const data = await prisma.defectCorrection.findMany({
        where: {
            country: {
                companyId: companyId ? parseInt(companyId) : undefined,
            },
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
                {
                    country: {
                        name: {
                            contains: searchKey
                        },
                    }
                }
            ],
        },
        select: {
            name: true, code: true, gstNo: true, active: true, id: true,
            country: {
                select: {
                    name: true
                }
            }
        }
    })
    return { statusCode: 0, data: data };
}

async function create(body) {
    const { name, code, defectId } = await body;

    const data = await prisma.defectCorrection.create({
        data: {
            name,
            Defect: {
                connect: { id: parseInt(defectId) }  
            }
        },
    });

    return { statusCode: 0, data };
}

async function update(id, body) {
    const { name, active,defectId } = await body
    const dataFound = await prisma.defectCorrection.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!dataFound) return NoRecordFound("defectCorrection");
    const data = await prisma.defectCorrection.update({
        where: {
            id: parseInt(id),
        },
        data:
        {
            name, active,
            Defect: {
                connect: { id: parseInt(defectId) }  
            }
        },
    })
    return { statusCode: 0, data };
};

async function remove(id) {
    const data = await prisma.defectCorrection.delete({
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
