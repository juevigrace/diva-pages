import { actions } from 'astro:actions';
import { json } from '@api/lib/response';
import { apiFetch } from '@api/lib/fetch';
import { signInInputSchema } from '@lib/schemas/auth';
import type { SessionResponse } from 'diva-types/auth/responses';

export async function POST({ request, callAction }: import('astro').APIContext): Promise<Response> {
  try {
    const body = await request.json();
    const parsed = signInInputSchema.safeParse(body);
    if (!parsed.success) {
      const fields = parsed.error.flatten().fieldErrors;
      const message = Object.values(fields).flat().join('. ');
      const isHtmx = request.headers.get('HX-Request') === 'true';
      if (isHtmx) {
        return new Response(null, {
          status: 200,
          headers: { 'HX-Trigger': JSON.stringify({ showToast: { type: 'error', message: message || 'Validation failed' } }) },
        });
      }
      return json({ message: message || 'Validation failed', fields }, 400);
    }

    const res = await apiFetch<SessionResponse>('/api/auth/signIn', {
      method: 'POST',
      body: {
        username: parsed.data.username,
        password: parsed.data.password,
        session_data: { device: parsed.data.device || 'web', user_agent: request.headers.get('User-Agent') || 'web' },
      },
    });

    if (!res.ok) {
      const isHtmx = request.headers.get('HX-Request') === 'true';
      if (isHtmx) {
        return new Response(null, {
          status: 200,
          headers: { 'HX-Trigger': JSON.stringify({ showToast: { type: 'error', message: res.json.message || 'An error occurred' } }) },
        });
      }
      return json(res.json, res.status);
    }

    await callAction(actions.session.saveSession, res.json.data);

    const isHtmx = request.headers.get('HX-Request') === 'true';
    if (isHtmx) {
      return new Response(null, { status: 200, headers: { 'HX-Redirect': '/' } });
    }

    return json(res.json.data, res.status);
  } catch (e) {
    if (e instanceof Response) return e;
    return json({ message: `${e}` }, 500);
  }
}
