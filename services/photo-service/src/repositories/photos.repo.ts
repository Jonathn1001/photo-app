import { prisma } from "../prisma.js";

export const photosRepo = {
  create(data: {
    ownerId: string;
    publicId: string;
    url: string;
    width: number;
    height: number;
    bytes: number;
    format: string;
  }) {
    return prisma.photo.create({ data });
  },
  findById(id: string) {
    return prisma.photo.findUnique({
      where: { id },
      include: { comments: { orderBy: { createdAt: "desc" } } },
    });
  },
  findByIdBare(id: string) {
    return prisma.photo.findUnique({ where: { id } });
  },
  delete(id: string) {
    return prisma.photo.delete({ where: { id } });
  },
  feed(opts: { cursor?: string; limit: number; ownerId?: string }) {
    return prisma.photo.findMany({
      where: opts.ownerId ? { ownerId: opts.ownerId } : undefined,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: opts.limit,
      cursor: opts.cursor ? { id: opts.cursor } : undefined,
      skip: opts.cursor ? 1 : 0,
    });
  },
};
