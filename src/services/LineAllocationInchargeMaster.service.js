import { PrismaClient } from "@prisma/client";
import { NoRecordFound } from "../configs/Responses.js";

const prisma = new PrismaClient();

async function get(req) {
  const { companyId } = req.query;
  const data = await prisma.LineAllocationInchargeMaster.findMany({
          include : {
            InchargeLineListMaster : true,
            Employee : {
              select : {
                name : true,
              }
            },
            Branch : {
              select : {
                branchName : true
              }
            }
          }
    
  });
  return { statusCode: 0, data };
}

async function getOne(id) {
  const data = await prisma.LineAllocationInchargeMaster.findUnique({
    where: {
      id: parseInt(id),
    },
    include : {
        InchargeLineListMaster : {
          include : {
            LineMaster  : {
              select : {
                lineName : true
              }
            }
          }
        }
    }
   
  });
  if (!data) return NoRecordFound("Line Master");
  return { statusCode: 0, data };
}

async function getSearch(req) {
  const { companyId } = req.query;
  const { searchKey } = req.params;

  const data = await prisma.LineAllocationInchargeMaster.findMany({
    where: {
      companyId: companyId ? parseInt(companyId) : undefined,
      OR: [
        {
          lineNo: {
            contains: searchKey,
            mode: "insensitive",
          },
        },
        {
          lineName: {
            contains: searchKey,
            mode: "insensitive",
          },
        },
      ],
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
          name: true,
        },
      },
    },
  });

  return { statusCode: 0, data };
}
async function create(body) {
  const {
    employeeCategoryId,
      branchId ,
 
    selectedLineList,
    active
  } = body;

  const data = await prisma.LineAllocationInchargeMaster.create({
    data: {
      Employee : employeeCategoryId  ?  { connect: { id: parseInt(employeeCategoryId) } }  : undefined  ,
      Branch : branchId   ? { connect: { id: parseInt(branchId) } }  : undefined ,
      
           InchargeLineListMaster :  {
                      createMany: selectedLineList.length >  0 ? {
                        data: selectedLineList?.map((temp) => {
                            let newItem = {}
                            newItem["lineMasterId"] = temp["value"] ? temp["value"] : null;

                            return newItem
                          })
                        } : undefined
                      
                }

      
    }
  });

  return { statusCode: 0, data };
}


async function update(id, body) {
  const {
   employeeCategoryId,
      branchId ,
 
    selectedLineList,
    active
  } = body;

  const dataFound = await prisma.LineAllocationInchargeMaster.findUnique({
    where: { id: parseInt(id) },
  });

  if (!dataFound) return NoRecordFound("Line Master");

const data = await prisma.LineAllocationInchargeMaster.update({
  where: { id: parseInt(id) },
  data: {
    Employee: employeeCategoryId
      ? { connect: { id: parseInt(employeeCategoryId) } }
      : undefined,
    Branch: branchId
      ? { connect: { id: parseInt(branchId) } }
      : undefined,

    InchargeLineListMaster: {
      deleteMany: {}, 
    },
  },
});

if (selectedLineList.length > 0) {
  await prisma.lineAllocationInchargeMaster.update({
    where: { id: parseInt(id) },
    data: {
      InchargeLineListMaster: {
        createMany: {
          data: selectedLineList.map((temp) => ({
            lineMasterId: temp?.value ?? null,
          })),
        },
      },
    },
  });
}


  return { statusCode: 0, data };
}

async function remove(id) {
  const data = await prisma.lineAllocationInchargeMaster.delete({
    where: {
      id: parseInt(id),
    },
  });

  return { statusCode: 0, data };
}

export { get, getOne, getSearch, create, update, remove };
