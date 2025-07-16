import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const createAllocation = async (req, res) => {
  try {
    const { partyId, branchId, lineMasterId, deliveryDate } = req.body;

    if (!partyId || !branchId || !lineMasterId || !deliveryDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const allocation = await prisma.allocation.create({
      data: {
        partyId: parseInt(partyId),
        branchId: parseInt(branchId),
        lineMasterId: parseInt(lineMasterId),
        DeliveryDate: new Date(deliveryDate), 
      }
    });

    res.status(201).json({
      success: true,
      message: 'Allocation created successfully',
      data: allocation
    });
  } catch (error) {
    console.error('Error creating allocation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create allocation',
      error: error.message
    });
  }
};
