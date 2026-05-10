import { NextRequest, NextResponse } from 'next/server';
import { getAccessToken } from './session';

const SERVICES = {
  user: process.env.USER_SERVICE_URL!,
  photo: process.env.PHOTO_SERVICE_URL!,
};

export async function proxy(req: NextRequest, target: 'user' | 'photo', path: string) {
  const token = await getAccessToken();
  if (!token) {
    return NextResponse.json(
      { status: 'error', code: 'PA-AUTH-001', message: 'Not signed in' },
      { status: 401 },
    );
  }

  const requestId = req.headers.get('x-request-id') ?? crypto.randomUUID();
  const url = new URL(path, SERVICES[target]);
  for (const [k, v] of req.nextUrl.searchParams.entries()) url.searchParams.set(k, v);

  const init: RequestInit = {
    method: req.method,
    headers: {
      authorization: `Bearer ${token}`,
      'x-request-id': requestId,
      ...(req.body ? { 'content-type': 'application/json' } : {}),
    },
    body: ['GET', 'HEAD'].includes(req.method) ? undefined : await req.text(),
  };
  const res = await fetch(url, init);
  const body = await res.text();
  return new NextResponse(body, {
    status: res.status,
    headers: {
      'content-type': res.headers.get('content-type') ?? 'application/json',
      'x-request-id': requestId,
    },
  });
}
