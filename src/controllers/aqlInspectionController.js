import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

class AqlInspectionError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = 'AqlInspectionError';
    this.statusCode = statusCode;
  }
}

// Utility functions
const validateRequiredFields = (data, fields) => {
  const missingFields = fields.filter(field => !data[field]);
  if (missingFields.length > 0) {
    throw new AqlInspectionError(`Missing required fields: ${missingFields.join(', ')}`);
  }
};

const validateSamples = (samples) => {
  if (!Array.isArray(samples) || samples.length === 0) {
    throw new AqlInspectionError('Samples must be a non-empty array');
  }

  samples.forEach((sample, index) => {
    if (!sample.size) {
      throw new AqlInspectionError(`Sample at index ${index} is missing size`);
    }
    if (!Array.isArray(sample.measurements) || sample.measurements.length === 0) {
      throw new AqlInspectionError(`Sample ${sample.size} has no measurements`);
    }
  });
};

const validateMeasurements = (measurements, size) => {
  measurements.forEach((measurement, index) => {
    if (!measurement.measurementId) {
      throw new AqlInspectionError(`Measurement at index ${index} in size ${size} is missing measurementId`);
    }
    if (measurement.standardValue === undefined || measurement.standardValue === null) {
      throw new AqlInspectionError(`Measurement ${measurement.measurementId} in size ${size} is missing standardValue`);
    }
    if (!Array.isArray(measurement.values) || measurement.values.length === 0) {
      throw new AqlInspectionError(`Measurement ${measurement.measurementId} in size ${size} has no values`);
    }
  });
};

// Main controller functions
export const createAqlInspection = async (req, res) => {
  try {
    const { companyId, reference, inspectionDate, samples } = req.body;

    // Validate top-level fields
    validateRequiredFields(req.body, ['companyId', 'reference', 'inspectionDate', 'samples']);
    
    // Validate samples structure
    validateSamples(samples);
    
    // Validate each sample's measurements
    samples.forEach(sample => {
      validateMeasurements(sample.measurements, sample.size);
    });

    // Create inspection with all nested data
    const inspection = await prisma.$transaction(async (tx) => {
      // 1. Create main inspection record
      const inspection = await tx.aqlInspection.create({
        data: {
          companyId,
          reference,
          inspectionDate: new Date(inspectionDate),
        },
      });

      // 2. Process samples in parallel
      await Promise.all(samples.map(async (sample) => {
        const createdSample = await tx.sample.create({
          data: {
            aqlInspectionId: inspection.id,
            size: sample.size,
          },
        });

        // 3. Process measurements in parallel
        await Promise.all(sample.measurements.map(async (measurement) => {
          const createdMeasurement = await tx.sampleMeasurement.create({
            data: {
              sampleId: createdSample.id,
              measurementId: measurement.measurementId,
              standardValue: measurement.standardValue,
              toleranceMin: measurement.toleranceMin || '0',
              toleranceMax: measurement.toleranceMax || '0',
              unit: measurement.unit || '',
            },
          });

          // 4. Create values in bulk
          if (measurement.values && measurement.values.length > 0) {
            await tx.sampleValue.createMany({
              data: measurement.values.map((value, index) => ({
                sampleMeasurementId: createdMeasurement.id,
                pieceNumber: value.pieceNumber || index + 1,
                actualValue: value.actualValue,
              })),
            });
          }
        }));
      }));

      // Return the complete inspection with relations
      return tx.aqlInspection.findUnique({
        where: { id: inspection.id },
        include: {
          samples: {
            include: {
              measurements: {
                include: {
                  values: true,
                  measurement: {
                    select: {
                      id: true,
                      description: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
    });

    return res.status(201).json({
      success: true,
      data: transformInspectionData(inspection),
    });

  } catch (error) {
    console.error('AQL Inspection Error:', error);
    
    const statusCode = error.statusCode || 500;
    const message = error instanceof AqlInspectionError 
      ? error.message 
      : 'Failed to create AQL inspection';

    return res.status(statusCode).json({
      success: false,
      error: message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    });
  }
};

export const getAqlInspectionById = async (req, res) => {
  try {
    const { id } = req.params;
    validateRequiredFields({ id }, ['id']);

    const inspection = await prisma.aqlInspection.findUnique({
      where: { id },
      include: {
        samples: {
          include: {
            measurements: {
              include: {
                values: true,
                measurement: {
                  select: {
                    id: true,
                    description: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!inspection) {
      throw new AqlInspectionError('AQL inspection not found', 404);
    }

    return res.status(200).json({
      success: true,
      data: transformInspectionData(inspection),
    });

  } catch (error) {
    console.error('Error fetching AQL inspection:', error);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      error: error.message,
    });
  }
};

// Utility function to transform inspection data
function transformInspectionData(inspection) {
  if (!inspection) return null;

  return {
    id: inspection.id,
    companyId: inspection.companyId,
    reference: inspection.reference,
    inspectionDate: inspection.inspectionDate,
    createdAt: inspection.createdAt,
    updatedAt: inspection.updatedAt,
    samples: inspection.samples?.map(sample => ({
      id: sample.id,
      size: sample.size,
      measurements: sample.measurements?.map(measurement => ({
        id: measurement.id,
        measurementId: measurement.measurementId,
        measurementName: measurement.measurement?.description,
        standardValue: measurement.standardValue,
        toleranceMin: measurement.toleranceMin,
        toleranceMax: measurement.toleranceMax,
        unit: measurement.unit,
        values: measurement.values?.map(value => ({
          pieceNumber: value.pieceNumber,
          actualValue: value.actualValue,
        })),
      })),
    })),
  };
}