import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


export const createStyleSheet = async (data) => {
  return prisma.styleSheet.create({ data });
};

export const updateStyleSheet = async (id, data) => {
  return prisma.styleSheet.update({
    where: { id: parseInt(id) },
    data
  });
};

export const getStyleSheetById = async (id) => {
  return prisma.styleSheet.findUnique({
    where: { id: parseInt(id) }
  });
};

export const getAllStyleSheets = async () => {
  return prisma.styleSheet.findMany();
};

export const deleteStyleSheet = async (id) => {
  return prisma.styleSheet.delete({
    where: { id: parseInt(id) }
  });
};
