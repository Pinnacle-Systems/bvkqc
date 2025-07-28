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

// Enhanced validation functions
const validateInspectionPayload = (payload) => {
  if (!payload) {
    throw new AqlInspectionError('Request body is required');
  }

  const requiredFields = ['companyId', 'reference', 'inspectionDate', 'samples'];
  const missingFields = requiredFields.filter(field => !payload[field]);
  
  if (missingFields.length > 0) {
    throw new AqlInspectionError(
      `Missing required fields: ${missingFields.join(', ')}`
    );
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
    throw new AqlInspectionError(
      `Measurement at index ${index} in sample ${sampleSize} is missing measurementId`
    );
  }

  if (measurement.standardValue === undefined || measurement.standardValue === null) {
    throw new AqlInspectionError(
      `Measurement ${measurement.measurementId} in sample ${sampleSize} is missing standardValue`
    );
  }

  if (!Array.isArray(measurement.values)) {
    throw new AqlInspectionError(
      `Measurement ${measurement.measurementId} in sample ${sampleSize} values must be an array`
    );
  }

  if (measurement.values.length === 0) {
    throw new AqlInspectionError(
      `Measurement ${measurement.measurementId} in sample ${sampleSize} must have at least one value`
    );
  }
};

const validateValue = (value, measurementId, index) => {
  if (value.actualValue === undefined || value.actualValue === null) {
    throw new AqlInspectionError(
      `Value at index ${index} for measurement ${measurementId} is missing actualValue`
    );
  }
};

export const createAqlInspection = async (req, res) => {
  try {
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
      const inspection = await tx.aqlInspection.create({
        data: {
          companyId: req.body.companyId,
          reference: req.body.reference,
          inspectionDate: new Date(req.body.inspectionDate),
        },
      });

      const samplePromises = req.body.samples.map(async (sample) => {
        const createdSample = await tx.sample.create({
          data: {
            aqlInspectionId: inspection.id,
            size: sample.size,
          },
        });

        const measurementPromises = sample.measurements.map(async (measurement) => {
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

          // 4. Create values in bulk
          const valueData = measurement.values.map((value) => ({
            sampleMeasurementId: createdMeasurement.id,
            pieceNumber: value.pieceNumber || 0, // Default to 0 if not provided
            actualValue: parseFloat(value.actualValue),
            status: value.status || 'within_tolerance',
          }));

          await tx.sampleValue.createMany({ data: valueData });

          return createdMeasurement;
        });

        await Promise.all(measurementPromises);
        return createdSample;
      });

      await Promise.all(samplePromises);

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

    const statusCode = error instanceof AqlInspectionError 
      ? error.statusCode 
      : 500;

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

function transformInspectionData(inspection) {
  if (!inspection) return null;

  return {
    id: inspection.id,
    companyId: inspection.companyId,
    reference: inspection.reference,
    inspectionDate: inspection.inspectionDate,
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
          pieceNumber: value.pieceNumber,
          actualValue: value.actualValue,
          status: value.status,
        })),
      })),
    })),
  };
}

export const aqlInspectionController = {
  createAqlInspection,
};