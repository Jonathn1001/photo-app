import type { NextRequest } from 'next/server';
import { proxy } from '@/lib/proxy';
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxy(req, 'photo', `/photos/${id}`);
}
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxy(req, 'photo', `/photos/${id}`);
}
