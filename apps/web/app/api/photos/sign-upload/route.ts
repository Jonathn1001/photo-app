import type { NextRequest } from 'next/server';
import { proxy } from '@/lib/proxy';
export const POST = (req: NextRequest) => proxy(req, 'photo', '/photos/sign-upload');
