import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Create Allocation
export const createAllocation = async (req, res) => {
  try {
    const { partyId, branchId, lineMasterId, deliveryDate, reference,allocationDate } = req.body;

    if (!partyId || !branchId || !lineMasterId || !deliveryDate || !reference) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    const allocation = await prisma.allocation.create({
      data: {
        partyId: parseInt(partyId),
        branchId: parseInt(branchId),
        lineMasterId: parseInt(lineMasterId),
        DeliveryDate: new Date(deliveryDate),
        allocationDate: new Date(allocationDate) ,
        reference,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Allocation created successfully',
      data: allocation,
    });
  } catch (error) {
    console.error('Error creating allocation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create allocation',
      error: error.message,
    });
  }
};

// Get All Allocations
export const get = async (req, res) => {
  try {
    const allocations = await prisma.allocation.findMany({
      include: {
        Party: true,
        Branch: true,
        LineMaster: true,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Allocations fetched successfully',
      data: allocations,
    });
  } catch (error) {
    console.error('Error fetching allocations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch allocations',
      error: error.message,
    });
  }
};

// Update Allocation
export const updateAllocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { partyId, branchId, lineMasterId, deliveryDate, reference } = req.body;
    console.log(reference,"reference")

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
      message: 'Allocation updated successfully',
      data: allocation,
    });
  } catch (error) {
    console.error('Error updating allocation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update allocation',
      error: error.message,
    });
  }
};

// Delete Allocation
export const deleteAllocation = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.allocation.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({
      success: true,
      message: 'Allocation deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting allocation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete allocation',
      error: error.message,
    });
  }
};
