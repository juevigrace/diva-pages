import type { APIContext } from 'astro';
import { actions } from 'astro:actions';
import { apiPost } from '@api/lib/fetch';
import { json, apiError } from '@api/lib/response';
import { forgotPasswordConfirmSchema } from '@lib/schemas/auth';
import type { SessionResponse } from 'diva-types/auth/responses';

export async function POST({ request, callAction }: APIContext): Promise<Response> {
  try {
    const body = await request.json();
    const parsed = forgotPasswordConfirmSchema.safeParse(body);
    if (!parsed.success) {
      return json({
        message: 'Validation failed',
        fields: parsed.error.flatten().fieldErrors,
      }, 400);
    }

    const { status, json: res } = await apiPost<SessionResponse>('/api/auth/forgot/password/confirm', {
      id: parsed.data.id,
      session_data: { device: parsed.data.device || 'web', user_agent: request.headers.get('User-Agent') || 'web' },
    });

    if (!status.toString().startsWith('2')) return json(res, status);

    await callAction(actions.session.saveSession, res.data);
    return json(res.data, status);
  } catch (e) {
    return apiError(e);
  }
}
