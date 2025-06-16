import { PrismaClient } from '@prisma/client';
import { NoRecordFound } from '../configs/Responses.js';

const prisma = new PrismaClient();

async function get(req) {
  const { companyId } = req.query;
  const data = await prisma.lineMaster.findMany({
    where: {
      companyId: companyId ? parseInt(companyId) : undefined
    },
    include: {
      Company: true
    }
  });
  return { statusCode: 0, data };
}

async function getOne(id) {
  const data = await prisma.lineMaster.findUnique({
    where: {
      id: parseInt(id)
    },
    include: {
      Company: true
    }
  });
  if (!data) return NoRecordFound("Line Master");
  return { statusCode: 0, data };
}

async function getSearch(req) {
  const { companyId } = req.query;
  const { searchKey } = req.params;

  const data = await prisma.lineMaster.findMany({
    where: {
      companyId: companyId ? parseInt(companyId) : undefined,
      OR: [
        {
          lineNo: {
            contains: searchKey,
            mode: 'insensitive'
          }
        },
        {
          lineName: {
            contains: searchKey,
            mode: 'insensitive'
          }
        }
      ]
    },
    select: {
      id: true,
      lineNo: true,
      lineName: true,
      sewingMachineQty: true,
      helperQty: true,
      OperationQty: true,
      Company: {
        select: {
          name: true
        }
      }
    }
  });

  return { statusCode: 0, data };
}

async function create(body) {
  const {
    lineNo,
    lineName,
    sewingMachineQty,
    helperQty,
    operatorQty,
    companyId,active
  } = body;
 console.log(active,"active")
  const data = await prisma.lineMaster.create({
    data: {
      lineNo,
      lineName,
      sewingMachineQty,
      helperQty,
      OperationQty:operatorQty,
      companyId: companyId ? parseInt(companyId) : undefined,
      active
    }
  });

  return { statusCode: 0, data };
}

async function update(id, body) {
  const {
    lineNo,
    lineName,
    sewingMachineQty,
    helperQty,
    operatorQty,
    companyId,
    active
  } = body;
console.log(operatorQty,"operatorQty")
  const dataFound = await prisma.lineMaster.findUnique({
    where: {
      id: parseInt(id)
    }
  });

  if (!dataFound) return NoRecordFound("Line Master");

  const data = await prisma.lineMaster.update({
    where: {
      id: parseInt(id)
    },
    data: {
      lineNo,
      lineName,
      sewingMachineQty,
      helperQty,
      active,
      OperationQty:operatorQty,
      companyId: companyId ? parseInt(companyId) : undefined
    }
  });

  return { statusCode: 0, data };
}

async function remove(id) {
  const data = await prisma.lineMaster.delete({
    where: {
      id: parseInt(id)
    }
  });

  return { statusCode: 0, data };
}

export {
  get,
  getOne,
  getSearch,
  create,
  update,
  remove
};
