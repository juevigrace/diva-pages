import { json } from '@api/lib/response';
import { apiFetch } from '@api/lib/fetch';

export async function POST({ request }: import('astro').APIContext): Promise<Response> {
  try {
    const res = await apiFetch('/api/verification/', { method: 'POST', body: await request.json() });
    if (!res.ok) return json(res.json, res.status);
    return new Response(null, { status: res.status });
  } catch (e) {
    return json({ message: `${e}` }, 500);
  }
}
