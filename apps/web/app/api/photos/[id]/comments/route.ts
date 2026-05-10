import type { NextRequest } from 'next/server';
import { proxy } from '@/lib/proxy';
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxy(req, 'photo', `/photos/${id}/comments`);
}
