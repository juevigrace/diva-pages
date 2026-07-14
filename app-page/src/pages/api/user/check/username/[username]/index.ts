import { json } from '@api/lib/response';
import { apiFetch } from '@api/lib/fetch';

export async function GET({ params }: import('astro').APIContext): Promise<Response> {
  try {
    const res = await apiFetch(`/api/user/check/username/${params.username}`);
    if (!res.ok) return json(res.json, res.status);
    return json(res.json.data ?? null, res.status);
  } catch (e) {
    return json({ message: `${e}` }, 500);
  }
}
