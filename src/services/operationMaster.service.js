import { PrismaClient } from "@prisma/client";
import { NoRecordFound } from "../configs/Responses.js";

const prisma = new PrismaClient();

async function get(req) {
  try {
    const data = await prisma.operation.findMany();
    return { statusCode: 0, data };
  } catch (error) {
    console.error("Error fetching operations:", error);
    return { statusCode: 1, message: "Failed to fetch operations" };
  }
}

async function getOne(id) {
  const childRecord = await prisma.state.count({
    where: { countryId: parseInt(id) },
  });
  const data = await prisma.country.findUnique({
    where: {
      id: parseInt(id),
    },
  });
  if (!data) return NoRecordFound("Country");
  return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

async function getSearch(req) {
  const { searchKey } = req.params;
  const { companyId, active } = req.query;
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
    },
  });
  return { statusCode: 0, data: data };
}

async function create(body) {
  try {
    console.log(body, "body");

    const operationsArray = Array.isArray(body.operations)
      ? body.operations
      : [];

    const operations = operationsArray.map((item) => ({
      name: item.data[0],
      reference: item.reference,
      active: true,
    }));

    const data = await prisma.operation.createMany({
      data: operations,
      skipDuplicates: true,
    });

    return { statusCode: 0, data };
  } catch (error) {
    console.error(error);
    return { statusCode: 1, message: "Error creating operations" };
  }
}

async function update(req) {
  console.log(req, "body");
  try {
    const dataFound = await prisma.operation.findUnique({
      where: {
        id: parseInt(id),
      },
    });

    if (!dataFound) {
      return { statusCode: 1, message: "Operation not found" };
    }

    // Prepare data to update from body
    const updateData = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.reference !== undefined) updateData.reference = body.reference;
    if (body.active !== undefined) updateData.active = body.active;

    const data = await prisma.operation.update({
      where: {
        id: parseInt(id),
      },
      data: updateData,
    });

    return { statusCode: 0, data };
  } catch (error) {
    console.error(error);
    return { statusCode: 1, message: "Error updating operation" };
  }
}


async function remove(operationId) {
  try {
    // Step 1: Find the operation to get its reference
    const operation = await prisma.operation.findUnique({
      where: { id: parseInt(operationId) },
    });

    if (!operation) {
      return { statusCode: 1, message: "Operation not found" };
    }

    // Step 2: Delete all operations with the same reference
    const deleted = await prisma.operation.deleteMany({
      where: { reference: operation.reference },
    });

    return { statusCode: 0, deleted };
  } catch (error) {
    console.error(error);
    return { statusCode: 2, message: "Error deleting operations", error };
  }
}


export { get, getOne, getSearch, create, update, remove };
