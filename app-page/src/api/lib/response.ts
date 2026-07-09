import type { APIResponse } from 'diva-types/common/api-response';

export function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export function unauthorized() {
  return json({ message: 'Unauthorized' }, 401);
}

export function dataResponse<T>(res: { ok: boolean; status: number; json: APIResponse<T> }) {
  if (!res.ok) return json(res.json, res.status);
  return json(res.json.data, res.status);
}

export function nullResponse(res: { ok: boolean; status: number; json: unknown }) {
  if (!res.ok) return json(res.json, res.status);
  return new Response(null, { status: res.status });
}

export function apiError(e: unknown) {
  return json({ message: `${e}` }, 500);
}
