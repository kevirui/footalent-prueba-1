import prisma from "@config/database";
import bcrypt from "bcrypt";
import { CreateUserPayload, UserRole } from "./users.types";

export const UserRepository = {
  create: async ({ email, name, role, password }: CreateUserPayload) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    return prisma.user.create({
      data: { email, name, role, password: hashedPassword },
    });
  },

  findByEmail: async (email: string) => {
    return prisma.user.findUnique({
      where: { email },
    });
  },

  findAll: async (page: number = 1, limit: number = 20) => {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      }),
      prisma.user.count(),
    ]);

    return {
      data,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  },

  findById: async (id: number) => {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
  },

  update: async (
    id: number,
    data: Partial<{
      email: string;
      name: string;
      role: UserRole;
      password: string;
    }>
  ) => {
    return prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
  },

  delete: async (id: number) => {
    return prisma.user.delete({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
  },
};
