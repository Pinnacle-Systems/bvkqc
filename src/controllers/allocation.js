export const createAllocation = async (req, res) => {
  try {
    const { partyId, branchId, lineMasterId, deliveryDate } = req.body;

    // Validate required fields
    if (!partyId || !branchId || !lineMasterId || !deliveryDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Create allocation in database
    const allocation = await prisma.allocation.create({
      data: {
        partyId: parseInt(partyId),
        branchId: parseInt(branchId),
        lineMasterId: parseInt(lineMasterId),
        deliveryDate: new Date(deliveryDate)
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