import { actions } from 'astro:actions';
import { requireSession, json } from '@api/lib/response';
import { apiFetch } from '@api/lib/fetch';

export async function POST(context: import('astro').APIContext): Promise<Response> {
  try {
    const session = await requireSession(context);
    const res = await apiFetch('/api/auth/ping', { method: 'POST', token: session.access_token });
    if (!res.ok) {
      await context.callAction(actions.session.deleteSession, {});
      return json(res.json, res.status);
    }
    return new Response(null, { status: res.status });
  } catch (e) {
    if (e instanceof Response) return e;
    return json({ message: `${e}` }, 500);
  }
}
