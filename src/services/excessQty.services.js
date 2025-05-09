import { PrismaClient } from '@prisma/client'
import { NoRecordFound } from '../configs/Responses.js';

const prisma = new PrismaClient()

async function get(req) {
    const { companyId, active, defaultRole } = req.query
    const data = await prisma.percentage.findMany({
        where: {
            active: active ? Boolean(active) : undefined,
        }
    });
    return { statusCode: 0, data };
}

async function getOne(id) {
    const childRecord = await prisma.user.count({ where: { roleId: parseInt(id) } });
    const data = await prisma.percentage.findUnique({
        where: {
            id: parseInt(id)
        }
       
    })
    if (!data) return NoRecordFound("Percentage");
    return { statusCode: 0, data: {...data, ...{childRecord}} };
}

async function getSearch(req) {
    const { searchKey } = req.params
    const { companyId, active, defaultRole } = req.query
    const data = await prisma.percentage.findMany({
        where: {
            companyId: companyId ? parseInt(companyId) : undefined,
            active: active ? Boolean(active) : undefined,
            defaultRole: defaultRole ?  JSON.parse(defaultRole) : undefined,
            OR: [
                {
                    name: {
                        contains: searchKey,
                    },
                },
            ],
        },
    })
    return { statusCode: 0, data: data };
}

async function create(body) {
    const { active,qty } = await body
   
    const data = await prisma.percentage.create({
        data: {
            qty:qty ? parseInt(qty)  : null,
            active: active,
          
        },
    });
    return { statusCode: 0, data };
}

async function update(id, body) {
    const { active,qty } = await body
    const dataFound = await prisma.percentage.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!dataFound) return NoRecordFound("role");
    const data = await prisma.percentage.update({
        where: {
            id: parseInt(id),
        },
        data: {
            qty:qty ? parseInt(qty)  : null,
            active: active,
        },
    })
    return { statusCode: 0, data };
};

async function remove(id) {
    const data = await prisma.percentage.delete({
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
