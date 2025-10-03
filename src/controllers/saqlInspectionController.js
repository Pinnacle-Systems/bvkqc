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
    userId: inspection.employeeId,
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
  defect: measurement.Defect?.name, 
  defectId: measurement.defectId,
  correctiveAction: measurement.DefectCorrection?.name, 
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

const validateEmployeeExists = async (tx, employeeId) => {
  if (!employeeId) {
    return null;
  }
  
  const parsedEmployeeId = parseInt(employeeId);
  if (isNaN(parsedEmployeeId)) {
    return null;
  }
  
  const employee = await tx.employee.findUnique({
    where: { id: parsedEmployeeId }
  });
  
  if (!employee) {
    return null;
  }
  
  return parsedEmployeeId;
};

const processSamples = async (tx, samples, condition, inspectionId) => {
  for (const sample of samples) {
    validateSample(sample, samples.indexOf(sample), condition);

    const createdSample = await tx.sSample.create({
      data: {
        size: sample.size,
        condition: condition.toUpperCase(),
        [condition.toUpperCase() === "BEFORE" ? "beforeAqlInspectionId" : "afterAqlInspectionId"]: inspectionId,
      },
    });

    for (const measurement of sample.measurements) {
      validateMeasurement(measurement, sample.size, sample.measurements.indexOf(measurement), condition);

      let operationIdValue = null;
      if (measurement.operationId) {
        const parsedOperationId = parseInt(measurement.operationId);
        operationIdValue = isNaN(parsedOperationId) ? null : parsedOperationId;
      }

      let defectIdValue = null;
      if (measurement.defectId) {
        const parsedDefectId = parseInt(measurement.defectId);
        defectIdValue = isNaN(parsedDefectId) ? null : parsedDefectId;
      }

      let correctiveActionIdValue = null;
      if (measurement.correctiveActionId) {
        const parsedCorrectiveActionId = parseInt(measurement.correctiveActionId);
        correctiveActionIdValue = isNaN(parsedCorrectiveActionId) ? null : parsedCorrectiveActionId;
      }

      const createdMeasurement = await tx.sSampleMeasurement.create({
        data: {
          sampleId: createdSample.id,
          measurementId: parseInt(measurement.measurementId),
          operationId: operationIdValue,
          standardValue: parseFloat(measurement.standardValue),
          toleranceMin: measurement.toleranceMin ? parseFloat(measurement.toleranceMin) : 0,
          toleranceMax: measurement.toleranceMax ? parseFloat(measurement.toleranceMax) : 0,
          unit: measurement.unit || "",
          mcNo: measurement.machineNo || "",
          spi: measurement.spi || "",
          defectId: defectIdValue,
          defectCorrectionId: correctiveActionIdValue,
        },
      });

      if (measurement.values && measurement.values.length > 0) {
        await tx.sSampleValue.createMany({
          data: measurement.values.map((value, index) => ({
            sampleMeasurementId: createdMeasurement.id,
            pieceNumber: value.pieceNumber || index + 1,
            actualValue: value.actualValue ? parseFloat(value.actualValue) : 0,
            status: value.status || "within_tolerance",
          })),
        });
      }
    }
  }
};

const getInspectionInclude = () => ({
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
          Defect: {
            select: {
              id: true,
              name: true,
            },
          },
          DefectCorrection: {
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
          Defect: {
            select: {
              id: true,
              name: true,
            },
          },
          DefectCorrection: {
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
  Employee: {
    select: {
      id: true,
      name: true,
    },
  },
});

export const createAqlInspection = async (req, res) => {
  try {
    validateInspectionPayload(req.body);

    const result = await prisma.$transaction(async (tx) => {
      const validEmployeeId = await validateEmployeeExists(tx, req.body.userId);

      const inspectionData = {
        companyId: String(req.body.companyId),
        reference: req.body.reference,
        inspectionDate: new Date(req.body.inspectionDate),
        lineMasterId: parseInt(req.body.lineMasterId),
        color: req.body.color || "",
        shift: String(req.body.shift) || "",
        userId: req.body.userId || "",
        employeeId: validEmployeeId, 
      };


      const inspection = await tx.sAqlInspection.create({
        data: inspectionData,
      });


      if (req.body.before && req.body.before.length > 0) {
        await processSamples(tx, req.body.before, "BEFORE", inspection.id);
      }

      if (req.body.after && req.body.after.length > 0) {
        await processSamples(tx, req.body.after, "AFTER", inspection.id);
      }

      const completeInspection = await tx.sAqlInspection.findUnique({
        where: { id: inspection.id },
        include: getInspectionInclude(),
      });

      return completeInspection;
    });

    return res.status(201).json({
      success: true,
      data: transformInspectionData(result),
    });
  } catch (error) {
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
      include: getInspectionInclude(),
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
    const statusCode = error instanceof AqlInspectionError ? error.statusCode : 500;
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
    const { page = 1, limit = 10, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    let whereClause = {};

    if (search) {
      whereClause = {
        OR: [
          { reference: { contains: search, mode: 'insensitive' } },
          { color: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    const [inspections, totalCount] = await Promise.all([
      prisma.sAqlInspection.findMany({
        where: whereClause,
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
          LineMaster: {
            select: {
              id: true,
              lineName: true,
            },
          },
          
          Employee: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take,
      }),
      prisma.sAqlInspection.count({ where: whereClause })
    ]);

    return res.status(200).json({
      success: true,
      data: inspections.map(transformInspectionData),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Failed to fetch inspections",
    });
  }
};

export const updateSAqlInspection = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      throw new AqlInspectionError("Inspection ID is required", 400);
    }

    validateInspectionPayload(req.body);

    const result = await prisma.$transaction(async (tx) => {
      const existingInspection = await tx.sAqlInspection.findUnique({
        where: { id: parseInt(id) },
      });

      if (!existingInspection) {
        throw new AqlInspectionError(`Inspection with ID ${id} not found`, 404);
      }

      const validEmployeeId = await validateEmployeeExists(tx, req.body.userId);

      const inspectionData = {
        companyId: String(req.body.companyId),
        reference: req.body.reference,
        inspectionDate: new Date(req.body.inspectionDate),
        lineMasterId: parseInt(req.body.lineMasterId),
        color: req.body.color || "",
        shift: String(req.body.shift) || "",
        employeeId: validEmployeeId,
      };

      await tx.sAqlInspection.update({
        where: { id: parseInt(id) },
        data: inspectionData,
      });

      await tx.sSample.deleteMany({
        where: {
          OR: [
            { beforeAqlInspectionId: parseInt(id) },
            { afterAqlInspectionId: parseInt(id) },
          ],
        },
      });

      if (req.body.before && req.body.before.length > 0) {
        await processSamples(tx, req.body.before, "BEFORE", parseInt(id));
      }

      if (req.body.after && req.body.after.length > 0) {
        await processSamples(tx, req.body.after, "AFTER", parseInt(id));
      }

      return tx.sAqlInspection.findUnique({
        where: { id: parseInt(id) },
        include: getInspectionInclude(),
      });
    });

    return res.status(200).json({
      success: true,
      data: transformInspectionData(result),
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      error: error.message,
    });
  }
};

export const deleteSAqlInspection = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      throw new AqlInspectionError("Inspection ID is required", 400);
    }

    await prisma.$transaction(async (tx) => {
      await tx.sSample.deleteMany({
        where: {
          OR: [
            { beforeAqlInspectionId: parseInt(id) },
            { afterAqlInspectionId: parseInt(id) },
          ],
        },
      });

      await tx.sAqlInspection.delete({
        where: { id: parseInt(id) },
      });
    });

    return res.status(200).json({
      success: true,
      message: "Inspection deleted successfully",
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: "Inspection not found",
      });
    }
    return res.status(500).json({
      success: false,
      error: "Failed to delete inspection",
    });
  }
};

export const getAqlInspectionSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let whereClause = {};
    
    if (startDate && endDate) {
      whereClause.inspectionDate = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const summary = await prisma.sAqlInspection.groupBy({
      by: ['inspectionDate'],
      where: whereClause,
      _count: {
        id: true,
      },
      orderBy: {
        inspectionDate: 'desc',
      },
    });

    return res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Failed to fetch inspection summary",
    });
  }
};

export const getSAqlInspections = async (req, res) => {
  try {
    const references = await prisma.sAqlInspection.findMany({
      select: {
        id: true,
        reference: true,
        inspectionDate: true,
        approveStatus: true,
        createdAt: true,
        updatedAt: true,
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
          
          }
        },
        User:{
            select:{
              id: true,
              username:true
            }
          }
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const formattedReferences = references.map(ref => ({
      id: ref.id,
      reference: ref.reference,
      inspectionDate: ref.inspectionDate,
      approveStatus: ref.approveStatus,
      createdAt: ref.createdAt,
      updatedAt: ref.updatedAt,
      hasBefore: ref.beforeSamples.length > 0,
      hasAfter: ref.afterSamples.length > 0,
      beforeSize: ref.beforeSamples[0]?.size || null, 
      afterSize: ref.afterSamples[0]?.size || null,  
      lineDetails: ref.LineMaster ? {
        id: ref.LineMaster.id,
        name: ref.LineMaster.lineName,
      } : null,
       userDetails: ref.User ? {
        id: ref.User.id,
        name: ref.User.username,
      } : null
    }));

    return res.status(200).json({
      success: true,
      data: formattedReferences,
    });
  } catch (error) {
    const statusCode = error instanceof AqlInspectionError ? error.statusCode : 500;
    const errorResponse = {
      success: false,
      error: error.message,
    };

    if (process.env.NODE_ENV === "development") {
      errorResponse.stack = error.stack;
      if (error.code) {
        errorResponse.prismaError = {
          code: error.code,
          meta: error.meta
        };
      }
    }

    return res.status(statusCode).json(errorResponse);
  }
};
export const updateSAqlStatusInspection = async (req, res) => {
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
