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

const validateInspectionPayload = (payload) => {
  if (!payload) {
    throw new AqlInspectionError("Request body is required");
  }

  const requiredFields = ["companyId", "reference", "inspectionDate", "lineMasterId"];
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

  // Validate operationId (required field)
  if (!measurement.operationId) {
    throw new AqlInspectionError(
      `Measurement ${measurement.measurementId} in sample ${size} (${condition}) is missing operationId`
    );
  }

  // Validate spi (required field)
  if (!measurement.spi) {
    throw new AqlInspectionError(
      `Measurement ${measurement.measurementId} in sample ${size} (${condition}) is missing spi`
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

const transformInspectionData = (inspection) => {
  if (!inspection) return null;

  return {
    id: inspection.id,
    companyId: inspection.companyId,
    reference: inspection.reference,
    inspectionDate: inspection.inspectionDate,
    lineMasterId: inspection.lineMasterId,
    color: inspection.color,
    shift: inspection.shift,
    userId: inspection.userId,
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
  machineNo: measurement.mcNo,
  operation: measurement.operation?.name,
  operationId: measurement.operationId,
  spi: measurement.spi,
  defect: measurement.defect?.name,
  defectId: measurement.defectId,
  correctiveAction: measurement.defectCorrection?.name,
  defectCorrectionId: measurement.defectCorrectionId,
  values: measurement.values?.map(transformValue),
});

const transformValue = (value) => ({
  id: value.id,
  pieceNumber: value.pieceNumber,
  actualValue: value.actualValue,
  status: value.status,
  createdAt: value.createdAt,
});

const processSamples = async (tx, samples, condition, inspectionId) => {
  for (const sample of samples) {
    // Create sample
    const createdSample = await tx.sSample.create({
      data: {
        size: sample.size,
        condition: condition.toUpperCase(),
        [condition.toUpperCase() === "BEFORE" ? "beforeAqlInspectionId" : "afterAqlInspectionId"]: inspectionId,
      },
    });

    // Create measurements for this sample
    for (const measurement of sample.measurements) {
      const createdMeasurement = await tx.sSampleMeasurement.create({
        data: {
          sampleId: createdSample.id,
          measurementId: measurement.measurementId,
          operationId: measurement.operationId,
          standardValue: parseFloat(measurement.standardValue),
          toleranceMin: parseFloat(measurement.toleranceMin || "0"),
          toleranceMax: parseFloat(measurement.toleranceMax || "0"),
          unit: measurement.unit || "",
          mcNo: measurement.machineNo || "",
          spi: measurement.spi || "",
          defectId: measurement.defectId ? parseInt(measurement.defectId) : null,
          defectCorrectionId: measurement.correctiveActionId ? parseInt(measurement.correctiveActionId) : null,
        },
      });

      // Create values for this measurement
      await tx.sSampleValue.createMany({
        data: measurement.values.map((value, index) => ({
          sampleMeasurementId: createdMeasurement.id,
          pieceNumber: value.pieceNumber || index + 1,
          actualValue: parseFloat(value.actualValue),
          status: value.status || "within_tolerance",
        })),
      });
    }
  }
};

export const createAqlInspection = async (req, res) => {
  try {
    validateInspectionPayload(req.body);

    // Validate samples and measurements
    if (req.body.before) {
      req.body.before.forEach((sample, index) => {
        validateSample(sample, index, "BEFORE");
        sample.measurements.forEach((measurement, mIndex) => {
          validateMeasurement(measurement, sample.size, mIndex, "BEFORE");
          measurement.values.forEach((value, vIndex) => {
            validateValue(value, measurement.measurementId, vIndex, "BEFORE");
          });
        });
      });
    }

    if (req.body.after) {
      req.body.after.forEach((sample, index) => {
        validateSample(sample, index, "AFTER");
        sample.measurements.forEach((measurement, mIndex) => {
          validateMeasurement(measurement, sample.size, mIndex, "AFTER");
          measurement.values.forEach((value, vIndex) => {
            validateValue(value, measurement.measurementId, vIndex, "AFTER");
          });
        });
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      // Create main inspection record
      const inspection = await tx.sAqlInspection.create({
        data: {
          companyId: String(req.body.companyId),
          reference: req.body.reference,
          inspectionDate: new Date(req.body.inspectionDate),
          lineMasterId: parseInt(req.body.lineMasterId),
          color: req.body.color || "",
          shift: req.body.shift || "",
          userId: req.body.userId || null,
          employeeId: req.body.employeeId || null,
        },
      });

      // Process before samples
      if (req.body.before && req.body.before.length > 0) {
        await processSamples(tx, req.body.before, "BEFORE", inspection.id);
      }

      // Process after samples
      if (req.body.after && req.body.after.length > 0) {
        await processSamples(tx, req.body.after, "AFTER", inspection.id);
      }

      // Return the complete inspection with all relations
      return tx.sAqlInspection.findUnique({
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
                  operation: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                  defect: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                  defectCorrection: {
                    select: {
                      id: true,
                      name: true,
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
                  operation: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                  defect: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                  defectCorrection: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
          LineMaster: {
            select: {
              id: true,
              lineName: true,
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
    console.error("Create AQL Inspection Error:", error);
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

    const inspection = await prisma.sAqlInspection.findUnique({
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
                operation: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
                defect: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
                defectCorrection: {
                  select: {
                    id: true,
                    name: true,
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
                operation: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
                defect: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
                defectCorrection: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        LineMaster: {
          select: {
            id: true,
            lineName: true,
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

export const getAqlInspections = async (req, res) => {
  try {
    const inspections = await prisma.sAqlInspection.findMany({
      include: {
        beforeSamples: {
          select: {
            condition: true,
            size: true,
          },
          take: 1,
        },
        afterSamples: {
          select: {
            condition: true,
            size: true,
          },
          take: 1,
        },
        LineMaster: {
          select: {
            id: true,
            lineName: true,
            lineNo: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const formattedInspections = inspections.map(inspection => ({
      id: inspection.id,
      reference: inspection.reference,
      inspectionDate: inspection.inspectionDate,
      color: inspection.color,
      shift: inspection.shift,
      approveStatus: inspection.approveStatus,
      createdAt: inspection.createdAt,
      updatedAt: inspection.updatedAt,
      hasBefore: inspection.beforeSamples.length > 0,
      hasAfter: inspection.afterSamples.length > 0,
      beforeSize: inspection.beforeSamples[0]?.size || null,
      afterSize: inspection.afterSamples[0]?.size || null,
      lineDetails: inspection.LineMaster ? {
        id: inspection.LineMaster.id,
        name: inspection.LineMaster.lineName,
        lineNo: inspection.LineMaster.lineNo,
      } : null
    }));

    return res.status(200).json({
      success: true,
      data: formattedInspections,
    });
  } catch (error) {
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

export const updateAqlInspection = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      throw new AqlInspectionError("Inspection ID is required", 400);
    }

    validateInspectionPayload(req.body);

    const result = await prisma.$transaction(async (tx) => {
      // Update main inspection record
      const updatedInspection = await tx.sAqlInspection.update({
        where: { id: parseInt(id) },
        data: {
          reference: req.body.reference,
          inspectionDate: new Date(req.body.inspectionDate),
          lineMasterId: parseInt(req.body.lineMasterId),
          color: req.body.color,
          shift: req.body.shift,
          updatedAt: new Date(),
        },
      });

      // Delete existing samples and measurements
      await tx.sSampleValue.deleteMany({
        where: {
          measurement: {
            sample: {
              OR: [
                { beforeAqlInspectionId: parseInt(id) },
                { afterAqlInspectionId: parseInt(id) },
              ],
            },
          },
        },
      });

      await tx.sSampleMeasurement.deleteMany({
        where: {
          sample: {
            OR: [
              { beforeAqlInspectionId: parseInt(id) },
              { afterAqlInspectionId: parseInt(id) },
            ],
          },
        },
      });

      await tx.sSample.deleteMany({
        where: {
          OR: [
            { beforeAqlInspectionId: parseInt(id) },
            { afterAqlInspectionId: parseInt(id) },
          ],
        },
      });

      // Process new samples
      if (req.body.before && req.body.before.length > 0) {
        await processSamples(tx, req.body.before, "BEFORE", parseInt(id));
      }

      if (req.body.after && req.body.after.length > 0) {
        await processSamples(tx, req.body.after, "AFTER", parseInt(id));
      }

      // Return updated inspection
      return tx.sAqlInspection.findUnique({
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
                  operation: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                  defect: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                  defectCorrection: {
                    select: {
                      id: true,
                      name: true,
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
                  operation: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                  defect: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                  defectCorrection: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
          LineMaster: {
            select: {
              id: true,
              lineName: true,
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

    const inspection = await prisma.sAqlInspection.findUnique({
      where: { id: inspectionId },
    });

    if (!inspection) {
      throw new AqlInspectionError(`Inspection with ID ${id} not found`, 404);
    }

    await prisma.$transaction(async (tx) => {
      await tx.sSampleValue.deleteMany({
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

      await tx.sSampleMeasurement.deleteMany({
        where: {
          sample: {
            OR: [
              { beforeAqlInspectionId: inspectionId },
              { afterAqlInspectionId: inspectionId },
            ],
          },
        },
      });

      await tx.sSample.deleteMany({
        where: {
          OR: [
            { beforeAqlInspectionId: inspectionId },
            { afterAqlInspectionId: inspectionId },
          ],
        },
      });

      await tx.sAqlInspection.delete({
        where: { id: inspectionId },
      });
    });

    return res.status(200).json({
      success: true,
      message: `AQL Inspection with ID ${id} deleted successfully`,
    });
  } catch (error) {
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

export const updateAqlStatusInspection = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Inspection ID is required" });
    }

    const updatedInspection = await prisma.sAqlInspection.update({
      where: { id: parseInt(id) },
      data: { approveStatus: req.body.status },
    });

    return res.status(200).json({
      success: true,
      data: updatedInspection,
    });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ message: "Inspection not found" });
    }
    return res.status(500).json({ message: err.message });
  }
};

export const aqlInspectionController = {
  createAqlInspection,
  getAqlInspectionById,
  getAqlInspections,
  updateAqlInspection,
  deleteAqlInspection,
  updateAqlStatusInspection,
};