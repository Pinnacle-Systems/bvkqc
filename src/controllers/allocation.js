import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const createAllocation = async (req, res) => {
  try {
    const { partyId, branchId, lineMasterIds, deliveryDate, reference, allocationDate } = req.body;
    console.log(req.body, "req.body");

    if (!partyId || !branchId || !lineMasterIds || lineMasterIds.length === 0 || !deliveryDate || !reference) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }
    const allocationsData = lineMasterIds.map((lineMasterId) => ({
      partyId: parseInt(partyId),
      branchId: parseInt(branchId),
      lineMasterId: parseInt(lineMasterId),
      DeliveryDate: new Date(deliveryDate),
      allocationDate: allocationDate ? new Date(allocationDate) : null,
      reference,
    }));

    const allocations = await prisma.allocation.createMany({
      data: allocationsData,
    });

    res.status(201).json({
      success: true,
      message: 'Allocations created successfully',
      count: allocations.count,
    });
  } catch (error) {
    console.error('Error creating allocations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create allocations',
      error: error.message,
    });
  }
};


export const get = async (req, res) => {
  try {
    const allocations = await prisma.allocation.findMany({
      include: {
        Party: true,
        Branch: true,
        LineMaster: {
          select:{
            lineName : true
          }
        },

      },
    });

    res.status(200).json({
      success: true,
      message: "Allocations fetched successfully",
      data: allocations,
    });
  } catch (error) {
    console.error("Error fetching allocations:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch allocations",
      error: error.message,
    });
  }
};

export const updateAllocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { partyId, branchId, lineMasterId, deliveryDate, reference } =
      req.body;
    console.log(reference, "reference");

    const allocation = await prisma.allocation.update({
      where: { id: parseInt(id) },
      data: {
        partyId: partyId ? parseInt(partyId) : undefined,
        branchId: branchId ? parseInt(branchId) : undefined,
        lineMasterId: lineMasterId ? parseInt(lineMasterId) : undefined,
        DeliveryDate: deliveryDate ? new Date(deliveryDate) : undefined,
        reference,
      },
    });

    res.status(200).json({
      success: true,
      message: "Allocation updated successfully",
      data: allocation,
    });
  } catch (error) {
    console.error("Error updating allocation:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update allocation",
      error: error.message,
    });
  }
};

export const deleteAllocation = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.allocation.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({
      success: true,
      message: "Allocation deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting allocation:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete allocation",
      error: error.message,
    });
  }
};
