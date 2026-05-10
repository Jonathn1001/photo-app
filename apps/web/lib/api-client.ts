export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public requestId?: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public errors?: any[],
  ) {
    super(message);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function apiClient<T = any>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { 'content-type': 'application/json', ...init.headers },
  });
  const requestId = res.headers.get('x-request-id') ?? undefined;
  const text = await res.text();
  const json = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const e = new ApiError(json?.code ?? 'PA-SYS-001', json?.message ?? 'Request failed', requestId, json?.errors);
    // Log only code + requestId. NEVER log request/response bodies.
    console.error(`[api] ${e.code} ${e.message} requestId=${requestId}`);
    throw e;
  }
  return json?.data;
}
