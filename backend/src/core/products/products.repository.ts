import prisma from "@config/database";

export const ProductRepository = {
  create: async (data: {
    name: string;
    price: number;
    code: string;
    stock: number;
  }) => {
    return prisma.product.create({
      data,
    });
  },

  findAll: async (options?: {
    page?: number;
    limit?: number;
    search?: string;
  }) => {
    const page = Math.max(1, options?.page || 1);
    const limit = Math.max(1, Math.min(100, options?.limit || 10));
    const skip = (page - 1) * limit;
    const search = options?.search?.trim();

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { code: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : undefined;

    const [items, totalItems] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.count({ where }),
    ]);

    const totalPages = Math.max(1, Math.ceil(totalItems / limit));

    return {
      items,
      meta: {
        page,
        limit,
        totalItems,
        totalPages,
      },
    };
  },

  findById: async (id: number) => {
    return prisma.product.findUnique({
      where: { id },
    });
  },

  findByCode: async (code: string) => {
    return prisma.product.findUnique({
      where: { code },
    });
  },

  update: async (id: number, data: any) => {
    return prisma.product.update({
      where: { id },
      data,
    });
  },

  delete: async (id: number) => {
    return prisma.product.delete({
      where: { id },
    });
  },
};
