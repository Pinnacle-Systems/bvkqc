import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const create = async (req, res) => {
  try {
    const { productReference, measurements } = req.body;
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
      const newMeasurement = await prisma.measurement.create({
        data: {
          productId: product.id,
          description: measurement.description,
          toleranceMin: measurement.toleranceMin,
          toleranceMax: measurement.toleranceMax,
          dimension: measurement.dimension,
          values: {
            create: measurement.values.map(value => ({
              size: value.size,
              value: value.value
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
      message: `Size chart saved for ${productReference} with ${measurements.length} measurements`,
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
      error: error.message
    });
  }
};
export const get = async (req, res) => {
  try {
    const { productReference } = req.query;

    if (!productReference) {
      return res.status(400).json({
        success: false,
        message: 'Product reference is required'
      });
    }

    const product = await prisma.product.findUnique({
      where: { reference: productReference },
      include: {
        measurements: {
          include: {
            values: true
          }
        }
      }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product with reference ${productReference} not found`
      });
    }

    // Extract unique sizes using Set
    const allSizes = product.measurements.flatMap(m => 
      m.values.map(v => v.size)
    );
    const uniqueSizes = [...new Set(allSizes)];

    // Transform data for frontend
    const sizeChart = {
      product: {
        id: product.id,
        name: product.name,
        reference: product.reference,
        description: product.description
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
          value: v.value
        }))
      })),
      availableSizes: uniqueSizes
    };

    res.status(200).json({
      success: true,
      message: `Size chart retrieved for ${productReference}`,
      data: sizeChart
    });
  } catch (error) {
    console.error('Error retrieving size chart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve size chart',
      error: error.message
    });
  }
};