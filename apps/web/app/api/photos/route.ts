import type { NextRequest } from 'next/server';
import { proxy } from '@/lib/proxy';
export const GET  = (req: NextRequest) => proxy(req, 'photo', '/photos');
export const POST = (req: NextRequest) => proxy(req, 'photo', '/photos');
