import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { ulid } from 'ulid';
import { AppError, ErrorCode, type GoogleProfileInput } from '@photo-app/shared';
import { env } from '../config/env.js';
import { usersRepo } from '../repositories/users.repo.js';
import { refreshTokensRepo } from '../repositories/refreshTokens.repo.js';

const ACCESS_TTL_SEC = 15 * 60;
const REFRESH_TTL_SEC = 7 * 24 * 60 * 60;

function sha256(s: string) { return crypto.createHash('sha256').update(s).digest('hex'); }

export const authService = {
  async loginWithGoogle(profile: GoogleProfileInput) {
    const user = await usersRepo.upsertByGoogleId(profile);
    return this.issueTokens(user.id, user);
  },
  async issueTokens(userId: string, user: { id: string; email: string; name: string; avatarUrl: string | null }) {
    const accessToken = jwt.sign({ sub: userId }, env.JWT_SECRET, { expiresIn: ACCESS_TTL_SEC });
    const refreshToken = `${ulid()}.${crypto.randomBytes(32).toString('base64url')}`;
    await refreshTokensRepo.create(userId, sha256(refreshToken), new Date(Date.now() + REFRESH_TTL_SEC * 1000));
    return { accessToken, refreshToken, user };
  },
  async rotate(refreshToken: string) {
    const row = await refreshTokensRepo.findActiveByHash(sha256(refreshToken));
    if (!row) throw new AppError(ErrorCode.PA_AUTH_004);
    await refreshTokensRepo.revoke(row.id);
    const user = await usersRepo.findById(row.userId);
    if (!user) throw new AppError(ErrorCode.PA_RES_001);
    return this.issueTokens(user.id, user);
  },
  async signout(refreshToken: string) {
    const row = await refreshTokensRepo.findActiveByHash(sha256(refreshToken));
    if (row) await refreshTokensRepo.revoke(row.id);
  },
};
