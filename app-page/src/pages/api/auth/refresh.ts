import type { APIContext } from 'astro';
import { actions } from 'astro:actions';
import { requireSession } from '@api/lib/guard';
import { apiPost } from '@api/lib/fetch';
import { json, apiError } from '@api/lib/response';
import type { SessionResponse } from 'diva-types/auth/responses';

export async function POST({ request, callAction }: APIContext): Promise<Response> {
  try {
    const result = await requireSession(callAction);
    if (!result.ok) return result.error;
    const { session } = result;
    const body = await request.json();
    const { status, json: res } = await apiPost<SessionResponse>('/api/auth/refresh', body, session.access_token);
    if (!status.toString().startsWith('2')) return json(res, status);
    await callAction(actions.session.saveSession, res.data);
    return json(res.data, status);
  } catch (e) {
    return apiError(e);
  }
}
