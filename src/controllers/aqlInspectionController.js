import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

class AqlInspectionError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = "AqlInspectionError";
    this.statusCode = statusCode;
  }
}

// Validation functions
const validateInspectionPayload = (payload) => {
  if (!payload) {
    throw new AqlInspectionError("Request body is required");
  }

  const requiredFields = ["companyId", "reference", "inspectionDate"];
  const missingFields = requiredFields.filter((field) => !payload[field]);

  if (missingFields.length > 0) {
    throw new AqlInspectionError(
      `Missing required fields: ${missingFields.join(", ")}`
    );
  }

  if (!payload.before && !payload.after) {
    throw new AqlInspectionError(
      "At least one of 'before' or 'after' samples is required"
    );
  }

  if (payload.before && !Array.isArray(payload.before)) {
    throw new AqlInspectionError("Before samples must be an array");
  }

  if (payload.after && !Array.isArray(payload.after)) {
    throw new AqlInspectionError("After samples must be an array");
  }
};

const validateSample = (sample, index, condition) => {
  if (!sample.size) {
    throw new AqlInspectionError(
      `Sample at index ${index} (${condition}) is missing size`
    );
  }

  if (!Array.isArray(sample.measurements)) {
    throw new AqlInspectionError(
      `Sample ${sample.size} (${condition}) measurements must be an array`
    );
  }

  if (sample.measurements.length === 0) {
    throw new AqlInspectionError(
      `Sample ${sample.size} (${condition}) must have at least one measurement`
    );
  }
};

const validateMeasurement = (measurement, size, index, condition) => {
  if (!measurement.measurementId) {
    throw new AqlInspectionError(
      `Measurement at index ${index} in sample ${size} (${condition}) is missing measurementId`
    );
  }

  if (measurement.standardValue === undefined || measurement.standardValue === null) {
    throw new AqlInspectionError(
      `Measurement ${measurement.measurementId} in sample ${size} (${condition}) is missing standardValue`
    );
  }

  if (!Array.isArray(measurement.values)) {
    throw new AqlInspectionError(
      `Measurement ${measurement.measurementId} in sample ${size} (${condition}) values must be an array`
    );
  }

  if (measurement.values.length === 0) {
    throw new AqlInspectionError(
      `Measurement ${measurement.measurementId} in sample ${size} (${condition}) must have at least one value`
    );
  }
};

const validateValue = (value, measurementId, index, condition) => {
  if (value.actualValue === undefined || value.actualValue === null) {
    throw new AqlInspectionError(
      `Value at index ${index} for measurement ${measurementId} (${condition}) is missing actualValue`
    );
  }
};

// Transformation functions
const transformInspectionData = (inspection) => {
  if (!inspection) return null;

  return {
    id: inspection.id,
    companyId: inspection.companyId,
    reference: inspection.reference,
    inspectionDate: inspection.inspectionDate,
    createdAt: inspection.createdAt,
    updatedAt: inspection.updatedAt,
    before: inspection.beforeSamples?.map(transformSample),
    after: inspection.afterSamples?.map(transformSample),
  };
};

const transformSample = (sample) => ({
  id: sample.id,
  size: sample.size,
  condition: sample.condition,
  measurements: sample.measurements?.map(transformMeasurement),
});

const transformMeasurement = (measurement) => ({
  id: measurement.id,
  measurementId: measurement.measurementId,
  measurementName: measurement.measurement?.description,
  standardValue: measurement.standardValue,
  toleranceMin: measurement.toleranceMin,
  toleranceMax: measurement.toleranceMax,
  unit: measurement.unit,
  values: measurement.values?.map(transformValue),
});

const transformValue = (value) => ({
  id: value.id,
  pieceNumber: value.pieceNumber,
  actualValue: value.actualValue,
  status: value.status,
  createdAt: value.createdAt,
});

// Helper function to process samples
const processSamples = async (tx, samples, condition, inspectionId) => {
  for (const sample of samples) {
    await tx.sample.create({
      data: {
        size: sample.size,
        condition,
        [condition === "BEFORE" ? "beforeAqlInspectionId" : "afterAqlInspectionId"]: inspectionId,
        measurements: {
          create: sample.measurements.map((measurement) => ({
            measurementId: measurement.measurementId,
            standardValue: parseFloat(measurement.standardValue),
            toleranceMin: parseFloat(measurement.toleranceMin || "0"),
            toleranceMax: parseFloat(measurement.toleranceMax || "0"),
            unit: measurement.unit || "",
            values: {
              create: measurement.values.map((value) => ({
                pieceNumber: value.pieceNumber || 0,
                actualValue: parseFloat(value.actualValue),
                status: value.status || "within_tolerance",
              })),
            },
          })),
        },
      },
    });
  }
};

// Controller functions
export const createAqlInspection = async (req, res) => {
  try {
    validateInspectionPayload(req.body);

    // Validate samples
    if (req.body.before) {
      req.body.before.forEach((sample, index) =>
        validateSample(sample, index, "BEFORE")
      );
    }
    if (req.body.after) {
      req.body.after.forEach((sample, index) =>
        validateSample(sample, index, "AFTER")
      );
    }

    // Create new inspection (allowing duplicate references)
    const inspection = await prisma.aqlInspection.create({
      data: {
        companyId: req.body.companyId,
        reference: req.body.reference,
        inspectionDate: new Date(req.body.inspectionDate),
        lineMasterId : req.body.lineMasterId,
        employeeId : req.body.userId
      },
    });

    // Process samples in transaction
    const result = await prisma.$transaction(async (tx) => {
      if (req.body.before) {
        await processSamples(tx, req.body.before, "BEFORE", inspection.id);
      }
      if (req.body.after) {
        await processSamples(tx, req.body.after, "AFTER", inspection.id);
      }

      return tx.aqlInspection.findUnique({
        where: { id: inspection.id },
        include: {
          beforeSamples: {
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
          afterSamples: {
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
    console.error("Error creating AQL inspection:", error);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      error: error.message,
      ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
    });
  }
};


export const getAqlInspectionById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      throw new AqlInspectionError("Inspection ID is required", 400);
    }

    const inspection = await prisma.aqlInspection.findUnique({
      where: { id: parseInt(id) },
      include: {
        beforeSamples: {
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
        afterSamples: {
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
      throw new AqlInspectionError(
        `No inspection found with ID ${id}`,
        404
      );
    }

    return res.status(200).json({
      success: true,
      data: transformInspectionData(inspection),
    });
  } catch (error) {
    console.error("Get AQL Inspection Error:", error);
    const statusCode =
      error instanceof AqlInspectionError ? error.statusCode : 500;
    const errorResponse = {
      success: false,
      error: error.message,
    };

    if (process.env.NODE_ENV === "development") {
      errorResponse.stack = error.stack;
    }

    return res.status(statusCode).json(errorResponse);
  }
};

export const getAqlInspectionsByReference = async (req, res) => {
  try {
    const { reference } = req.params;

    if (!reference) {
      throw new AqlInspectionError("Reference is required", 400);
    }

    const inspection = await prisma.aqlInspection.findFirst({
      where: { reference },
      include: {
        beforeSamples: {
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
        afterSamples: {
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
      throw new AqlInspectionError(
        `No inspection found for reference ${reference}`,
        404
      );
    }

    return res.status(200).json({
      success: true,
      data: transformInspectionData(inspection),
    });
  } catch (error) {
    console.error("Get AQL Inspections by Reference Error:", error);
    const statusCode =
      error instanceof AqlInspectionError ? error.statusCode : 500;
    const errorResponse = {
      success: false,
      error: error.message,
    };

    if (process.env.NODE_ENV === "development") {
      errorResponse.stack = error.stack;
    }

    return res.status(statusCode).json(errorResponse);
  }
};

export const getAllReferences = async (req, res) => {
  try {
    const references = await prisma.aqlInspection.findMany({
      select: {
        id: true,
        reference: true,
        inspectionDate: true,
        createdAt: true,
        updatedAt: true,
        beforeSamples: {
          select: {
            condition: true,
          },
          take: 1,
        },
        afterSamples: {
          select: {
            condition: true,
          },
          take: 1,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const formattedReferences = references.map(ref => ({
      id: ref.id,
      reference: ref.reference,
      inspectionDate: ref.inspectionDate,
      createdAt: ref.createdAt,
      updatedAt: ref.updatedAt,
      hasBefore: ref.beforeSamples.length > 0,
      hasAfter: ref.afterSamples.length > 0,
    }));

    return res.status(200).json({
      success: true,
      data: formattedReferences,
    });
  } catch (error) {
    console.error("Get All References Error:", error);
    const statusCode =
      error instanceof AqlInspectionError ? error.statusCode : 500;
    const errorResponse = {
      success: false,
      error: error.message,
    };

    if (process.env.NODE_ENV === "development") {
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
      throw new AqlInspectionError("Inspection ID is required", 400);
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
      // First delete all related data for the condition we're updating
      const condition = req.body.ayanCondition.toUpperCase();
      const relationField = condition === "BEFORE" ? "beforeSamples" : "afterSamples";

      await tx.sampleValue.deleteMany({
        where: {
          measurement: {
            sample: {
              [condition === "BEFORE" ? "beforeAqlInspectionId" : "afterAqlInspectionId"]: parseInt(id),
            },
          },
        },
      });

      await tx.sampleMeasurement.deleteMany({
        where: {
          sample: {
            [condition === "BEFORE" ? "beforeAqlInspectionId" : "afterAqlInspectionId"]: parseInt(id),
          },
        },
      });

      await tx.sample.deleteMany({
        where: {
          [condition === "BEFORE" ? "beforeAqlInspectionId" : "afterAqlInspectionId"]: parseInt(id),
        },
      });

      // Update the inspection details
      const updatedInspection = await tx.aqlInspection.update({
        where: { id: parseInt(id) },
        data: {
          reference: req.body.reference,
          inspectionDate: new Date(req.body.inspectionDate),
          updatedAt: new Date(),
        },
      });

      // Create new samples for the condition
      const sampleData = {
        size: req.body.samples[0].size,
        condition,
        [condition === "BEFORE" ? "beforeAqlInspectionId" : "afterAqlInspectionId"]: updatedInspection.id,
        measurements: {
          create: req.body.samples.flatMap(sample => 
            sample.measurements.map(measurement => ({
              measurementId: measurement.measurementId,
              standardValue: parseFloat(measurement.standardValue),
              toleranceMin: parseFloat(measurement.toleranceMin || "0"),
              toleranceMax: parseFloat(measurement.toleranceMax || "0"),
              unit: measurement.unit || "",
              values: {
                create: measurement.values.map(value => ({
                  pieceNumber: value.pieceNumber || 0,
                  actualValue: parseFloat(value.actualValue),
                  status: value.status || "within_tolerance",
                })),
              },
            }))
          ),
        },
      };

      await tx.sample.create({
        data: sampleData,
      });

      return tx.aqlInspection.findUnique({
        where: { id: updatedInspection.id },
        include: {
          beforeSamples: {
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
          afterSamples: {
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
    console.error("Update AQL Inspection Error:", error);
    const statusCode =
      error instanceof AqlInspectionError ? error.statusCode : 500;
    const errorResponse = {
      success: false,
      error: error.message,
    };

    if (process.env.NODE_ENV === "development") {
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
      throw new AqlInspectionError("Inspection ID is required", 400);
    }

    const inspectionId = parseInt(id, 10);
    if (isNaN(inspectionId)) {
      throw new AqlInspectionError("Invalid inspection ID format", 400);
    }

    const inspection = await prisma.aqlInspection.findUnique({
      where: { id: inspectionId },
    });

    if (!inspection) {
      throw new AqlInspectionError(`Inspection with ID ${id} not found`, 404);
    }

    await prisma.$transaction(async (tx) => {
      // Delete all related data
      await tx.sampleValue.deleteMany({
        where: {
          measurement: {
            sample: {
              OR: [
                { beforeAqlInspectionId: inspectionId },
                { afterAqlInspectionId: inspectionId },
              ],
            },
          },
        },
      });

      await tx.sampleMeasurement.deleteMany({
        where: {
          sample: {
            OR: [
              { beforeAqlInspectionId: inspectionId },
              { afterAqlInspectionId: inspectionId },
            ],
          },
        },
      });

      await tx.sample.deleteMany({
        where: {
          OR: [
            { beforeAqlInspectionId: inspectionId },
            { afterAqlInspectionId: inspectionId },
          ],
        },
      });

      await tx.aqlInspection.delete({
        where: { id: inspectionId },
      });
    });

    return res.status(200).json({
      success: true,
      message: `AQL Inspection with ID ${id} deleted successfully`,
    });
  } catch (error) {
    console.error("Delete AQL Inspection Error:", error);
    const statusCode =
      error instanceof AqlInspectionError ? error.statusCode : 500;
    const errorResponse = {
      success: false,
      error: error.message,
    };

    if (process.env.NODE_ENV === "development") {
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