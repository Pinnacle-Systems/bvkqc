import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const create = async (req, res) => {
  try {
    // Check if body exists
    if (!req.body) {
      return res.status(400).json({
        success: false,
        message: 'Request body is missing'
      });
    }

    const { productReference, measurements,selectedPartyId } = req.body;
    
    // Validate required fields
    if (!productReference || !measurements) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: productReference or measurements'
      });
    }

    let product = await prisma.product.findUnique({
      where: { reference: productReference }
    });

    if (!product) {
      product = await prisma.product.create({
        data: {
          name: productReference,
          reference: productReference,
           partyId: parseInt(selectedPartyId),
          description: 'Created from PDF upload'
        }
      });
    }

    // Create new measurements
    const createdMeasurements = [];
    for (const measurement of measurements) {
      // Add validation for measurement structure
      if (!measurement.description || !measurement.values) {
        console.warn('Skipping invalid measurement:', measurement);
        continue;
      }

      const newMeasurement = await prisma.measurement.create({
        data: {
          productId: product.id,
          description: measurement.description,
          toleranceMin: measurement.toleranceMin || '',
          toleranceMax: measurement.toleranceMax || '',
          dimension: measurement.dimension || '',
          values: {
            create: measurement.values.map(value => ({
              size: value.size || '',
              value: value.value || ''
            }))
          }
        },
        include: {
          values: true
        }
      });
      createdMeasurements.push(newMeasurement);
    }

    res.status(201).json({
      success: true,
      message: `Size chart saved for ${productReference} with ${createdMeasurements.length} measurements`,
      data: {
        product,
        measurements: createdMeasurements
      }
    });
  } catch (error) {
    console.error('Error saving size chart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save size chart',
      error: error.message,
      requestBody: req.body // Include for debugging
    });
  }
};
export const get = async (req, res) => {
  try {
    const { productReference } = req.query;

    if (!productReference) {
      return res.status(400).json({
        success: false,
        message: 'Product reference is required',
      });
    }

    const product = await prisma.product.findUnique({
      where: { reference: productReference },
      include: {
        measurements: {
          include: {
            values: true,
          },
        },
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product with reference "${productReference}" not found`,
      });
    }

    const allSizes = product.measurements.flatMap(m =>
      m.values.map(v => v.size)
    );
    const uniqueSizes = Array.from(new Set(allSizes));

    const measurementIds = product.measurements.map(m => m.id);

    const allValues = await prisma.measurementValue.findMany({
      where: {
        measurementId: {
          in: measurementIds,
        },
      },
      select: {
        id: true,
        measurementId: true,
        size: true,
        value: true,
        createdAt: true,
      },
    });

    const sizeChart = {
      product: {
        id: product.id,
        name: product.name,
        reference: product.reference,
        description: product.description,
      },
      measurements: product.measurements.map(m => ({
        id: m.id,
        description: m.description,
        toleranceMin: m.toleranceMin,
        toleranceMax: m.toleranceMax,
        dimension: m.dimension,
        values: m.values.map(v => ({
          id: v.id,
          size: v.size,
          value: v.value,
        })),
      })),
      availableSizes: uniqueSizes,
      allValues,
    };

    return res.status(200).json({
      success: true,
      message: `Size chart retrieved for "${productReference}"`,
      data: sizeChart,
    });
  } catch (error) {
    console.error('Error retrieving size chart:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve size chart',
      error: error.message,
    });
  }
};
export const getReference = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        reference: true,
        partyId: true,
        Party: {
          select: {
            name: true,
          },
        },
        measurements: {
          select: {
            values: {
              select: {
                size: true,
                id : true
              },
            },
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error('Error retrieving references:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve product references',
      error: error.message,
    });
  }
};





