import { prisma } from '../prisma.js';

export const commentsRepo = {
  create(data: { photoId: string; authorId: string; content: string }) {
    return prisma.comment.create({ data });
  },
  findById(id: string) {
    return prisma.comment.findUnique({ where: { id } });
  },
  delete(id: string) {
    return prisma.comment.delete({ where: { id } });
  },
};
