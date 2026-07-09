import type { APIContext } from 'astro';
import { actions } from 'astro:actions';
import { parseBody } from '@api/lib/body';
import { apiPost } from '@api/lib/fetch';
import { json, apiError } from '@api/lib/response';
import { signInInputSchema } from '@lib/schemas/auth';
import type { SessionResponse } from 'diva-types/auth/responses';

export async function POST({ request, callAction }: APIContext): Promise<Response> {
  try {
    const body = await parseBody(request);
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

    const { status, json: res } = await apiPost<SessionResponse>('/api/auth/signIn', {
      username: parsed.data.username,
      password: parsed.data.password,
      session_data: { device: parsed.data.device || 'web', user_agent: request.headers.get('User-Agent') || 'web' },
    });

    if (!status.toString().startsWith('2')) {
      const isHtmx = request.headers.get('HX-Request') === 'true';
      if (isHtmx) {
        return new Response(null, {
          status: 200,
          headers: { 'HX-Trigger': JSON.stringify({ showToast: { type: 'error', message: res.message || 'An error occurred' } }) },
        });
      }
      return json(res, status);
    }

    await callAction(actions.session.saveSession, res.data);

    const isHtmx = request.headers.get('HX-Request') === 'true';
    if (isHtmx) {
      return new Response(null, { status: 200, headers: { 'HX-Redirect': '/' } });
    }

    return json(res.data, status);
  } catch (e) {
    return apiError(e);
  }
}
