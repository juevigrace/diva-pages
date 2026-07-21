import { actions } from 'astro:actions';
import { requireSession, json } from '@api/lib/response';
import { apiFetch } from '@api/lib/fetch';

export async function POST(context: import('astro').APIContext): Promise<Response> {
  try {
    const session = await requireSession(context);
    const body = await context.request.json();
    const res = await apiFetch('/api/auth/signOut', { method: 'POST', body: { ...body, device: body.device || session.device, user_agent: body.user_agent || session.agent }, token: session.access_token });
    await context.callAction(actions.server.session.deleteSession, {});
    if (!res.ok) return json(res.json, res.status);
    return new Response(null, { status: res.status });
  } catch (e) {
    if (e instanceof Response) return e;
    return json({ message: `${e}` }, 500);
  }
}
