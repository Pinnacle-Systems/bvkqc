import { PrismaClient } from '@prisma/client'
import { NoRecordFound } from '../configs/Responses.js';

const prisma = new PrismaClient()


async function get(req) {
    const { companyId, active } = req.query

    const data = await prisma.defect.findMany({
        where: {
                active: active ? Boolean(active) : undefined,
        }
    });
    return { statusCode: 0, data };
}


async function getOne(id) {
    // const childRecord = await prisma.state.count({ where: { defectId: parseInt(id) } });
    const data = await prisma.defect.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!data) return NoRecordFound("Defect");
    return { statusCode: 0, data };
}

async function getSearch(req) {
    const { searchKey } = req.params
    const { companyId, active } = req.query
    const data = await prisma.country.findMany({
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

async function create(body) {
    console.log(body,"body")
    const { name, active } = await body
    const data = await prisma.defect.create(
        {
            data: {
                name,   active
            }
        }
    )
    return { statusCode: 0, data };
}

async function update(id, body) {
    const { name,  active } = await body
    const dataFound = await prisma.defect.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!dataFound) return NoRecordFound("Defect");
    const data = await prisma.defect.update({
        where: {
            id: parseInt(id),
        },
        data:
        {
            name,  active
        },
    })
    return { statusCode: 0, data };
};

async function remove(id) {
    const data = await prisma.defect.delete({
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
