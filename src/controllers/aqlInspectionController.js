import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

class AqlInspectionError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = 'AqlInspectionError';
    this.statusCode = statusCode;
  }
}

const validateInspectionPayload = (payload) => {
  if (!payload) {
    throw new AqlInspectionError('Request body is required');
  }

  const requiredFields = ['companyId', 'reference', 'inspectionDate', 'samples', 'ayanCondition'];
  const missingFields = requiredFields.filter(field => !payload[field]);
  
  if (missingFields.length > 0) {
    throw new AqlInspectionError(`Missing required fields: ${missingFields.join(', ')}`);
  }

  if (!['BEFORE', 'AFTER'].includes(payload.ayanCondition)) {
    throw new AqlInspectionError('Ayan condition must be either BEFORE or AFTER');
  }

  if (!Array.isArray(payload.samples)) {
    throw new AqlInspectionError('Samples must be an array');
  }

  if (payload.samples.length === 0) {
    throw new AqlInspectionError('At least one sample is required');
  }
};

const validateSample = (sample, index) => {
  if (!sample.size) {
    throw new AqlInspectionError(`Sample at index ${index} is missing size`);
  }

  if (!Array.isArray(sample.measurements)) {
    throw new AqlInspectionError(`Sample ${sample.size} measurements must be an array`);
  }

  if (sample.measurements.length === 0) {
    throw new AqlInspectionError(`Sample ${sample.size} must have at least one measurement`);
  }
};

const validateMeasurement = (measurement, sampleSize, index) => {
  if (!measurement.measurementId) {
    throw new AqlInspectionError(`Measurement at index ${index} in sample ${sampleSize} is missing measurementId`);
  }

  if (measurement.standardValue === undefined || measurement.standardValue === null) {
    throw new AqlInspectionError(`Measurement ${measurement.measurementId} in sample ${sampleSize} is missing standardValue`);
  }

  if (!Array.isArray(measurement.values)) {
    throw new AqlInspectionError(`Measurement ${measurement.measurementId} in sample ${sampleSize} values must be an array`);
  }

  if (measurement.values.length === 0) {
    throw new AqlInspectionError(`Measurement ${measurement.measurementId} in sample ${sampleSize} must have at least one value`);
  }
};

const validateValue = (value, measurementId, index) => {
  if (value.actualValue === undefined || value.actualValue === null) {
    throw new AqlInspectionError(`Value at index ${index} for measurement ${measurementId} is missing actualValue`);
  }
};

const transformInspectionData = (inspection) => {
  if (!inspection) return null;

  return {
    id: inspection.id,
    companyId: inspection.companyId,
    reference: inspection.reference,
    inspectionDate: inspection.inspectionDate,
    ayanCondition: inspection.ayanCondition,
    createdAt: inspection.createdAt,
    updatedAt: inspection.updatedAt,
    samples: inspection.samples?.map((sample) => ({
      id: sample.id,
      size: sample.size,
      measurements: sample.measurements?.map((measurement) => ({
        id: measurement.id,
        measurementId: measurement.measurementId,
        measurementName: measurement.measurement?.description,
        standardValue: measurement.standardValue,
        toleranceMin: measurement.toleranceMin,
        toleranceMax: measurement.toleranceMax,
        unit: measurement.unit,
        values: measurement.values?.map((value) => ({
          id: value.id,
          pieceNumber: value.pieceNumber,
          actualValue: value.actualValue,
          status: value.status,
          createdAt: value.createdAt,
        })),
      })),
    })),
  };
};

export const createAqlInspection = async (req, res) => {
  try {
    validateInspectionPayload(req.body);
    const existingInspection = await prisma.aqlInspection.findUnique({
      where: {
        reference_ayanCondition: {
          reference: req.body.reference,
          ayanCondition: req.body.ayanCondition
        }
      }
    });

    if (existingInspection) {
      throw new AqlInspectionError(
        `An inspection with reference ${req.body.reference} and condition ${req.body.ayanCondition} already exists`,
        409
      );
    }

    req.body.samples.forEach((sample, sampleIndex) => {
      validateSample(sample, sampleIndex);
      sample.measurements.forEach((measurement, measurementIndex) => {
        validateMeasurement(measurement, sample.size, measurementIndex);
        measurement.values.forEach((value, valueIndex) => {
          validateValue(value, measurement.measurementId, valueIndex);
        });
      });
    });

    const result = await prisma.$transaction(async (tx) => {
      const inspection = await tx.aqlInspection.create({
        data: {
          companyId: req.body.companyId,
          reference: req.body.reference,
          inspectionDate: new Date(req.body.inspectionDate),
          ayanCondition: req.body.ayanCondition,
        },
      });

      await Promise.all(req.body.samples.map(async (sample) => {
        const createdSample = await tx.sample.create({
          data: {
            aqlInspectionId: inspection.id,
            size: sample.size,
          },
        });

        await Promise.all(sample.measurements.map(async (measurement) => {
          const createdMeasurement = await tx.sampleMeasurement.create({
            data: {
              sampleId: createdSample.id,
              measurementId: measurement.measurementId,
              standardValue: parseFloat(measurement.standardValue),
              toleranceMin: parseFloat(measurement.toleranceMin || '0'),
              toleranceMax: parseFloat(measurement.toleranceMax || '0'),
              unit: measurement.unit || '',
            },
          });

          await tx.sampleValue.createMany({
            data: measurement.values.map((value) => ({
              sampleMeasurementId: createdMeasurement.id,
              pieceNumber: value.pieceNumber || 0,
              actualValue: parseFloat(value.actualValue),
              status: value.status || 'within_tolerance',
            })),
          });
        }));
      }));

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
      data: transformInspectionData(result),
    });

  } catch (error) {
    console.error('AQL Inspection Error:', error);
    const statusCode = error instanceof AqlInspectionError ? error.statusCode : 500;
    const errorResponse = {
      success: false,
      error: error.message,
    };

    if (process.env.NODE_ENV === 'development') {
      errorResponse.stack = error.stack;
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        errorResponse.prismaError = error.meta;
      }
    }

    return res.status(statusCode).json(errorResponse);
  }
};

export const getAqlInspectionById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      throw new AqlInspectionError('Inspection ID is required', 400);
    }

    const inspectionId = parseInt(id, 10);
    if (isNaN(inspectionId)) {
      throw new AqlInspectionError('Invalid inspection ID format', 400);
    }

    const inspection = await prisma.aqlInspection.findUnique({
      where: { id: inspectionId },
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
      throw new AqlInspectionError(`No inspection found with ID ${id}`, 404);
    }

    return res.status(200).json({
      success: true,
      data: transformInspectionData(inspection),
    });

  } catch (error) {
    console.error('Get AQL Inspection by ID Error:', error);
    const statusCode = error instanceof AqlInspectionError ? error.statusCode : 500;
    const errorResponse = {
      success: false,
      error: error.message,
    };

    if (process.env.NODE_ENV === 'development') {
      errorResponse.stack = error.stack;
    }

    return res.status(statusCode).json(errorResponse);
  }
};

export const getAqlInspectionsByReference = async (req, res) => {
  try {
    const { reference } = req.params;

    if (!reference) {
      throw new AqlInspectionError('Reference is required', 400);
    }

    const inspections = await prisma.aqlInspection.findMany({
      where: { reference },
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
      orderBy: {
        ayanCondition: 'asc', 
      },
    });

    if (!inspections || inspections.length === 0) {
      throw new AqlInspectionError(`No inspections found for reference ${reference}`, 404);
    }

    const result = {
      reference,
      beforeAyaning: inspections.find(i => i.ayanCondition === 'BEFORE') 
        ? transformInspectionData(inspections.find(i => i.ayanCondition === 'BEFORE'))
        : null,
      afterAyaning: inspections.find(i => i.ayanCondition === 'AFTER') 
        ? transformInspectionData(inspections.find(i => i.ayanCondition === 'AFTER'))
        : null,
    };

    return res.status(200).json({
      success: true,
      data: result,
    });

  } catch (error) {
    console.error('Get AQL Inspections by Reference Error:', error);
    const statusCode = error instanceof AqlInspectionError ? error.statusCode : 500;
    const errorResponse = {
      success: false,
      error: error.message,
    };

    if (process.env.NODE_ENV === 'development') {
      errorResponse.stack = error.stack;
    }

    return res.status(statusCode).json(errorResponse);
  }
};

export const getAllReferences = async (req, res) => {
  try {
    const references = await prisma.aqlInspection.findMany({
      distinct: ['reference'],
      select: {
        reference: true,
      },
      orderBy: {
        reference: 'asc',
      },
    });

    return res.status(200).json({
      success: true,
      data: references.map(r => r.reference),
    });

  } catch (error) {
    console.error('Get All References Error:', error);
    const statusCode = error instanceof AqlInspectionError ? error.statusCode : 500;
    const errorResponse = {
      success: false,
      error: error.message,
    };

    if (process.env.NODE_ENV === 'development') {
      errorResponse.stack = error.stack;
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        errorResponse.prismaError = error.meta;
      }
    }

    return res.status(statusCode).json(errorResponse);
  }
};

export const updateAqlInspection = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      throw new AqlInspectionError('Inspection ID is required', 400);
    }

    validateInspectionPayload(req.body);

    req.body.samples.forEach((sample, sampleIndex) => {
      validateSample(sample, sampleIndex);
      sample.measurements.forEach((measurement, measurementIndex) => {
        validateMeasurement(measurement, sample.size, measurementIndex);
        measurement.values.forEach((value, valueIndex) => {
          validateValue(value, measurement.measurementId, valueIndex);
        });
      });
    });

    const result = await prisma.$transaction(async (tx) => {
      await tx.sampleValue.deleteMany({
        where: {
          measurement: {
            sample: {
              aqlInspectionId: parseInt(id)
            }
          }
        }
      });

      await tx.sampleMeasurement.deleteMany({
        where: {
          sample: {
            aqlInspectionId: parseInt(id)
          }
        }
      });

      await tx.sample.deleteMany({
        where: {
          aqlInspectionId: parseInt(id)
        }
      });

      const updatedInspection = await tx.aqlInspection.update({
        where: { id: parseInt(id) },
        data: {
          reference: req.body.reference,
          inspectionDate: new Date(req.body.inspectionDate),
          ayanCondition: req.body.ayanCondition,
          updatedAt: new Date(),
        },
      });
      await Promise.all(req.body.samples.map(async (sample) => {
        const createdSample = await tx.sample.create({
          data: {
            aqlInspectionId: updatedInspection.id,
            size: sample.size,
          },
        });

        await Promise.all(sample.measurements.map(async (measurement) => {
          const createdMeasurement = await tx.sampleMeasurement.create({
            data: {
              sampleId: createdSample.id,
              measurementId: measurement.measurementId,
              standardValue: parseFloat(measurement.standardValue),
              toleranceMin: parseFloat(measurement.toleranceMin || '0'),
              toleranceMax: parseFloat(measurement.toleranceMax || '0'),
              unit: measurement.unit || '',
            },
          });

          await tx.sampleValue.createMany({
            data: measurement.values.map((value) => ({
              sampleMeasurementId: createdMeasurement.id,
              pieceNumber: value.pieceNumber || 0,
              actualValue: parseFloat(value.actualValue),
              status: value.status || 'within_tolerance',
            })),
          });
        }));
      }));
      return tx.aqlInspection.findUnique({
        where: { id: updatedInspection.id },
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

    return res.status(200).json({
      success: true,
      data: transformInspectionData(result),
    });

  } catch (error) {
    console.error('Update AQL Inspection Error:', error);
    const statusCode = error instanceof AqlInspectionError ? error.statusCode : 500;
    const errorResponse = {
      success: false,
      error: error.message,
    };

    if (process.env.NODE_ENV === 'development') {
      errorResponse.stack = error.stack;
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        errorResponse.prismaError = error.meta;
      }
    }

    return res.status(statusCode).json(errorResponse);
  }
};

export const deleteAqlInspection = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      throw new AqlInspectionError('Inspection ID is required', 400);
    }

    const inspectionId = parseInt(id, 10);
    if (isNaN(inspectionId)) {
      throw new AqlInspectionError('Invalid inspection ID format', 400);
    }

    const inspection = await prisma.aqlInspection.findUnique({
      where: { id: inspectionId },
    });

    if (!inspection) {
      throw new AqlInspectionError(`Inspection with ID ${id} not found`, 404);
    }
    await prisma.aqlInspection.delete({
      where: { id: inspectionId },
    });

    return res.status(200).json({
      success: true,
      message: `AQL Inspection with ID ${id} deleted successfully`,
    });

  } catch (error) {
    console.error('Delete AQL Inspection Error:', error);
    const statusCode = error instanceof AqlInspectionError ? error.statusCode : 500;
    const errorResponse = {
      success: false,
      error: error.message,
    };

    if (process.env.NODE_ENV === 'development') {
      errorResponse.stack = error.stack;
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        errorResponse.prismaError = error.meta;
      }
    }

    return res.status(statusCode).json(errorResponse);
  }
};

export const aqlInspectionController = {
  createAqlInspection,
  getAqlInspectionById,
  getAqlInspectionsByReference,
  getAllReferences,
  updateAqlInspection,
  deleteAqlInspection,
};