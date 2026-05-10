import { prisma } from '../prisma.js';
import type { GoogleProfileInput } from '@photo-app/shared';

export const usersRepo = {
  upsertByGoogleId(input: GoogleProfileInput) {
    return prisma.user.upsert({
      where: { googleId: input.googleId },
      create: { googleId: input.googleId, email: input.email, name: input.name, avatarUrl: input.avatarUrl },
      update: { email: input.email, name: input.name, avatarUrl: input.avatarUrl },
    });
  },
  findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },
};
