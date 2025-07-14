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

    const { productReference, measurements } = req.body;
    
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