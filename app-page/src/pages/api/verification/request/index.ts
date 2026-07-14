import { json } from '@api/lib/response';
import { apiFetch } from '@api/lib/fetch';

export async function POST({ request }: import('astro').APIContext): Promise<Response> {
  try {
    const res = await apiFetch('/api/verification/request', { method: 'POST', body: await request.json() });
    if (!res.ok) return json(res.json, res.status);
    return json(res.json.data ?? null, res.status);
  } catch (e) {
    return json({ message: `${e}` }, 500);
  }
}
